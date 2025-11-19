//! Full Firmware Analysis Example
//!
//! Comprehensive demonstration of the BattleMagic analyzer using a real firmware dump.
//! This example showcases all major features:
//! - Vector table extraction
//! - Function detection with calling convention analysis
//! - Control Flow Graph (CFG) analysis
//! - Loop detection
//! - Cross-reference tracking
//! - Performance metrics
//! - JSON export capability

use battlemagic_analyzer::arch::arm::ArmArchitecture;
use battlemagic_analyzer::analyzer::BinaryAnalyzer;
use battlemagic_analyzer::types::{XrefType, LoopType};
use std::collections::HashMap;
use std::env;
use std::fs;
use std::time::Instant;

fn main() {
    // Parse command line arguments
    let args: Vec<String> = env::args().collect();

    let (firmware_path, json_output) = parse_args(&args);

    // Load firmware file
    let firmware_bytes = match fs::read(&firmware_path) {
        Ok(bytes) => bytes,
        Err(e) => {
            eprintln!("Error reading firmware: {}", e);
            std::process::exit(1);
        }
    };

    // Run comprehensive analysis
    if json_output {
        run_json_analysis(&firmware_bytes, &firmware_path);
    } else {
        run_detailed_analysis(&firmware_bytes, &firmware_path);
    }
}

/// Parse command-line arguments
fn parse_args(args: &[String]) -> (String, bool) {
    let json_output;

    if args.len() < 2 {
        eprintln!("Usage: {} <firmware_file> [--json]", args[0]);
        eprintln!("\nOptions:");
        eprintln!("  --json    Export analysis results as JSON");
        std::process::exit(1);
    }

    let firmware_path = args[1].clone();

    if args.len() > 2 && args[2] == "--json" {
        json_output = true;
    } else {
        json_output = false;
    }

    (firmware_path, json_output)
}

