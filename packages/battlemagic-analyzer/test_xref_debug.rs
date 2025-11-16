use battlemagic_analyzer::traits::Instruction;
use battlemagic_analyzer::arch::arm::xref::extract_arm_xrefs;

fn main() {
    let inst = Instruction::new(
        0x8000,
        vec![0x00, 0x48],
        "ldr".to_string(),
        "r0, [pc, #0x20]".to_string(),
    );
    
    let xrefs = extract_arm_xrefs(&inst);
    println!("Mnemonic: {}", inst.mnemonic);
    println!("Operands: {}", inst.operands);
    println!("Xrefs found: {}", xrefs.len());
}
