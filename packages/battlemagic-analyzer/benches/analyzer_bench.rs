use battlemagic_analyzer::types::Instruction;
use battlemagic_analyzer::xref::XrefBuilder;
use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion, Throughput};

fn create_test_instructions(count: usize, instruction_type: &str) -> Vec<Instruction> {
    let mut instructions = Vec::with_capacity(count);

    for i in 0..count {
        let addr = 0x8000 + (i as u32 * 4);
        let (mnemonic, operands) = match instruction_type {
            "call" => ("bl", format!("#0x{:x}", 0x10000 + i * 4)),
            "branch" => ("b.eq", format!("#0x{:x}", 0x10000 + i * 4)),
            "data" => ("ldr", "r0, [pc, #0x10]".to_string()),
            "mixed" => {
                match i % 4 {
                    0 => ("bl", format!("#0x{:x}", 0x10000 + i * 4)),
                    1 => ("b.eq", format!("#0x{:x}", 0x10000 + i * 4)),
                    2 => ("ldr", "r0, [pc, #0x10]".to_string()),
                    _ => ("mov", "r0, r1".to_string()),
                }
            }
            _ => ("mov", "r0, r1".to_string()),
        };

        instructions.push(Instruction::new(
            addr,
            vec![0, 0, 0, 0],
            mnemonic.to_string(),
            operands,
        ));
    }

    instructions
}

fn bench_analysis_small(c: &mut Criterion) {
    let mut group = c.benchmark_group("analysis_small");

    for size in [10, 50, 100, 500].iter() {
        group.throughput(Throughput::Elements(*size as u64));

        group.bench_with_input(BenchmarkId::new("calls", size), size, |b, &size| {
            let instructions = create_test_instructions(size, "call");
            b.iter(|| {
                let mut builder = XrefBuilder::new();
                builder.build_from_instructions(black_box(&instructions));
                builder
            });
        });

        group.bench_with_input(BenchmarkId::new("branches", size), size, |b, &size| {
            let instructions = create_test_instructions(size, "branch");
            b.iter(|| {
                let mut builder = XrefBuilder::new();
                builder.build_from_instructions(black_box(&instructions));
                builder
            });
        });

        group.bench_with_input(BenchmarkId::new("data_refs", size), size, |b, &size| {
            let instructions = create_test_instructions(size, "data");
            b.iter(|| {
                let mut builder = XrefBuilder::new();
                builder.build_from_instructions(black_box(&instructions));
                builder
            });
        });

        group.bench_with_input(BenchmarkId::new("mixed", size), size, |b, &size| {
            let instructions = create_test_instructions(size, "mixed");
            b.iter(|| {
                let mut builder = XrefBuilder::new();
                builder.build_from_instructions(black_box(&instructions));
                builder
            });
        });
    }

    group.finish();
}

fn bench_analysis_large(c: &mut Criterion) {
    let mut group = c.benchmark_group("analysis_large");
    group.sample_size(20); // Reduce sample size for large benchmarks

    for size in [1000, 5000, 10000, 50000].iter() {
        group.throughput(Throughput::Elements(*size as u64));

        group.bench_with_input(BenchmarkId::new("mixed", size), size, |b, &size| {
            let instructions = create_test_instructions(size, "mixed");
            b.iter(|| {
                let mut builder = XrefBuilder::new();
                builder.build_from_instructions(black_box(&instructions));
                builder
            });
        });
    }

    group.finish();
}

fn bench_xref_queries(c: &mut Criterion) {
    let mut group = c.benchmark_group("xref_queries");

    // Create a binary with known xrefs
    let instructions = create_test_instructions(10000, "mixed");
    let mut builder = XrefBuilder::new();
    builder.build_from_instructions(&instructions);

    group.bench_function("get_xrefs_to_hot", |b| {
        // Query a "hot" address that has many references
        b.iter(|| {
            let xrefs = builder.get_xrefs_to(black_box(0x10000));
            xrefs
        });
    });

    group.bench_function("get_xrefs_to_cold", |b| {
        // Query an address with no references
        b.iter(|| {
            let xrefs = builder.get_xrefs_to(black_box(0xDEADBEEF));
            xrefs
        });
    });

    group.bench_function("get_xrefs_from", |b| {
        b.iter(|| {
            let xrefs = builder.get_xrefs_from(black_box(0x8000));
            xrefs
        });
    });

    group.bench_function("xref_count", |b| {
        b.iter(|| {
            let count = builder.count();
            black_box(count)
        });
    });

    group.finish();
}

