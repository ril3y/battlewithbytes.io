//! Test firmware analysis performance with optimized CFG algorithm

use battlemagic_analyzer::arch::arm::ArmArchitecture;
use battlemagic_analyzer::analyzer::BinaryAnalyzer;
use std::fs;
use std::time::Instant;

fn main() {
    println!("=== Firmware Analysis Performance Test ===\n");

    // Load firmware file - the large 256KB file that was hanging before optimization
    let firmware_path = "../../firmware_Unknown_(already_attached)_1763317348910.bin";

    println!("Loading firmware from: {}", firmware_path);
    let firmware_bytes = match fs::read(firmware_path) {
        Ok(bytes) => bytes,
        Err(e) => {
            eprintln!("Error reading firmware: {}", e);
            return;
        }
    };

    println!("Firmware size: {} bytes ({:.1} KB)\n", firmware_bytes.len(), firmware_bytes.len() as f64 / 1024.0);

    // Create analyzer
    let base_address = 0x08000000; // Typical ARM Cortex-M flash base
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, base_address);

    // Analyze firmware
    println!("Starting analysis...");
    let start = Instant::now();

    let results = analyzer.analyze_from_bytes(&firmware_bytes);

    let elapsed = start.elapsed();
    println!("Analysis completed in: {:.2}ms\n", elapsed.as_secs_f64() * 1000.0);

    // Print results
    println!("=== Analysis Results ===");
    println!("Total instructions: {}", results.total_instructions);
    println!("Cross-references: {}", results.xrefs.len());
    println!("Unique targets: {}", results.unique_targets);
    println!("Loops detected: {}", results.loops.len());
    println!("Functions detected: {}", results.functions.len());
    println!("Address range: 0x{:X} - 0x{:X}", results.start_address, results.end_address);

    // Print loop details
    if !results.loops.is_empty() {
        println!("\n=== Loop Details ===");
        for (i, lp) in results.loops.iter().take(10).enumerate() {
            println!("Loop {}: Header=0x{:X}, BackEdge=0x{:X}, Body={} addrs, Type={:?}, Depth={}",
                i + 1,
                lp.header_addr,
                lp.back_edge_addr,
                lp.body_addrs.len(),
                lp.loop_type,
                lp.nesting_level
            );
        }
        if results.loops.len() > 10 {
            println!("... and {} more loops", results.loops.len() - 10);
        }
    }

    // Print function details
    if !results.functions.is_empty() {
        println!("\n=== Function Details ===");
        for (i, func) in results.functions.iter().take(10).enumerate() {
            println!("Function {}: Start=0x{:X}, End={:?}, Name={:?}, Callers={}, Callees={}",
                i + 1,
                func.start_address,
                func.end_address.map(|e| format!("0x{:X}", e)).unwrap_or_else(|| "None".to_string()),
                func.name,
                func.callers.len(),
                func.callees.len()
            );
        }
        if results.functions.len() > 10 {
            println!("... and {} more functions", results.functions.len() - 10);
        }
    }

    // Performance summary
    println!("\n=== Performance Summary ===");
    let instructions_per_ms = results.total_instructions as f64 / (elapsed.as_secs_f64() * 1000.0);
    println!("Throughput: {:.0} instructions/ms", instructions_per_ms);
    println!("Per-instruction time: {:.2}µs", 1000.0 / instructions_per_ms);
}
