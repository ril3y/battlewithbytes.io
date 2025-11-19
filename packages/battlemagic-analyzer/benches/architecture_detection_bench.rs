use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use battlemagic_analyzer::binary::detector::ArchitectureDetector;

/// Generate test ARM Cortex-M firmware with vector table
fn generate_arm_firmware(size: usize) -> Vec<u8> {
    let mut data = vec![0u8; size];

    // Stack pointer at 0x20001000 (valid ARM SRAM)
    data[0..4].copy_from_slice(&0x2000_1000u32.to_le_bytes());

    // Reset handler at 0x080001C1 (Thumb bit set)
    data[4..8].copy_from_slice(&0x0800_01C1u32.to_le_bytes());

    // Fill more vectors with Thumb bit set
    for i in (8..256).step_by(4) {
        data[i..i+4].copy_from_slice(&0x0800_0101u32.to_le_bytes());
    }

    // Add some Thumb instructions
    for i in (256..size.min(2048)).step_by(2) {
        // LDR (literal) pattern: 0x4800-0x4FFF
        data[i] = 0x00;
        data[i+1] = 0x48;
    }

    data
}

/// Generate test MIPS firmware
fn generate_mips_firmware(size: usize) -> Vec<u8> {
    let mut data = vec![0u8; size];

    // MIPS jump at start: 0x08000000 (j 0x0)
    data[0..4].copy_from_slice(&0x0800_0000u32.to_be_bytes());

    // Fill with common MIPS instructions
    for i in (4..size.min(2048)).step_by(4) {
        // ADDIU instruction: opcode 0x09
        let inst = 0x0900_0000u32;
        data[i..i+4].copy_from_slice(&inst.to_be_bytes());
    }

    data
}

/// Generate test RISC-V firmware
fn generate_riscv_firmware(size: usize) -> Vec<u8> {
    let mut data = vec![0u8; size];

    // RISC-V JAL at start: 0x0000006F
    data[0..4].copy_from_slice(&0x0000_006Fu32.to_le_bytes());

    // Fill with common RISC-V instructions and compressed instructions
    for i in (4..size.min(2048)).step_by(4) {
        // LUI instruction: opcode 0x37
        let inst = 0x0000_0037u32;
        data[i..i+4].copy_from_slice(&inst.to_le_bytes());
    }

    data
}

/// Generate test ELF file with ARM architecture
fn generate_elf_arm(size: usize) -> Vec<u8> {
    let mut data = vec![0u8; size.max(0x14)];

    // ELF magic
    data[0..4].copy_from_slice(&[0x7F, 0x45, 0x4C, 0x46]);
    // Little endian
    data[5] = 1;
    // e_machine = EM_ARM (40)
    data[0x12] = 40;
    data[0x13] = 0;

    data
}

fn bench_architecture_detection(c: &mut Criterion) {
    let sizes = vec![512, 1024, 4096, 10_000, 50_000];

    let mut group = c.benchmark_group("architecture_detection");

    for size in sizes {
        // Benchmark ARM detection
        let arm_data = generate_arm_firmware(size);
        group.bench_with_input(
            BenchmarkId::new("ARM_raw", size),
            &arm_data,
            |b, data| {
                b.iter(|| {
                    let detector = ArchitectureDetector::new();
                    black_box(detector.detect(black_box(data)));
                });
            },
        );

        // Benchmark MIPS detection
        let mips_data = generate_mips_firmware(size);
        group.bench_with_input(
            BenchmarkId::new("MIPS_raw", size),
            &mips_data,
            |b, data| {
                b.iter(|| {
                    let detector = ArchitectureDetector::new();
                    black_box(detector.detect(black_box(data)));
                });
            },
        );

        // Benchmark RISC-V detection
        let riscv_data = generate_riscv_firmware(size);
        group.bench_with_input(
            BenchmarkId::new("RISCV_raw", size),
            &riscv_data,
            |b, data| {
                b.iter(|| {
                    let detector = ArchitectureDetector::new();
                    black_box(detector.detect(black_box(data)));
                });
            },
        );

        // Benchmark ELF detection (fast path)
        let elf_data = generate_elf_arm(size);
        group.bench_with_input(
            BenchmarkId::new("ARM_ELF", size),
            &elf_data,
            |b, data| {
                b.iter(|| {
                    let detector = ArchitectureDetector::new();
                    black_box(detector.detect(black_box(data)));
                });
            },
        );
    }

    group.finish();
}

fn bench_with_base_address_hint(c: &mut Criterion) {
    let size = 10_000;
    let data = vec![0u8; size];

    let mut group = c.benchmark_group("base_address_hint");

    group.bench_function("without_hint", |b| {
        b.iter(|| {
            let detector = ArchitectureDetector::new();
            black_box(detector.detect(black_box(&data)));
        });
    });

    group.bench_function("with_ARM_hint", |b| {
        b.iter(|| {
            let detector = ArchitectureDetector::new()
                .with_base_address(0x0800_0000);
            black_box(detector.detect(black_box(&data)));
        });
    });

    group.bench_function("with_MIPS_hint", |b| {
        b.iter(|| {
            let detector = ArchitectureDetector::new()
                .with_base_address(0xBFC0_0000);
            black_box(detector.detect(black_box(&data)));
        });
    });

    group.finish();
}

criterion_group!(benches, bench_architecture_detection, bench_with_base_address_hint);
criterion_main!(benches);
