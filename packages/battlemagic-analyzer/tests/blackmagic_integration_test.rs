//! Black Magic Probe Integration Test
//!
//! Tests the complete analysis pipeline:
//! 1. Connect to Black Magic Probe via serial (COM3)
//! 2. Read firmware from target device via GDB protocol
//! 3. Parse ARM Cortex-M vector table
//! 4. Write firmware to test binary file for WASM testing
//!
//! This test collects real firmware data from the debugger.
//! Use test-elf.mjs or test-browser.html to test WASM disassembly.
//!
//! Run with: cargo test --test blackmagic_integration_test -- --ignored --nocapture
use serialport::SerialPort;
use std::io::Write;
use std::time::Duration;

/// Black Magic Probe configuration
const SERIAL_PORT: &str = "COM31"; // GDB port
const BAUD_RATE: u32 = 115200;

/// GDB client for Black Magic Probe
struct GdbClient {
    port: Box<dyn SerialPort>,
}

impl GdbClient {
    fn connect(port_name: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let mut port = serialport::new(port_name, BAUD_RATE)
            .timeout(Duration::from_millis(100))
            .flow_control(serialport::FlowControl::None)
            .data_bits(serialport::DataBits::Eight)
            .parity(serialport::Parity::None)
            .stop_bits(serialport::StopBits::One)
            .open()?;

        // Clear any pending data
        std::thread::sleep(Duration::from_millis(200));
        let mut buf = vec![0u8; 4096];
        let _ = port.read(&mut buf);

        println!("   Port configured: 115200 8N1, no flow control");

        Ok(Self { port })
    }

    /// Calculate GDB RSP checksum
    fn calculate_checksum(data: &str) -> u8 {
        data.bytes().fold(0u8, |acc, b| acc.wrapping_add(b))
    }

    /// Build GDB RSP packet with checksum: $data#checksum
    fn build_packet(data: &str) -> String {
        let checksum = Self::calculate_checksum(data);
        format!("${}#{:02x}", data, checksum)
    }

    fn send_command(&mut self, cmd: &str) -> Result<String, Box<dyn std::error::Error>> {
        // Build RSP packet
        let packet = Self::build_packet(cmd);
        println!("[TX] {}", packet);

        // Send packet
        self.port.write_all(packet.as_bytes())?;
        self.port.flush()?;

        // Wait longer for memory commands which can be slow
        let wait_time = if cmd.starts_with("x/") {
            Duration::from_millis(1000)
        } else {
            Duration::from_millis(500)
        };
        std::thread::sleep(wait_time);

        // Read response in chunks
        let mut response = String::new();
        let mut buf = vec![0u8; 4096];
        let mut total_read = 0;
        let mut consecutive_timeouts = 0;

        for _ in 0..30 {  // Try up to 30 reads
            match self.port.read(&mut buf) {
                Ok(n) if n > 0 => {
                    let chunk = String::from_utf8_lossy(&buf[..n]);
                    print!("[RX] {}", chunk);
                    response.push_str(&chunk);
                    total_read += n;
                    consecutive_timeouts = 0;
                }
                Ok(_) => break, // No more data
                Err(e) if e.kind() == std::io::ErrorKind::TimedOut => {
                    consecutive_timeouts += 1;
                    if total_read > 0 && consecutive_timeouts >= 3 {
                        break; // We got some data, and multiple timeouts - stop reading
                    }
                    if consecutive_timeouts >= 10 {
                        println!("[RX] (no response after {} timeouts, {} bytes received)", consecutive_timeouts, total_read);
                        if total_read == 0 {
                            return Err("No response from device".into());
                        }
                        break;
                    }
                }
                Err(e) => {
                    if total_read > 0 {
                        break; // We got some data before error
                    }
                    return Err(e.into());
                }
            }
        }

        if !response.is_empty() {
            println!(); // Newline after response
        }
        Ok(response)
    }

    fn read_memory(&mut self, address: u32, length: usize) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
        // Use GDB RSP 'm' command: mADDR,LENGTH
        let cmd = format!("m{:x},{:x}", address, length);
        let response = self.send_command(&cmd)?;