fn bench_address_parsing(c: &mut Criterion) {
    let mut group = c.benchmark_group("address_parsing");

    let builder = XrefBuilder::new();

    group.bench_function("parse_hex_address", |b| {
        b.iter(|| {
            // This is private, so we test indirectly through instruction creation
            let instr = Instruction::new(
                0x1000,
                vec![0, 0, 0, 0],
                "bl".to_string(),
                black_box("#0x8000".to_string()),
            );
            instr
        });
    });

    group.bench_function("parse_pc_relative", |b| {
        b.iter(|| {
            let instr = Instruction::new(
                0x1000,
                vec![0, 0, 0, 0],
                "ldr".to_string(),
                black_box("r0, [pc, #0x100]".to_string()),
            );
            instr
        });
    });

    group.finish();
}

fn bench_instruction_classification(c: &mut Criterion) {
    let mut group = c.benchmark_group("instruction_classification");

    let call_instr = Instruction::new(0x1000, vec![0, 0, 0, 0], "bl".to_string(), "#0x2000".to_string());
    let branch_instr = Instruction::new(0x1000, vec![0, 0, 0, 0], "b.eq".to_string(), "#0x2000".to_string());
    let data_instr = Instruction::new(0x1000, vec![0, 0, 0, 0], "ldr".to_string(), "r0, [pc, #0x10]".to_string());
    let other_instr = Instruction::new(0x1000, vec![0, 0, 0, 0], "mov".to_string(), "r0, r1".to_string());

    group.bench_function("is_call", |b| {
        b.iter(|| {
            black_box(call_instr.is_call())
        });
    });

    group.bench_function("is_branch", |b| {
        b.iter(|| {
            black_box(branch_instr.is_branch())
        });
    });

    group.bench_function("is_data_ref", |b| {
        b.iter(|| {
            black_box(data_instr.is_data_ref())
        });
    });

    group.bench_function("is_other", |b| {
        b.iter(|| {
            black_box(!other_instr.is_call() && !other_instr.is_branch() && !other_instr.is_data_ref())
        });
    });

    group.finish();
}

fn bench_realistic_function(c: &mut Criterion) {
    let mut group = c.benchmark_group("realistic_function");

    // Simulate a realistic function with mixed instructions
    let instructions = vec![
        Instruction::new(0x8000, vec![0, 0, 0, 0], "push".to_string(), "{r4-r7, lr}".to_string()),
        Instruction::new(0x8004, vec![0, 0, 0, 0], "sub".to_string(), "sp, #16".to_string()),
        Instruction::new(0x8008, vec![0, 0, 0, 0], "ldr".to_string(), "r0, [pc, #0x20]".to_string()),
        Instruction::new(0x800c, vec![0, 0, 0, 0], "bl".to_string(), "#0x9000".to_string()),
        Instruction::new(0x8010, vec![0, 0, 0, 0], "cmp".to_string(), "r0, #0".to_string()),
        Instruction::new(0x8014, vec![0, 0, 0, 0], "b.eq".to_string(), "#0x8030".to_string()),
        Instruction::new(0x8018, vec![0, 0, 0, 0], "bl".to_string(), "#0x9100".to_string()),
        Instruction::new(0x801c, vec![0, 0, 0, 0], "str".to_string(), "r0, [pc, #0x10]".to_string()),
        Instruction::new(0x8020, vec![0, 0, 0, 0], "add".to_string(), "sp, #16".to_string()),
        Instruction::new(0x8024, vec![0, 0, 0, 0], "pop".to_string(), "{r4-r7, pc}".to_string()),
        Instruction::new(0x8030, vec![0, 0, 0, 0], "mov".to_string(), "r0, #-1".to_string()),
        Instruction::new(0x8034, vec![0, 0, 0, 0], "b".to_string(), "#0x8020".to_string()),
    ];

    group.bench_function("complete_function", |b| {
        b.iter(|| {
            let mut builder = XrefBuilder::new();
            builder.build_from_instructions(black_box(&instructions));
            builder
        });
    });

    group.finish();
}

fn bench_memory_overhead(c: &mut Criterion) {
    let mut group = c.benchmark_group("memory_overhead");

    for size in [100, 1000, 10000].iter() {
        group.bench_with_input(BenchmarkId::new("builder_creation", size), size, |b, &size| {
            b.iter(|| {
                let instructions = create_test_instructions(size, "mixed");
                let mut builder = XrefBuilder::new();
                builder.build_from_instructions(&instructions);
                black_box(builder)
            });
        });
    }

    group.finish();
}

criterion_group!(
    benches,
    bench_analysis_small,
    bench_analysis_large,
    bench_xref_queries,
    bench_address_parsing,
    bench_instruction_classification,
    bench_realistic_function,
    bench_memory_overhead
);

criterion_main!(benches);