/// Run detailed analysis with formatted output
fn run_detailed_analysis(firmware_bytes: &[u8], firmware_path: &str) {
    let firmware_size_kb = firmware_bytes.len() as f64 / 1024.0;

    // Print header
    print_separator('=');
    println!("           FIRMWARE ANALYSIS REPORT");
    print_separator('=');
    println!("Firmware: {}", firmware_path.split(&['/', '\\'][..]).last().unwrap_or(firmware_path));
    println!("Size: {} bytes ({:.1} KB)", firmware_bytes.len(), firmware_size_kb);
    println!("Base Address: 0x08000000 (STM32 Flash)");
    println!();

    // Create analyzer with typical STM32 flash base address
    let base_address = 0x08000000;
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, base_address);

    // Run analysis with timing
    print_separator('-');
    println!("Starting comprehensive analysis...");
    println!();

    let start_time = Instant::now();
    let results = analyzer.analyze_from_bytes(firmware_bytes);
    let elapsed = start_time.elapsed();

    // Vector Table Analysis
    print_separator('=');
    println!("           VECTOR TABLE");
    print_separator('=');

    let vector_table = analyzer.get_vector_table();

    if !vector_table.is_empty() {
        println!("{:<10} {:<20} {:<12} {:<8}", "Vector", "Handler Name", "Address", "Status");
        print_separator('-');

        for entry in vector_table.iter().take(50) {
            let status = if entry.is_valid { "VALID" } else { "INVALID" };

            if entry.vector_number == 0 {
                // Initial stack pointer
                println!(
                    "{:<10} {:<20} 0x{:08X} {:<8}",
                    entry.vector_number,
                    entry.handler_name,
                    entry.handler_address,
                    status
                );
            } else if entry.is_valid {
                // Valid code handler
                println!(
                    "{:<10} {:<20} 0x{:08X} {:<8}",
                    entry.vector_number,
                    entry.handler_name,
                    entry.handler_address,
                    status
                );
            }
        }

        let valid_count = vector_table.iter().filter(|e| e.is_valid).count();
        println!();
        println!("Total Valid Vectors: {} / {}", valid_count, vector_table.len());
    } else {
        println!("No vector table detected");
    }
    println!();

    // Functions Analysis
    print_separator('=');
    println!("           FUNCTIONS DETECTED");
    print_separator('=');
    println!("Total Functions: {}", results.functions.len());
    println!();

    if !results.functions.is_empty() {
        println!("{:<12} {:<12} {:<8} {:<8} {:<10} {:<10}",
                 "Address", "End", "Callers", "Calls", "Stack", "Args");
        print_separator('-');

        for func in results.functions.iter().take(30) {
            let end_str = func.end_address
                .map(|e| format!("0x{:08X}", e))
                .unwrap_or_else(|| "Unknown".to_string());

            println!(
                "0x{:08X} {:<12} {:<8} {:<8} {:<10} {:<10}",
                func.start_address,
                end_str,
                func.callers.len(),
                func.callees.len(),
                format!("{} bytes", func.stack_frame_size),
                format!("{} annot", func.arg_annotations.len())
            );

            // Show function calls with arguments (if any)
            if !func.arg_annotations.is_empty() {
                for annotation in func.arg_annotations.iter().take(3) {
                    if !annotation.args.is_empty() {
                        println!("    -> 0x{:08X} with args: {}",
                                 annotation.call_address,
                                 annotation.args.iter()
                                     .map(|(n, loc)| format!("r{}={}", n, loc))
                                     .collect::<Vec<_>>()
                                     .join(", "));
                    }
                }
            }
        }

        if results.functions.len() > 30 {
            println!("... and {} more functions", results.functions.len() - 30);
        }
    }
    println!();

    // Cross-References Analysis
    print_separator('=');
    println!("           CROSS-REFERENCES");
    print_separator('=');

    let xref_stats = analyze_xref_statistics(&results.xrefs);

    println!("Total XREFs: {}", results.xrefs.len());
    println!("Unique Targets: {}", results.unique_targets);
    println!();
    println!("By Type:");
    println!("  Call:              {:>6}", xref_stats.call_count);
    println!("  Unconditional:     {:>6}", xref_stats.branch_count);
    println!("  Conditional:       {:>6}", xref_stats.conditional_count);
    println!("  Data Read:         {:>6}", xref_stats.data_read_count);
    println!("  Data Write:        {:>6}", xref_stats.data_write_count);
    println!();

    // Show top referenced addresses
    let top_targets = find_top_targets(&results.xrefs, 10);
    if !top_targets.is_empty() {
        println!("Most Referenced Addresses:");
        print_separator('-');
        println!("{:<12} {:<10} {}", "Address", "Refs", "Types");
        for (addr, count, types) in top_targets {
            println!("0x{:08X}   {:>6}     {}", addr, count, types.join(", "));
        }
    }
    println!();

    // Loop Analysis
    print_separator('=');
    println!("           LOOPS DETECTED");
    print_separator('=');
    println!("Total Loops: {}", results.loops.len());
    println!();

    if !results.loops.is_empty() {
        println!("{:<12} {:<12} {:<8} {:<10} {:<8}",
                 "Header", "BackEdge", "Body", "Type", "Nesting");
        print_separator('-');

        for lp in results.loops.iter().take(20) {
            let loop_type_str = match lp.loop_type {
                LoopType::While => "while",
                LoopType::DoWhile => "do-while",
                LoopType::For => "for",
                LoopType::Infinite => "infinite",
            };

            println!(
                "0x{:08X} 0x{:08X} {:<8} {:<10} {:<8}",
                lp.header_addr,
                lp.back_edge_addr,
                lp.body_addrs.len(),
                loop_type_str,
                lp.nesting_level
            );
        }

        if results.loops.len() > 20 {
            println!("... and {} more loops", results.loops.len() - 20);
        }

        // Loop statistics
        let loop_stats = analyze_loop_statistics(&results.loops);
        println!();
        println!("Loop Statistics:");
        println!("  While loops:    {}", loop_stats.while_count);
        println!("  Do-While loops: {}", loop_stats.do_while_count);
        println!("  For loops:      {}", loop_stats.for_count);
        println!("  Infinite loops: {}", loop_stats.infinite_count);
        println!("  Max nesting:    {}", loop_stats.max_nesting);
        println!("  Avg body size:  {:.1} instructions", loop_stats.avg_body_size);
    }
    println!();

    // Performance Summary
    print_separator('=');
    println!("           PERFORMANCE METRICS");
    print_separator('=');

    let elapsed_ms = elapsed.as_secs_f64() * 1000.0;
    let instructions_per_sec = (results.total_instructions as f64 / elapsed.as_secs_f64()) as usize;
    let bytes_per_sec = (firmware_bytes.len() as f64 / elapsed.as_secs_f64()) as usize;

    println!("Total Instructions: {}", results.total_instructions);
    println!("Analysis Time:      {:.2} ms", elapsed_ms);
    println!("Throughput:         {} instructions/sec", format_number(instructions_per_sec));
    println!("                    {} bytes/sec ({:.1} KB/sec)",
             format_number(bytes_per_sec),
             bytes_per_sec as f64 / 1024.0);
    println!("Per-instruction:    {:.2} µs", 1000000.0 / instructions_per_sec as f64);

    // Memory statistics
    println!();
    println!("Memory Usage:");
    println!("  XREFs:      {} entries ({} KB)",
             results.xrefs.len(),
             (results.xrefs.len() * std::mem::size_of::<battlemagic_analyzer::types::CrossReference>()) / 1024);
    println!("  Functions:  {} entries ({} KB)",
             results.functions.len(),
             (results.functions.len() * 200) / 1024); // Approximate size
    println!("  Loops:      {} entries ({} KB)",
             results.loops.len(),
             (results.loops.len() * std::mem::size_of::<battlemagic_analyzer::types::Loop>()) / 1024);

    println!();
    print_separator('=');
    println!("           ANALYSIS COMPLETE");
    print_separator('=');
}