        // Parse response - should be hex bytes like: "0123456789ABCDEF"
        // Response format: $DATA#checksum or +$DATA#checksum
        let hex_data = response
            .trim_start_matches('+')
            .trim_start_matches('$')
            .split('#')
            .next()
            .unwrap_or("");

        // Convert hex string to bytes
        let mut bytes = Vec::new();
        let chars: Vec<char> = hex_data.chars().collect();
        for i in (0..chars.len()).step_by(2) {
            if i + 1 < chars.len() {
                let hex_str: String = vec![chars[i], chars[i + 1]].iter().collect();
                if let Ok(byte) = u8::from_str_radix(&hex_str, 16) {
                    bytes.push(byte);
                }
            }
        }

        Ok(bytes)
    }

    fn halt(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Send Ctrl-C (0x03) to interrupt
        self.port.write_all(&[0x03])?;
        self.port.flush()?;
        std::thread::sleep(Duration::from_millis(200));

        // Read response
        let mut buf = vec![0u8; 256];
        let _ = self.port.read(&mut buf);

        Ok(())
    }
}

/// Parse ARM Cortex-M vector table to find reset vector
fn parse_vector_table(memory: &[u8]) -> Option<(u32, u32)> {
    if memory.len() < 8 {
        return None;
    }

    // Little-endian parsing
    let initial_sp = u32::from_le_bytes([memory[0], memory[1], memory[2], memory[3]]);
    let reset_vector = u32::from_le_bytes([memory[4], memory[5], memory[6], memory[7]]);

    Some((initial_sp, reset_vector))
}

/// Check if memory is erased flash (all 0xFF)
fn is_erased_flash(data: &[u8]) -> bool {
    data.iter().all(|&b| b == 0xFF)
}

/// Find where firmware ends (detect erased flash)
fn find_firmware_end(data: &[u8]) -> usize {
    const CONSECUTIVE_FF_THRESHOLD: usize = 64;

    let mut consecutive_ff = 0;
    for (i, &byte) in data.iter().enumerate() {
        if byte == 0xFF {
            consecutive_ff += 1;
            if consecutive_ff >= CONSECUTIVE_FF_THRESHOLD {
                return i.saturating_sub(CONSECUTIVE_FF_THRESHOLD);
            }
        } else {
            consecutive_ff = 0;
        }
    }

    data.len()
}