/// Run analysis and export as JSON
fn run_json_analysis(firmware_bytes: &[u8], firmware_path: &str) {
    let base_address = 0x08000000;
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, base_address);

    let start_time = Instant::now();
    let results = analyzer.analyze_from_bytes(firmware_bytes);
    let elapsed = start_time.elapsed();

    let vector_table = analyzer.get_vector_table();

    // Build JSON output
    let output = serde_json::json!({
        "firmware": {
            "path": firmware_path,
            "size": firmware_bytes.len(),
            "base_address": base_address,
        },
        "analysis": {
            "total_instructions": results.total_instructions,
            "analysis_time_ms": elapsed.as_millis(),
            "start_address": results.start_address,
            "end_address": results.end_address,
        },
        "vector_table": vector_table.iter().map(|v| {
            serde_json::json!({
                "vector_number": v.vector_number,
                "handler_name": v.handler_name,
                "handler_address": format!("0x{:08X}", v.handler_address),
                "is_valid": v.is_valid,
            })
        }).collect::<Vec<_>>(),
        "xrefs": {
            "total": results.xrefs.len(),
            "unique_targets": results.unique_targets,
            "by_type": analyze_xref_statistics(&results.xrefs),
            "entries": results.xrefs.iter().take(1000).map(|x| {
                serde_json::json!({
                    "from": format!("0x{:08X}", x.from_addr),
                    "to": format!("0x{:08X}", x.to_addr),
                    "type": format!("{:?}", x.xref_type),
                    "instruction": x.instruction,
                    "operands": x.operands,
                })
            }).collect::<Vec<_>>(),
        },
        "functions": {
            "total": results.functions.len(),
            "entries": results.functions.iter().take(100).map(|f| {
                serde_json::json!({
                    "address": format!("0x{:08X}", f.start_address),
                    "end": f.end_address.map(|e| format!("0x{:08X}", e)),
                    "name": f.name,
                    "callers": f.callers.len(),
                    "callees": f.callees.len(),
                    "stack_frame_size": f.stack_frame_size,
                    "arg_annotations": f.arg_annotations.len(),
                })
            }).collect::<Vec<_>>(),
        },
        "loops": {
            "total": results.loops.len(),
            "statistics": analyze_loop_statistics(&results.loops),
            "entries": results.loops.iter().take(100).map(|l| {
                serde_json::json!({
                    "header": format!("0x{:08X}", l.header_addr),
                    "back_edge": format!("0x{:08X}", l.back_edge_addr),
                    "body_size": l.body_addrs.len(),
                    "type": format!("{:?}", l.loop_type),
                    "nesting": l.nesting_level,
                })
            }).collect::<Vec<_>>(),
        },
    });

    println!("{}", serde_json::to_string_pretty(&output).unwrap());
}