#[test]
#[ignore] // Only run when explicitly requested: cargo test --test blackmagic_integration_test -- --ignored --nocapture
fn test_blackmagic_firmware_analysis() {
    println!("=== Black Magic Probe Firmware Analysis Test ===\n");

    // Step 1: Connect to Black Magic Probe
    println!("[1] Connecting to Black Magic Probe on {}...", SERIAL_PORT);
    let mut gdb = match GdbClient::connect(SERIAL_PORT) {
        Ok(client) => {
            println!("✓ Connected successfully\n");
            client
        }
        Err(e) => {
            eprintln!("✗ Failed to connect: {}", e);
            eprintln!("\nMake sure:");
            eprintln!("  - Black Magic Probe is connected to {}", SERIAL_PORT);
            eprintln!("  - No other program is using the port");
            panic!("Cannot proceed without connection");
        }
    };

    // Step 2: Halt target (optional - target might already be halted)
    println!("[2] Halting target...");
    match gdb.halt() {
        Ok(_) => println!("✓ Target halted\n"),
        Err(e) => {
            println!("⚠ Halt command failed: {}", e);
            println!("  (Target might already be halted, continuing anyway...)\n");
        }
    }

    // Step 3: Read vector table
    println!("[3] Reading vector table from 0x0...");
    let vector_table = gdb.read_memory(0x0, 8).expect("Failed to read vector table");

    if vector_table.len() < 8 {
        panic!("Failed to read vector table (got {} bytes)", vector_table.len());
    }

    let (initial_sp, reset_vector) = parse_vector_table(&vector_table)
        .expect("Failed to parse vector table");

    println!("   Initial SP: 0x{:08X}", initial_sp);
    println!("   Reset Vector: 0x{:08X}", reset_vector);

    // Clear Thumb bit (LSB) to get actual address
    let reset_addr = reset_vector & 0xFFFFFFFE;
    println!("   Reset Address: 0x{:08X}", reset_addr);
    println!("✓ Vector table parsed\n");

    // Step 4: Read 4KB from start of flash
    println!("[4] Reading 4KB from 0x0 in 256-byte chunks...");
    const READ_SIZE: usize = 0x1000; // 4KB
    const CHUNK_SIZE: usize = 256;

    let mut full_memory = Vec::new();
    for offset in (0..READ_SIZE).step_by(CHUNK_SIZE) {
        print!("   Reading chunk at 0x{:03X}... ", offset);
        match gdb.read_memory(offset as u32, CHUNK_SIZE) {
            Ok(chunk) if chunk.len() == CHUNK_SIZE => {
                full_memory.extend_from_slice(&chunk);
                println!("✓");
            }
            Ok(chunk) => {
                println!("⚠ (got {} bytes)", chunk.len());
                full_memory.extend_from_slice(&chunk);
                break;
            }
            Err(e) => {
                println!("✗ ({})", e);
                break;
            }
        }
    }

    println!("✓ Read {} bytes total\n", full_memory.len());

    // Step 5: Find where firmware ends
    println!("[5] Analyzing firmware boundaries...");
    let firmware_end = find_firmware_end(&full_memory);
    println!("   Firmware appears to end at: 0x{:X}", firmware_end);

    // Check if first chunk is erased
    if is_erased_flash(&full_memory[0..256.min(full_memory.len())]) {
        println!("   ⚠ WARNING: Memory appears to be erased (all 0xFF)");
        println!("   This could mean:");
        println!("     - No firmware is loaded");
        println!("     - Read protection is enabled");
        println!("     - Wrong flash base address");
        return;
    }
    println!("✓ Firmware data detected\n");

    // Step 6: Save firmware to file for WASM testing
    println!("[6] Saving firmware to file...");

    let output_path = "X:/battlewithbytes.io/packages/battlemagic-analyzer/test-data/nrf52_firmware.bin";
    match std::fs::write(output_path, &full_memory) {
        Ok(_) => {
            println!("   ✓ Saved {} bytes to {}", full_memory.len(), output_path);
            println!("   Reset vector: 0x{:08X}", reset_addr);
            println!("\n   To test WASM disassembly:");
            println!("   1. cd packages/battlemagic-core");
            println!("   2. node test-elf.mjs ../battlemagic-analyzer/test-data/nrf52_firmware.bin");
            println!("      (or open test-browser.html and drag the .bin file)");
        }
        Err(e) => {
            println!("   ✗ Failed to save file: {}", e);
        }
    }

    // Step 7: Also save metadata JSON
    println!("\n[7] Saving metadata...");
    let metadata = format!(
        r#"{{
  "initial_sp": "0x{:08X}",
  "reset_vector": "0x{:08X}",
  "reset_address": "0x{:08X}",
  "firmware_size": {},
  "firmware_end": "0x{:X}",
  "architecture": "ARM Thumb",
  "mcu": "NRF52",
  "flash_base": "0x00000000"
}}"#,
        initial_sp, reset_vector, reset_addr, full_memory.len(), firmware_end
    );

    let metadata_path = "X:/battlewithbytes.io/packages/battlemagic-analyzer/test-data/nrf52_firmware.json";
    match std::fs::write(metadata_path, metadata) {
        Ok(_) => println!("   ✓ Saved metadata to {}", metadata_path),
        Err(e) => println!("   ✗ Failed to save metadata: {}", e),
    }

    println!("\n=== Test Complete ===");
    println!("\nNext steps:");
    println!("1. Test WASM disassembly with the collected firmware");
    println!("2. If WASM fails, examine the error and fix battlemagic-core");
    println!("3. The firmware has been saved for repeatable testing");
}