// ============================================================================
// Helper Functions
// ============================================================================

struct XrefStats {
    call_count: usize,
    branch_count: usize,
    conditional_count: usize,
    data_read_count: usize,
    data_write_count: usize,
}

fn analyze_xref_statistics(xrefs: &[battlemagic_analyzer::types::CrossReference]) -> XrefStats {
    let mut stats = XrefStats {
        call_count: 0,
        branch_count: 0,
        conditional_count: 0,
        data_read_count: 0,
        data_write_count: 0,
    };

    for xref in xrefs {
        match xref.xref_type {
            XrefType::Call => stats.call_count += 1,
            XrefType::Branch => stats.branch_count += 1,
            XrefType::ConditionalBranch => stats.conditional_count += 1,
            XrefType::DataRead => stats.data_read_count += 1,
            XrefType::DataWrite => stats.data_write_count += 1,
        }
    }

    stats
}

struct LoopStats {
    while_count: usize,
    do_while_count: usize,
    for_count: usize,
    infinite_count: usize,
    max_nesting: u32,
    avg_body_size: f64,
}

fn analyze_loop_statistics(loops: &[battlemagic_analyzer::types::Loop]) -> LoopStats {
    let mut stats = LoopStats {
        while_count: 0,
        do_while_count: 0,
        for_count: 0,
        infinite_count: 0,
        max_nesting: 0,
        avg_body_size: 0.0,
    };

    if loops.is_empty() {
        return stats;
    }

    let mut total_body_size = 0;

    for lp in loops {
        match lp.loop_type {
            LoopType::While => stats.while_count += 1,
            LoopType::DoWhile => stats.do_while_count += 1,
            LoopType::For => stats.for_count += 1,
            LoopType::Infinite => stats.infinite_count += 1,
        }

        if lp.nesting_level > stats.max_nesting {
            stats.max_nesting = lp.nesting_level;
        }

        total_body_size += lp.body_addrs.len();
    }

    stats.avg_body_size = total_body_size as f64 / loops.len() as f64;
    stats
}

fn find_top_targets(xrefs: &[battlemagic_analyzer::types::CrossReference], limit: usize)
    -> Vec<(u32, usize, Vec<String>)> {
    let mut target_map: HashMap<u32, Vec<XrefType>> = HashMap::new();

    for xref in xrefs {
        target_map.entry(xref.to_addr)
            .or_insert_with(Vec::new)
            .push(xref.xref_type);
    }

    let mut targets: Vec<(u32, usize, Vec<String>)> = target_map
        .into_iter()
        .map(|(addr, types)| {
            let type_names: Vec<String> = types.iter()
                .map(|t| format!("{:?}", t))
                .collect::<std::collections::HashSet<_>>()
                .into_iter()
                .collect();
            (addr, types.len(), type_names)
        })
        .collect();

    targets.sort_by(|a, b| b.1.cmp(&a.1));
    targets.truncate(limit);
    targets
}

fn print_separator(ch: char) {
    println!("{}", ch.to_string().repeat(70));
}

fn format_number(n: usize) -> String {
    let s = n.to_string();
    let mut result = String::new();
    for (i, c) in s.chars().rev().enumerate() {
        if i > 0 && i % 3 == 0 {
            result.push(',');
        }
        result.push(c);
    }
    result.chars().rev().collect()
}

impl serde::Serialize for XrefStats {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("XrefStats", 5)?;
        state.serialize_field("call", &self.call_count)?;
        state.serialize_field("branch", &self.branch_count)?;
        state.serialize_field("conditional", &self.conditional_count)?;
        state.serialize_field("data_read", &self.data_read_count)?;
        state.serialize_field("data_write", &self.data_write_count)?;
        state.end()
    }
}

impl serde::Serialize for LoopStats {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("LoopStats", 6)?;
        state.serialize_field("while_loops", &self.while_count)?;
        state.serialize_field("do_while_loops", &self.do_while_count)?;
        state.serialize_field("for_loops", &self.for_count)?;
        state.serialize_field("infinite_loops", &self.infinite_count)?;
        state.serialize_field("max_nesting", &self.max_nesting)?;
        state.serialize_field("avg_body_size", &self.avg_body_size)?;
        state.end()
    }
}
