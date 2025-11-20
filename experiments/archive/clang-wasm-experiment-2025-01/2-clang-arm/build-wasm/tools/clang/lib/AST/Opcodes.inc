#ifdef GET_OPCODE_NAMES
OP_AddSint8,
OP_AddUint8,
OP_AddSint16,
OP_AddUint16,
OP_AddSint32,
OP_AddUint32,
OP_AddSint64,
OP_AddUint64,
OP_AddIntAP,
OP_AddIntAPS,
OP_AddBool,
#endif
#ifdef GET_INTERP
case OP_AddSint8: {
  if (!Add<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_AddUint8: {
  if (!Add<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_AddSint16: {
  if (!Add<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_AddUint16: {
  if (!Add<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_AddSint32: {
  if (!Add<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_AddUint32: {
  if (!Add<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_AddSint64: {
  if (!Add<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_AddUint64: {
  if (!Add<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_AddIntAP: {
  if (!Add<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_AddIntAPS: {
  if (!Add<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_AddBool: {
  if (!Add<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_AddSint8:
  PrintName("AddSint8");
  OS << "\t" << "\n";
  continue;
case OP_AddUint8:
  PrintName("AddUint8");
  OS << "\t" << "\n";
  continue;
case OP_AddSint16:
  PrintName("AddSint16");
  OS << "\t" << "\n";
  continue;
case OP_AddUint16:
  PrintName("AddUint16");
  OS << "\t" << "\n";
  continue;
case OP_AddSint32:
  PrintName("AddSint32");
  OS << "\t" << "\n";
  continue;
case OP_AddUint32:
  PrintName("AddUint32");
  OS << "\t" << "\n";
  continue;
case OP_AddSint64:
  PrintName("AddSint64");
  OS << "\t" << "\n";
  continue;
case OP_AddUint64:
  PrintName("AddUint64");
  OS << "\t" << "\n";
  continue;
case OP_AddIntAP:
  PrintName("AddIntAP");
  OS << "\t" << "\n";
  continue;
case OP_AddIntAPS:
  PrintName("AddIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_AddBool:
  PrintName("AddBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitAddSint8(const SourceInfo &);
bool emitAddUint8(const SourceInfo &);
bool emitAddSint16(const SourceInfo &);
bool emitAddUint16(const SourceInfo &);
bool emitAddSint32(const SourceInfo &);
bool emitAddUint32(const SourceInfo &);
bool emitAddSint64(const SourceInfo &);
bool emitAddUint64(const SourceInfo &);
bool emitAddIntAP(const SourceInfo &);
bool emitAddIntAPS(const SourceInfo &);
bool emitAddBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitAdd(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitAdd(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitAddSint8(I);
  case PT_Uint8:
    return emitAddUint8(I);
  case PT_Sint16:
    return emitAddSint16(I);
  case PT_Uint16:
    return emitAddUint16(I);
  case PT_Sint32:
    return emitAddSint32(I);
  case PT_Uint32:
    return emitAddUint32(I);
  case PT_Sint64:
    return emitAddSint64(I);
  case PT_Uint64:
    return emitAddUint64(I);
  case PT_IntAP:
    return emitAddIntAP(I);
  case PT_IntAPS:
    return emitAddIntAPS(I);
  case PT_Bool:
    return emitAddBool(I);
  default: llvm_unreachable("invalid type: emitAdd");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitAddSint8(const SourceInfo &L) {
  return emitOp<>(OP_AddSint8, L);
}
bool ByteCodeEmitter::emitAddUint8(const SourceInfo &L) {
  return emitOp<>(OP_AddUint8, L);
}
bool ByteCodeEmitter::emitAddSint16(const SourceInfo &L) {
  return emitOp<>(OP_AddSint16, L);
}
bool ByteCodeEmitter::emitAddUint16(const SourceInfo &L) {
  return emitOp<>(OP_AddUint16, L);
}
bool ByteCodeEmitter::emitAddSint32(const SourceInfo &L) {
  return emitOp<>(OP_AddSint32, L);
}
bool ByteCodeEmitter::emitAddUint32(const SourceInfo &L) {
  return emitOp<>(OP_AddUint32, L);
}
bool ByteCodeEmitter::emitAddSint64(const SourceInfo &L) {
  return emitOp<>(OP_AddSint64, L);
}
bool ByteCodeEmitter::emitAddUint64(const SourceInfo &L) {
  return emitOp<>(OP_AddUint64, L);
}
bool ByteCodeEmitter::emitAddIntAP(const SourceInfo &L) {
  return emitOp<>(OP_AddIntAP, L);
}
bool ByteCodeEmitter::emitAddIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_AddIntAPS, L);
}
bool ByteCodeEmitter::emitAddBool(const SourceInfo &L) {
  return emitOp<>(OP_AddBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitAddSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Add<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitAddUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Add<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitAddSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Add<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitAddUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Add<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitAddSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Add<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitAddUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Add<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitAddSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Add<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitAddUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Add<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitAddIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Add<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitAddIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Add<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitAddBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Add<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_AddOffsetSint8,
OP_AddOffsetUint8,
OP_AddOffsetSint16,
OP_AddOffsetUint16,
OP_AddOffsetSint32,
OP_AddOffsetUint32,
OP_AddOffsetSint64,
OP_AddOffsetUint64,
OP_AddOffsetIntAP,
OP_AddOffsetIntAPS,
OP_AddOffsetBool,
#endif
#ifdef GET_INTERP
case OP_AddOffsetSint8: {
  if (!AddOffset<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_AddOffsetUint8: {
  if (!AddOffset<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_AddOffsetSint16: {
  if (!AddOffset<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_AddOffsetUint16: {
  if (!AddOffset<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_AddOffsetSint32: {
  if (!AddOffset<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_AddOffsetUint32: {
  if (!AddOffset<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_AddOffsetSint64: {
  if (!AddOffset<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_AddOffsetUint64: {
  if (!AddOffset<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_AddOffsetIntAP: {
  if (!AddOffset<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_AddOffsetIntAPS: {
  if (!AddOffset<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_AddOffsetBool: {
  if (!AddOffset<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_AddOffsetSint8:
  PrintName("AddOffsetSint8");
  OS << "\t" << "\n";
  continue;
case OP_AddOffsetUint8:
  PrintName("AddOffsetUint8");
  OS << "\t" << "\n";
  continue;
case OP_AddOffsetSint16:
  PrintName("AddOffsetSint16");
  OS << "\t" << "\n";
  continue;
case OP_AddOffsetUint16:
  PrintName("AddOffsetUint16");
  OS << "\t" << "\n";
  continue;
case OP_AddOffsetSint32:
  PrintName("AddOffsetSint32");
  OS << "\t" << "\n";
  continue;
case OP_AddOffsetUint32:
  PrintName("AddOffsetUint32");
  OS << "\t" << "\n";
  continue;
case OP_AddOffsetSint64:
  PrintName("AddOffsetSint64");
  OS << "\t" << "\n";
  continue;
case OP_AddOffsetUint64:
  PrintName("AddOffsetUint64");
  OS << "\t" << "\n";
  continue;
case OP_AddOffsetIntAP:
  PrintName("AddOffsetIntAP");
  OS << "\t" << "\n";
  continue;
case OP_AddOffsetIntAPS:
  PrintName("AddOffsetIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_AddOffsetBool:
  PrintName("AddOffsetBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitAddOffsetSint8(const SourceInfo &);
bool emitAddOffsetUint8(const SourceInfo &);
bool emitAddOffsetSint16(const SourceInfo &);
bool emitAddOffsetUint16(const SourceInfo &);
bool emitAddOffsetSint32(const SourceInfo &);
bool emitAddOffsetUint32(const SourceInfo &);
bool emitAddOffsetSint64(const SourceInfo &);
bool emitAddOffsetUint64(const SourceInfo &);
bool emitAddOffsetIntAP(const SourceInfo &);
bool emitAddOffsetIntAPS(const SourceInfo &);
bool emitAddOffsetBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitAddOffset(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitAddOffset(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitAddOffsetSint8(I);
  case PT_Uint8:
    return emitAddOffsetUint8(I);
  case PT_Sint16:
    return emitAddOffsetSint16(I);
  case PT_Uint16:
    return emitAddOffsetUint16(I);
  case PT_Sint32:
    return emitAddOffsetSint32(I);
  case PT_Uint32:
    return emitAddOffsetUint32(I);
  case PT_Sint64:
    return emitAddOffsetSint64(I);
  case PT_Uint64:
    return emitAddOffsetUint64(I);
  case PT_IntAP:
    return emitAddOffsetIntAP(I);
  case PT_IntAPS:
    return emitAddOffsetIntAPS(I);
  case PT_Bool:
    return emitAddOffsetBool(I);
  default: llvm_unreachable("invalid type: emitAddOffset");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitAddOffsetSint8(const SourceInfo &L) {
  return emitOp<>(OP_AddOffsetSint8, L);
}
bool ByteCodeEmitter::emitAddOffsetUint8(const SourceInfo &L) {
  return emitOp<>(OP_AddOffsetUint8, L);
}
bool ByteCodeEmitter::emitAddOffsetSint16(const SourceInfo &L) {
  return emitOp<>(OP_AddOffsetSint16, L);
}
bool ByteCodeEmitter::emitAddOffsetUint16(const SourceInfo &L) {
  return emitOp<>(OP_AddOffsetUint16, L);
}
bool ByteCodeEmitter::emitAddOffsetSint32(const SourceInfo &L) {
  return emitOp<>(OP_AddOffsetSint32, L);
}
bool ByteCodeEmitter::emitAddOffsetUint32(const SourceInfo &L) {
  return emitOp<>(OP_AddOffsetUint32, L);
}
bool ByteCodeEmitter::emitAddOffsetSint64(const SourceInfo &L) {
  return emitOp<>(OP_AddOffsetSint64, L);
}
bool ByteCodeEmitter::emitAddOffsetUint64(const SourceInfo &L) {
  return emitOp<>(OP_AddOffsetUint64, L);
}
bool ByteCodeEmitter::emitAddOffsetIntAP(const SourceInfo &L) {
  return emitOp<>(OP_AddOffsetIntAP, L);
}
bool ByteCodeEmitter::emitAddOffsetIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_AddOffsetIntAPS, L);
}
bool ByteCodeEmitter::emitAddOffsetBool(const SourceInfo &L) {
  return emitOp<>(OP_AddOffsetBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitAddOffsetSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return AddOffset<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitAddOffsetUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return AddOffset<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitAddOffsetSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return AddOffset<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitAddOffsetUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return AddOffset<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitAddOffsetSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return AddOffset<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitAddOffsetUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return AddOffset<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitAddOffsetSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return AddOffset<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitAddOffsetUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return AddOffset<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitAddOffsetIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return AddOffset<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitAddOffsetIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return AddOffset<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitAddOffsetBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return AddOffset<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Addf,
#endif
#ifdef GET_INTERP
case OP_Addf: {
  auto V0 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!Addf(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Addf:
  PrintName("Addf");
  OS << "\t" << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitAddf(llvm::RoundingMode, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitAddf(llvm::RoundingMode A0, const SourceInfo &L) {
  return emitOp<llvm::RoundingMode>(OP_Addf, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitAddf(llvm::RoundingMode A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Addf(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ArrayDecay,
#endif
#ifdef GET_INTERP
case OP_ArrayDecay: {
  if (!ArrayDecay(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ArrayDecay:
  PrintName("ArrayDecay");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitArrayDecay(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitArrayDecay(const SourceInfo &L) {
  return emitOp<>(OP_ArrayDecay, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitArrayDecay(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayDecay(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ArrayElemPtrSint8,
OP_ArrayElemPtrUint8,
OP_ArrayElemPtrSint16,
OP_ArrayElemPtrUint16,
OP_ArrayElemPtrSint32,
OP_ArrayElemPtrUint32,
OP_ArrayElemPtrSint64,
OP_ArrayElemPtrUint64,
OP_ArrayElemPtrIntAP,
OP_ArrayElemPtrIntAPS,
OP_ArrayElemPtrBool,
#endif
#ifdef GET_INTERP
case OP_ArrayElemPtrSint8: {
  if (!ArrayElemPtr<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrUint8: {
  if (!ArrayElemPtr<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrSint16: {
  if (!ArrayElemPtr<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrUint16: {
  if (!ArrayElemPtr<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrSint32: {
  if (!ArrayElemPtr<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrUint32: {
  if (!ArrayElemPtr<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrSint64: {
  if (!ArrayElemPtr<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrUint64: {
  if (!ArrayElemPtr<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrIntAP: {
  if (!ArrayElemPtr<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrIntAPS: {
  if (!ArrayElemPtr<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrBool: {
  if (!ArrayElemPtr<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ArrayElemPtrSint8:
  PrintName("ArrayElemPtrSint8");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrUint8:
  PrintName("ArrayElemPtrUint8");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrSint16:
  PrintName("ArrayElemPtrSint16");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrUint16:
  PrintName("ArrayElemPtrUint16");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrSint32:
  PrintName("ArrayElemPtrSint32");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrUint32:
  PrintName("ArrayElemPtrUint32");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrSint64:
  PrintName("ArrayElemPtrSint64");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrUint64:
  PrintName("ArrayElemPtrUint64");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrIntAP:
  PrintName("ArrayElemPtrIntAP");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrIntAPS:
  PrintName("ArrayElemPtrIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrBool:
  PrintName("ArrayElemPtrBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitArrayElemPtrSint8(const SourceInfo &);
bool emitArrayElemPtrUint8(const SourceInfo &);
bool emitArrayElemPtrSint16(const SourceInfo &);
bool emitArrayElemPtrUint16(const SourceInfo &);
bool emitArrayElemPtrSint32(const SourceInfo &);
bool emitArrayElemPtrUint32(const SourceInfo &);
bool emitArrayElemPtrSint64(const SourceInfo &);
bool emitArrayElemPtrUint64(const SourceInfo &);
bool emitArrayElemPtrIntAP(const SourceInfo &);
bool emitArrayElemPtrIntAPS(const SourceInfo &);
bool emitArrayElemPtrBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitArrayElemPtr(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitArrayElemPtr(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitArrayElemPtrSint8(I);
  case PT_Uint8:
    return emitArrayElemPtrUint8(I);
  case PT_Sint16:
    return emitArrayElemPtrSint16(I);
  case PT_Uint16:
    return emitArrayElemPtrUint16(I);
  case PT_Sint32:
    return emitArrayElemPtrSint32(I);
  case PT_Uint32:
    return emitArrayElemPtrUint32(I);
  case PT_Sint64:
    return emitArrayElemPtrSint64(I);
  case PT_Uint64:
    return emitArrayElemPtrUint64(I);
  case PT_IntAP:
    return emitArrayElemPtrIntAP(I);
  case PT_IntAPS:
    return emitArrayElemPtrIntAPS(I);
  case PT_Bool:
    return emitArrayElemPtrBool(I);
  default: llvm_unreachable("invalid type: emitArrayElemPtr");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitArrayElemPtrSint8(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrSint8, L);
}
bool ByteCodeEmitter::emitArrayElemPtrUint8(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrUint8, L);
}
bool ByteCodeEmitter::emitArrayElemPtrSint16(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrSint16, L);
}
bool ByteCodeEmitter::emitArrayElemPtrUint16(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrUint16, L);
}
bool ByteCodeEmitter::emitArrayElemPtrSint32(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrSint32, L);
}
bool ByteCodeEmitter::emitArrayElemPtrUint32(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrUint32, L);
}
bool ByteCodeEmitter::emitArrayElemPtrSint64(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrSint64, L);
}
bool ByteCodeEmitter::emitArrayElemPtrUint64(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrUint64, L);
}
bool ByteCodeEmitter::emitArrayElemPtrIntAP(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrIntAP, L);
}
bool ByteCodeEmitter::emitArrayElemPtrIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrIntAPS, L);
}
bool ByteCodeEmitter::emitArrayElemPtrBool(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitArrayElemPtrSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtr<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtr<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtr<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtr<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtr<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtr<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtr<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtr<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtr<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtr<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtr<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ArrayElemPtrPopSint8,
OP_ArrayElemPtrPopUint8,
OP_ArrayElemPtrPopSint16,
OP_ArrayElemPtrPopUint16,
OP_ArrayElemPtrPopSint32,
OP_ArrayElemPtrPopUint32,
OP_ArrayElemPtrPopSint64,
OP_ArrayElemPtrPopUint64,
OP_ArrayElemPtrPopIntAP,
OP_ArrayElemPtrPopIntAPS,
OP_ArrayElemPtrPopBool,
#endif
#ifdef GET_INTERP
case OP_ArrayElemPtrPopSint8: {
  if (!ArrayElemPtrPop<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrPopUint8: {
  if (!ArrayElemPtrPop<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrPopSint16: {
  if (!ArrayElemPtrPop<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrPopUint16: {
  if (!ArrayElemPtrPop<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrPopSint32: {
  if (!ArrayElemPtrPop<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrPopUint32: {
  if (!ArrayElemPtrPop<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrPopSint64: {
  if (!ArrayElemPtrPop<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrPopUint64: {
  if (!ArrayElemPtrPop<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrPopIntAP: {
  if (!ArrayElemPtrPop<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrPopIntAPS: {
  if (!ArrayElemPtrPop<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ArrayElemPtrPopBool: {
  if (!ArrayElemPtrPop<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ArrayElemPtrPopSint8:
  PrintName("ArrayElemPtrPopSint8");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrPopUint8:
  PrintName("ArrayElemPtrPopUint8");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrPopSint16:
  PrintName("ArrayElemPtrPopSint16");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrPopUint16:
  PrintName("ArrayElemPtrPopUint16");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrPopSint32:
  PrintName("ArrayElemPtrPopSint32");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrPopUint32:
  PrintName("ArrayElemPtrPopUint32");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrPopSint64:
  PrintName("ArrayElemPtrPopSint64");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrPopUint64:
  PrintName("ArrayElemPtrPopUint64");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrPopIntAP:
  PrintName("ArrayElemPtrPopIntAP");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrPopIntAPS:
  PrintName("ArrayElemPtrPopIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ArrayElemPtrPopBool:
  PrintName("ArrayElemPtrPopBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitArrayElemPtrPopSint8(const SourceInfo &);
bool emitArrayElemPtrPopUint8(const SourceInfo &);
bool emitArrayElemPtrPopSint16(const SourceInfo &);
bool emitArrayElemPtrPopUint16(const SourceInfo &);
bool emitArrayElemPtrPopSint32(const SourceInfo &);
bool emitArrayElemPtrPopUint32(const SourceInfo &);
bool emitArrayElemPtrPopSint64(const SourceInfo &);
bool emitArrayElemPtrPopUint64(const SourceInfo &);
bool emitArrayElemPtrPopIntAP(const SourceInfo &);
bool emitArrayElemPtrPopIntAPS(const SourceInfo &);
bool emitArrayElemPtrPopBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitArrayElemPtrPop(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitArrayElemPtrPop(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitArrayElemPtrPopSint8(I);
  case PT_Uint8:
    return emitArrayElemPtrPopUint8(I);
  case PT_Sint16:
    return emitArrayElemPtrPopSint16(I);
  case PT_Uint16:
    return emitArrayElemPtrPopUint16(I);
  case PT_Sint32:
    return emitArrayElemPtrPopSint32(I);
  case PT_Uint32:
    return emitArrayElemPtrPopUint32(I);
  case PT_Sint64:
    return emitArrayElemPtrPopSint64(I);
  case PT_Uint64:
    return emitArrayElemPtrPopUint64(I);
  case PT_IntAP:
    return emitArrayElemPtrPopIntAP(I);
  case PT_IntAPS:
    return emitArrayElemPtrPopIntAPS(I);
  case PT_Bool:
    return emitArrayElemPtrPopBool(I);
  default: llvm_unreachable("invalid type: emitArrayElemPtrPop");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitArrayElemPtrPopSint8(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrPopSint8, L);
}
bool ByteCodeEmitter::emitArrayElemPtrPopUint8(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrPopUint8, L);
}
bool ByteCodeEmitter::emitArrayElemPtrPopSint16(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrPopSint16, L);
}
bool ByteCodeEmitter::emitArrayElemPtrPopUint16(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrPopUint16, L);
}
bool ByteCodeEmitter::emitArrayElemPtrPopSint32(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrPopSint32, L);
}
bool ByteCodeEmitter::emitArrayElemPtrPopUint32(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrPopUint32, L);
}
bool ByteCodeEmitter::emitArrayElemPtrPopSint64(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrPopSint64, L);
}
bool ByteCodeEmitter::emitArrayElemPtrPopUint64(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrPopUint64, L);
}
bool ByteCodeEmitter::emitArrayElemPtrPopIntAP(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrPopIntAP, L);
}
bool ByteCodeEmitter::emitArrayElemPtrPopIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrPopIntAPS, L);
}
bool ByteCodeEmitter::emitArrayElemPtrPopBool(const SourceInfo &L) {
  return emitOp<>(OP_ArrayElemPtrPopBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitArrayElemPtrPopSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtrPop<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrPopUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtrPop<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrPopSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtrPop<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrPopUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtrPop<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrPopSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtrPop<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrPopUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtrPop<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrPopSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtrPop<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrPopUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtrPop<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrPopIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtrPop<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrPopIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtrPop<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitArrayElemPtrPopBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ArrayElemPtrPop<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_BitAndSint8,
OP_BitAndUint8,
OP_BitAndSint16,
OP_BitAndUint16,
OP_BitAndSint32,
OP_BitAndUint32,
OP_BitAndSint64,
OP_BitAndUint64,
OP_BitAndIntAP,
OP_BitAndIntAPS,
#endif
#ifdef GET_INTERP
case OP_BitAndSint8: {
  if (!BitAnd<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_BitAndUint8: {
  if (!BitAnd<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_BitAndSint16: {
  if (!BitAnd<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_BitAndUint16: {
  if (!BitAnd<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_BitAndSint32: {
  if (!BitAnd<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_BitAndUint32: {
  if (!BitAnd<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_BitAndSint64: {
  if (!BitAnd<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_BitAndUint64: {
  if (!BitAnd<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_BitAndIntAP: {
  if (!BitAnd<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_BitAndIntAPS: {
  if (!BitAnd<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_BitAndSint8:
  PrintName("BitAndSint8");
  OS << "\t" << "\n";
  continue;
case OP_BitAndUint8:
  PrintName("BitAndUint8");
  OS << "\t" << "\n";
  continue;
case OP_BitAndSint16:
  PrintName("BitAndSint16");
  OS << "\t" << "\n";
  continue;
case OP_BitAndUint16:
  PrintName("BitAndUint16");
  OS << "\t" << "\n";
  continue;
case OP_BitAndSint32:
  PrintName("BitAndSint32");
  OS << "\t" << "\n";
  continue;
case OP_BitAndUint32:
  PrintName("BitAndUint32");
  OS << "\t" << "\n";
  continue;
case OP_BitAndSint64:
  PrintName("BitAndSint64");
  OS << "\t" << "\n";
  continue;
case OP_BitAndUint64:
  PrintName("BitAndUint64");
  OS << "\t" << "\n";
  continue;
case OP_BitAndIntAP:
  PrintName("BitAndIntAP");
  OS << "\t" << "\n";
  continue;
case OP_BitAndIntAPS:
  PrintName("BitAndIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitBitAndSint8(const SourceInfo &);
bool emitBitAndUint8(const SourceInfo &);
bool emitBitAndSint16(const SourceInfo &);
bool emitBitAndUint16(const SourceInfo &);
bool emitBitAndSint32(const SourceInfo &);
bool emitBitAndUint32(const SourceInfo &);
bool emitBitAndSint64(const SourceInfo &);
bool emitBitAndUint64(const SourceInfo &);
bool emitBitAndIntAP(const SourceInfo &);
bool emitBitAndIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitBitAnd(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitBitAnd(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitBitAndSint8(I);
  case PT_Uint8:
    return emitBitAndUint8(I);
  case PT_Sint16:
    return emitBitAndSint16(I);
  case PT_Uint16:
    return emitBitAndUint16(I);
  case PT_Sint32:
    return emitBitAndSint32(I);
  case PT_Uint32:
    return emitBitAndUint32(I);
  case PT_Sint64:
    return emitBitAndSint64(I);
  case PT_Uint64:
    return emitBitAndUint64(I);
  case PT_IntAP:
    return emitBitAndIntAP(I);
  case PT_IntAPS:
    return emitBitAndIntAPS(I);
  default: llvm_unreachable("invalid type: emitBitAnd");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitBitAndSint8(const SourceInfo &L) {
  return emitOp<>(OP_BitAndSint8, L);
}
bool ByteCodeEmitter::emitBitAndUint8(const SourceInfo &L) {
  return emitOp<>(OP_BitAndUint8, L);
}
bool ByteCodeEmitter::emitBitAndSint16(const SourceInfo &L) {
  return emitOp<>(OP_BitAndSint16, L);
}
bool ByteCodeEmitter::emitBitAndUint16(const SourceInfo &L) {
  return emitOp<>(OP_BitAndUint16, L);
}
bool ByteCodeEmitter::emitBitAndSint32(const SourceInfo &L) {
  return emitOp<>(OP_BitAndSint32, L);
}
bool ByteCodeEmitter::emitBitAndUint32(const SourceInfo &L) {
  return emitOp<>(OP_BitAndUint32, L);
}
bool ByteCodeEmitter::emitBitAndSint64(const SourceInfo &L) {
  return emitOp<>(OP_BitAndSint64, L);
}
bool ByteCodeEmitter::emitBitAndUint64(const SourceInfo &L) {
  return emitOp<>(OP_BitAndUint64, L);
}
bool ByteCodeEmitter::emitBitAndIntAP(const SourceInfo &L) {
  return emitOp<>(OP_BitAndIntAP, L);
}
bool ByteCodeEmitter::emitBitAndIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_BitAndIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitBitAndSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitAnd<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitBitAndUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitAnd<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitBitAndSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitAnd<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitBitAndUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitAnd<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitBitAndSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitAnd<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitBitAndUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitAnd<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitBitAndSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitAnd<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitBitAndUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitAnd<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitBitAndIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitAnd<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitBitAndIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitAnd<PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_BitOrSint8,
OP_BitOrUint8,
OP_BitOrSint16,
OP_BitOrUint16,
OP_BitOrSint32,
OP_BitOrUint32,
OP_BitOrSint64,
OP_BitOrUint64,
OP_BitOrIntAP,
OP_BitOrIntAPS,
#endif
#ifdef GET_INTERP
case OP_BitOrSint8: {
  if (!BitOr<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_BitOrUint8: {
  if (!BitOr<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_BitOrSint16: {
  if (!BitOr<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_BitOrUint16: {
  if (!BitOr<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_BitOrSint32: {
  if (!BitOr<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_BitOrUint32: {
  if (!BitOr<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_BitOrSint64: {
  if (!BitOr<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_BitOrUint64: {
  if (!BitOr<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_BitOrIntAP: {
  if (!BitOr<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_BitOrIntAPS: {
  if (!BitOr<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_BitOrSint8:
  PrintName("BitOrSint8");
  OS << "\t" << "\n";
  continue;
case OP_BitOrUint8:
  PrintName("BitOrUint8");
  OS << "\t" << "\n";
  continue;
case OP_BitOrSint16:
  PrintName("BitOrSint16");
  OS << "\t" << "\n";
  continue;
case OP_BitOrUint16:
  PrintName("BitOrUint16");
  OS << "\t" << "\n";
  continue;
case OP_BitOrSint32:
  PrintName("BitOrSint32");
  OS << "\t" << "\n";
  continue;
case OP_BitOrUint32:
  PrintName("BitOrUint32");
  OS << "\t" << "\n";
  continue;
case OP_BitOrSint64:
  PrintName("BitOrSint64");
  OS << "\t" << "\n";
  continue;
case OP_BitOrUint64:
  PrintName("BitOrUint64");
  OS << "\t" << "\n";
  continue;
case OP_BitOrIntAP:
  PrintName("BitOrIntAP");
  OS << "\t" << "\n";
  continue;
case OP_BitOrIntAPS:
  PrintName("BitOrIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitBitOrSint8(const SourceInfo &);
bool emitBitOrUint8(const SourceInfo &);
bool emitBitOrSint16(const SourceInfo &);
bool emitBitOrUint16(const SourceInfo &);
bool emitBitOrSint32(const SourceInfo &);
bool emitBitOrUint32(const SourceInfo &);
bool emitBitOrSint64(const SourceInfo &);
bool emitBitOrUint64(const SourceInfo &);
bool emitBitOrIntAP(const SourceInfo &);
bool emitBitOrIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitBitOr(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitBitOr(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitBitOrSint8(I);
  case PT_Uint8:
    return emitBitOrUint8(I);
  case PT_Sint16:
    return emitBitOrSint16(I);
  case PT_Uint16:
    return emitBitOrUint16(I);
  case PT_Sint32:
    return emitBitOrSint32(I);
  case PT_Uint32:
    return emitBitOrUint32(I);
  case PT_Sint64:
    return emitBitOrSint64(I);
  case PT_Uint64:
    return emitBitOrUint64(I);
  case PT_IntAP:
    return emitBitOrIntAP(I);
  case PT_IntAPS:
    return emitBitOrIntAPS(I);
  default: llvm_unreachable("invalid type: emitBitOr");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitBitOrSint8(const SourceInfo &L) {
  return emitOp<>(OP_BitOrSint8, L);
}
bool ByteCodeEmitter::emitBitOrUint8(const SourceInfo &L) {
  return emitOp<>(OP_BitOrUint8, L);
}
bool ByteCodeEmitter::emitBitOrSint16(const SourceInfo &L) {
  return emitOp<>(OP_BitOrSint16, L);
}
bool ByteCodeEmitter::emitBitOrUint16(const SourceInfo &L) {
  return emitOp<>(OP_BitOrUint16, L);
}
bool ByteCodeEmitter::emitBitOrSint32(const SourceInfo &L) {
  return emitOp<>(OP_BitOrSint32, L);
}
bool ByteCodeEmitter::emitBitOrUint32(const SourceInfo &L) {
  return emitOp<>(OP_BitOrUint32, L);
}
bool ByteCodeEmitter::emitBitOrSint64(const SourceInfo &L) {
  return emitOp<>(OP_BitOrSint64, L);
}
bool ByteCodeEmitter::emitBitOrUint64(const SourceInfo &L) {
  return emitOp<>(OP_BitOrUint64, L);
}
bool ByteCodeEmitter::emitBitOrIntAP(const SourceInfo &L) {
  return emitOp<>(OP_BitOrIntAP, L);
}
bool ByteCodeEmitter::emitBitOrIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_BitOrIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitBitOrSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitOr<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitBitOrUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitOr<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitBitOrSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitOr<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitBitOrUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitOr<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitBitOrSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitOr<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitBitOrUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitOr<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitBitOrSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitOr<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitBitOrUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitOr<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitBitOrIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitOr<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitBitOrIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitOr<PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_BitXorSint8,
OP_BitXorUint8,
OP_BitXorSint16,
OP_BitXorUint16,
OP_BitXorSint32,
OP_BitXorUint32,
OP_BitXorSint64,
OP_BitXorUint64,
OP_BitXorIntAP,
OP_BitXorIntAPS,
#endif
#ifdef GET_INTERP
case OP_BitXorSint8: {
  if (!BitXor<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_BitXorUint8: {
  if (!BitXor<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_BitXorSint16: {
  if (!BitXor<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_BitXorUint16: {
  if (!BitXor<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_BitXorSint32: {
  if (!BitXor<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_BitXorUint32: {
  if (!BitXor<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_BitXorSint64: {
  if (!BitXor<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_BitXorUint64: {
  if (!BitXor<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_BitXorIntAP: {
  if (!BitXor<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_BitXorIntAPS: {
  if (!BitXor<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_BitXorSint8:
  PrintName("BitXorSint8");
  OS << "\t" << "\n";
  continue;
case OP_BitXorUint8:
  PrintName("BitXorUint8");
  OS << "\t" << "\n";
  continue;
case OP_BitXorSint16:
  PrintName("BitXorSint16");
  OS << "\t" << "\n";
  continue;
case OP_BitXorUint16:
  PrintName("BitXorUint16");
  OS << "\t" << "\n";
  continue;
case OP_BitXorSint32:
  PrintName("BitXorSint32");
  OS << "\t" << "\n";
  continue;
case OP_BitXorUint32:
  PrintName("BitXorUint32");
  OS << "\t" << "\n";
  continue;
case OP_BitXorSint64:
  PrintName("BitXorSint64");
  OS << "\t" << "\n";
  continue;
case OP_BitXorUint64:
  PrintName("BitXorUint64");
  OS << "\t" << "\n";
  continue;
case OP_BitXorIntAP:
  PrintName("BitXorIntAP");
  OS << "\t" << "\n";
  continue;
case OP_BitXorIntAPS:
  PrintName("BitXorIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitBitXorSint8(const SourceInfo &);
bool emitBitXorUint8(const SourceInfo &);
bool emitBitXorSint16(const SourceInfo &);
bool emitBitXorUint16(const SourceInfo &);
bool emitBitXorSint32(const SourceInfo &);
bool emitBitXorUint32(const SourceInfo &);
bool emitBitXorSint64(const SourceInfo &);
bool emitBitXorUint64(const SourceInfo &);
bool emitBitXorIntAP(const SourceInfo &);
bool emitBitXorIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitBitXor(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitBitXor(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitBitXorSint8(I);
  case PT_Uint8:
    return emitBitXorUint8(I);
  case PT_Sint16:
    return emitBitXorSint16(I);
  case PT_Uint16:
    return emitBitXorUint16(I);
  case PT_Sint32:
    return emitBitXorSint32(I);
  case PT_Uint32:
    return emitBitXorUint32(I);
  case PT_Sint64:
    return emitBitXorSint64(I);
  case PT_Uint64:
    return emitBitXorUint64(I);
  case PT_IntAP:
    return emitBitXorIntAP(I);
  case PT_IntAPS:
    return emitBitXorIntAPS(I);
  default: llvm_unreachable("invalid type: emitBitXor");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitBitXorSint8(const SourceInfo &L) {
  return emitOp<>(OP_BitXorSint8, L);
}
bool ByteCodeEmitter::emitBitXorUint8(const SourceInfo &L) {
  return emitOp<>(OP_BitXorUint8, L);
}
bool ByteCodeEmitter::emitBitXorSint16(const SourceInfo &L) {
  return emitOp<>(OP_BitXorSint16, L);
}
bool ByteCodeEmitter::emitBitXorUint16(const SourceInfo &L) {
  return emitOp<>(OP_BitXorUint16, L);
}
bool ByteCodeEmitter::emitBitXorSint32(const SourceInfo &L) {
  return emitOp<>(OP_BitXorSint32, L);
}
bool ByteCodeEmitter::emitBitXorUint32(const SourceInfo &L) {
  return emitOp<>(OP_BitXorUint32, L);
}
bool ByteCodeEmitter::emitBitXorSint64(const SourceInfo &L) {
  return emitOp<>(OP_BitXorSint64, L);
}
bool ByteCodeEmitter::emitBitXorUint64(const SourceInfo &L) {
  return emitOp<>(OP_BitXorUint64, L);
}
bool ByteCodeEmitter::emitBitXorIntAP(const SourceInfo &L) {
  return emitOp<>(OP_BitXorIntAP, L);
}
bool ByteCodeEmitter::emitBitXorIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_BitXorIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitBitXorSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitXor<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitBitXorUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitXor<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitBitXorSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitXor<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitBitXorUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitXor<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitBitXorSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitXor<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitBitXorUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitXor<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitBitXorSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitXor<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitBitXorUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitXor<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitBitXorIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitXor<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitBitXorIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return BitXor<PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CMP3Sint8,
OP_CMP3Uint8,
OP_CMP3Sint16,
OP_CMP3Uint16,
OP_CMP3Sint32,
OP_CMP3Uint32,
OP_CMP3Sint64,
OP_CMP3Uint64,
OP_CMP3IntAP,
OP_CMP3IntAPS,
OP_CMP3Bool,
OP_CMP3Ptr,
OP_CMP3Float,
OP_CMP3FnPtr,
#endif
#ifdef GET_INTERP
case OP_CMP3Sint8: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3Uint8: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3Sint16: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3Uint16: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3Sint32: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3Uint32: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3Sint64: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3Uint64: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3IntAP: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3IntAPS: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3Bool: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3Ptr: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3Float: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CMP3FnPtr: {
  auto V0 = ReadArg<const ComparisonCategoryInfo *>(S, PC);
  if (!CMP3<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CMP3Sint8:
  PrintName("CMP3Sint8");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3Uint8:
  PrintName("CMP3Uint8");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3Sint16:
  PrintName("CMP3Sint16");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3Uint16:
  PrintName("CMP3Uint16");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3Sint32:
  PrintName("CMP3Sint32");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3Uint32:
  PrintName("CMP3Uint32");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3Sint64:
  PrintName("CMP3Sint64");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3Uint64:
  PrintName("CMP3Uint64");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3IntAP:
  PrintName("CMP3IntAP");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3IntAPS:
  PrintName("CMP3IntAPS");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3Bool:
  PrintName("CMP3Bool");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3Ptr:
  PrintName("CMP3Ptr");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3Float:
  PrintName("CMP3Float");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
case OP_CMP3FnPtr:
  PrintName("CMP3FnPtr");
  OS << "\t" << ReadArg<const ComparisonCategoryInfo *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCMP3Sint8(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3Uint8(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3Sint16(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3Uint16(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3Sint32(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3Uint32(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3Sint64(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3Uint64(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3IntAP(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3IntAPS(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3Bool(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3Ptr(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3Float(const ComparisonCategoryInfo *, const SourceInfo &);
bool emitCMP3FnPtr(const ComparisonCategoryInfo *, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCMP3(PrimType, const ComparisonCategoryInfo *, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitCMP3(PrimType T0, const ComparisonCategoryInfo * A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitCMP3Sint8(A0, I);
  case PT_Uint8:
    return emitCMP3Uint8(A0, I);
  case PT_Sint16:
    return emitCMP3Sint16(A0, I);
  case PT_Uint16:
    return emitCMP3Uint16(A0, I);
  case PT_Sint32:
    return emitCMP3Sint32(A0, I);
  case PT_Uint32:
    return emitCMP3Uint32(A0, I);
  case PT_Sint64:
    return emitCMP3Sint64(A0, I);
  case PT_Uint64:
    return emitCMP3Uint64(A0, I);
  case PT_IntAP:
    return emitCMP3IntAP(A0, I);
  case PT_IntAPS:
    return emitCMP3IntAPS(A0, I);
  case PT_Bool:
    return emitCMP3Bool(A0, I);
  case PT_Ptr:
    return emitCMP3Ptr(A0, I);
  case PT_Float:
    return emitCMP3Float(A0, I);
  case PT_FnPtr:
    return emitCMP3FnPtr(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCMP3Sint8(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3Sint8, A0, L);
}
bool ByteCodeEmitter::emitCMP3Uint8(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3Uint8, A0, L);
}
bool ByteCodeEmitter::emitCMP3Sint16(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3Sint16, A0, L);
}
bool ByteCodeEmitter::emitCMP3Uint16(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3Uint16, A0, L);
}
bool ByteCodeEmitter::emitCMP3Sint32(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3Sint32, A0, L);
}
bool ByteCodeEmitter::emitCMP3Uint32(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3Uint32, A0, L);
}
bool ByteCodeEmitter::emitCMP3Sint64(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3Sint64, A0, L);
}
bool ByteCodeEmitter::emitCMP3Uint64(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3Uint64, A0, L);
}
bool ByteCodeEmitter::emitCMP3IntAP(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3IntAP, A0, L);
}
bool ByteCodeEmitter::emitCMP3IntAPS(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3IntAPS, A0, L);
}
bool ByteCodeEmitter::emitCMP3Bool(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3Bool, A0, L);
}
bool ByteCodeEmitter::emitCMP3Ptr(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3Ptr, A0, L);
}
bool ByteCodeEmitter::emitCMP3Float(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3Float, A0, L);
}
bool ByteCodeEmitter::emitCMP3FnPtr(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  return emitOp<const ComparisonCategoryInfo *>(OP_CMP3FnPtr, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCMP3Sint8(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3Uint8(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3Sint16(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3Uint16(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3Sint32(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3Uint32(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3Sint64(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3Uint64(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3IntAP(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3IntAPS(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3Bool(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3Ptr(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3Float(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_Float>(S, OpPC, A0);
}
bool EvalEmitter::emitCMP3FnPtr(const ComparisonCategoryInfo * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CMP3<PT_FnPtr>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Call,
#endif
#ifdef GET_INTERP
case OP_Call: {
  auto V0 = ReadArg<const Function *>(S, PC);
  if (!Call(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Call:
  PrintName("Call");
  OS << "\t" << ReadArg<const Function *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCall(const Function *, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCall(const Function * A0, const SourceInfo &L) {
  return emitOp<const Function *>(OP_Call, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCall(const Function * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Call(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CallBI,
#endif
#ifdef GET_INTERP
case OP_CallBI: {
  auto V0 = ReadArg<const Function *>(S, PC);
  auto V1 = ReadArg<const CallExpr *>(S, PC);
  if (!CallBI(S, OpPC, V0, V1))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CallBI:
  PrintName("CallBI");
  OS << "\t" << ReadArg<const Function *>(P, PC) << " " << ReadArg<const CallExpr *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCallBI(const Function *, const CallExpr *, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCallBI(const Function * A0, const CallExpr * A1, const SourceInfo &L) {
  return emitOp<const Function *, const CallExpr *>(OP_CallBI, A0, A1, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCallBI(const Function * A0, const CallExpr * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CallBI(S, OpPC, A0, A1);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CallPtr,
#endif
#ifdef GET_INTERP
case OP_CallPtr: {
  if (!CallPtr(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CallPtr:
  PrintName("CallPtr");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCallPtr(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCallPtr(const SourceInfo &L) {
  return emitOp<>(OP_CallPtr, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCallPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CallPtr(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CallVirt,
#endif
#ifdef GET_INTERP
case OP_CallVirt: {
  auto V0 = ReadArg<const Function *>(S, PC);
  if (!CallVirt(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CallVirt:
  PrintName("CallVirt");
  OS << "\t" << ReadArg<const Function *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCallVirt(const Function *, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCallVirt(const Function * A0, const SourceInfo &L) {
  return emitOp<const Function *>(OP_CallVirt, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCallVirt(const Function * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CallVirt(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CastUint8Uint8,
OP_CastUint8Sint8,
OP_CastUint8Uint16,
OP_CastUint8Sint16,
OP_CastUint8Uint32,
OP_CastUint8Sint32,
OP_CastUint8Uint64,
OP_CastUint8Sint64,
OP_CastUint8Bool,
OP_CastSint8Uint8,
OP_CastSint8Sint8,
OP_CastSint8Uint16,
OP_CastSint8Sint16,
OP_CastSint8Uint32,
OP_CastSint8Sint32,
OP_CastSint8Uint64,
OP_CastSint8Sint64,
OP_CastSint8Bool,
OP_CastUint16Uint8,
OP_CastUint16Sint8,
OP_CastUint16Uint16,
OP_CastUint16Sint16,
OP_CastUint16Uint32,
OP_CastUint16Sint32,
OP_CastUint16Uint64,
OP_CastUint16Sint64,
OP_CastUint16Bool,
OP_CastSint16Uint8,
OP_CastSint16Sint8,
OP_CastSint16Uint16,
OP_CastSint16Sint16,
OP_CastSint16Uint32,
OP_CastSint16Sint32,
OP_CastSint16Uint64,
OP_CastSint16Sint64,
OP_CastSint16Bool,
OP_CastUint32Uint8,
OP_CastUint32Sint8,
OP_CastUint32Uint16,
OP_CastUint32Sint16,
OP_CastUint32Uint32,
OP_CastUint32Sint32,
OP_CastUint32Uint64,
OP_CastUint32Sint64,
OP_CastUint32Bool,
OP_CastSint32Uint8,
OP_CastSint32Sint8,
OP_CastSint32Uint16,
OP_CastSint32Sint16,
OP_CastSint32Uint32,
OP_CastSint32Sint32,
OP_CastSint32Uint64,
OP_CastSint32Sint64,
OP_CastSint32Bool,
OP_CastUint64Uint8,
OP_CastUint64Sint8,
OP_CastUint64Uint16,
OP_CastUint64Sint16,
OP_CastUint64Uint32,
OP_CastUint64Sint32,
OP_CastUint64Uint64,
OP_CastUint64Sint64,
OP_CastUint64Bool,
OP_CastSint64Uint8,
OP_CastSint64Sint8,
OP_CastSint64Uint16,
OP_CastSint64Sint16,
OP_CastSint64Uint32,
OP_CastSint64Sint32,
OP_CastSint64Uint64,
OP_CastSint64Sint64,
OP_CastSint64Bool,
OP_CastBoolUint8,
OP_CastBoolSint8,
OP_CastBoolUint16,
OP_CastBoolSint16,
OP_CastBoolUint32,
OP_CastBoolSint32,
OP_CastBoolUint64,
OP_CastBoolSint64,
OP_CastBoolBool,
OP_CastIntAPUint8,
OP_CastIntAPSint8,
OP_CastIntAPUint16,
OP_CastIntAPSint16,
OP_CastIntAPUint32,
OP_CastIntAPSint32,
OP_CastIntAPUint64,
OP_CastIntAPSint64,
OP_CastIntAPBool,
OP_CastIntAPSUint8,
OP_CastIntAPSSint8,
OP_CastIntAPSUint16,
OP_CastIntAPSSint16,
OP_CastIntAPSUint32,
OP_CastIntAPSSint32,
OP_CastIntAPSUint64,
OP_CastIntAPSSint64,
OP_CastIntAPSBool,
#endif
#ifdef GET_INTERP
case OP_CastUint8Uint8: {
  if (!Cast<PT_Uint8, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint8Sint8: {
  if (!Cast<PT_Uint8, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint8Uint16: {
  if (!Cast<PT_Uint8, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint8Sint16: {
  if (!Cast<PT_Uint8, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint8Uint32: {
  if (!Cast<PT_Uint8, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint8Sint32: {
  if (!Cast<PT_Uint8, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint8Uint64: {
  if (!Cast<PT_Uint8, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint8Sint64: {
  if (!Cast<PT_Uint8, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint8Bool: {
  if (!Cast<PT_Uint8, PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint8Uint8: {
  if (!Cast<PT_Sint8, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint8Sint8: {
  if (!Cast<PT_Sint8, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint8Uint16: {
  if (!Cast<PT_Sint8, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint8Sint16: {
  if (!Cast<PT_Sint8, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint8Uint32: {
  if (!Cast<PT_Sint8, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint8Sint32: {
  if (!Cast<PT_Sint8, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint8Uint64: {
  if (!Cast<PT_Sint8, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint8Sint64: {
  if (!Cast<PT_Sint8, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint8Bool: {
  if (!Cast<PT_Sint8, PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint16Uint8: {
  if (!Cast<PT_Uint16, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint16Sint8: {
  if (!Cast<PT_Uint16, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint16Uint16: {
  if (!Cast<PT_Uint16, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint16Sint16: {
  if (!Cast<PT_Uint16, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint16Uint32: {
  if (!Cast<PT_Uint16, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint16Sint32: {
  if (!Cast<PT_Uint16, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint16Uint64: {
  if (!Cast<PT_Uint16, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint16Sint64: {
  if (!Cast<PT_Uint16, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint16Bool: {
  if (!Cast<PT_Uint16, PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint16Uint8: {
  if (!Cast<PT_Sint16, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint16Sint8: {
  if (!Cast<PT_Sint16, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint16Uint16: {
  if (!Cast<PT_Sint16, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint16Sint16: {
  if (!Cast<PT_Sint16, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint16Uint32: {
  if (!Cast<PT_Sint16, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint16Sint32: {
  if (!Cast<PT_Sint16, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint16Uint64: {
  if (!Cast<PT_Sint16, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint16Sint64: {
  if (!Cast<PT_Sint16, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint16Bool: {
  if (!Cast<PT_Sint16, PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint32Uint8: {
  if (!Cast<PT_Uint32, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint32Sint8: {
  if (!Cast<PT_Uint32, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint32Uint16: {
  if (!Cast<PT_Uint32, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint32Sint16: {
  if (!Cast<PT_Uint32, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint32Uint32: {
  if (!Cast<PT_Uint32, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint32Sint32: {
  if (!Cast<PT_Uint32, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint32Uint64: {
  if (!Cast<PT_Uint32, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint32Sint64: {
  if (!Cast<PT_Uint32, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint32Bool: {
  if (!Cast<PT_Uint32, PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint32Uint8: {
  if (!Cast<PT_Sint32, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint32Sint8: {
  if (!Cast<PT_Sint32, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint32Uint16: {
  if (!Cast<PT_Sint32, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint32Sint16: {
  if (!Cast<PT_Sint32, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint32Uint32: {
  if (!Cast<PT_Sint32, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint32Sint32: {
  if (!Cast<PT_Sint32, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint32Uint64: {
  if (!Cast<PT_Sint32, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint32Sint64: {
  if (!Cast<PT_Sint32, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint32Bool: {
  if (!Cast<PT_Sint32, PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint64Uint8: {
  if (!Cast<PT_Uint64, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint64Sint8: {
  if (!Cast<PT_Uint64, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint64Uint16: {
  if (!Cast<PT_Uint64, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint64Sint16: {
  if (!Cast<PT_Uint64, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint64Uint32: {
  if (!Cast<PT_Uint64, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint64Sint32: {
  if (!Cast<PT_Uint64, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint64Uint64: {
  if (!Cast<PT_Uint64, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint64Sint64: {
  if (!Cast<PT_Uint64, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastUint64Bool: {
  if (!Cast<PT_Uint64, PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint64Uint8: {
  if (!Cast<PT_Sint64, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint64Sint8: {
  if (!Cast<PT_Sint64, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint64Uint16: {
  if (!Cast<PT_Sint64, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint64Sint16: {
  if (!Cast<PT_Sint64, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint64Uint32: {
  if (!Cast<PT_Sint64, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint64Sint32: {
  if (!Cast<PT_Sint64, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint64Uint64: {
  if (!Cast<PT_Sint64, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint64Sint64: {
  if (!Cast<PT_Sint64, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastSint64Bool: {
  if (!Cast<PT_Sint64, PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_CastBoolUint8: {
  if (!Cast<PT_Bool, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastBoolSint8: {
  if (!Cast<PT_Bool, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastBoolUint16: {
  if (!Cast<PT_Bool, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastBoolSint16: {
  if (!Cast<PT_Bool, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastBoolUint32: {
  if (!Cast<PT_Bool, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastBoolSint32: {
  if (!Cast<PT_Bool, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastBoolUint64: {
  if (!Cast<PT_Bool, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastBoolSint64: {
  if (!Cast<PT_Bool, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastBoolBool: {
  if (!Cast<PT_Bool, PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPUint8: {
  if (!Cast<PT_IntAP, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSint8: {
  if (!Cast<PT_IntAP, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPUint16: {
  if (!Cast<PT_IntAP, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSint16: {
  if (!Cast<PT_IntAP, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPUint32: {
  if (!Cast<PT_IntAP, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSint32: {
  if (!Cast<PT_IntAP, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPUint64: {
  if (!Cast<PT_IntAP, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSint64: {
  if (!Cast<PT_IntAP, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPBool: {
  if (!Cast<PT_IntAP, PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSUint8: {
  if (!Cast<PT_IntAPS, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSSint8: {
  if (!Cast<PT_IntAPS, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSUint16: {
  if (!Cast<PT_IntAPS, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSSint16: {
  if (!Cast<PT_IntAPS, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSUint32: {
  if (!Cast<PT_IntAPS, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSSint32: {
  if (!Cast<PT_IntAPS, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSUint64: {
  if (!Cast<PT_IntAPS, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSSint64: {
  if (!Cast<PT_IntAPS, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastIntAPSBool: {
  if (!Cast<PT_IntAPS, PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CastUint8Uint8:
  PrintName("CastUint8Uint8");
  OS << "\t" << "\n";
  continue;
case OP_CastUint8Sint8:
  PrintName("CastUint8Sint8");
  OS << "\t" << "\n";
  continue;
case OP_CastUint8Uint16:
  PrintName("CastUint8Uint16");
  OS << "\t" << "\n";
  continue;
case OP_CastUint8Sint16:
  PrintName("CastUint8Sint16");
  OS << "\t" << "\n";
  continue;
case OP_CastUint8Uint32:
  PrintName("CastUint8Uint32");
  OS << "\t" << "\n";
  continue;
case OP_CastUint8Sint32:
  PrintName("CastUint8Sint32");
  OS << "\t" << "\n";
  continue;
case OP_CastUint8Uint64:
  PrintName("CastUint8Uint64");
  OS << "\t" << "\n";
  continue;
case OP_CastUint8Sint64:
  PrintName("CastUint8Sint64");
  OS << "\t" << "\n";
  continue;
case OP_CastUint8Bool:
  PrintName("CastUint8Bool");
  OS << "\t" << "\n";
  continue;
case OP_CastSint8Uint8:
  PrintName("CastSint8Uint8");
  OS << "\t" << "\n";
  continue;
case OP_CastSint8Sint8:
  PrintName("CastSint8Sint8");
  OS << "\t" << "\n";
  continue;
case OP_CastSint8Uint16:
  PrintName("CastSint8Uint16");
  OS << "\t" << "\n";
  continue;
case OP_CastSint8Sint16:
  PrintName("CastSint8Sint16");
  OS << "\t" << "\n";
  continue;
case OP_CastSint8Uint32:
  PrintName("CastSint8Uint32");
  OS << "\t" << "\n";
  continue;
case OP_CastSint8Sint32:
  PrintName("CastSint8Sint32");
  OS << "\t" << "\n";
  continue;
case OP_CastSint8Uint64:
  PrintName("CastSint8Uint64");
  OS << "\t" << "\n";
  continue;
case OP_CastSint8Sint64:
  PrintName("CastSint8Sint64");
  OS << "\t" << "\n";
  continue;
case OP_CastSint8Bool:
  PrintName("CastSint8Bool");
  OS << "\t" << "\n";
  continue;
case OP_CastUint16Uint8:
  PrintName("CastUint16Uint8");
  OS << "\t" << "\n";
  continue;
case OP_CastUint16Sint8:
  PrintName("CastUint16Sint8");
  OS << "\t" << "\n";
  continue;
case OP_CastUint16Uint16:
  PrintName("CastUint16Uint16");
  OS << "\t" << "\n";
  continue;
case OP_CastUint16Sint16:
  PrintName("CastUint16Sint16");
  OS << "\t" << "\n";
  continue;
case OP_CastUint16Uint32:
  PrintName("CastUint16Uint32");
  OS << "\t" << "\n";
  continue;
case OP_CastUint16Sint32:
  PrintName("CastUint16Sint32");
  OS << "\t" << "\n";
  continue;
case OP_CastUint16Uint64:
  PrintName("CastUint16Uint64");
  OS << "\t" << "\n";
  continue;
case OP_CastUint16Sint64:
  PrintName("CastUint16Sint64");
  OS << "\t" << "\n";
  continue;
case OP_CastUint16Bool:
  PrintName("CastUint16Bool");
  OS << "\t" << "\n";
  continue;
case OP_CastSint16Uint8:
  PrintName("CastSint16Uint8");
  OS << "\t" << "\n";
  continue;
case OP_CastSint16Sint8:
  PrintName("CastSint16Sint8");
  OS << "\t" << "\n";
  continue;
case OP_CastSint16Uint16:
  PrintName("CastSint16Uint16");
  OS << "\t" << "\n";
  continue;
case OP_CastSint16Sint16:
  PrintName("CastSint16Sint16");
  OS << "\t" << "\n";
  continue;
case OP_CastSint16Uint32:
  PrintName("CastSint16Uint32");
  OS << "\t" << "\n";
  continue;
case OP_CastSint16Sint32:
  PrintName("CastSint16Sint32");
  OS << "\t" << "\n";
  continue;
case OP_CastSint16Uint64:
  PrintName("CastSint16Uint64");
  OS << "\t" << "\n";
  continue;
case OP_CastSint16Sint64:
  PrintName("CastSint16Sint64");
  OS << "\t" << "\n";
  continue;
case OP_CastSint16Bool:
  PrintName("CastSint16Bool");
  OS << "\t" << "\n";
  continue;
case OP_CastUint32Uint8:
  PrintName("CastUint32Uint8");
  OS << "\t" << "\n";
  continue;
case OP_CastUint32Sint8:
  PrintName("CastUint32Sint8");
  OS << "\t" << "\n";
  continue;
case OP_CastUint32Uint16:
  PrintName("CastUint32Uint16");
  OS << "\t" << "\n";
  continue;
case OP_CastUint32Sint16:
  PrintName("CastUint32Sint16");
  OS << "\t" << "\n";
  continue;
case OP_CastUint32Uint32:
  PrintName("CastUint32Uint32");
  OS << "\t" << "\n";
  continue;
case OP_CastUint32Sint32:
  PrintName("CastUint32Sint32");
  OS << "\t" << "\n";
  continue;
case OP_CastUint32Uint64:
  PrintName("CastUint32Uint64");
  OS << "\t" << "\n";
  continue;
case OP_CastUint32Sint64:
  PrintName("CastUint32Sint64");
  OS << "\t" << "\n";
  continue;
case OP_CastUint32Bool:
  PrintName("CastUint32Bool");
  OS << "\t" << "\n";
  continue;
case OP_CastSint32Uint8:
  PrintName("CastSint32Uint8");
  OS << "\t" << "\n";
  continue;
case OP_CastSint32Sint8:
  PrintName("CastSint32Sint8");
  OS << "\t" << "\n";
  continue;
case OP_CastSint32Uint16:
  PrintName("CastSint32Uint16");
  OS << "\t" << "\n";
  continue;
case OP_CastSint32Sint16:
  PrintName("CastSint32Sint16");
  OS << "\t" << "\n";
  continue;
case OP_CastSint32Uint32:
  PrintName("CastSint32Uint32");
  OS << "\t" << "\n";
  continue;
case OP_CastSint32Sint32:
  PrintName("CastSint32Sint32");
  OS << "\t" << "\n";
  continue;
case OP_CastSint32Uint64:
  PrintName("CastSint32Uint64");
  OS << "\t" << "\n";
  continue;
case OP_CastSint32Sint64:
  PrintName("CastSint32Sint64");
  OS << "\t" << "\n";
  continue;
case OP_CastSint32Bool:
  PrintName("CastSint32Bool");
  OS << "\t" << "\n";
  continue;
case OP_CastUint64Uint8:
  PrintName("CastUint64Uint8");
  OS << "\t" << "\n";
  continue;
case OP_CastUint64Sint8:
  PrintName("CastUint64Sint8");
  OS << "\t" << "\n";
  continue;
case OP_CastUint64Uint16:
  PrintName("CastUint64Uint16");
  OS << "\t" << "\n";
  continue;
case OP_CastUint64Sint16:
  PrintName("CastUint64Sint16");
  OS << "\t" << "\n";
  continue;
case OP_CastUint64Uint32:
  PrintName("CastUint64Uint32");
  OS << "\t" << "\n";
  continue;
case OP_CastUint64Sint32:
  PrintName("CastUint64Sint32");
  OS << "\t" << "\n";
  continue;
case OP_CastUint64Uint64:
  PrintName("CastUint64Uint64");
  OS << "\t" << "\n";
  continue;
case OP_CastUint64Sint64:
  PrintName("CastUint64Sint64");
  OS << "\t" << "\n";
  continue;
case OP_CastUint64Bool:
  PrintName("CastUint64Bool");
  OS << "\t" << "\n";
  continue;
case OP_CastSint64Uint8:
  PrintName("CastSint64Uint8");
  OS << "\t" << "\n";
  continue;
case OP_CastSint64Sint8:
  PrintName("CastSint64Sint8");
  OS << "\t" << "\n";
  continue;
case OP_CastSint64Uint16:
  PrintName("CastSint64Uint16");
  OS << "\t" << "\n";
  continue;
case OP_CastSint64Sint16:
  PrintName("CastSint64Sint16");
  OS << "\t" << "\n";
  continue;
case OP_CastSint64Uint32:
  PrintName("CastSint64Uint32");
  OS << "\t" << "\n";
  continue;
case OP_CastSint64Sint32:
  PrintName("CastSint64Sint32");
  OS << "\t" << "\n";
  continue;
case OP_CastSint64Uint64:
  PrintName("CastSint64Uint64");
  OS << "\t" << "\n";
  continue;
case OP_CastSint64Sint64:
  PrintName("CastSint64Sint64");
  OS << "\t" << "\n";
  continue;
case OP_CastSint64Bool:
  PrintName("CastSint64Bool");
  OS << "\t" << "\n";
  continue;
case OP_CastBoolUint8:
  PrintName("CastBoolUint8");
  OS << "\t" << "\n";
  continue;
case OP_CastBoolSint8:
  PrintName("CastBoolSint8");
  OS << "\t" << "\n";
  continue;
case OP_CastBoolUint16:
  PrintName("CastBoolUint16");
  OS << "\t" << "\n";
  continue;
case OP_CastBoolSint16:
  PrintName("CastBoolSint16");
  OS << "\t" << "\n";
  continue;
case OP_CastBoolUint32:
  PrintName("CastBoolUint32");
  OS << "\t" << "\n";
  continue;
case OP_CastBoolSint32:
  PrintName("CastBoolSint32");
  OS << "\t" << "\n";
  continue;
case OP_CastBoolUint64:
  PrintName("CastBoolUint64");
  OS << "\t" << "\n";
  continue;
case OP_CastBoolSint64:
  PrintName("CastBoolSint64");
  OS << "\t" << "\n";
  continue;
case OP_CastBoolBool:
  PrintName("CastBoolBool");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPUint8:
  PrintName("CastIntAPUint8");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSint8:
  PrintName("CastIntAPSint8");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPUint16:
  PrintName("CastIntAPUint16");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSint16:
  PrintName("CastIntAPSint16");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPUint32:
  PrintName("CastIntAPUint32");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSint32:
  PrintName("CastIntAPSint32");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPUint64:
  PrintName("CastIntAPUint64");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSint64:
  PrintName("CastIntAPSint64");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPBool:
  PrintName("CastIntAPBool");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSUint8:
  PrintName("CastIntAPSUint8");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSSint8:
  PrintName("CastIntAPSSint8");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSUint16:
  PrintName("CastIntAPSUint16");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSSint16:
  PrintName("CastIntAPSSint16");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSUint32:
  PrintName("CastIntAPSUint32");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSSint32:
  PrintName("CastIntAPSSint32");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSUint64:
  PrintName("CastIntAPSUint64");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSSint64:
  PrintName("CastIntAPSSint64");
  OS << "\t" << "\n";
  continue;
case OP_CastIntAPSBool:
  PrintName("CastIntAPSBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastUint8Uint8(const SourceInfo &);
bool emitCastUint8Sint8(const SourceInfo &);
bool emitCastUint8Uint16(const SourceInfo &);
bool emitCastUint8Sint16(const SourceInfo &);
bool emitCastUint8Uint32(const SourceInfo &);
bool emitCastUint8Sint32(const SourceInfo &);
bool emitCastUint8Uint64(const SourceInfo &);
bool emitCastUint8Sint64(const SourceInfo &);
bool emitCastUint8Bool(const SourceInfo &);
bool emitCastSint8Uint8(const SourceInfo &);
bool emitCastSint8Sint8(const SourceInfo &);
bool emitCastSint8Uint16(const SourceInfo &);
bool emitCastSint8Sint16(const SourceInfo &);
bool emitCastSint8Uint32(const SourceInfo &);
bool emitCastSint8Sint32(const SourceInfo &);
bool emitCastSint8Uint64(const SourceInfo &);
bool emitCastSint8Sint64(const SourceInfo &);
bool emitCastSint8Bool(const SourceInfo &);
bool emitCastUint16Uint8(const SourceInfo &);
bool emitCastUint16Sint8(const SourceInfo &);
bool emitCastUint16Uint16(const SourceInfo &);
bool emitCastUint16Sint16(const SourceInfo &);
bool emitCastUint16Uint32(const SourceInfo &);
bool emitCastUint16Sint32(const SourceInfo &);
bool emitCastUint16Uint64(const SourceInfo &);
bool emitCastUint16Sint64(const SourceInfo &);
bool emitCastUint16Bool(const SourceInfo &);
bool emitCastSint16Uint8(const SourceInfo &);
bool emitCastSint16Sint8(const SourceInfo &);
bool emitCastSint16Uint16(const SourceInfo &);
bool emitCastSint16Sint16(const SourceInfo &);
bool emitCastSint16Uint32(const SourceInfo &);
bool emitCastSint16Sint32(const SourceInfo &);
bool emitCastSint16Uint64(const SourceInfo &);
bool emitCastSint16Sint64(const SourceInfo &);
bool emitCastSint16Bool(const SourceInfo &);
bool emitCastUint32Uint8(const SourceInfo &);
bool emitCastUint32Sint8(const SourceInfo &);
bool emitCastUint32Uint16(const SourceInfo &);
bool emitCastUint32Sint16(const SourceInfo &);
bool emitCastUint32Uint32(const SourceInfo &);
bool emitCastUint32Sint32(const SourceInfo &);
bool emitCastUint32Uint64(const SourceInfo &);
bool emitCastUint32Sint64(const SourceInfo &);
bool emitCastUint32Bool(const SourceInfo &);
bool emitCastSint32Uint8(const SourceInfo &);
bool emitCastSint32Sint8(const SourceInfo &);
bool emitCastSint32Uint16(const SourceInfo &);
bool emitCastSint32Sint16(const SourceInfo &);
bool emitCastSint32Uint32(const SourceInfo &);
bool emitCastSint32Sint32(const SourceInfo &);
bool emitCastSint32Uint64(const SourceInfo &);
bool emitCastSint32Sint64(const SourceInfo &);
bool emitCastSint32Bool(const SourceInfo &);
bool emitCastUint64Uint8(const SourceInfo &);
bool emitCastUint64Sint8(const SourceInfo &);
bool emitCastUint64Uint16(const SourceInfo &);
bool emitCastUint64Sint16(const SourceInfo &);
bool emitCastUint64Uint32(const SourceInfo &);
bool emitCastUint64Sint32(const SourceInfo &);
bool emitCastUint64Uint64(const SourceInfo &);
bool emitCastUint64Sint64(const SourceInfo &);
bool emitCastUint64Bool(const SourceInfo &);
bool emitCastSint64Uint8(const SourceInfo &);
bool emitCastSint64Sint8(const SourceInfo &);
bool emitCastSint64Uint16(const SourceInfo &);
bool emitCastSint64Sint16(const SourceInfo &);
bool emitCastSint64Uint32(const SourceInfo &);
bool emitCastSint64Sint32(const SourceInfo &);
bool emitCastSint64Uint64(const SourceInfo &);
bool emitCastSint64Sint64(const SourceInfo &);
bool emitCastSint64Bool(const SourceInfo &);
bool emitCastBoolUint8(const SourceInfo &);
bool emitCastBoolSint8(const SourceInfo &);
bool emitCastBoolUint16(const SourceInfo &);
bool emitCastBoolSint16(const SourceInfo &);
bool emitCastBoolUint32(const SourceInfo &);
bool emitCastBoolSint32(const SourceInfo &);
bool emitCastBoolUint64(const SourceInfo &);
bool emitCastBoolSint64(const SourceInfo &);
bool emitCastBoolBool(const SourceInfo &);
bool emitCastIntAPUint8(const SourceInfo &);
bool emitCastIntAPSint8(const SourceInfo &);
bool emitCastIntAPUint16(const SourceInfo &);
bool emitCastIntAPSint16(const SourceInfo &);
bool emitCastIntAPUint32(const SourceInfo &);
bool emitCastIntAPSint32(const SourceInfo &);
bool emitCastIntAPUint64(const SourceInfo &);
bool emitCastIntAPSint64(const SourceInfo &);
bool emitCastIntAPBool(const SourceInfo &);
bool emitCastIntAPSUint8(const SourceInfo &);
bool emitCastIntAPSSint8(const SourceInfo &);
bool emitCastIntAPSUint16(const SourceInfo &);
bool emitCastIntAPSSint16(const SourceInfo &);
bool emitCastIntAPSUint32(const SourceInfo &);
bool emitCastIntAPSSint32(const SourceInfo &);
bool emitCastIntAPSUint64(const SourceInfo &);
bool emitCastIntAPSSint64(const SourceInfo &);
bool emitCastIntAPSBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCast(PrimType, PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitCast(PrimType T0, PrimType T1, const SourceInfo &I) {
  switch (T0) {
  case PT_Uint8:
  switch (T1) {
  case PT_Uint8:
    return emitCastUint8Uint8(I);
  case PT_Sint8:
    return emitCastUint8Sint8(I);
  case PT_Uint16:
    return emitCastUint8Uint16(I);
  case PT_Sint16:
    return emitCastUint8Sint16(I);
  case PT_Uint32:
    return emitCastUint8Uint32(I);
  case PT_Sint32:
    return emitCastUint8Sint32(I);
  case PT_Uint64:
    return emitCastUint8Uint64(I);
  case PT_Sint64:
    return emitCastUint8Sint64(I);
  case PT_Bool:
    return emitCastUint8Bool(I);
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
  case PT_Sint8:
  switch (T1) {
  case PT_Uint8:
    return emitCastSint8Uint8(I);
  case PT_Sint8:
    return emitCastSint8Sint8(I);
  case PT_Uint16:
    return emitCastSint8Uint16(I);
  case PT_Sint16:
    return emitCastSint8Sint16(I);
  case PT_Uint32:
    return emitCastSint8Uint32(I);
  case PT_Sint32:
    return emitCastSint8Sint32(I);
  case PT_Uint64:
    return emitCastSint8Uint64(I);
  case PT_Sint64:
    return emitCastSint8Sint64(I);
  case PT_Bool:
    return emitCastSint8Bool(I);
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
  case PT_Uint16:
  switch (T1) {
  case PT_Uint8:
    return emitCastUint16Uint8(I);
  case PT_Sint8:
    return emitCastUint16Sint8(I);
  case PT_Uint16:
    return emitCastUint16Uint16(I);
  case PT_Sint16:
    return emitCastUint16Sint16(I);
  case PT_Uint32:
    return emitCastUint16Uint32(I);
  case PT_Sint32:
    return emitCastUint16Sint32(I);
  case PT_Uint64:
    return emitCastUint16Uint64(I);
  case PT_Sint64:
    return emitCastUint16Sint64(I);
  case PT_Bool:
    return emitCastUint16Bool(I);
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
  case PT_Sint16:
  switch (T1) {
  case PT_Uint8:
    return emitCastSint16Uint8(I);
  case PT_Sint8:
    return emitCastSint16Sint8(I);
  case PT_Uint16:
    return emitCastSint16Uint16(I);
  case PT_Sint16:
    return emitCastSint16Sint16(I);
  case PT_Uint32:
    return emitCastSint16Uint32(I);
  case PT_Sint32:
    return emitCastSint16Sint32(I);
  case PT_Uint64:
    return emitCastSint16Uint64(I);
  case PT_Sint64:
    return emitCastSint16Sint64(I);
  case PT_Bool:
    return emitCastSint16Bool(I);
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
  case PT_Uint32:
  switch (T1) {
  case PT_Uint8:
    return emitCastUint32Uint8(I);
  case PT_Sint8:
    return emitCastUint32Sint8(I);
  case PT_Uint16:
    return emitCastUint32Uint16(I);
  case PT_Sint16:
    return emitCastUint32Sint16(I);
  case PT_Uint32:
    return emitCastUint32Uint32(I);
  case PT_Sint32:
    return emitCastUint32Sint32(I);
  case PT_Uint64:
    return emitCastUint32Uint64(I);
  case PT_Sint64:
    return emitCastUint32Sint64(I);
  case PT_Bool:
    return emitCastUint32Bool(I);
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
  case PT_Sint32:
  switch (T1) {
  case PT_Uint8:
    return emitCastSint32Uint8(I);
  case PT_Sint8:
    return emitCastSint32Sint8(I);
  case PT_Uint16:
    return emitCastSint32Uint16(I);
  case PT_Sint16:
    return emitCastSint32Sint16(I);
  case PT_Uint32:
    return emitCastSint32Uint32(I);
  case PT_Sint32:
    return emitCastSint32Sint32(I);
  case PT_Uint64:
    return emitCastSint32Uint64(I);
  case PT_Sint64:
    return emitCastSint32Sint64(I);
  case PT_Bool:
    return emitCastSint32Bool(I);
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
  case PT_Uint64:
  switch (T1) {
  case PT_Uint8:
    return emitCastUint64Uint8(I);
  case PT_Sint8:
    return emitCastUint64Sint8(I);
  case PT_Uint16:
    return emitCastUint64Uint16(I);
  case PT_Sint16:
    return emitCastUint64Sint16(I);
  case PT_Uint32:
    return emitCastUint64Uint32(I);
  case PT_Sint32:
    return emitCastUint64Sint32(I);
  case PT_Uint64:
    return emitCastUint64Uint64(I);
  case PT_Sint64:
    return emitCastUint64Sint64(I);
  case PT_Bool:
    return emitCastUint64Bool(I);
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
  case PT_Sint64:
  switch (T1) {
  case PT_Uint8:
    return emitCastSint64Uint8(I);
  case PT_Sint8:
    return emitCastSint64Sint8(I);
  case PT_Uint16:
    return emitCastSint64Uint16(I);
  case PT_Sint16:
    return emitCastSint64Sint16(I);
  case PT_Uint32:
    return emitCastSint64Uint32(I);
  case PT_Sint32:
    return emitCastSint64Sint32(I);
  case PT_Uint64:
    return emitCastSint64Uint64(I);
  case PT_Sint64:
    return emitCastSint64Sint64(I);
  case PT_Bool:
    return emitCastSint64Bool(I);
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
  case PT_Bool:
  switch (T1) {
  case PT_Uint8:
    return emitCastBoolUint8(I);
  case PT_Sint8:
    return emitCastBoolSint8(I);
  case PT_Uint16:
    return emitCastBoolUint16(I);
  case PT_Sint16:
    return emitCastBoolSint16(I);
  case PT_Uint32:
    return emitCastBoolUint32(I);
  case PT_Sint32:
    return emitCastBoolSint32(I);
  case PT_Uint64:
    return emitCastBoolUint64(I);
  case PT_Sint64:
    return emitCastBoolSint64(I);
  case PT_Bool:
    return emitCastBoolBool(I);
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
  case PT_IntAP:
  switch (T1) {
  case PT_Uint8:
    return emitCastIntAPUint8(I);
  case PT_Sint8:
    return emitCastIntAPSint8(I);
  case PT_Uint16:
    return emitCastIntAPUint16(I);
  case PT_Sint16:
    return emitCastIntAPSint16(I);
  case PT_Uint32:
    return emitCastIntAPUint32(I);
  case PT_Sint32:
    return emitCastIntAPSint32(I);
  case PT_Uint64:
    return emitCastIntAPUint64(I);
  case PT_Sint64:
    return emitCastIntAPSint64(I);
  case PT_Bool:
    return emitCastIntAPBool(I);
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
  case PT_IntAPS:
  switch (T1) {
  case PT_Uint8:
    return emitCastIntAPSUint8(I);
  case PT_Sint8:
    return emitCastIntAPSSint8(I);
  case PT_Uint16:
    return emitCastIntAPSUint16(I);
  case PT_Sint16:
    return emitCastIntAPSSint16(I);
  case PT_Uint32:
    return emitCastIntAPSUint32(I);
  case PT_Sint32:
    return emitCastIntAPSSint32(I);
  case PT_Uint64:
    return emitCastIntAPSUint64(I);
  case PT_Sint64:
    return emitCastIntAPSSint64(I);
  case PT_Bool:
    return emitCastIntAPSBool(I);
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
  default: llvm_unreachable("invalid type: emitCast");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCastUint8Uint8(const SourceInfo &L) {
  return emitOp<>(OP_CastUint8Uint8, L);
}
bool ByteCodeEmitter::emitCastUint8Sint8(const SourceInfo &L) {
  return emitOp<>(OP_CastUint8Sint8, L);
}
bool ByteCodeEmitter::emitCastUint8Uint16(const SourceInfo &L) {
  return emitOp<>(OP_CastUint8Uint16, L);
}
bool ByteCodeEmitter::emitCastUint8Sint16(const SourceInfo &L) {
  return emitOp<>(OP_CastUint8Sint16, L);
}
bool ByteCodeEmitter::emitCastUint8Uint32(const SourceInfo &L) {
  return emitOp<>(OP_CastUint8Uint32, L);
}
bool ByteCodeEmitter::emitCastUint8Sint32(const SourceInfo &L) {
  return emitOp<>(OP_CastUint8Sint32, L);
}
bool ByteCodeEmitter::emitCastUint8Uint64(const SourceInfo &L) {
  return emitOp<>(OP_CastUint8Uint64, L);
}
bool ByteCodeEmitter::emitCastUint8Sint64(const SourceInfo &L) {
  return emitOp<>(OP_CastUint8Sint64, L);
}
bool ByteCodeEmitter::emitCastUint8Bool(const SourceInfo &L) {
  return emitOp<>(OP_CastUint8Bool, L);
}
bool ByteCodeEmitter::emitCastSint8Uint8(const SourceInfo &L) {
  return emitOp<>(OP_CastSint8Uint8, L);
}
bool ByteCodeEmitter::emitCastSint8Sint8(const SourceInfo &L) {
  return emitOp<>(OP_CastSint8Sint8, L);
}
bool ByteCodeEmitter::emitCastSint8Uint16(const SourceInfo &L) {
  return emitOp<>(OP_CastSint8Uint16, L);
}
bool ByteCodeEmitter::emitCastSint8Sint16(const SourceInfo &L) {
  return emitOp<>(OP_CastSint8Sint16, L);
}
bool ByteCodeEmitter::emitCastSint8Uint32(const SourceInfo &L) {
  return emitOp<>(OP_CastSint8Uint32, L);
}
bool ByteCodeEmitter::emitCastSint8Sint32(const SourceInfo &L) {
  return emitOp<>(OP_CastSint8Sint32, L);
}
bool ByteCodeEmitter::emitCastSint8Uint64(const SourceInfo &L) {
  return emitOp<>(OP_CastSint8Uint64, L);
}
bool ByteCodeEmitter::emitCastSint8Sint64(const SourceInfo &L) {
  return emitOp<>(OP_CastSint8Sint64, L);
}
bool ByteCodeEmitter::emitCastSint8Bool(const SourceInfo &L) {
  return emitOp<>(OP_CastSint8Bool, L);
}
bool ByteCodeEmitter::emitCastUint16Uint8(const SourceInfo &L) {
  return emitOp<>(OP_CastUint16Uint8, L);
}
bool ByteCodeEmitter::emitCastUint16Sint8(const SourceInfo &L) {
  return emitOp<>(OP_CastUint16Sint8, L);
}
bool ByteCodeEmitter::emitCastUint16Uint16(const SourceInfo &L) {
  return emitOp<>(OP_CastUint16Uint16, L);
}
bool ByteCodeEmitter::emitCastUint16Sint16(const SourceInfo &L) {
  return emitOp<>(OP_CastUint16Sint16, L);
}
bool ByteCodeEmitter::emitCastUint16Uint32(const SourceInfo &L) {
  return emitOp<>(OP_CastUint16Uint32, L);
}
bool ByteCodeEmitter::emitCastUint16Sint32(const SourceInfo &L) {
  return emitOp<>(OP_CastUint16Sint32, L);
}
bool ByteCodeEmitter::emitCastUint16Uint64(const SourceInfo &L) {
  return emitOp<>(OP_CastUint16Uint64, L);
}
bool ByteCodeEmitter::emitCastUint16Sint64(const SourceInfo &L) {
  return emitOp<>(OP_CastUint16Sint64, L);
}
bool ByteCodeEmitter::emitCastUint16Bool(const SourceInfo &L) {
  return emitOp<>(OP_CastUint16Bool, L);
}
bool ByteCodeEmitter::emitCastSint16Uint8(const SourceInfo &L) {
  return emitOp<>(OP_CastSint16Uint8, L);
}
bool ByteCodeEmitter::emitCastSint16Sint8(const SourceInfo &L) {
  return emitOp<>(OP_CastSint16Sint8, L);
}
bool ByteCodeEmitter::emitCastSint16Uint16(const SourceInfo &L) {
  return emitOp<>(OP_CastSint16Uint16, L);
}
bool ByteCodeEmitter::emitCastSint16Sint16(const SourceInfo &L) {
  return emitOp<>(OP_CastSint16Sint16, L);
}
bool ByteCodeEmitter::emitCastSint16Uint32(const SourceInfo &L) {
  return emitOp<>(OP_CastSint16Uint32, L);
}
bool ByteCodeEmitter::emitCastSint16Sint32(const SourceInfo &L) {
  return emitOp<>(OP_CastSint16Sint32, L);
}
bool ByteCodeEmitter::emitCastSint16Uint64(const SourceInfo &L) {
  return emitOp<>(OP_CastSint16Uint64, L);
}
bool ByteCodeEmitter::emitCastSint16Sint64(const SourceInfo &L) {
  return emitOp<>(OP_CastSint16Sint64, L);
}
bool ByteCodeEmitter::emitCastSint16Bool(const SourceInfo &L) {
  return emitOp<>(OP_CastSint16Bool, L);
}
bool ByteCodeEmitter::emitCastUint32Uint8(const SourceInfo &L) {
  return emitOp<>(OP_CastUint32Uint8, L);
}
bool ByteCodeEmitter::emitCastUint32Sint8(const SourceInfo &L) {
  return emitOp<>(OP_CastUint32Sint8, L);
}
bool ByteCodeEmitter::emitCastUint32Uint16(const SourceInfo &L) {
  return emitOp<>(OP_CastUint32Uint16, L);
}
bool ByteCodeEmitter::emitCastUint32Sint16(const SourceInfo &L) {
  return emitOp<>(OP_CastUint32Sint16, L);
}
bool ByteCodeEmitter::emitCastUint32Uint32(const SourceInfo &L) {
  return emitOp<>(OP_CastUint32Uint32, L);
}
bool ByteCodeEmitter::emitCastUint32Sint32(const SourceInfo &L) {
  return emitOp<>(OP_CastUint32Sint32, L);
}
bool ByteCodeEmitter::emitCastUint32Uint64(const SourceInfo &L) {
  return emitOp<>(OP_CastUint32Uint64, L);
}
bool ByteCodeEmitter::emitCastUint32Sint64(const SourceInfo &L) {
  return emitOp<>(OP_CastUint32Sint64, L);
}
bool ByteCodeEmitter::emitCastUint32Bool(const SourceInfo &L) {
  return emitOp<>(OP_CastUint32Bool, L);
}
bool ByteCodeEmitter::emitCastSint32Uint8(const SourceInfo &L) {
  return emitOp<>(OP_CastSint32Uint8, L);
}
bool ByteCodeEmitter::emitCastSint32Sint8(const SourceInfo &L) {
  return emitOp<>(OP_CastSint32Sint8, L);
}
bool ByteCodeEmitter::emitCastSint32Uint16(const SourceInfo &L) {
  return emitOp<>(OP_CastSint32Uint16, L);
}
bool ByteCodeEmitter::emitCastSint32Sint16(const SourceInfo &L) {
  return emitOp<>(OP_CastSint32Sint16, L);
}
bool ByteCodeEmitter::emitCastSint32Uint32(const SourceInfo &L) {
  return emitOp<>(OP_CastSint32Uint32, L);
}
bool ByteCodeEmitter::emitCastSint32Sint32(const SourceInfo &L) {
  return emitOp<>(OP_CastSint32Sint32, L);
}
bool ByteCodeEmitter::emitCastSint32Uint64(const SourceInfo &L) {
  return emitOp<>(OP_CastSint32Uint64, L);
}
bool ByteCodeEmitter::emitCastSint32Sint64(const SourceInfo &L) {
  return emitOp<>(OP_CastSint32Sint64, L);
}
bool ByteCodeEmitter::emitCastSint32Bool(const SourceInfo &L) {
  return emitOp<>(OP_CastSint32Bool, L);
}
bool ByteCodeEmitter::emitCastUint64Uint8(const SourceInfo &L) {
  return emitOp<>(OP_CastUint64Uint8, L);
}
bool ByteCodeEmitter::emitCastUint64Sint8(const SourceInfo &L) {
  return emitOp<>(OP_CastUint64Sint8, L);
}
bool ByteCodeEmitter::emitCastUint64Uint16(const SourceInfo &L) {
  return emitOp<>(OP_CastUint64Uint16, L);
}
bool ByteCodeEmitter::emitCastUint64Sint16(const SourceInfo &L) {
  return emitOp<>(OP_CastUint64Sint16, L);
}
bool ByteCodeEmitter::emitCastUint64Uint32(const SourceInfo &L) {
  return emitOp<>(OP_CastUint64Uint32, L);
}
bool ByteCodeEmitter::emitCastUint64Sint32(const SourceInfo &L) {
  return emitOp<>(OP_CastUint64Sint32, L);
}
bool ByteCodeEmitter::emitCastUint64Uint64(const SourceInfo &L) {
  return emitOp<>(OP_CastUint64Uint64, L);
}
bool ByteCodeEmitter::emitCastUint64Sint64(const SourceInfo &L) {
  return emitOp<>(OP_CastUint64Sint64, L);
}
bool ByteCodeEmitter::emitCastUint64Bool(const SourceInfo &L) {
  return emitOp<>(OP_CastUint64Bool, L);
}
bool ByteCodeEmitter::emitCastSint64Uint8(const SourceInfo &L) {
  return emitOp<>(OP_CastSint64Uint8, L);
}
bool ByteCodeEmitter::emitCastSint64Sint8(const SourceInfo &L) {
  return emitOp<>(OP_CastSint64Sint8, L);
}
bool ByteCodeEmitter::emitCastSint64Uint16(const SourceInfo &L) {
  return emitOp<>(OP_CastSint64Uint16, L);
}
bool ByteCodeEmitter::emitCastSint64Sint16(const SourceInfo &L) {
  return emitOp<>(OP_CastSint64Sint16, L);
}
bool ByteCodeEmitter::emitCastSint64Uint32(const SourceInfo &L) {
  return emitOp<>(OP_CastSint64Uint32, L);
}
bool ByteCodeEmitter::emitCastSint64Sint32(const SourceInfo &L) {
  return emitOp<>(OP_CastSint64Sint32, L);
}
bool ByteCodeEmitter::emitCastSint64Uint64(const SourceInfo &L) {
  return emitOp<>(OP_CastSint64Uint64, L);
}
bool ByteCodeEmitter::emitCastSint64Sint64(const SourceInfo &L) {
  return emitOp<>(OP_CastSint64Sint64, L);
}
bool ByteCodeEmitter::emitCastSint64Bool(const SourceInfo &L) {
  return emitOp<>(OP_CastSint64Bool, L);
}
bool ByteCodeEmitter::emitCastBoolUint8(const SourceInfo &L) {
  return emitOp<>(OP_CastBoolUint8, L);
}
bool ByteCodeEmitter::emitCastBoolSint8(const SourceInfo &L) {
  return emitOp<>(OP_CastBoolSint8, L);
}
bool ByteCodeEmitter::emitCastBoolUint16(const SourceInfo &L) {
  return emitOp<>(OP_CastBoolUint16, L);
}
bool ByteCodeEmitter::emitCastBoolSint16(const SourceInfo &L) {
  return emitOp<>(OP_CastBoolSint16, L);
}
bool ByteCodeEmitter::emitCastBoolUint32(const SourceInfo &L) {
  return emitOp<>(OP_CastBoolUint32, L);
}
bool ByteCodeEmitter::emitCastBoolSint32(const SourceInfo &L) {
  return emitOp<>(OP_CastBoolSint32, L);
}
bool ByteCodeEmitter::emitCastBoolUint64(const SourceInfo &L) {
  return emitOp<>(OP_CastBoolUint64, L);
}
bool ByteCodeEmitter::emitCastBoolSint64(const SourceInfo &L) {
  return emitOp<>(OP_CastBoolSint64, L);
}
bool ByteCodeEmitter::emitCastBoolBool(const SourceInfo &L) {
  return emitOp<>(OP_CastBoolBool, L);
}
bool ByteCodeEmitter::emitCastIntAPUint8(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPUint8, L);
}
bool ByteCodeEmitter::emitCastIntAPSint8(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSint8, L);
}
bool ByteCodeEmitter::emitCastIntAPUint16(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPUint16, L);
}
bool ByteCodeEmitter::emitCastIntAPSint16(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSint16, L);
}
bool ByteCodeEmitter::emitCastIntAPUint32(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPUint32, L);
}
bool ByteCodeEmitter::emitCastIntAPSint32(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSint32, L);
}
bool ByteCodeEmitter::emitCastIntAPUint64(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPUint64, L);
}
bool ByteCodeEmitter::emitCastIntAPSint64(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSint64, L);
}
bool ByteCodeEmitter::emitCastIntAPBool(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPBool, L);
}
bool ByteCodeEmitter::emitCastIntAPSUint8(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSUint8, L);
}
bool ByteCodeEmitter::emitCastIntAPSSint8(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSSint8, L);
}
bool ByteCodeEmitter::emitCastIntAPSUint16(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSUint16, L);
}
bool ByteCodeEmitter::emitCastIntAPSSint16(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSSint16, L);
}
bool ByteCodeEmitter::emitCastIntAPSUint32(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSUint32, L);
}
bool ByteCodeEmitter::emitCastIntAPSSint32(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSSint32, L);
}
bool ByteCodeEmitter::emitCastIntAPSUint64(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSUint64, L);
}
bool ByteCodeEmitter::emitCastIntAPSSint64(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSSint64, L);
}
bool ByteCodeEmitter::emitCastIntAPSBool(const SourceInfo &L) {
  return emitOp<>(OP_CastIntAPSBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCastUint8Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint8, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastUint8Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint8, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastUint8Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint8, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastUint8Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint8, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastUint8Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint8, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastUint8Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint8, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastUint8Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint8, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastUint8Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint8, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastUint8Bool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint8, PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitCastSint8Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint8, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastSint8Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint8, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastSint8Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint8, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastSint8Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint8, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastSint8Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint8, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastSint8Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint8, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastSint8Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint8, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastSint8Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint8, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastSint8Bool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint8, PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitCastUint16Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint16, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastUint16Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint16, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastUint16Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint16, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastUint16Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint16, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastUint16Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint16, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastUint16Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint16, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastUint16Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint16, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastUint16Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint16, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastUint16Bool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint16, PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitCastSint16Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint16, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastSint16Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint16, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastSint16Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint16, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastSint16Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint16, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastSint16Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint16, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastSint16Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint16, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastSint16Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint16, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastSint16Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint16, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastSint16Bool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint16, PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitCastUint32Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint32, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastUint32Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint32, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastUint32Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint32, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastUint32Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint32, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastUint32Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint32, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastUint32Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint32, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastUint32Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint32, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastUint32Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint32, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastUint32Bool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint32, PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitCastSint32Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint32, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastSint32Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint32, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastSint32Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint32, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastSint32Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint32, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastSint32Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint32, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastSint32Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint32, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastSint32Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint32, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastSint32Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint32, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastSint32Bool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint32, PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitCastUint64Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint64, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastUint64Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint64, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastUint64Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint64, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastUint64Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint64, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastUint64Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint64, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastUint64Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint64, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastUint64Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint64, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastUint64Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint64, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastUint64Bool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Uint64, PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitCastSint64Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint64, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastSint64Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint64, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastSint64Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint64, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastSint64Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint64, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastSint64Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint64, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastSint64Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint64, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastSint64Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint64, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastSint64Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint64, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastSint64Bool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Sint64, PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitCastBoolUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Bool, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastBoolSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Bool, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastBoolUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Bool, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastBoolSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Bool, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastBoolUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Bool, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastBoolSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Bool, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastBoolUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Bool, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastBoolSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Bool, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastBoolBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_Bool, PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAP, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAP, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAP, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAP, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAP, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAP, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAP, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAP, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAP, PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAPS, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAPS, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAPS, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAPS, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAPS, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAPS, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAPS, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAPS, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastIntAPSBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Cast<PT_IntAPS, PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CastAPSint8,
OP_CastAPUint8,
OP_CastAPSint16,
OP_CastAPUint16,
OP_CastAPSint32,
OP_CastAPUint32,
OP_CastAPSint64,
OP_CastAPUint64,
OP_CastAPIntAP,
OP_CastAPIntAPS,
OP_CastAPBool,
#endif
#ifdef GET_INTERP
case OP_CastAPSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAP<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAP<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAP<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAP<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAP<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAP<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAP<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAP<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAP<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAP<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAP<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CastAPSint8:
  PrintName("CastAPSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPUint8:
  PrintName("CastAPUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSint16:
  PrintName("CastAPSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPUint16:
  PrintName("CastAPUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSint32:
  PrintName("CastAPSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPUint32:
  PrintName("CastAPUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSint64:
  PrintName("CastAPSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPUint64:
  PrintName("CastAPUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPIntAP:
  PrintName("CastAPIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPIntAPS:
  PrintName("CastAPIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPBool:
  PrintName("CastAPBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastAPSint8(uint32_t, const SourceInfo &);
bool emitCastAPUint8(uint32_t, const SourceInfo &);
bool emitCastAPSint16(uint32_t, const SourceInfo &);
bool emitCastAPUint16(uint32_t, const SourceInfo &);
bool emitCastAPSint32(uint32_t, const SourceInfo &);
bool emitCastAPUint32(uint32_t, const SourceInfo &);
bool emitCastAPSint64(uint32_t, const SourceInfo &);
bool emitCastAPUint64(uint32_t, const SourceInfo &);
bool emitCastAPIntAP(uint32_t, const SourceInfo &);
bool emitCastAPIntAPS(uint32_t, const SourceInfo &);
bool emitCastAPBool(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastAP(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitCastAP(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitCastAPSint8(A0, I);
  case PT_Uint8:
    return emitCastAPUint8(A0, I);
  case PT_Sint16:
    return emitCastAPSint16(A0, I);
  case PT_Uint16:
    return emitCastAPUint16(A0, I);
  case PT_Sint32:
    return emitCastAPSint32(A0, I);
  case PT_Uint32:
    return emitCastAPUint32(A0, I);
  case PT_Sint64:
    return emitCastAPSint64(A0, I);
  case PT_Uint64:
    return emitCastAPUint64(A0, I);
  case PT_IntAP:
    return emitCastAPIntAP(A0, I);
  case PT_IntAPS:
    return emitCastAPIntAPS(A0, I);
  case PT_Bool:
    return emitCastAPBool(A0, I);
  default: llvm_unreachable("invalid type: emitCastAP");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCastAPSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSint8, A0, L);
}
bool ByteCodeEmitter::emitCastAPUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPUint8, A0, L);
}
bool ByteCodeEmitter::emitCastAPSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSint16, A0, L);
}
bool ByteCodeEmitter::emitCastAPUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPUint16, A0, L);
}
bool ByteCodeEmitter::emitCastAPSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSint32, A0, L);
}
bool ByteCodeEmitter::emitCastAPUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPUint32, A0, L);
}
bool ByteCodeEmitter::emitCastAPSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSint64, A0, L);
}
bool ByteCodeEmitter::emitCastAPUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPUint64, A0, L);
}
bool ByteCodeEmitter::emitCastAPIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPIntAP, A0, L);
}
bool ByteCodeEmitter::emitCastAPIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPIntAPS, A0, L);
}
bool ByteCodeEmitter::emitCastAPBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPBool, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCastAPSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAP<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAP<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAP<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAP<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAP<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAP<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAP<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAP<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAP<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAP<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAP<PT_Bool>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CastAPSSint8,
OP_CastAPSUint8,
OP_CastAPSSint16,
OP_CastAPSUint16,
OP_CastAPSSint32,
OP_CastAPSUint32,
OP_CastAPSSint64,
OP_CastAPSUint64,
OP_CastAPSIntAP,
OP_CastAPSIntAPS,
OP_CastAPSBool,
#endif
#ifdef GET_INTERP
case OP_CastAPSSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAPS<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAPS<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAPS<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAPS<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAPS<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAPS<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAPS<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAPS<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAPS<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAPS<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_CastAPSBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastAPS<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CastAPSSint8:
  PrintName("CastAPSSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSUint8:
  PrintName("CastAPSUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSSint16:
  PrintName("CastAPSSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSUint16:
  PrintName("CastAPSUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSSint32:
  PrintName("CastAPSSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSUint32:
  PrintName("CastAPSUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSSint64:
  PrintName("CastAPSSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSUint64:
  PrintName("CastAPSUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSIntAP:
  PrintName("CastAPSIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSIntAPS:
  PrintName("CastAPSIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_CastAPSBool:
  PrintName("CastAPSBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastAPSSint8(uint32_t, const SourceInfo &);
bool emitCastAPSUint8(uint32_t, const SourceInfo &);
bool emitCastAPSSint16(uint32_t, const SourceInfo &);
bool emitCastAPSUint16(uint32_t, const SourceInfo &);
bool emitCastAPSSint32(uint32_t, const SourceInfo &);
bool emitCastAPSUint32(uint32_t, const SourceInfo &);
bool emitCastAPSSint64(uint32_t, const SourceInfo &);
bool emitCastAPSUint64(uint32_t, const SourceInfo &);
bool emitCastAPSIntAP(uint32_t, const SourceInfo &);
bool emitCastAPSIntAPS(uint32_t, const SourceInfo &);
bool emitCastAPSBool(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastAPS(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitCastAPS(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitCastAPSSint8(A0, I);
  case PT_Uint8:
    return emitCastAPSUint8(A0, I);
  case PT_Sint16:
    return emitCastAPSSint16(A0, I);
  case PT_Uint16:
    return emitCastAPSUint16(A0, I);
  case PT_Sint32:
    return emitCastAPSSint32(A0, I);
  case PT_Uint32:
    return emitCastAPSUint32(A0, I);
  case PT_Sint64:
    return emitCastAPSSint64(A0, I);
  case PT_Uint64:
    return emitCastAPSUint64(A0, I);
  case PT_IntAP:
    return emitCastAPSIntAP(A0, I);
  case PT_IntAPS:
    return emitCastAPSIntAPS(A0, I);
  case PT_Bool:
    return emitCastAPSBool(A0, I);
  default: llvm_unreachable("invalid type: emitCastAPS");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCastAPSSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSSint8, A0, L);
}
bool ByteCodeEmitter::emitCastAPSUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSUint8, A0, L);
}
bool ByteCodeEmitter::emitCastAPSSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSSint16, A0, L);
}
bool ByteCodeEmitter::emitCastAPSUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSUint16, A0, L);
}
bool ByteCodeEmitter::emitCastAPSSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSSint32, A0, L);
}
bool ByteCodeEmitter::emitCastAPSUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSUint32, A0, L);
}
bool ByteCodeEmitter::emitCastAPSSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSSint64, A0, L);
}
bool ByteCodeEmitter::emitCastAPSUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSUint64, A0, L);
}
bool ByteCodeEmitter::emitCastAPSIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSIntAP, A0, L);
}
bool ByteCodeEmitter::emitCastAPSIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSIntAPS, A0, L);
}
bool ByteCodeEmitter::emitCastAPSBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastAPSBool, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCastAPSSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAPS<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAPS<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAPS<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAPS<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAPS<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAPS<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAPS<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAPS<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAPS<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAPS<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitCastAPSBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastAPS<PT_Bool>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CastFP,
#endif
#ifdef GET_INTERP
case OP_CastFP: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastFP(S, OpPC, V0, V1))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CastFP:
  PrintName("CastFP");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastFP(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCastFP(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastFP, A0, A1, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCastFP(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFP(S, OpPC, A0, A1);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CastFloatingIntegralUint8,
OP_CastFloatingIntegralSint8,
OP_CastFloatingIntegralUint16,
OP_CastFloatingIntegralSint16,
OP_CastFloatingIntegralUint32,
OP_CastFloatingIntegralSint32,
OP_CastFloatingIntegralUint64,
OP_CastFloatingIntegralSint64,
OP_CastFloatingIntegralBool,
#endif
#ifdef GET_INTERP
case OP_CastFloatingIntegralUint8: {
  if (!CastFloatingIntegral<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastFloatingIntegralSint8: {
  if (!CastFloatingIntegral<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastFloatingIntegralUint16: {
  if (!CastFloatingIntegral<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastFloatingIntegralSint16: {
  if (!CastFloatingIntegral<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastFloatingIntegralUint32: {
  if (!CastFloatingIntegral<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastFloatingIntegralSint32: {
  if (!CastFloatingIntegral<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastFloatingIntegralUint64: {
  if (!CastFloatingIntegral<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastFloatingIntegralSint64: {
  if (!CastFloatingIntegral<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastFloatingIntegralBool: {
  if (!CastFloatingIntegral<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CastFloatingIntegralUint8:
  PrintName("CastFloatingIntegralUint8");
  OS << "\t" << "\n";
  continue;
case OP_CastFloatingIntegralSint8:
  PrintName("CastFloatingIntegralSint8");
  OS << "\t" << "\n";
  continue;
case OP_CastFloatingIntegralUint16:
  PrintName("CastFloatingIntegralUint16");
  OS << "\t" << "\n";
  continue;
case OP_CastFloatingIntegralSint16:
  PrintName("CastFloatingIntegralSint16");
  OS << "\t" << "\n";
  continue;
case OP_CastFloatingIntegralUint32:
  PrintName("CastFloatingIntegralUint32");
  OS << "\t" << "\n";
  continue;
case OP_CastFloatingIntegralSint32:
  PrintName("CastFloatingIntegralSint32");
  OS << "\t" << "\n";
  continue;
case OP_CastFloatingIntegralUint64:
  PrintName("CastFloatingIntegralUint64");
  OS << "\t" << "\n";
  continue;
case OP_CastFloatingIntegralSint64:
  PrintName("CastFloatingIntegralSint64");
  OS << "\t" << "\n";
  continue;
case OP_CastFloatingIntegralBool:
  PrintName("CastFloatingIntegralBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastFloatingIntegralUint8(const SourceInfo &);
bool emitCastFloatingIntegralSint8(const SourceInfo &);
bool emitCastFloatingIntegralUint16(const SourceInfo &);
bool emitCastFloatingIntegralSint16(const SourceInfo &);
bool emitCastFloatingIntegralUint32(const SourceInfo &);
bool emitCastFloatingIntegralSint32(const SourceInfo &);
bool emitCastFloatingIntegralUint64(const SourceInfo &);
bool emitCastFloatingIntegralSint64(const SourceInfo &);
bool emitCastFloatingIntegralBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastFloatingIntegral(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitCastFloatingIntegral(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Uint8:
    return emitCastFloatingIntegralUint8(I);
  case PT_Sint8:
    return emitCastFloatingIntegralSint8(I);
  case PT_Uint16:
    return emitCastFloatingIntegralUint16(I);
  case PT_Sint16:
    return emitCastFloatingIntegralSint16(I);
  case PT_Uint32:
    return emitCastFloatingIntegralUint32(I);
  case PT_Sint32:
    return emitCastFloatingIntegralSint32(I);
  case PT_Uint64:
    return emitCastFloatingIntegralUint64(I);
  case PT_Sint64:
    return emitCastFloatingIntegralSint64(I);
  case PT_Bool:
    return emitCastFloatingIntegralBool(I);
  default: llvm_unreachable("invalid type: emitCastFloatingIntegral");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCastFloatingIntegralUint8(const SourceInfo &L) {
  return emitOp<>(OP_CastFloatingIntegralUint8, L);
}
bool ByteCodeEmitter::emitCastFloatingIntegralSint8(const SourceInfo &L) {
  return emitOp<>(OP_CastFloatingIntegralSint8, L);
}
bool ByteCodeEmitter::emitCastFloatingIntegralUint16(const SourceInfo &L) {
  return emitOp<>(OP_CastFloatingIntegralUint16, L);
}
bool ByteCodeEmitter::emitCastFloatingIntegralSint16(const SourceInfo &L) {
  return emitOp<>(OP_CastFloatingIntegralSint16, L);
}
bool ByteCodeEmitter::emitCastFloatingIntegralUint32(const SourceInfo &L) {
  return emitOp<>(OP_CastFloatingIntegralUint32, L);
}
bool ByteCodeEmitter::emitCastFloatingIntegralSint32(const SourceInfo &L) {
  return emitOp<>(OP_CastFloatingIntegralSint32, L);
}
bool ByteCodeEmitter::emitCastFloatingIntegralUint64(const SourceInfo &L) {
  return emitOp<>(OP_CastFloatingIntegralUint64, L);
}
bool ByteCodeEmitter::emitCastFloatingIntegralSint64(const SourceInfo &L) {
  return emitOp<>(OP_CastFloatingIntegralSint64, L);
}
bool ByteCodeEmitter::emitCastFloatingIntegralBool(const SourceInfo &L) {
  return emitOp<>(OP_CastFloatingIntegralBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCastFloatingIntegralUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFloatingIntegral<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastFloatingIntegralSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFloatingIntegral<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastFloatingIntegralUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFloatingIntegral<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastFloatingIntegralSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFloatingIntegral<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastFloatingIntegralUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFloatingIntegral<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastFloatingIntegralSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFloatingIntegral<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastFloatingIntegralUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFloatingIntegral<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastFloatingIntegralSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFloatingIntegral<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastFloatingIntegralBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFloatingIntegral<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CastFloatingIntegralAP,
#endif
#ifdef GET_INTERP
case OP_CastFloatingIntegralAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastFloatingIntegralAP(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CastFloatingIntegralAP:
  PrintName("CastFloatingIntegralAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastFloatingIntegralAP(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCastFloatingIntegralAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastFloatingIntegralAP, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCastFloatingIntegralAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFloatingIntegralAP(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CastFloatingIntegralAPS,
#endif
#ifdef GET_INTERP
case OP_CastFloatingIntegralAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!CastFloatingIntegralAPS(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CastFloatingIntegralAPS:
  PrintName("CastFloatingIntegralAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastFloatingIntegralAPS(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCastFloatingIntegralAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_CastFloatingIntegralAPS, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCastFloatingIntegralAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastFloatingIntegralAPS(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CastIntegralFloatingSint8,
OP_CastIntegralFloatingUint8,
OP_CastIntegralFloatingSint16,
OP_CastIntegralFloatingUint16,
OP_CastIntegralFloatingSint32,
OP_CastIntegralFloatingUint32,
OP_CastIntegralFloatingSint64,
OP_CastIntegralFloatingUint64,
OP_CastIntegralFloatingIntAP,
OP_CastIntegralFloatingIntAPS,
OP_CastIntegralFloatingBool,
#endif
#ifdef GET_INTERP
case OP_CastIntegralFloatingSint8: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastIntegralFloating<PT_Sint8>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_CastIntegralFloatingUint8: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastIntegralFloating<PT_Uint8>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_CastIntegralFloatingSint16: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastIntegralFloating<PT_Sint16>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_CastIntegralFloatingUint16: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastIntegralFloating<PT_Uint16>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_CastIntegralFloatingSint32: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastIntegralFloating<PT_Sint32>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_CastIntegralFloatingUint32: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastIntegralFloating<PT_Uint32>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_CastIntegralFloatingSint64: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastIntegralFloating<PT_Sint64>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_CastIntegralFloatingUint64: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastIntegralFloating<PT_Uint64>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_CastIntegralFloatingIntAP: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastIntegralFloating<PT_IntAP>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_CastIntegralFloatingIntAPS: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastIntegralFloating<PT_IntAPS>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_CastIntegralFloatingBool: {
  auto V0 = ReadArg<const llvm::fltSemantics *>(S, PC);
  auto V1 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!CastIntegralFloating<PT_Bool>(S, OpPC, V0, V1))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CastIntegralFloatingSint8:
  PrintName("CastIntegralFloatingSint8");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
case OP_CastIntegralFloatingUint8:
  PrintName("CastIntegralFloatingUint8");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
case OP_CastIntegralFloatingSint16:
  PrintName("CastIntegralFloatingSint16");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
case OP_CastIntegralFloatingUint16:
  PrintName("CastIntegralFloatingUint16");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
case OP_CastIntegralFloatingSint32:
  PrintName("CastIntegralFloatingSint32");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
case OP_CastIntegralFloatingUint32:
  PrintName("CastIntegralFloatingUint32");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
case OP_CastIntegralFloatingSint64:
  PrintName("CastIntegralFloatingSint64");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
case OP_CastIntegralFloatingUint64:
  PrintName("CastIntegralFloatingUint64");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
case OP_CastIntegralFloatingIntAP:
  PrintName("CastIntegralFloatingIntAP");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
case OP_CastIntegralFloatingIntAPS:
  PrintName("CastIntegralFloatingIntAPS");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
case OP_CastIntegralFloatingBool:
  PrintName("CastIntegralFloatingBool");
  OS << "\t" << ReadArg<const llvm::fltSemantics *>(P, PC) << " " << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastIntegralFloatingSint8(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
bool emitCastIntegralFloatingUint8(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
bool emitCastIntegralFloatingSint16(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
bool emitCastIntegralFloatingUint16(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
bool emitCastIntegralFloatingSint32(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
bool emitCastIntegralFloatingUint32(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
bool emitCastIntegralFloatingSint64(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
bool emitCastIntegralFloatingUint64(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
bool emitCastIntegralFloatingIntAP(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
bool emitCastIntegralFloatingIntAPS(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
bool emitCastIntegralFloatingBool(const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastIntegralFloating(PrimType, const llvm::fltSemantics *, llvm::RoundingMode, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitCastIntegralFloating(PrimType T0, const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitCastIntegralFloatingSint8(A0, A1, I);
  case PT_Uint8:
    return emitCastIntegralFloatingUint8(A0, A1, I);
  case PT_Sint16:
    return emitCastIntegralFloatingSint16(A0, A1, I);
  case PT_Uint16:
    return emitCastIntegralFloatingUint16(A0, A1, I);
  case PT_Sint32:
    return emitCastIntegralFloatingSint32(A0, A1, I);
  case PT_Uint32:
    return emitCastIntegralFloatingUint32(A0, A1, I);
  case PT_Sint64:
    return emitCastIntegralFloatingSint64(A0, A1, I);
  case PT_Uint64:
    return emitCastIntegralFloatingUint64(A0, A1, I);
  case PT_IntAP:
    return emitCastIntegralFloatingIntAP(A0, A1, I);
  case PT_IntAPS:
    return emitCastIntegralFloatingIntAPS(A0, A1, I);
  case PT_Bool:
    return emitCastIntegralFloatingBool(A0, A1, I);
  default: llvm_unreachable("invalid type: emitCastIntegralFloating");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCastIntegralFloatingSint8(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastIntegralFloatingSint8, A0, A1, L);
}
bool ByteCodeEmitter::emitCastIntegralFloatingUint8(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastIntegralFloatingUint8, A0, A1, L);
}
bool ByteCodeEmitter::emitCastIntegralFloatingSint16(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastIntegralFloatingSint16, A0, A1, L);
}
bool ByteCodeEmitter::emitCastIntegralFloatingUint16(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastIntegralFloatingUint16, A0, A1, L);
}
bool ByteCodeEmitter::emitCastIntegralFloatingSint32(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastIntegralFloatingSint32, A0, A1, L);
}
bool ByteCodeEmitter::emitCastIntegralFloatingUint32(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastIntegralFloatingUint32, A0, A1, L);
}
bool ByteCodeEmitter::emitCastIntegralFloatingSint64(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastIntegralFloatingSint64, A0, A1, L);
}
bool ByteCodeEmitter::emitCastIntegralFloatingUint64(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastIntegralFloatingUint64, A0, A1, L);
}
bool ByteCodeEmitter::emitCastIntegralFloatingIntAP(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastIntegralFloatingIntAP, A0, A1, L);
}
bool ByteCodeEmitter::emitCastIntegralFloatingIntAPS(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastIntegralFloatingIntAPS, A0, A1, L);
}
bool ByteCodeEmitter::emitCastIntegralFloatingBool(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  return emitOp<const llvm::fltSemantics *, llvm::RoundingMode>(OP_CastIntegralFloatingBool, A0, A1, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCastIntegralFloatingSint8(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastIntegralFloating<PT_Sint8>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitCastIntegralFloatingUint8(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastIntegralFloating<PT_Uint8>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitCastIntegralFloatingSint16(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastIntegralFloating<PT_Sint16>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitCastIntegralFloatingUint16(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastIntegralFloating<PT_Uint16>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitCastIntegralFloatingSint32(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastIntegralFloating<PT_Sint32>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitCastIntegralFloatingUint32(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastIntegralFloating<PT_Uint32>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitCastIntegralFloatingSint64(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastIntegralFloating<PT_Sint64>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitCastIntegralFloatingUint64(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastIntegralFloating<PT_Uint64>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitCastIntegralFloatingIntAP(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastIntegralFloating<PT_IntAP>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitCastIntegralFloatingIntAPS(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastIntegralFloating<PT_IntAPS>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitCastIntegralFloatingBool(const llvm::fltSemantics * A0, llvm::RoundingMode A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastIntegralFloating<PT_Bool>(S, OpPC, A0, A1);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CastPointerIntegralSint8,
OP_CastPointerIntegralUint8,
OP_CastPointerIntegralSint16,
OP_CastPointerIntegralUint16,
OP_CastPointerIntegralSint32,
OP_CastPointerIntegralUint32,
OP_CastPointerIntegralSint64,
OP_CastPointerIntegralUint64,
OP_CastPointerIntegralIntAP,
OP_CastPointerIntegralIntAPS,
OP_CastPointerIntegralBool,
#endif
#ifdef GET_INTERP
case OP_CastPointerIntegralSint8: {
  if (!CastPointerIntegral<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastPointerIntegralUint8: {
  if (!CastPointerIntegral<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CastPointerIntegralSint16: {
  if (!CastPointerIntegral<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastPointerIntegralUint16: {
  if (!CastPointerIntegral<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CastPointerIntegralSint32: {
  if (!CastPointerIntegral<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastPointerIntegralUint32: {
  if (!CastPointerIntegral<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CastPointerIntegralSint64: {
  if (!CastPointerIntegral<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastPointerIntegralUint64: {
  if (!CastPointerIntegral<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CastPointerIntegralIntAP: {
  if (!CastPointerIntegral<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_CastPointerIntegralIntAPS: {
  if (!CastPointerIntegral<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_CastPointerIntegralBool: {
  if (!CastPointerIntegral<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CastPointerIntegralSint8:
  PrintName("CastPointerIntegralSint8");
  OS << "\t" << "\n";
  continue;
case OP_CastPointerIntegralUint8:
  PrintName("CastPointerIntegralUint8");
  OS << "\t" << "\n";
  continue;
case OP_CastPointerIntegralSint16:
  PrintName("CastPointerIntegralSint16");
  OS << "\t" << "\n";
  continue;
case OP_CastPointerIntegralUint16:
  PrintName("CastPointerIntegralUint16");
  OS << "\t" << "\n";
  continue;
case OP_CastPointerIntegralSint32:
  PrintName("CastPointerIntegralSint32");
  OS << "\t" << "\n";
  continue;
case OP_CastPointerIntegralUint32:
  PrintName("CastPointerIntegralUint32");
  OS << "\t" << "\n";
  continue;
case OP_CastPointerIntegralSint64:
  PrintName("CastPointerIntegralSint64");
  OS << "\t" << "\n";
  continue;
case OP_CastPointerIntegralUint64:
  PrintName("CastPointerIntegralUint64");
  OS << "\t" << "\n";
  continue;
case OP_CastPointerIntegralIntAP:
  PrintName("CastPointerIntegralIntAP");
  OS << "\t" << "\n";
  continue;
case OP_CastPointerIntegralIntAPS:
  PrintName("CastPointerIntegralIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_CastPointerIntegralBool:
  PrintName("CastPointerIntegralBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastPointerIntegralSint8(const SourceInfo &);
bool emitCastPointerIntegralUint8(const SourceInfo &);
bool emitCastPointerIntegralSint16(const SourceInfo &);
bool emitCastPointerIntegralUint16(const SourceInfo &);
bool emitCastPointerIntegralSint32(const SourceInfo &);
bool emitCastPointerIntegralUint32(const SourceInfo &);
bool emitCastPointerIntegralSint64(const SourceInfo &);
bool emitCastPointerIntegralUint64(const SourceInfo &);
bool emitCastPointerIntegralIntAP(const SourceInfo &);
bool emitCastPointerIntegralIntAPS(const SourceInfo &);
bool emitCastPointerIntegralBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCastPointerIntegral(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitCastPointerIntegral(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitCastPointerIntegralSint8(I);
  case PT_Uint8:
    return emitCastPointerIntegralUint8(I);
  case PT_Sint16:
    return emitCastPointerIntegralSint16(I);
  case PT_Uint16:
    return emitCastPointerIntegralUint16(I);
  case PT_Sint32:
    return emitCastPointerIntegralSint32(I);
  case PT_Uint32:
    return emitCastPointerIntegralUint32(I);
  case PT_Sint64:
    return emitCastPointerIntegralSint64(I);
  case PT_Uint64:
    return emitCastPointerIntegralUint64(I);
  case PT_IntAP:
    return emitCastPointerIntegralIntAP(I);
  case PT_IntAPS:
    return emitCastPointerIntegralIntAPS(I);
  case PT_Bool:
    return emitCastPointerIntegralBool(I);
  default: llvm_unreachable("invalid type: emitCastPointerIntegral");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCastPointerIntegralSint8(const SourceInfo &L) {
  return emitOp<>(OP_CastPointerIntegralSint8, L);
}
bool ByteCodeEmitter::emitCastPointerIntegralUint8(const SourceInfo &L) {
  return emitOp<>(OP_CastPointerIntegralUint8, L);
}
bool ByteCodeEmitter::emitCastPointerIntegralSint16(const SourceInfo &L) {
  return emitOp<>(OP_CastPointerIntegralSint16, L);
}
bool ByteCodeEmitter::emitCastPointerIntegralUint16(const SourceInfo &L) {
  return emitOp<>(OP_CastPointerIntegralUint16, L);
}
bool ByteCodeEmitter::emitCastPointerIntegralSint32(const SourceInfo &L) {
  return emitOp<>(OP_CastPointerIntegralSint32, L);
}
bool ByteCodeEmitter::emitCastPointerIntegralUint32(const SourceInfo &L) {
  return emitOp<>(OP_CastPointerIntegralUint32, L);
}
bool ByteCodeEmitter::emitCastPointerIntegralSint64(const SourceInfo &L) {
  return emitOp<>(OP_CastPointerIntegralSint64, L);
}
bool ByteCodeEmitter::emitCastPointerIntegralUint64(const SourceInfo &L) {
  return emitOp<>(OP_CastPointerIntegralUint64, L);
}
bool ByteCodeEmitter::emitCastPointerIntegralIntAP(const SourceInfo &L) {
  return emitOp<>(OP_CastPointerIntegralIntAP, L);
}
bool ByteCodeEmitter::emitCastPointerIntegralIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_CastPointerIntegralIntAPS, L);
}
bool ByteCodeEmitter::emitCastPointerIntegralBool(const SourceInfo &L) {
  return emitOp<>(OP_CastPointerIntegralBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCastPointerIntegralSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastPointerIntegral<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCastPointerIntegralUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastPointerIntegral<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCastPointerIntegralSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastPointerIntegral<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCastPointerIntegralUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastPointerIntegral<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCastPointerIntegralSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastPointerIntegral<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCastPointerIntegralUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastPointerIntegral<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCastPointerIntegralSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastPointerIntegral<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCastPointerIntegralUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastPointerIntegral<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCastPointerIntegralIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastPointerIntegral<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitCastPointerIntegralIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastPointerIntegral<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitCastPointerIntegralBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return CastPointerIntegral<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_CompSint8,
OP_CompUint8,
OP_CompSint16,
OP_CompUint16,
OP_CompSint32,
OP_CompUint32,
OP_CompSint64,
OP_CompUint64,
OP_CompIntAP,
OP_CompIntAPS,
#endif
#ifdef GET_INTERP
case OP_CompSint8: {
  if (!Comp<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_CompUint8: {
  if (!Comp<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_CompSint16: {
  if (!Comp<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_CompUint16: {
  if (!Comp<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_CompSint32: {
  if (!Comp<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_CompUint32: {
  if (!Comp<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_CompSint64: {
  if (!Comp<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_CompUint64: {
  if (!Comp<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_CompIntAP: {
  if (!Comp<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_CompIntAPS: {
  if (!Comp<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_CompSint8:
  PrintName("CompSint8");
  OS << "\t" << "\n";
  continue;
case OP_CompUint8:
  PrintName("CompUint8");
  OS << "\t" << "\n";
  continue;
case OP_CompSint16:
  PrintName("CompSint16");
  OS << "\t" << "\n";
  continue;
case OP_CompUint16:
  PrintName("CompUint16");
  OS << "\t" << "\n";
  continue;
case OP_CompSint32:
  PrintName("CompSint32");
  OS << "\t" << "\n";
  continue;
case OP_CompUint32:
  PrintName("CompUint32");
  OS << "\t" << "\n";
  continue;
case OP_CompSint64:
  PrintName("CompSint64");
  OS << "\t" << "\n";
  continue;
case OP_CompUint64:
  PrintName("CompUint64");
  OS << "\t" << "\n";
  continue;
case OP_CompIntAP:
  PrintName("CompIntAP");
  OS << "\t" << "\n";
  continue;
case OP_CompIntAPS:
  PrintName("CompIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitCompSint8(const SourceInfo &);
bool emitCompUint8(const SourceInfo &);
bool emitCompSint16(const SourceInfo &);
bool emitCompUint16(const SourceInfo &);
bool emitCompSint32(const SourceInfo &);
bool emitCompUint32(const SourceInfo &);
bool emitCompSint64(const SourceInfo &);
bool emitCompUint64(const SourceInfo &);
bool emitCompIntAP(const SourceInfo &);
bool emitCompIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitComp(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitComp(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitCompSint8(I);
  case PT_Uint8:
    return emitCompUint8(I);
  case PT_Sint16:
    return emitCompSint16(I);
  case PT_Uint16:
    return emitCompUint16(I);
  case PT_Sint32:
    return emitCompSint32(I);
  case PT_Uint32:
    return emitCompUint32(I);
  case PT_Sint64:
    return emitCompSint64(I);
  case PT_Uint64:
    return emitCompUint64(I);
  case PT_IntAP:
    return emitCompIntAP(I);
  case PT_IntAPS:
    return emitCompIntAPS(I);
  default: llvm_unreachable("invalid type: emitComp");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitCompSint8(const SourceInfo &L) {
  return emitOp<>(OP_CompSint8, L);
}
bool ByteCodeEmitter::emitCompUint8(const SourceInfo &L) {
  return emitOp<>(OP_CompUint8, L);
}
bool ByteCodeEmitter::emitCompSint16(const SourceInfo &L) {
  return emitOp<>(OP_CompSint16, L);
}
bool ByteCodeEmitter::emitCompUint16(const SourceInfo &L) {
  return emitOp<>(OP_CompUint16, L);
}
bool ByteCodeEmitter::emitCompSint32(const SourceInfo &L) {
  return emitOp<>(OP_CompSint32, L);
}
bool ByteCodeEmitter::emitCompUint32(const SourceInfo &L) {
  return emitOp<>(OP_CompUint32, L);
}
bool ByteCodeEmitter::emitCompSint64(const SourceInfo &L) {
  return emitOp<>(OP_CompSint64, L);
}
bool ByteCodeEmitter::emitCompUint64(const SourceInfo &L) {
  return emitOp<>(OP_CompUint64, L);
}
bool ByteCodeEmitter::emitCompIntAP(const SourceInfo &L) {
  return emitOp<>(OP_CompIntAP, L);
}
bool ByteCodeEmitter::emitCompIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_CompIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitCompSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Comp<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitCompUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Comp<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitCompSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Comp<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitCompUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Comp<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitCompSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Comp<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitCompUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Comp<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitCompSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Comp<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitCompUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Comp<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitCompIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Comp<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitCompIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Comp<PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ConstBool,
#endif
#ifdef GET_INTERP
case OP_ConstBool: {
  auto V0 = ReadArg<bool>(S, PC);
  if (!Const<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ConstBool:
  PrintName("ConstBool");
  OS << "\t" << ReadArg<bool>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitConstBool(bool, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitConstBool(bool A0, const SourceInfo &L) {
  return emitOp<bool>(OP_ConstBool, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitConstBool(bool A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Const<PT_Bool>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ConstFloat,
#endif
#ifdef GET_INTERP
case OP_ConstFloat: {
  auto V0 = ReadArg<Floating>(S, PC);
  if (!Const<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ConstFloat:
  PrintName("ConstFloat");
  OS << "\t" << ReadArg<Floating>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitConstFloat(Floating, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitConstFloat(Floating A0, const SourceInfo &L) {
  return emitOp<Floating>(OP_ConstFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitConstFloat(Floating A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Const<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ConstSint8,
#endif
#ifdef GET_INTERP
case OP_ConstSint8: {
  auto V0 = ReadArg<int8_t>(S, PC);
  if (!Const<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ConstSint8:
  PrintName("ConstSint8");
  OS << "\t" << ReadArg<int8_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitConstSint8(int8_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitConstSint8(int8_t A0, const SourceInfo &L) {
  return emitOp<int8_t>(OP_ConstSint8, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitConstSint8(int8_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Const<PT_Sint8>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ConstSint16,
#endif
#ifdef GET_INTERP
case OP_ConstSint16: {
  auto V0 = ReadArg<int16_t>(S, PC);
  if (!Const<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ConstSint16:
  PrintName("ConstSint16");
  OS << "\t" << ReadArg<int16_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitConstSint16(int16_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitConstSint16(int16_t A0, const SourceInfo &L) {
  return emitOp<int16_t>(OP_ConstSint16, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitConstSint16(int16_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Const<PT_Sint16>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ConstSint32,
#endif
#ifdef GET_INTERP
case OP_ConstSint32: {
  auto V0 = ReadArg<int32_t>(S, PC);
  if (!Const<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ConstSint32:
  PrintName("ConstSint32");
  OS << "\t" << ReadArg<int32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitConstSint32(int32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitConstSint32(int32_t A0, const SourceInfo &L) {
  return emitOp<int32_t>(OP_ConstSint32, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitConstSint32(int32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Const<PT_Sint32>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ConstSint64,
#endif
#ifdef GET_INTERP
case OP_ConstSint64: {
  auto V0 = ReadArg<int64_t>(S, PC);
  if (!Const<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ConstSint64:
  PrintName("ConstSint64");
  OS << "\t" << ReadArg<int64_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitConstSint64(int64_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitConstSint64(int64_t A0, const SourceInfo &L) {
  return emitOp<int64_t>(OP_ConstSint64, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitConstSint64(int64_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Const<PT_Sint64>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ConstUint8,
#endif
#ifdef GET_INTERP
case OP_ConstUint8: {
  auto V0 = ReadArg<uint8_t>(S, PC);
  if (!Const<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ConstUint8:
  PrintName("ConstUint8");
  OS << "\t" << ReadArg<uint8_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitConstUint8(uint8_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitConstUint8(uint8_t A0, const SourceInfo &L) {
  return emitOp<uint8_t>(OP_ConstUint8, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitConstUint8(uint8_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Const<PT_Uint8>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ConstUint16,
#endif
#ifdef GET_INTERP
case OP_ConstUint16: {
  auto V0 = ReadArg<uint16_t>(S, PC);
  if (!Const<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ConstUint16:
  PrintName("ConstUint16");
  OS << "\t" << ReadArg<uint16_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitConstUint16(uint16_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitConstUint16(uint16_t A0, const SourceInfo &L) {
  return emitOp<uint16_t>(OP_ConstUint16, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitConstUint16(uint16_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Const<PT_Uint16>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ConstUint32,
#endif
#ifdef GET_INTERP
case OP_ConstUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!Const<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ConstUint32:
  PrintName("ConstUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitConstUint32(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitConstUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_ConstUint32, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitConstUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Const<PT_Uint32>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ConstUint64,
#endif
#ifdef GET_INTERP
case OP_ConstUint64: {
  auto V0 = ReadArg<uint64_t>(S, PC);
  if (!Const<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ConstUint64:
  PrintName("ConstUint64");
  OS << "\t" << ReadArg<uint64_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitConstUint64(uint64_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitConstUint64(uint64_t A0, const SourceInfo &L) {
  return emitOp<uint64_t>(OP_ConstUint64, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitConstUint64(uint64_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Const<PT_Uint64>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_DecSint8,
OP_DecUint8,
OP_DecSint16,
OP_DecUint16,
OP_DecSint32,
OP_DecUint32,
OP_DecSint64,
OP_DecUint64,
OP_DecIntAP,
OP_DecIntAPS,
#endif
#ifdef GET_INTERP
case OP_DecSint8: {
  if (!Dec<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_DecUint8: {
  if (!Dec<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_DecSint16: {
  if (!Dec<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_DecUint16: {
  if (!Dec<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_DecSint32: {
  if (!Dec<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_DecUint32: {
  if (!Dec<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_DecSint64: {
  if (!Dec<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_DecUint64: {
  if (!Dec<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_DecIntAP: {
  if (!Dec<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_DecIntAPS: {
  if (!Dec<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_DecSint8:
  PrintName("DecSint8");
  OS << "\t" << "\n";
  continue;
case OP_DecUint8:
  PrintName("DecUint8");
  OS << "\t" << "\n";
  continue;
case OP_DecSint16:
  PrintName("DecSint16");
  OS << "\t" << "\n";
  continue;
case OP_DecUint16:
  PrintName("DecUint16");
  OS << "\t" << "\n";
  continue;
case OP_DecSint32:
  PrintName("DecSint32");
  OS << "\t" << "\n";
  continue;
case OP_DecUint32:
  PrintName("DecUint32");
  OS << "\t" << "\n";
  continue;
case OP_DecSint64:
  PrintName("DecSint64");
  OS << "\t" << "\n";
  continue;
case OP_DecUint64:
  PrintName("DecUint64");
  OS << "\t" << "\n";
  continue;
case OP_DecIntAP:
  PrintName("DecIntAP");
  OS << "\t" << "\n";
  continue;
case OP_DecIntAPS:
  PrintName("DecIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDecSint8(const SourceInfo &);
bool emitDecUint8(const SourceInfo &);
bool emitDecSint16(const SourceInfo &);
bool emitDecUint16(const SourceInfo &);
bool emitDecSint32(const SourceInfo &);
bool emitDecUint32(const SourceInfo &);
bool emitDecSint64(const SourceInfo &);
bool emitDecUint64(const SourceInfo &);
bool emitDecIntAP(const SourceInfo &);
bool emitDecIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDec(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitDec(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitDecSint8(I);
  case PT_Uint8:
    return emitDecUint8(I);
  case PT_Sint16:
    return emitDecSint16(I);
  case PT_Uint16:
    return emitDecUint16(I);
  case PT_Sint32:
    return emitDecSint32(I);
  case PT_Uint32:
    return emitDecUint32(I);
  case PT_Sint64:
    return emitDecSint64(I);
  case PT_Uint64:
    return emitDecUint64(I);
  case PT_IntAP:
    return emitDecIntAP(I);
  case PT_IntAPS:
    return emitDecIntAPS(I);
  default: llvm_unreachable("invalid type: emitDec");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitDecSint8(const SourceInfo &L) {
  return emitOp<>(OP_DecSint8, L);
}
bool ByteCodeEmitter::emitDecUint8(const SourceInfo &L) {
  return emitOp<>(OP_DecUint8, L);
}
bool ByteCodeEmitter::emitDecSint16(const SourceInfo &L) {
  return emitOp<>(OP_DecSint16, L);
}
bool ByteCodeEmitter::emitDecUint16(const SourceInfo &L) {
  return emitOp<>(OP_DecUint16, L);
}
bool ByteCodeEmitter::emitDecSint32(const SourceInfo &L) {
  return emitOp<>(OP_DecSint32, L);
}
bool ByteCodeEmitter::emitDecUint32(const SourceInfo &L) {
  return emitOp<>(OP_DecUint32, L);
}
bool ByteCodeEmitter::emitDecSint64(const SourceInfo &L) {
  return emitOp<>(OP_DecSint64, L);
}
bool ByteCodeEmitter::emitDecUint64(const SourceInfo &L) {
  return emitOp<>(OP_DecUint64, L);
}
bool ByteCodeEmitter::emitDecIntAP(const SourceInfo &L) {
  return emitOp<>(OP_DecIntAP, L);
}
bool ByteCodeEmitter::emitDecIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_DecIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitDecSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dec<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitDecUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dec<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitDecSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dec<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitDecUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dec<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitDecSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dec<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitDecUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dec<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitDecSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dec<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitDecUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dec<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitDecIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dec<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitDecIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dec<PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_DecPopSint8,
OP_DecPopUint8,
OP_DecPopSint16,
OP_DecPopUint16,
OP_DecPopSint32,
OP_DecPopUint32,
OP_DecPopSint64,
OP_DecPopUint64,
OP_DecPopIntAP,
OP_DecPopIntAPS,
#endif
#ifdef GET_INTERP
case OP_DecPopSint8: {
  if (!DecPop<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_DecPopUint8: {
  if (!DecPop<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_DecPopSint16: {
  if (!DecPop<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_DecPopUint16: {
  if (!DecPop<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_DecPopSint32: {
  if (!DecPop<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_DecPopUint32: {
  if (!DecPop<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_DecPopSint64: {
  if (!DecPop<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_DecPopUint64: {
  if (!DecPop<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_DecPopIntAP: {
  if (!DecPop<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_DecPopIntAPS: {
  if (!DecPop<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_DecPopSint8:
  PrintName("DecPopSint8");
  OS << "\t" << "\n";
  continue;
case OP_DecPopUint8:
  PrintName("DecPopUint8");
  OS << "\t" << "\n";
  continue;
case OP_DecPopSint16:
  PrintName("DecPopSint16");
  OS << "\t" << "\n";
  continue;
case OP_DecPopUint16:
  PrintName("DecPopUint16");
  OS << "\t" << "\n";
  continue;
case OP_DecPopSint32:
  PrintName("DecPopSint32");
  OS << "\t" << "\n";
  continue;
case OP_DecPopUint32:
  PrintName("DecPopUint32");
  OS << "\t" << "\n";
  continue;
case OP_DecPopSint64:
  PrintName("DecPopSint64");
  OS << "\t" << "\n";
  continue;
case OP_DecPopUint64:
  PrintName("DecPopUint64");
  OS << "\t" << "\n";
  continue;
case OP_DecPopIntAP:
  PrintName("DecPopIntAP");
  OS << "\t" << "\n";
  continue;
case OP_DecPopIntAPS:
  PrintName("DecPopIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDecPopSint8(const SourceInfo &);
bool emitDecPopUint8(const SourceInfo &);
bool emitDecPopSint16(const SourceInfo &);
bool emitDecPopUint16(const SourceInfo &);
bool emitDecPopSint32(const SourceInfo &);
bool emitDecPopUint32(const SourceInfo &);
bool emitDecPopSint64(const SourceInfo &);
bool emitDecPopUint64(const SourceInfo &);
bool emitDecPopIntAP(const SourceInfo &);
bool emitDecPopIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDecPop(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitDecPop(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitDecPopSint8(I);
  case PT_Uint8:
    return emitDecPopUint8(I);
  case PT_Sint16:
    return emitDecPopSint16(I);
  case PT_Uint16:
    return emitDecPopUint16(I);
  case PT_Sint32:
    return emitDecPopSint32(I);
  case PT_Uint32:
    return emitDecPopUint32(I);
  case PT_Sint64:
    return emitDecPopSint64(I);
  case PT_Uint64:
    return emitDecPopUint64(I);
  case PT_IntAP:
    return emitDecPopIntAP(I);
  case PT_IntAPS:
    return emitDecPopIntAPS(I);
  default: llvm_unreachable("invalid type: emitDecPop");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitDecPopSint8(const SourceInfo &L) {
  return emitOp<>(OP_DecPopSint8, L);
}
bool ByteCodeEmitter::emitDecPopUint8(const SourceInfo &L) {
  return emitOp<>(OP_DecPopUint8, L);
}
bool ByteCodeEmitter::emitDecPopSint16(const SourceInfo &L) {
  return emitOp<>(OP_DecPopSint16, L);
}
bool ByteCodeEmitter::emitDecPopUint16(const SourceInfo &L) {
  return emitOp<>(OP_DecPopUint16, L);
}
bool ByteCodeEmitter::emitDecPopSint32(const SourceInfo &L) {
  return emitOp<>(OP_DecPopSint32, L);
}
bool ByteCodeEmitter::emitDecPopUint32(const SourceInfo &L) {
  return emitOp<>(OP_DecPopUint32, L);
}
bool ByteCodeEmitter::emitDecPopSint64(const SourceInfo &L) {
  return emitOp<>(OP_DecPopSint64, L);
}
bool ByteCodeEmitter::emitDecPopUint64(const SourceInfo &L) {
  return emitOp<>(OP_DecPopUint64, L);
}
bool ByteCodeEmitter::emitDecPopIntAP(const SourceInfo &L) {
  return emitOp<>(OP_DecPopIntAP, L);
}
bool ByteCodeEmitter::emitDecPopIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_DecPopIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitDecPopSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecPop<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitDecPopUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecPop<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitDecPopSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecPop<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitDecPopUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecPop<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitDecPopSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecPop<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitDecPopUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecPop<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitDecPopSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecPop<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitDecPopUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecPop<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitDecPopIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecPop<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitDecPopIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecPop<PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_DecPtr,
#endif
#ifdef GET_INTERP
case OP_DecPtr: {
  if (!DecPtr(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_DecPtr:
  PrintName("DecPtr");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDecPtr(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitDecPtr(const SourceInfo &L) {
  return emitOp<>(OP_DecPtr, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitDecPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecPtr(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Decf,
#endif
#ifdef GET_INTERP
case OP_Decf: {
  auto V0 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!Decf(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Decf:
  PrintName("Decf");
  OS << "\t" << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDecf(llvm::RoundingMode, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitDecf(llvm::RoundingMode A0, const SourceInfo &L) {
  return emitOp<llvm::RoundingMode>(OP_Decf, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitDecf(llvm::RoundingMode A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Decf(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_DecfPop,
#endif
#ifdef GET_INTERP
case OP_DecfPop: {
  auto V0 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!DecfPop(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_DecfPop:
  PrintName("DecfPop");
  OS << "\t" << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDecfPop(llvm::RoundingMode, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitDecfPop(llvm::RoundingMode A0, const SourceInfo &L) {
  return emitOp<llvm::RoundingMode>(OP_DecfPop, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitDecfPop(llvm::RoundingMode A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return DecfPop(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Destroy,
#endif
#ifdef GET_INTERP
case OP_Destroy: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!Destroy(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Destroy:
  PrintName("Destroy");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDestroy(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitDestroy(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_Destroy, A0, L);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_DivSint8,
OP_DivUint8,
OP_DivSint16,
OP_DivUint16,
OP_DivSint32,
OP_DivUint32,
OP_DivSint64,
OP_DivUint64,
OP_DivIntAP,
OP_DivIntAPS,
#endif
#ifdef GET_INTERP
case OP_DivSint8: {
  if (!Div<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_DivUint8: {
  if (!Div<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_DivSint16: {
  if (!Div<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_DivUint16: {
  if (!Div<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_DivSint32: {
  if (!Div<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_DivUint32: {
  if (!Div<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_DivSint64: {
  if (!Div<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_DivUint64: {
  if (!Div<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_DivIntAP: {
  if (!Div<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_DivIntAPS: {
  if (!Div<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_DivSint8:
  PrintName("DivSint8");
  OS << "\t" << "\n";
  continue;
case OP_DivUint8:
  PrintName("DivUint8");
  OS << "\t" << "\n";
  continue;
case OP_DivSint16:
  PrintName("DivSint16");
  OS << "\t" << "\n";
  continue;
case OP_DivUint16:
  PrintName("DivUint16");
  OS << "\t" << "\n";
  continue;
case OP_DivSint32:
  PrintName("DivSint32");
  OS << "\t" << "\n";
  continue;
case OP_DivUint32:
  PrintName("DivUint32");
  OS << "\t" << "\n";
  continue;
case OP_DivSint64:
  PrintName("DivSint64");
  OS << "\t" << "\n";
  continue;
case OP_DivUint64:
  PrintName("DivUint64");
  OS << "\t" << "\n";
  continue;
case OP_DivIntAP:
  PrintName("DivIntAP");
  OS << "\t" << "\n";
  continue;
case OP_DivIntAPS:
  PrintName("DivIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDivSint8(const SourceInfo &);
bool emitDivUint8(const SourceInfo &);
bool emitDivSint16(const SourceInfo &);
bool emitDivUint16(const SourceInfo &);
bool emitDivSint32(const SourceInfo &);
bool emitDivUint32(const SourceInfo &);
bool emitDivSint64(const SourceInfo &);
bool emitDivUint64(const SourceInfo &);
bool emitDivIntAP(const SourceInfo &);
bool emitDivIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDiv(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitDiv(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitDivSint8(I);
  case PT_Uint8:
    return emitDivUint8(I);
  case PT_Sint16:
    return emitDivSint16(I);
  case PT_Uint16:
    return emitDivUint16(I);
  case PT_Sint32:
    return emitDivSint32(I);
  case PT_Uint32:
    return emitDivUint32(I);
  case PT_Sint64:
    return emitDivSint64(I);
  case PT_Uint64:
    return emitDivUint64(I);
  case PT_IntAP:
    return emitDivIntAP(I);
  case PT_IntAPS:
    return emitDivIntAPS(I);
  default: llvm_unreachable("invalid type: emitDiv");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitDivSint8(const SourceInfo &L) {
  return emitOp<>(OP_DivSint8, L);
}
bool ByteCodeEmitter::emitDivUint8(const SourceInfo &L) {
  return emitOp<>(OP_DivUint8, L);
}
bool ByteCodeEmitter::emitDivSint16(const SourceInfo &L) {
  return emitOp<>(OP_DivSint16, L);
}
bool ByteCodeEmitter::emitDivUint16(const SourceInfo &L) {
  return emitOp<>(OP_DivUint16, L);
}
bool ByteCodeEmitter::emitDivSint32(const SourceInfo &L) {
  return emitOp<>(OP_DivSint32, L);
}
bool ByteCodeEmitter::emitDivUint32(const SourceInfo &L) {
  return emitOp<>(OP_DivUint32, L);
}
bool ByteCodeEmitter::emitDivSint64(const SourceInfo &L) {
  return emitOp<>(OP_DivSint64, L);
}
bool ByteCodeEmitter::emitDivUint64(const SourceInfo &L) {
  return emitOp<>(OP_DivUint64, L);
}
bool ByteCodeEmitter::emitDivIntAP(const SourceInfo &L) {
  return emitOp<>(OP_DivIntAP, L);
}
bool ByteCodeEmitter::emitDivIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_DivIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitDivSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Div<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitDivUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Div<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitDivSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Div<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitDivUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Div<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitDivSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Div<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitDivUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Div<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitDivSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Div<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitDivUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Div<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitDivIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Div<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitDivIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Div<PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Divf,
#endif
#ifdef GET_INTERP
case OP_Divf: {
  auto V0 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!Divf(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Divf:
  PrintName("Divf");
  OS << "\t" << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDivf(llvm::RoundingMode, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitDivf(llvm::RoundingMode A0, const SourceInfo &L) {
  return emitOp<llvm::RoundingMode>(OP_Divf, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitDivf(llvm::RoundingMode A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Divf(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_DupSint8,
OP_DupUint8,
OP_DupSint16,
OP_DupUint16,
OP_DupSint32,
OP_DupUint32,
OP_DupSint64,
OP_DupUint64,
OP_DupIntAP,
OP_DupIntAPS,
OP_DupBool,
OP_DupPtr,
OP_DupFnPtr,
OP_DupFloat,
#endif
#ifdef GET_INTERP
case OP_DupSint8: {
  if (!Dup<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_DupUint8: {
  if (!Dup<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_DupSint16: {
  if (!Dup<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_DupUint16: {
  if (!Dup<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_DupSint32: {
  if (!Dup<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_DupUint32: {
  if (!Dup<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_DupSint64: {
  if (!Dup<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_DupUint64: {
  if (!Dup<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_DupIntAP: {
  if (!Dup<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_DupIntAPS: {
  if (!Dup<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_DupBool: {
  if (!Dup<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_DupPtr: {
  if (!Dup<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_DupFnPtr: {
  if (!Dup<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
case OP_DupFloat: {
  if (!Dup<PT_Float>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_DupSint8:
  PrintName("DupSint8");
  OS << "\t" << "\n";
  continue;
case OP_DupUint8:
  PrintName("DupUint8");
  OS << "\t" << "\n";
  continue;
case OP_DupSint16:
  PrintName("DupSint16");
  OS << "\t" << "\n";
  continue;
case OP_DupUint16:
  PrintName("DupUint16");
  OS << "\t" << "\n";
  continue;
case OP_DupSint32:
  PrintName("DupSint32");
  OS << "\t" << "\n";
  continue;
case OP_DupUint32:
  PrintName("DupUint32");
  OS << "\t" << "\n";
  continue;
case OP_DupSint64:
  PrintName("DupSint64");
  OS << "\t" << "\n";
  continue;
case OP_DupUint64:
  PrintName("DupUint64");
  OS << "\t" << "\n";
  continue;
case OP_DupIntAP:
  PrintName("DupIntAP");
  OS << "\t" << "\n";
  continue;
case OP_DupIntAPS:
  PrintName("DupIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_DupBool:
  PrintName("DupBool");
  OS << "\t" << "\n";
  continue;
case OP_DupPtr:
  PrintName("DupPtr");
  OS << "\t" << "\n";
  continue;
case OP_DupFnPtr:
  PrintName("DupFnPtr");
  OS << "\t" << "\n";
  continue;
case OP_DupFloat:
  PrintName("DupFloat");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDupSint8(const SourceInfo &);
bool emitDupUint8(const SourceInfo &);
bool emitDupSint16(const SourceInfo &);
bool emitDupUint16(const SourceInfo &);
bool emitDupSint32(const SourceInfo &);
bool emitDupUint32(const SourceInfo &);
bool emitDupSint64(const SourceInfo &);
bool emitDupUint64(const SourceInfo &);
bool emitDupIntAP(const SourceInfo &);
bool emitDupIntAPS(const SourceInfo &);
bool emitDupBool(const SourceInfo &);
bool emitDupPtr(const SourceInfo &);
bool emitDupFnPtr(const SourceInfo &);
bool emitDupFloat(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitDup(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitDup(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitDupSint8(I);
  case PT_Uint8:
    return emitDupUint8(I);
  case PT_Sint16:
    return emitDupSint16(I);
  case PT_Uint16:
    return emitDupUint16(I);
  case PT_Sint32:
    return emitDupSint32(I);
  case PT_Uint32:
    return emitDupUint32(I);
  case PT_Sint64:
    return emitDupSint64(I);
  case PT_Uint64:
    return emitDupUint64(I);
  case PT_IntAP:
    return emitDupIntAP(I);
  case PT_IntAPS:
    return emitDupIntAPS(I);
  case PT_Bool:
    return emitDupBool(I);
  case PT_Ptr:
    return emitDupPtr(I);
  case PT_FnPtr:
    return emitDupFnPtr(I);
  case PT_Float:
    return emitDupFloat(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitDupSint8(const SourceInfo &L) {
  return emitOp<>(OP_DupSint8, L);
}
bool ByteCodeEmitter::emitDupUint8(const SourceInfo &L) {
  return emitOp<>(OP_DupUint8, L);
}
bool ByteCodeEmitter::emitDupSint16(const SourceInfo &L) {
  return emitOp<>(OP_DupSint16, L);
}
bool ByteCodeEmitter::emitDupUint16(const SourceInfo &L) {
  return emitOp<>(OP_DupUint16, L);
}
bool ByteCodeEmitter::emitDupSint32(const SourceInfo &L) {
  return emitOp<>(OP_DupSint32, L);
}
bool ByteCodeEmitter::emitDupUint32(const SourceInfo &L) {
  return emitOp<>(OP_DupUint32, L);
}
bool ByteCodeEmitter::emitDupSint64(const SourceInfo &L) {
  return emitOp<>(OP_DupSint64, L);
}
bool ByteCodeEmitter::emitDupUint64(const SourceInfo &L) {
  return emitOp<>(OP_DupUint64, L);
}
bool ByteCodeEmitter::emitDupIntAP(const SourceInfo &L) {
  return emitOp<>(OP_DupIntAP, L);
}
bool ByteCodeEmitter::emitDupIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_DupIntAPS, L);
}
bool ByteCodeEmitter::emitDupBool(const SourceInfo &L) {
  return emitOp<>(OP_DupBool, L);
}
bool ByteCodeEmitter::emitDupPtr(const SourceInfo &L) {
  return emitOp<>(OP_DupPtr, L);
}
bool ByteCodeEmitter::emitDupFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_DupFnPtr, L);
}
bool ByteCodeEmitter::emitDupFloat(const SourceInfo &L) {
  return emitOp<>(OP_DupFloat, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitDupSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitDupUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitDupSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitDupUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitDupSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitDupUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitDupSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitDupUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitDupIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitDupIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitDupBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitDupPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitDupFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_FnPtr>(S, OpPC);
}
bool EvalEmitter::emitDupFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Dup<PT_Float>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_EQSint8,
OP_EQUint8,
OP_EQSint16,
OP_EQUint16,
OP_EQSint32,
OP_EQUint32,
OP_EQSint64,
OP_EQUint64,
OP_EQIntAP,
OP_EQIntAPS,
OP_EQBool,
OP_EQPtr,
OP_EQFnPtr,
OP_EQFloat,
#endif
#ifdef GET_INTERP
case OP_EQSint8: {
  if (!EQ<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_EQUint8: {
  if (!EQ<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_EQSint16: {
  if (!EQ<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_EQUint16: {
  if (!EQ<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_EQSint32: {
  if (!EQ<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_EQUint32: {
  if (!EQ<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_EQSint64: {
  if (!EQ<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_EQUint64: {
  if (!EQ<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_EQIntAP: {
  if (!EQ<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_EQIntAPS: {
  if (!EQ<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_EQBool: {
  if (!EQ<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_EQPtr: {
  if (!EQ<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_EQFnPtr: {
  if (!EQ<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
case OP_EQFloat: {
  if (!EQ<PT_Float>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_EQSint8:
  PrintName("EQSint8");
  OS << "\t" << "\n";
  continue;
case OP_EQUint8:
  PrintName("EQUint8");
  OS << "\t" << "\n";
  continue;
case OP_EQSint16:
  PrintName("EQSint16");
  OS << "\t" << "\n";
  continue;
case OP_EQUint16:
  PrintName("EQUint16");
  OS << "\t" << "\n";
  continue;
case OP_EQSint32:
  PrintName("EQSint32");
  OS << "\t" << "\n";
  continue;
case OP_EQUint32:
  PrintName("EQUint32");
  OS << "\t" << "\n";
  continue;
case OP_EQSint64:
  PrintName("EQSint64");
  OS << "\t" << "\n";
  continue;
case OP_EQUint64:
  PrintName("EQUint64");
  OS << "\t" << "\n";
  continue;
case OP_EQIntAP:
  PrintName("EQIntAP");
  OS << "\t" << "\n";
  continue;
case OP_EQIntAPS:
  PrintName("EQIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_EQBool:
  PrintName("EQBool");
  OS << "\t" << "\n";
  continue;
case OP_EQPtr:
  PrintName("EQPtr");
  OS << "\t" << "\n";
  continue;
case OP_EQFnPtr:
  PrintName("EQFnPtr");
  OS << "\t" << "\n";
  continue;
case OP_EQFloat:
  PrintName("EQFloat");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitEQSint8(const SourceInfo &);
bool emitEQUint8(const SourceInfo &);
bool emitEQSint16(const SourceInfo &);
bool emitEQUint16(const SourceInfo &);
bool emitEQSint32(const SourceInfo &);
bool emitEQUint32(const SourceInfo &);
bool emitEQSint64(const SourceInfo &);
bool emitEQUint64(const SourceInfo &);
bool emitEQIntAP(const SourceInfo &);
bool emitEQIntAPS(const SourceInfo &);
bool emitEQBool(const SourceInfo &);
bool emitEQPtr(const SourceInfo &);
bool emitEQFnPtr(const SourceInfo &);
bool emitEQFloat(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitEQ(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitEQ(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitEQSint8(I);
  case PT_Uint8:
    return emitEQUint8(I);
  case PT_Sint16:
    return emitEQSint16(I);
  case PT_Uint16:
    return emitEQUint16(I);
  case PT_Sint32:
    return emitEQSint32(I);
  case PT_Uint32:
    return emitEQUint32(I);
  case PT_Sint64:
    return emitEQSint64(I);
  case PT_Uint64:
    return emitEQUint64(I);
  case PT_IntAP:
    return emitEQIntAP(I);
  case PT_IntAPS:
    return emitEQIntAPS(I);
  case PT_Bool:
    return emitEQBool(I);
  case PT_Ptr:
    return emitEQPtr(I);
  case PT_FnPtr:
    return emitEQFnPtr(I);
  case PT_Float:
    return emitEQFloat(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitEQSint8(const SourceInfo &L) {
  return emitOp<>(OP_EQSint8, L);
}
bool ByteCodeEmitter::emitEQUint8(const SourceInfo &L) {
  return emitOp<>(OP_EQUint8, L);
}
bool ByteCodeEmitter::emitEQSint16(const SourceInfo &L) {
  return emitOp<>(OP_EQSint16, L);
}
bool ByteCodeEmitter::emitEQUint16(const SourceInfo &L) {
  return emitOp<>(OP_EQUint16, L);
}
bool ByteCodeEmitter::emitEQSint32(const SourceInfo &L) {
  return emitOp<>(OP_EQSint32, L);
}
bool ByteCodeEmitter::emitEQUint32(const SourceInfo &L) {
  return emitOp<>(OP_EQUint32, L);
}
bool ByteCodeEmitter::emitEQSint64(const SourceInfo &L) {
  return emitOp<>(OP_EQSint64, L);
}
bool ByteCodeEmitter::emitEQUint64(const SourceInfo &L) {
  return emitOp<>(OP_EQUint64, L);
}
bool ByteCodeEmitter::emitEQIntAP(const SourceInfo &L) {
  return emitOp<>(OP_EQIntAP, L);
}
bool ByteCodeEmitter::emitEQIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_EQIntAPS, L);
}
bool ByteCodeEmitter::emitEQBool(const SourceInfo &L) {
  return emitOp<>(OP_EQBool, L);
}
bool ByteCodeEmitter::emitEQPtr(const SourceInfo &L) {
  return emitOp<>(OP_EQPtr, L);
}
bool ByteCodeEmitter::emitEQFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_EQFnPtr, L);
}
bool ByteCodeEmitter::emitEQFloat(const SourceInfo &L) {
  return emitOp<>(OP_EQFloat, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitEQSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitEQUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitEQSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitEQUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitEQSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitEQUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitEQSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitEQUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitEQIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitEQIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitEQBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitEQPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitEQFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_FnPtr>(S, OpPC);
}
bool EvalEmitter::emitEQFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return EQ<PT_Float>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ExpandPtr,
#endif
#ifdef GET_INTERP
case OP_ExpandPtr: {
  if (!ExpandPtr(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ExpandPtr:
  PrintName("ExpandPtr");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitExpandPtr(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitExpandPtr(const SourceInfo &L) {
  return emitOp<>(OP_ExpandPtr, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitExpandPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ExpandPtr(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GESint8,
OP_GEUint8,
OP_GESint16,
OP_GEUint16,
OP_GESint32,
OP_GEUint32,
OP_GESint64,
OP_GEUint64,
OP_GEIntAP,
OP_GEIntAPS,
OP_GEBool,
OP_GEPtr,
OP_GEFloat,
OP_GEFnPtr,
#endif
#ifdef GET_INTERP
case OP_GESint8: {
  if (!GE<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_GEUint8: {
  if (!GE<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_GESint16: {
  if (!GE<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_GEUint16: {
  if (!GE<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_GESint32: {
  if (!GE<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_GEUint32: {
  if (!GE<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_GESint64: {
  if (!GE<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_GEUint64: {
  if (!GE<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_GEIntAP: {
  if (!GE<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_GEIntAPS: {
  if (!GE<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_GEBool: {
  if (!GE<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_GEPtr: {
  if (!GE<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_GEFloat: {
  if (!GE<PT_Float>(S, OpPC))
    return false;
  continue;
}
case OP_GEFnPtr: {
  if (!GE<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GESint8:
  PrintName("GESint8");
  OS << "\t" << "\n";
  continue;
case OP_GEUint8:
  PrintName("GEUint8");
  OS << "\t" << "\n";
  continue;
case OP_GESint16:
  PrintName("GESint16");
  OS << "\t" << "\n";
  continue;
case OP_GEUint16:
  PrintName("GEUint16");
  OS << "\t" << "\n";
  continue;
case OP_GESint32:
  PrintName("GESint32");
  OS << "\t" << "\n";
  continue;
case OP_GEUint32:
  PrintName("GEUint32");
  OS << "\t" << "\n";
  continue;
case OP_GESint64:
  PrintName("GESint64");
  OS << "\t" << "\n";
  continue;
case OP_GEUint64:
  PrintName("GEUint64");
  OS << "\t" << "\n";
  continue;
case OP_GEIntAP:
  PrintName("GEIntAP");
  OS << "\t" << "\n";
  continue;
case OP_GEIntAPS:
  PrintName("GEIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_GEBool:
  PrintName("GEBool");
  OS << "\t" << "\n";
  continue;
case OP_GEPtr:
  PrintName("GEPtr");
  OS << "\t" << "\n";
  continue;
case OP_GEFloat:
  PrintName("GEFloat");
  OS << "\t" << "\n";
  continue;
case OP_GEFnPtr:
  PrintName("GEFnPtr");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGESint8(const SourceInfo &);
bool emitGEUint8(const SourceInfo &);
bool emitGESint16(const SourceInfo &);
bool emitGEUint16(const SourceInfo &);
bool emitGESint32(const SourceInfo &);
bool emitGEUint32(const SourceInfo &);
bool emitGESint64(const SourceInfo &);
bool emitGEUint64(const SourceInfo &);
bool emitGEIntAP(const SourceInfo &);
bool emitGEIntAPS(const SourceInfo &);
bool emitGEBool(const SourceInfo &);
bool emitGEPtr(const SourceInfo &);
bool emitGEFloat(const SourceInfo &);
bool emitGEFnPtr(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGE(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitGE(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitGESint8(I);
  case PT_Uint8:
    return emitGEUint8(I);
  case PT_Sint16:
    return emitGESint16(I);
  case PT_Uint16:
    return emitGEUint16(I);
  case PT_Sint32:
    return emitGESint32(I);
  case PT_Uint32:
    return emitGEUint32(I);
  case PT_Sint64:
    return emitGESint64(I);
  case PT_Uint64:
    return emitGEUint64(I);
  case PT_IntAP:
    return emitGEIntAP(I);
  case PT_IntAPS:
    return emitGEIntAPS(I);
  case PT_Bool:
    return emitGEBool(I);
  case PT_Ptr:
    return emitGEPtr(I);
  case PT_Float:
    return emitGEFloat(I);
  case PT_FnPtr:
    return emitGEFnPtr(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGESint8(const SourceInfo &L) {
  return emitOp<>(OP_GESint8, L);
}
bool ByteCodeEmitter::emitGEUint8(const SourceInfo &L) {
  return emitOp<>(OP_GEUint8, L);
}
bool ByteCodeEmitter::emitGESint16(const SourceInfo &L) {
  return emitOp<>(OP_GESint16, L);
}
bool ByteCodeEmitter::emitGEUint16(const SourceInfo &L) {
  return emitOp<>(OP_GEUint16, L);
}
bool ByteCodeEmitter::emitGESint32(const SourceInfo &L) {
  return emitOp<>(OP_GESint32, L);
}
bool ByteCodeEmitter::emitGEUint32(const SourceInfo &L) {
  return emitOp<>(OP_GEUint32, L);
}
bool ByteCodeEmitter::emitGESint64(const SourceInfo &L) {
  return emitOp<>(OP_GESint64, L);
}
bool ByteCodeEmitter::emitGEUint64(const SourceInfo &L) {
  return emitOp<>(OP_GEUint64, L);
}
bool ByteCodeEmitter::emitGEIntAP(const SourceInfo &L) {
  return emitOp<>(OP_GEIntAP, L);
}
bool ByteCodeEmitter::emitGEIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_GEIntAPS, L);
}
bool ByteCodeEmitter::emitGEBool(const SourceInfo &L) {
  return emitOp<>(OP_GEBool, L);
}
bool ByteCodeEmitter::emitGEPtr(const SourceInfo &L) {
  return emitOp<>(OP_GEPtr, L);
}
bool ByteCodeEmitter::emitGEFloat(const SourceInfo &L) {
  return emitOp<>(OP_GEFloat, L);
}
bool ByteCodeEmitter::emitGEFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_GEFnPtr, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGESint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitGEUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitGESint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitGEUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitGESint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitGEUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitGESint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitGEUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitGEIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitGEIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitGEBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitGEPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitGEFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_Float>(S, OpPC);
}
bool EvalEmitter::emitGEFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GE<PT_FnPtr>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GTSint8,
OP_GTUint8,
OP_GTSint16,
OP_GTUint16,
OP_GTSint32,
OP_GTUint32,
OP_GTSint64,
OP_GTUint64,
OP_GTIntAP,
OP_GTIntAPS,
OP_GTBool,
OP_GTPtr,
OP_GTFloat,
OP_GTFnPtr,
#endif
#ifdef GET_INTERP
case OP_GTSint8: {
  if (!GT<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_GTUint8: {
  if (!GT<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_GTSint16: {
  if (!GT<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_GTUint16: {
  if (!GT<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_GTSint32: {
  if (!GT<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_GTUint32: {
  if (!GT<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_GTSint64: {
  if (!GT<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_GTUint64: {
  if (!GT<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_GTIntAP: {
  if (!GT<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_GTIntAPS: {
  if (!GT<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_GTBool: {
  if (!GT<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_GTPtr: {
  if (!GT<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_GTFloat: {
  if (!GT<PT_Float>(S, OpPC))
    return false;
  continue;
}
case OP_GTFnPtr: {
  if (!GT<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GTSint8:
  PrintName("GTSint8");
  OS << "\t" << "\n";
  continue;
case OP_GTUint8:
  PrintName("GTUint8");
  OS << "\t" << "\n";
  continue;
case OP_GTSint16:
  PrintName("GTSint16");
  OS << "\t" << "\n";
  continue;
case OP_GTUint16:
  PrintName("GTUint16");
  OS << "\t" << "\n";
  continue;
case OP_GTSint32:
  PrintName("GTSint32");
  OS << "\t" << "\n";
  continue;
case OP_GTUint32:
  PrintName("GTUint32");
  OS << "\t" << "\n";
  continue;
case OP_GTSint64:
  PrintName("GTSint64");
  OS << "\t" << "\n";
  continue;
case OP_GTUint64:
  PrintName("GTUint64");
  OS << "\t" << "\n";
  continue;
case OP_GTIntAP:
  PrintName("GTIntAP");
  OS << "\t" << "\n";
  continue;
case OP_GTIntAPS:
  PrintName("GTIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_GTBool:
  PrintName("GTBool");
  OS << "\t" << "\n";
  continue;
case OP_GTPtr:
  PrintName("GTPtr");
  OS << "\t" << "\n";
  continue;
case OP_GTFloat:
  PrintName("GTFloat");
  OS << "\t" << "\n";
  continue;
case OP_GTFnPtr:
  PrintName("GTFnPtr");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGTSint8(const SourceInfo &);
bool emitGTUint8(const SourceInfo &);
bool emitGTSint16(const SourceInfo &);
bool emitGTUint16(const SourceInfo &);
bool emitGTSint32(const SourceInfo &);
bool emitGTUint32(const SourceInfo &);
bool emitGTSint64(const SourceInfo &);
bool emitGTUint64(const SourceInfo &);
bool emitGTIntAP(const SourceInfo &);
bool emitGTIntAPS(const SourceInfo &);
bool emitGTBool(const SourceInfo &);
bool emitGTPtr(const SourceInfo &);
bool emitGTFloat(const SourceInfo &);
bool emitGTFnPtr(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGT(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitGT(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitGTSint8(I);
  case PT_Uint8:
    return emitGTUint8(I);
  case PT_Sint16:
    return emitGTSint16(I);
  case PT_Uint16:
    return emitGTUint16(I);
  case PT_Sint32:
    return emitGTSint32(I);
  case PT_Uint32:
    return emitGTUint32(I);
  case PT_Sint64:
    return emitGTSint64(I);
  case PT_Uint64:
    return emitGTUint64(I);
  case PT_IntAP:
    return emitGTIntAP(I);
  case PT_IntAPS:
    return emitGTIntAPS(I);
  case PT_Bool:
    return emitGTBool(I);
  case PT_Ptr:
    return emitGTPtr(I);
  case PT_Float:
    return emitGTFloat(I);
  case PT_FnPtr:
    return emitGTFnPtr(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGTSint8(const SourceInfo &L) {
  return emitOp<>(OP_GTSint8, L);
}
bool ByteCodeEmitter::emitGTUint8(const SourceInfo &L) {
  return emitOp<>(OP_GTUint8, L);
}
bool ByteCodeEmitter::emitGTSint16(const SourceInfo &L) {
  return emitOp<>(OP_GTSint16, L);
}
bool ByteCodeEmitter::emitGTUint16(const SourceInfo &L) {
  return emitOp<>(OP_GTUint16, L);
}
bool ByteCodeEmitter::emitGTSint32(const SourceInfo &L) {
  return emitOp<>(OP_GTSint32, L);
}
bool ByteCodeEmitter::emitGTUint32(const SourceInfo &L) {
  return emitOp<>(OP_GTUint32, L);
}
bool ByteCodeEmitter::emitGTSint64(const SourceInfo &L) {
  return emitOp<>(OP_GTSint64, L);
}
bool ByteCodeEmitter::emitGTUint64(const SourceInfo &L) {
  return emitOp<>(OP_GTUint64, L);
}
bool ByteCodeEmitter::emitGTIntAP(const SourceInfo &L) {
  return emitOp<>(OP_GTIntAP, L);
}
bool ByteCodeEmitter::emitGTIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_GTIntAPS, L);
}
bool ByteCodeEmitter::emitGTBool(const SourceInfo &L) {
  return emitOp<>(OP_GTBool, L);
}
bool ByteCodeEmitter::emitGTPtr(const SourceInfo &L) {
  return emitOp<>(OP_GTPtr, L);
}
bool ByteCodeEmitter::emitGTFloat(const SourceInfo &L) {
  return emitOp<>(OP_GTFloat, L);
}
bool ByteCodeEmitter::emitGTFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_GTFnPtr, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGTSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitGTUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitGTSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitGTUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitGTSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitGTUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitGTSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitGTUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitGTIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitGTIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitGTBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitGTPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitGTFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_Float>(S, OpPC);
}
bool EvalEmitter::emitGTFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GT<PT_FnPtr>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetFieldSint8,
OP_GetFieldUint8,
OP_GetFieldSint16,
OP_GetFieldUint16,
OP_GetFieldSint32,
OP_GetFieldUint32,
OP_GetFieldSint64,
OP_GetFieldUint64,
OP_GetFieldIntAP,
OP_GetFieldIntAPS,
OP_GetFieldBool,
OP_GetFieldPtr,
OP_GetFieldFnPtr,
OP_GetFieldFloat,
#endif
#ifdef GET_INTERP
case OP_GetFieldSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetField<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetFieldSint8:
  PrintName("GetFieldSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldUint8:
  PrintName("GetFieldUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldSint16:
  PrintName("GetFieldSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldUint16:
  PrintName("GetFieldUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldSint32:
  PrintName("GetFieldSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldUint32:
  PrintName("GetFieldUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldSint64:
  PrintName("GetFieldSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldUint64:
  PrintName("GetFieldUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldIntAP:
  PrintName("GetFieldIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldIntAPS:
  PrintName("GetFieldIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldBool:
  PrintName("GetFieldBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPtr:
  PrintName("GetFieldPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldFnPtr:
  PrintName("GetFieldFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldFloat:
  PrintName("GetFieldFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetFieldSint8(uint32_t, const SourceInfo &);
bool emitGetFieldUint8(uint32_t, const SourceInfo &);
bool emitGetFieldSint16(uint32_t, const SourceInfo &);
bool emitGetFieldUint16(uint32_t, const SourceInfo &);
bool emitGetFieldSint32(uint32_t, const SourceInfo &);
bool emitGetFieldUint32(uint32_t, const SourceInfo &);
bool emitGetFieldSint64(uint32_t, const SourceInfo &);
bool emitGetFieldUint64(uint32_t, const SourceInfo &);
bool emitGetFieldIntAP(uint32_t, const SourceInfo &);
bool emitGetFieldIntAPS(uint32_t, const SourceInfo &);
bool emitGetFieldBool(uint32_t, const SourceInfo &);
bool emitGetFieldPtr(uint32_t, const SourceInfo &);
bool emitGetFieldFnPtr(uint32_t, const SourceInfo &);
bool emitGetFieldFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetField(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitGetField(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitGetFieldSint8(A0, I);
  case PT_Uint8:
    return emitGetFieldUint8(A0, I);
  case PT_Sint16:
    return emitGetFieldSint16(A0, I);
  case PT_Uint16:
    return emitGetFieldUint16(A0, I);
  case PT_Sint32:
    return emitGetFieldSint32(A0, I);
  case PT_Uint32:
    return emitGetFieldUint32(A0, I);
  case PT_Sint64:
    return emitGetFieldSint64(A0, I);
  case PT_Uint64:
    return emitGetFieldUint64(A0, I);
  case PT_IntAP:
    return emitGetFieldIntAP(A0, I);
  case PT_IntAPS:
    return emitGetFieldIntAPS(A0, I);
  case PT_Bool:
    return emitGetFieldBool(A0, I);
  case PT_Ptr:
    return emitGetFieldPtr(A0, I);
  case PT_FnPtr:
    return emitGetFieldFnPtr(A0, I);
  case PT_Float:
    return emitGetFieldFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetFieldSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldSint8, A0, L);
}
bool ByteCodeEmitter::emitGetFieldUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldUint8, A0, L);
}
bool ByteCodeEmitter::emitGetFieldSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldSint16, A0, L);
}
bool ByteCodeEmitter::emitGetFieldUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldUint16, A0, L);
}
bool ByteCodeEmitter::emitGetFieldSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldSint32, A0, L);
}
bool ByteCodeEmitter::emitGetFieldUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldUint32, A0, L);
}
bool ByteCodeEmitter::emitGetFieldSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldSint64, A0, L);
}
bool ByteCodeEmitter::emitGetFieldUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldUint64, A0, L);
}
bool ByteCodeEmitter::emitGetFieldIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldIntAP, A0, L);
}
bool ByteCodeEmitter::emitGetFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldIntAPS, A0, L);
}
bool ByteCodeEmitter::emitGetFieldBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldBool, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPtr, A0, L);
}
bool ByteCodeEmitter::emitGetFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldFnPtr, A0, L);
}
bool ByteCodeEmitter::emitGetFieldFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetFieldSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetField<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetFieldPopSint8,
OP_GetFieldPopUint8,
OP_GetFieldPopSint16,
OP_GetFieldPopUint16,
OP_GetFieldPopSint32,
OP_GetFieldPopUint32,
OP_GetFieldPopSint64,
OP_GetFieldPopUint64,
OP_GetFieldPopIntAP,
OP_GetFieldPopIntAPS,
OP_GetFieldPopBool,
OP_GetFieldPopPtr,
OP_GetFieldPopFnPtr,
OP_GetFieldPopFloat,
#endif
#ifdef GET_INTERP
case OP_GetFieldPopSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetFieldPopFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetFieldPop<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetFieldPopSint8:
  PrintName("GetFieldPopSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopUint8:
  PrintName("GetFieldPopUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopSint16:
  PrintName("GetFieldPopSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopUint16:
  PrintName("GetFieldPopUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopSint32:
  PrintName("GetFieldPopSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopUint32:
  PrintName("GetFieldPopUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopSint64:
  PrintName("GetFieldPopSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopUint64:
  PrintName("GetFieldPopUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopIntAP:
  PrintName("GetFieldPopIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopIntAPS:
  PrintName("GetFieldPopIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopBool:
  PrintName("GetFieldPopBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopPtr:
  PrintName("GetFieldPopPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopFnPtr:
  PrintName("GetFieldPopFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetFieldPopFloat:
  PrintName("GetFieldPopFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetFieldPopSint8(uint32_t, const SourceInfo &);
bool emitGetFieldPopUint8(uint32_t, const SourceInfo &);
bool emitGetFieldPopSint16(uint32_t, const SourceInfo &);
bool emitGetFieldPopUint16(uint32_t, const SourceInfo &);
bool emitGetFieldPopSint32(uint32_t, const SourceInfo &);
bool emitGetFieldPopUint32(uint32_t, const SourceInfo &);
bool emitGetFieldPopSint64(uint32_t, const SourceInfo &);
bool emitGetFieldPopUint64(uint32_t, const SourceInfo &);
bool emitGetFieldPopIntAP(uint32_t, const SourceInfo &);
bool emitGetFieldPopIntAPS(uint32_t, const SourceInfo &);
bool emitGetFieldPopBool(uint32_t, const SourceInfo &);
bool emitGetFieldPopPtr(uint32_t, const SourceInfo &);
bool emitGetFieldPopFnPtr(uint32_t, const SourceInfo &);
bool emitGetFieldPopFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetFieldPop(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitGetFieldPop(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitGetFieldPopSint8(A0, I);
  case PT_Uint8:
    return emitGetFieldPopUint8(A0, I);
  case PT_Sint16:
    return emitGetFieldPopSint16(A0, I);
  case PT_Uint16:
    return emitGetFieldPopUint16(A0, I);
  case PT_Sint32:
    return emitGetFieldPopSint32(A0, I);
  case PT_Uint32:
    return emitGetFieldPopUint32(A0, I);
  case PT_Sint64:
    return emitGetFieldPopSint64(A0, I);
  case PT_Uint64:
    return emitGetFieldPopUint64(A0, I);
  case PT_IntAP:
    return emitGetFieldPopIntAP(A0, I);
  case PT_IntAPS:
    return emitGetFieldPopIntAPS(A0, I);
  case PT_Bool:
    return emitGetFieldPopBool(A0, I);
  case PT_Ptr:
    return emitGetFieldPopPtr(A0, I);
  case PT_FnPtr:
    return emitGetFieldPopFnPtr(A0, I);
  case PT_Float:
    return emitGetFieldPopFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetFieldPopSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopSint8, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopUint8, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopSint16, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopUint16, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopSint32, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopUint32, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopSint64, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopUint64, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopIntAP, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopIntAPS, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopBool, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopPtr, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopFnPtr, A0, L);
}
bool ByteCodeEmitter::emitGetFieldPopFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetFieldPopFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetFieldPopSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetFieldPopFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFieldPop<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetFnPtr,
#endif
#ifdef GET_INTERP
case OP_GetFnPtr: {
  auto V0 = ReadArg<const Function *>(S, PC);
  if (!GetFnPtr(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetFnPtr:
  PrintName("GetFnPtr");
  OS << "\t" << ReadArg<const Function *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetFnPtr(const Function *, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetFnPtr(const Function * A0, const SourceInfo &L) {
  return emitOp<const Function *>(OP_GetFnPtr, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetFnPtr(const Function * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetFnPtr(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetGlobalSint8,
OP_GetGlobalUint8,
OP_GetGlobalSint16,
OP_GetGlobalUint16,
OP_GetGlobalSint32,
OP_GetGlobalUint32,
OP_GetGlobalSint64,
OP_GetGlobalUint64,
OP_GetGlobalIntAP,
OP_GetGlobalIntAPS,
OP_GetGlobalBool,
OP_GetGlobalPtr,
OP_GetGlobalFnPtr,
OP_GetGlobalFloat,
#endif
#ifdef GET_INTERP
case OP_GetGlobalSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobal<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetGlobalSint8:
  PrintName("GetGlobalSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUint8:
  PrintName("GetGlobalUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalSint16:
  PrintName("GetGlobalSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUint16:
  PrintName("GetGlobalUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalSint32:
  PrintName("GetGlobalSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUint32:
  PrintName("GetGlobalUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalSint64:
  PrintName("GetGlobalSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUint64:
  PrintName("GetGlobalUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalIntAP:
  PrintName("GetGlobalIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalIntAPS:
  PrintName("GetGlobalIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalBool:
  PrintName("GetGlobalBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalPtr:
  PrintName("GetGlobalPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalFnPtr:
  PrintName("GetGlobalFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalFloat:
  PrintName("GetGlobalFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetGlobalSint8(uint32_t, const SourceInfo &);
bool emitGetGlobalUint8(uint32_t, const SourceInfo &);
bool emitGetGlobalSint16(uint32_t, const SourceInfo &);
bool emitGetGlobalUint16(uint32_t, const SourceInfo &);
bool emitGetGlobalSint32(uint32_t, const SourceInfo &);
bool emitGetGlobalUint32(uint32_t, const SourceInfo &);
bool emitGetGlobalSint64(uint32_t, const SourceInfo &);
bool emitGetGlobalUint64(uint32_t, const SourceInfo &);
bool emitGetGlobalIntAP(uint32_t, const SourceInfo &);
bool emitGetGlobalIntAPS(uint32_t, const SourceInfo &);
bool emitGetGlobalBool(uint32_t, const SourceInfo &);
bool emitGetGlobalPtr(uint32_t, const SourceInfo &);
bool emitGetGlobalFnPtr(uint32_t, const SourceInfo &);
bool emitGetGlobalFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetGlobal(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitGetGlobal(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitGetGlobalSint8(A0, I);
  case PT_Uint8:
    return emitGetGlobalUint8(A0, I);
  case PT_Sint16:
    return emitGetGlobalSint16(A0, I);
  case PT_Uint16:
    return emitGetGlobalUint16(A0, I);
  case PT_Sint32:
    return emitGetGlobalSint32(A0, I);
  case PT_Uint32:
    return emitGetGlobalUint32(A0, I);
  case PT_Sint64:
    return emitGetGlobalSint64(A0, I);
  case PT_Uint64:
    return emitGetGlobalUint64(A0, I);
  case PT_IntAP:
    return emitGetGlobalIntAP(A0, I);
  case PT_IntAPS:
    return emitGetGlobalIntAPS(A0, I);
  case PT_Bool:
    return emitGetGlobalBool(A0, I);
  case PT_Ptr:
    return emitGetGlobalPtr(A0, I);
  case PT_FnPtr:
    return emitGetGlobalFnPtr(A0, I);
  case PT_Float:
    return emitGetGlobalFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetGlobalSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalSint8, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUint8, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalSint16, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUint16, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalSint32, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUint32, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalSint64, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUint64, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalIntAP, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalIntAPS, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalBool, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalPtr, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalFnPtr, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetGlobalSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobal<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetGlobalUncheckedSint8,
OP_GetGlobalUncheckedUint8,
OP_GetGlobalUncheckedSint16,
OP_GetGlobalUncheckedUint16,
OP_GetGlobalUncheckedSint32,
OP_GetGlobalUncheckedUint32,
OP_GetGlobalUncheckedSint64,
OP_GetGlobalUncheckedUint64,
OP_GetGlobalUncheckedIntAP,
OP_GetGlobalUncheckedIntAPS,
OP_GetGlobalUncheckedBool,
OP_GetGlobalUncheckedPtr,
OP_GetGlobalUncheckedFnPtr,
OP_GetGlobalUncheckedFloat,
#endif
#ifdef GET_INTERP
case OP_GetGlobalUncheckedSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetGlobalUncheckedFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetGlobalUnchecked<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetGlobalUncheckedSint8:
  PrintName("GetGlobalUncheckedSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedUint8:
  PrintName("GetGlobalUncheckedUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedSint16:
  PrintName("GetGlobalUncheckedSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedUint16:
  PrintName("GetGlobalUncheckedUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedSint32:
  PrintName("GetGlobalUncheckedSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedUint32:
  PrintName("GetGlobalUncheckedUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedSint64:
  PrintName("GetGlobalUncheckedSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedUint64:
  PrintName("GetGlobalUncheckedUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedIntAP:
  PrintName("GetGlobalUncheckedIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedIntAPS:
  PrintName("GetGlobalUncheckedIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedBool:
  PrintName("GetGlobalUncheckedBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedPtr:
  PrintName("GetGlobalUncheckedPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedFnPtr:
  PrintName("GetGlobalUncheckedFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetGlobalUncheckedFloat:
  PrintName("GetGlobalUncheckedFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetGlobalUncheckedSint8(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedUint8(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedSint16(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedUint16(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedSint32(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedUint32(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedSint64(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedUint64(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedIntAP(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedIntAPS(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedBool(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedPtr(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedFnPtr(uint32_t, const SourceInfo &);
bool emitGetGlobalUncheckedFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetGlobalUnchecked(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitGetGlobalUnchecked(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitGetGlobalUncheckedSint8(A0, I);
  case PT_Uint8:
    return emitGetGlobalUncheckedUint8(A0, I);
  case PT_Sint16:
    return emitGetGlobalUncheckedSint16(A0, I);
  case PT_Uint16:
    return emitGetGlobalUncheckedUint16(A0, I);
  case PT_Sint32:
    return emitGetGlobalUncheckedSint32(A0, I);
  case PT_Uint32:
    return emitGetGlobalUncheckedUint32(A0, I);
  case PT_Sint64:
    return emitGetGlobalUncheckedSint64(A0, I);
  case PT_Uint64:
    return emitGetGlobalUncheckedUint64(A0, I);
  case PT_IntAP:
    return emitGetGlobalUncheckedIntAP(A0, I);
  case PT_IntAPS:
    return emitGetGlobalUncheckedIntAPS(A0, I);
  case PT_Bool:
    return emitGetGlobalUncheckedBool(A0, I);
  case PT_Ptr:
    return emitGetGlobalUncheckedPtr(A0, I);
  case PT_FnPtr:
    return emitGetGlobalUncheckedFnPtr(A0, I);
  case PT_Float:
    return emitGetGlobalUncheckedFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetGlobalUncheckedSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedSint8, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedUint8, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedSint16, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedUint16, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedSint32, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedUint32, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedSint64, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedUint64, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedIntAP, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedIntAPS, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedBool, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedPtr, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedFnPtr, A0, L);
}
bool ByteCodeEmitter::emitGetGlobalUncheckedFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetGlobalUncheckedFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetGlobalUncheckedSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetGlobalUncheckedFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetGlobalUnchecked<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetLocalSint8,
OP_GetLocalUint8,
OP_GetLocalSint16,
OP_GetLocalUint16,
OP_GetLocalSint32,
OP_GetLocalUint32,
OP_GetLocalSint64,
OP_GetLocalUint64,
OP_GetLocalIntAP,
OP_GetLocalIntAPS,
OP_GetLocalBool,
OP_GetLocalPtr,
OP_GetLocalFnPtr,
OP_GetLocalFloat,
#endif
#ifdef GET_INTERP
case OP_GetLocalSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetLocalFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetLocal<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetLocalSint8:
  PrintName("GetLocalSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalUint8:
  PrintName("GetLocalUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalSint16:
  PrintName("GetLocalSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalUint16:
  PrintName("GetLocalUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalSint32:
  PrintName("GetLocalSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalUint32:
  PrintName("GetLocalUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalSint64:
  PrintName("GetLocalSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalUint64:
  PrintName("GetLocalUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalIntAP:
  PrintName("GetLocalIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalIntAPS:
  PrintName("GetLocalIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalBool:
  PrintName("GetLocalBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalPtr:
  PrintName("GetLocalPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalFnPtr:
  PrintName("GetLocalFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetLocalFloat:
  PrintName("GetLocalFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetLocalSint8(uint32_t, const SourceInfo &);
bool emitGetLocalUint8(uint32_t, const SourceInfo &);
bool emitGetLocalSint16(uint32_t, const SourceInfo &);
bool emitGetLocalUint16(uint32_t, const SourceInfo &);
bool emitGetLocalSint32(uint32_t, const SourceInfo &);
bool emitGetLocalUint32(uint32_t, const SourceInfo &);
bool emitGetLocalSint64(uint32_t, const SourceInfo &);
bool emitGetLocalUint64(uint32_t, const SourceInfo &);
bool emitGetLocalIntAP(uint32_t, const SourceInfo &);
bool emitGetLocalIntAPS(uint32_t, const SourceInfo &);
bool emitGetLocalBool(uint32_t, const SourceInfo &);
bool emitGetLocalPtr(uint32_t, const SourceInfo &);
bool emitGetLocalFnPtr(uint32_t, const SourceInfo &);
bool emitGetLocalFloat(uint32_t, const SourceInfo &);
#if defined(GET_EVAL_PROTO)
template<PrimType>
bool emitGetLocal(uint32_t, const SourceInfo &);
#endif
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetLocal(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitGetLocal(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
#ifdef GET_LINK_IMPL
    return emitGetLocalSint8
#else
    return emitGetLocal<PT_Sint8>
#endif
      (A0, I);
  case PT_Uint8:
#ifdef GET_LINK_IMPL
    return emitGetLocalUint8
#else
    return emitGetLocal<PT_Uint8>
#endif
      (A0, I);
  case PT_Sint16:
#ifdef GET_LINK_IMPL
    return emitGetLocalSint16
#else
    return emitGetLocal<PT_Sint16>
#endif
      (A0, I);
  case PT_Uint16:
#ifdef GET_LINK_IMPL
    return emitGetLocalUint16
#else
    return emitGetLocal<PT_Uint16>
#endif
      (A0, I);
  case PT_Sint32:
#ifdef GET_LINK_IMPL
    return emitGetLocalSint32
#else
    return emitGetLocal<PT_Sint32>
#endif
      (A0, I);
  case PT_Uint32:
#ifdef GET_LINK_IMPL
    return emitGetLocalUint32
#else
    return emitGetLocal<PT_Uint32>
#endif
      (A0, I);
  case PT_Sint64:
#ifdef GET_LINK_IMPL
    return emitGetLocalSint64
#else
    return emitGetLocal<PT_Sint64>
#endif
      (A0, I);
  case PT_Uint64:
#ifdef GET_LINK_IMPL
    return emitGetLocalUint64
#else
    return emitGetLocal<PT_Uint64>
#endif
      (A0, I);
  case PT_IntAP:
#ifdef GET_LINK_IMPL
    return emitGetLocalIntAP
#else
    return emitGetLocal<PT_IntAP>
#endif
      (A0, I);
  case PT_IntAPS:
#ifdef GET_LINK_IMPL
    return emitGetLocalIntAPS
#else
    return emitGetLocal<PT_IntAPS>
#endif
      (A0, I);
  case PT_Bool:
#ifdef GET_LINK_IMPL
    return emitGetLocalBool
#else
    return emitGetLocal<PT_Bool>
#endif
      (A0, I);
  case PT_Ptr:
#ifdef GET_LINK_IMPL
    return emitGetLocalPtr
#else
    return emitGetLocal<PT_Ptr>
#endif
      (A0, I);
  case PT_FnPtr:
#ifdef GET_LINK_IMPL
    return emitGetLocalFnPtr
#else
    return emitGetLocal<PT_FnPtr>
#endif
      (A0, I);
  case PT_Float:
#ifdef GET_LINK_IMPL
    return emitGetLocalFloat
#else
    return emitGetLocal<PT_Float>
#endif
      (A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetLocalSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalSint8, A0, L);
}
bool ByteCodeEmitter::emitGetLocalUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalUint8, A0, L);
}
bool ByteCodeEmitter::emitGetLocalSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalSint16, A0, L);
}
bool ByteCodeEmitter::emitGetLocalUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalUint16, A0, L);
}
bool ByteCodeEmitter::emitGetLocalSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalSint32, A0, L);
}
bool ByteCodeEmitter::emitGetLocalUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalUint32, A0, L);
}
bool ByteCodeEmitter::emitGetLocalSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalSint64, A0, L);
}
bool ByteCodeEmitter::emitGetLocalUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalUint64, A0, L);
}
bool ByteCodeEmitter::emitGetLocalIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalIntAP, A0, L);
}
bool ByteCodeEmitter::emitGetLocalIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalIntAPS, A0, L);
}
bool ByteCodeEmitter::emitGetLocalBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalBool, A0, L);
}
bool ByteCodeEmitter::emitGetLocalPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalPtr, A0, L);
}
bool ByteCodeEmitter::emitGetLocalFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalFnPtr, A0, L);
}
bool ByteCodeEmitter::emitGetLocalFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetLocalFloat, A0, L);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetParamSint8,
OP_GetParamUint8,
OP_GetParamSint16,
OP_GetParamUint16,
OP_GetParamSint32,
OP_GetParamUint32,
OP_GetParamSint64,
OP_GetParamUint64,
OP_GetParamIntAP,
OP_GetParamIntAPS,
OP_GetParamBool,
OP_GetParamPtr,
OP_GetParamFnPtr,
OP_GetParamFloat,
#endif
#ifdef GET_INTERP
case OP_GetParamSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetParamFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetParam<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetParamSint8:
  PrintName("GetParamSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamUint8:
  PrintName("GetParamUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamSint16:
  PrintName("GetParamSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamUint16:
  PrintName("GetParamUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamSint32:
  PrintName("GetParamSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamUint32:
  PrintName("GetParamUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamSint64:
  PrintName("GetParamSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamUint64:
  PrintName("GetParamUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamIntAP:
  PrintName("GetParamIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamIntAPS:
  PrintName("GetParamIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamBool:
  PrintName("GetParamBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamPtr:
  PrintName("GetParamPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamFnPtr:
  PrintName("GetParamFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetParamFloat:
  PrintName("GetParamFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetParamSint8(uint32_t, const SourceInfo &);
bool emitGetParamUint8(uint32_t, const SourceInfo &);
bool emitGetParamSint16(uint32_t, const SourceInfo &);
bool emitGetParamUint16(uint32_t, const SourceInfo &);
bool emitGetParamSint32(uint32_t, const SourceInfo &);
bool emitGetParamUint32(uint32_t, const SourceInfo &);
bool emitGetParamSint64(uint32_t, const SourceInfo &);
bool emitGetParamUint64(uint32_t, const SourceInfo &);
bool emitGetParamIntAP(uint32_t, const SourceInfo &);
bool emitGetParamIntAPS(uint32_t, const SourceInfo &);
bool emitGetParamBool(uint32_t, const SourceInfo &);
bool emitGetParamPtr(uint32_t, const SourceInfo &);
bool emitGetParamFnPtr(uint32_t, const SourceInfo &);
bool emitGetParamFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetParam(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitGetParam(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitGetParamSint8(A0, I);
  case PT_Uint8:
    return emitGetParamUint8(A0, I);
  case PT_Sint16:
    return emitGetParamSint16(A0, I);
  case PT_Uint16:
    return emitGetParamUint16(A0, I);
  case PT_Sint32:
    return emitGetParamSint32(A0, I);
  case PT_Uint32:
    return emitGetParamUint32(A0, I);
  case PT_Sint64:
    return emitGetParamSint64(A0, I);
  case PT_Uint64:
    return emitGetParamUint64(A0, I);
  case PT_IntAP:
    return emitGetParamIntAP(A0, I);
  case PT_IntAPS:
    return emitGetParamIntAPS(A0, I);
  case PT_Bool:
    return emitGetParamBool(A0, I);
  case PT_Ptr:
    return emitGetParamPtr(A0, I);
  case PT_FnPtr:
    return emitGetParamFnPtr(A0, I);
  case PT_Float:
    return emitGetParamFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetParamSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamSint8, A0, L);
}
bool ByteCodeEmitter::emitGetParamUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamUint8, A0, L);
}
bool ByteCodeEmitter::emitGetParamSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamSint16, A0, L);
}
bool ByteCodeEmitter::emitGetParamUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamUint16, A0, L);
}
bool ByteCodeEmitter::emitGetParamSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamSint32, A0, L);
}
bool ByteCodeEmitter::emitGetParamUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamUint32, A0, L);
}
bool ByteCodeEmitter::emitGetParamSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamSint64, A0, L);
}
bool ByteCodeEmitter::emitGetParamUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamUint64, A0, L);
}
bool ByteCodeEmitter::emitGetParamIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamIntAP, A0, L);
}
bool ByteCodeEmitter::emitGetParamIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamIntAPS, A0, L);
}
bool ByteCodeEmitter::emitGetParamBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamBool, A0, L);
}
bool ByteCodeEmitter::emitGetParamPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamPtr, A0, L);
}
bool ByteCodeEmitter::emitGetParamFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamFnPtr, A0, L);
}
bool ByteCodeEmitter::emitGetParamFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetParamFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetParamSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetParamFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetParam<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrActiveField,
#endif
#ifdef GET_INTERP
case OP_GetPtrActiveField: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetPtrActiveField(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrActiveField:
  PrintName("GetPtrActiveField");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrActiveField(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrActiveField(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetPtrActiveField, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrActiveField(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrActiveField(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrActiveThisField,
#endif
#ifdef GET_INTERP
case OP_GetPtrActiveThisField: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetPtrActiveThisField(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrActiveThisField:
  PrintName("GetPtrActiveThisField");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrActiveThisField(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrActiveThisField(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetPtrActiveThisField, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrActiveThisField(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrActiveThisField(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrBase,
#endif
#ifdef GET_INTERP
case OP_GetPtrBase: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetPtrBase(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrBase:
  PrintName("GetPtrBase");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrBase(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrBase(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetPtrBase, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrBase(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrBase(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrBasePop,
#endif
#ifdef GET_INTERP
case OP_GetPtrBasePop: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetPtrBasePop(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrBasePop:
  PrintName("GetPtrBasePop");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrBasePop(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrBasePop(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetPtrBasePop, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrBasePop(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrBasePop(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrDerivedPop,
#endif
#ifdef GET_INTERP
case OP_GetPtrDerivedPop: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetPtrDerivedPop(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrDerivedPop:
  PrintName("GetPtrDerivedPop");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrDerivedPop(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrDerivedPop(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetPtrDerivedPop, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrDerivedPop(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrDerivedPop(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrField,
#endif
#ifdef GET_INTERP
case OP_GetPtrField: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetPtrField(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrField:
  PrintName("GetPtrField");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrField(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrField(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetPtrField, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrField(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrField(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrGlobal,
#endif
#ifdef GET_INTERP
case OP_GetPtrGlobal: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetPtrGlobal(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrGlobal:
  PrintName("GetPtrGlobal");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrGlobal(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrGlobal(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetPtrGlobal, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrGlobal(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrGlobal(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrLocal,
#endif
#ifdef GET_INTERP
case OP_GetPtrLocal: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetPtrLocal(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrLocal:
  PrintName("GetPtrLocal");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrLocal(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrLocal(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetPtrLocal, A0, L);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrParam,
#endif
#ifdef GET_INTERP
case OP_GetPtrParam: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetPtrParam(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrParam:
  PrintName("GetPtrParam");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrParam(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrParam(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetPtrParam, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrParam(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrParam(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrThisBase,
#endif
#ifdef GET_INTERP
case OP_GetPtrThisBase: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetPtrThisBase(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrThisBase:
  PrintName("GetPtrThisBase");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrThisBase(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrThisBase(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetPtrThisBase, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrThisBase(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrThisBase(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrThisField,
#endif
#ifdef GET_INTERP
case OP_GetPtrThisField: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetPtrThisField(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrThisField:
  PrintName("GetPtrThisField");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrThisField(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrThisField(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetPtrThisField, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrThisField(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrThisField(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrThisVirtBase,
#endif
#ifdef GET_INTERP
case OP_GetPtrThisVirtBase: {
  auto V0 = ReadArg<const RecordDecl *>(S, PC);
  if (!GetPtrThisVirtBase(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrThisVirtBase:
  PrintName("GetPtrThisVirtBase");
  OS << "\t" << ReadArg<const RecordDecl *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrThisVirtBase(const RecordDecl *, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrThisVirtBase(const RecordDecl * A0, const SourceInfo &L) {
  return emitOp<const RecordDecl *>(OP_GetPtrThisVirtBase, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrThisVirtBase(const RecordDecl * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrThisVirtBase(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetPtrVirtBase,
#endif
#ifdef GET_INTERP
case OP_GetPtrVirtBase: {
  auto V0 = ReadArg<const RecordDecl *>(S, PC);
  if (!GetPtrVirtBase(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetPtrVirtBase:
  PrintName("GetPtrVirtBase");
  OS << "\t" << ReadArg<const RecordDecl *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetPtrVirtBase(const RecordDecl *, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetPtrVirtBase(const RecordDecl * A0, const SourceInfo &L) {
  return emitOp<const RecordDecl *>(OP_GetPtrVirtBase, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetPtrVirtBase(const RecordDecl * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetPtrVirtBase(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_GetThisFieldSint8,
OP_GetThisFieldUint8,
OP_GetThisFieldSint16,
OP_GetThisFieldUint16,
OP_GetThisFieldSint32,
OP_GetThisFieldUint32,
OP_GetThisFieldSint64,
OP_GetThisFieldUint64,
OP_GetThisFieldIntAP,
OP_GetThisFieldIntAPS,
OP_GetThisFieldBool,
OP_GetThisFieldPtr,
OP_GetThisFieldFnPtr,
OP_GetThisFieldFloat,
#endif
#ifdef GET_INTERP
case OP_GetThisFieldSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_GetThisFieldFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!GetThisField<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_GetThisFieldSint8:
  PrintName("GetThisFieldSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldUint8:
  PrintName("GetThisFieldUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldSint16:
  PrintName("GetThisFieldSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldUint16:
  PrintName("GetThisFieldUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldSint32:
  PrintName("GetThisFieldSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldUint32:
  PrintName("GetThisFieldUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldSint64:
  PrintName("GetThisFieldSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldUint64:
  PrintName("GetThisFieldUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldIntAP:
  PrintName("GetThisFieldIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldIntAPS:
  PrintName("GetThisFieldIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldBool:
  PrintName("GetThisFieldBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldPtr:
  PrintName("GetThisFieldPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldFnPtr:
  PrintName("GetThisFieldFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_GetThisFieldFloat:
  PrintName("GetThisFieldFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetThisFieldSint8(uint32_t, const SourceInfo &);
bool emitGetThisFieldUint8(uint32_t, const SourceInfo &);
bool emitGetThisFieldSint16(uint32_t, const SourceInfo &);
bool emitGetThisFieldUint16(uint32_t, const SourceInfo &);
bool emitGetThisFieldSint32(uint32_t, const SourceInfo &);
bool emitGetThisFieldUint32(uint32_t, const SourceInfo &);
bool emitGetThisFieldSint64(uint32_t, const SourceInfo &);
bool emitGetThisFieldUint64(uint32_t, const SourceInfo &);
bool emitGetThisFieldIntAP(uint32_t, const SourceInfo &);
bool emitGetThisFieldIntAPS(uint32_t, const SourceInfo &);
bool emitGetThisFieldBool(uint32_t, const SourceInfo &);
bool emitGetThisFieldPtr(uint32_t, const SourceInfo &);
bool emitGetThisFieldFnPtr(uint32_t, const SourceInfo &);
bool emitGetThisFieldFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitGetThisField(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitGetThisField(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitGetThisFieldSint8(A0, I);
  case PT_Uint8:
    return emitGetThisFieldUint8(A0, I);
  case PT_Sint16:
    return emitGetThisFieldSint16(A0, I);
  case PT_Uint16:
    return emitGetThisFieldUint16(A0, I);
  case PT_Sint32:
    return emitGetThisFieldSint32(A0, I);
  case PT_Uint32:
    return emitGetThisFieldUint32(A0, I);
  case PT_Sint64:
    return emitGetThisFieldSint64(A0, I);
  case PT_Uint64:
    return emitGetThisFieldUint64(A0, I);
  case PT_IntAP:
    return emitGetThisFieldIntAP(A0, I);
  case PT_IntAPS:
    return emitGetThisFieldIntAPS(A0, I);
  case PT_Bool:
    return emitGetThisFieldBool(A0, I);
  case PT_Ptr:
    return emitGetThisFieldPtr(A0, I);
  case PT_FnPtr:
    return emitGetThisFieldFnPtr(A0, I);
  case PT_Float:
    return emitGetThisFieldFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitGetThisFieldSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldSint8, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldUint8, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldSint16, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldUint16, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldSint32, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldUint32, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldSint64, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldUint64, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldIntAP, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldIntAPS, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldBool, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldPtr, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldFnPtr, A0, L);
}
bool ByteCodeEmitter::emitGetThisFieldFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_GetThisFieldFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitGetThisFieldSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitGetThisFieldFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return GetThisField<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_IncSint8,
OP_IncUint8,
OP_IncSint16,
OP_IncUint16,
OP_IncSint32,
OP_IncUint32,
OP_IncSint64,
OP_IncUint64,
OP_IncIntAP,
OP_IncIntAPS,
#endif
#ifdef GET_INTERP
case OP_IncSint8: {
  if (!Inc<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_IncUint8: {
  if (!Inc<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_IncSint16: {
  if (!Inc<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_IncUint16: {
  if (!Inc<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_IncSint32: {
  if (!Inc<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_IncUint32: {
  if (!Inc<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_IncSint64: {
  if (!Inc<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_IncUint64: {
  if (!Inc<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_IncIntAP: {
  if (!Inc<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_IncIntAPS: {
  if (!Inc<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_IncSint8:
  PrintName("IncSint8");
  OS << "\t" << "\n";
  continue;
case OP_IncUint8:
  PrintName("IncUint8");
  OS << "\t" << "\n";
  continue;
case OP_IncSint16:
  PrintName("IncSint16");
  OS << "\t" << "\n";
  continue;
case OP_IncUint16:
  PrintName("IncUint16");
  OS << "\t" << "\n";
  continue;
case OP_IncSint32:
  PrintName("IncSint32");
  OS << "\t" << "\n";
  continue;
case OP_IncUint32:
  PrintName("IncUint32");
  OS << "\t" << "\n";
  continue;
case OP_IncSint64:
  PrintName("IncSint64");
  OS << "\t" << "\n";
  continue;
case OP_IncUint64:
  PrintName("IncUint64");
  OS << "\t" << "\n";
  continue;
case OP_IncIntAP:
  PrintName("IncIntAP");
  OS << "\t" << "\n";
  continue;
case OP_IncIntAPS:
  PrintName("IncIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitIncSint8(const SourceInfo &);
bool emitIncUint8(const SourceInfo &);
bool emitIncSint16(const SourceInfo &);
bool emitIncUint16(const SourceInfo &);
bool emitIncSint32(const SourceInfo &);
bool emitIncUint32(const SourceInfo &);
bool emitIncSint64(const SourceInfo &);
bool emitIncUint64(const SourceInfo &);
bool emitIncIntAP(const SourceInfo &);
bool emitIncIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInc(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInc(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitIncSint8(I);
  case PT_Uint8:
    return emitIncUint8(I);
  case PT_Sint16:
    return emitIncSint16(I);
  case PT_Uint16:
    return emitIncUint16(I);
  case PT_Sint32:
    return emitIncSint32(I);
  case PT_Uint32:
    return emitIncUint32(I);
  case PT_Sint64:
    return emitIncSint64(I);
  case PT_Uint64:
    return emitIncUint64(I);
  case PT_IntAP:
    return emitIncIntAP(I);
  case PT_IntAPS:
    return emitIncIntAPS(I);
  default: llvm_unreachable("invalid type: emitInc");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitIncSint8(const SourceInfo &L) {
  return emitOp<>(OP_IncSint8, L);
}
bool ByteCodeEmitter::emitIncUint8(const SourceInfo &L) {
  return emitOp<>(OP_IncUint8, L);
}
bool ByteCodeEmitter::emitIncSint16(const SourceInfo &L) {
  return emitOp<>(OP_IncSint16, L);
}
bool ByteCodeEmitter::emitIncUint16(const SourceInfo &L) {
  return emitOp<>(OP_IncUint16, L);
}
bool ByteCodeEmitter::emitIncSint32(const SourceInfo &L) {
  return emitOp<>(OP_IncSint32, L);
}
bool ByteCodeEmitter::emitIncUint32(const SourceInfo &L) {
  return emitOp<>(OP_IncUint32, L);
}
bool ByteCodeEmitter::emitIncSint64(const SourceInfo &L) {
  return emitOp<>(OP_IncSint64, L);
}
bool ByteCodeEmitter::emitIncUint64(const SourceInfo &L) {
  return emitOp<>(OP_IncUint64, L);
}
bool ByteCodeEmitter::emitIncIntAP(const SourceInfo &L) {
  return emitOp<>(OP_IncIntAP, L);
}
bool ByteCodeEmitter::emitIncIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_IncIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitIncSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Inc<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitIncUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Inc<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitIncSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Inc<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitIncUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Inc<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitIncSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Inc<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitIncUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Inc<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitIncSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Inc<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitIncUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Inc<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitIncIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Inc<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitIncIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Inc<PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_IncPopSint8,
OP_IncPopUint8,
OP_IncPopSint16,
OP_IncPopUint16,
OP_IncPopSint32,
OP_IncPopUint32,
OP_IncPopSint64,
OP_IncPopUint64,
OP_IncPopIntAP,
OP_IncPopIntAPS,
#endif
#ifdef GET_INTERP
case OP_IncPopSint8: {
  if (!IncPop<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_IncPopUint8: {
  if (!IncPop<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_IncPopSint16: {
  if (!IncPop<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_IncPopUint16: {
  if (!IncPop<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_IncPopSint32: {
  if (!IncPop<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_IncPopUint32: {
  if (!IncPop<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_IncPopSint64: {
  if (!IncPop<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_IncPopUint64: {
  if (!IncPop<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_IncPopIntAP: {
  if (!IncPop<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_IncPopIntAPS: {
  if (!IncPop<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_IncPopSint8:
  PrintName("IncPopSint8");
  OS << "\t" << "\n";
  continue;
case OP_IncPopUint8:
  PrintName("IncPopUint8");
  OS << "\t" << "\n";
  continue;
case OP_IncPopSint16:
  PrintName("IncPopSint16");
  OS << "\t" << "\n";
  continue;
case OP_IncPopUint16:
  PrintName("IncPopUint16");
  OS << "\t" << "\n";
  continue;
case OP_IncPopSint32:
  PrintName("IncPopSint32");
  OS << "\t" << "\n";
  continue;
case OP_IncPopUint32:
  PrintName("IncPopUint32");
  OS << "\t" << "\n";
  continue;
case OP_IncPopSint64:
  PrintName("IncPopSint64");
  OS << "\t" << "\n";
  continue;
case OP_IncPopUint64:
  PrintName("IncPopUint64");
  OS << "\t" << "\n";
  continue;
case OP_IncPopIntAP:
  PrintName("IncPopIntAP");
  OS << "\t" << "\n";
  continue;
case OP_IncPopIntAPS:
  PrintName("IncPopIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitIncPopSint8(const SourceInfo &);
bool emitIncPopUint8(const SourceInfo &);
bool emitIncPopSint16(const SourceInfo &);
bool emitIncPopUint16(const SourceInfo &);
bool emitIncPopSint32(const SourceInfo &);
bool emitIncPopUint32(const SourceInfo &);
bool emitIncPopSint64(const SourceInfo &);
bool emitIncPopUint64(const SourceInfo &);
bool emitIncPopIntAP(const SourceInfo &);
bool emitIncPopIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitIncPop(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitIncPop(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitIncPopSint8(I);
  case PT_Uint8:
    return emitIncPopUint8(I);
  case PT_Sint16:
    return emitIncPopSint16(I);
  case PT_Uint16:
    return emitIncPopUint16(I);
  case PT_Sint32:
    return emitIncPopSint32(I);
  case PT_Uint32:
    return emitIncPopUint32(I);
  case PT_Sint64:
    return emitIncPopSint64(I);
  case PT_Uint64:
    return emitIncPopUint64(I);
  case PT_IntAP:
    return emitIncPopIntAP(I);
  case PT_IntAPS:
    return emitIncPopIntAPS(I);
  default: llvm_unreachable("invalid type: emitIncPop");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitIncPopSint8(const SourceInfo &L) {
  return emitOp<>(OP_IncPopSint8, L);
}
bool ByteCodeEmitter::emitIncPopUint8(const SourceInfo &L) {
  return emitOp<>(OP_IncPopUint8, L);
}
bool ByteCodeEmitter::emitIncPopSint16(const SourceInfo &L) {
  return emitOp<>(OP_IncPopSint16, L);
}
bool ByteCodeEmitter::emitIncPopUint16(const SourceInfo &L) {
  return emitOp<>(OP_IncPopUint16, L);
}
bool ByteCodeEmitter::emitIncPopSint32(const SourceInfo &L) {
  return emitOp<>(OP_IncPopSint32, L);
}
bool ByteCodeEmitter::emitIncPopUint32(const SourceInfo &L) {
  return emitOp<>(OP_IncPopUint32, L);
}
bool ByteCodeEmitter::emitIncPopSint64(const SourceInfo &L) {
  return emitOp<>(OP_IncPopSint64, L);
}
bool ByteCodeEmitter::emitIncPopUint64(const SourceInfo &L) {
  return emitOp<>(OP_IncPopUint64, L);
}
bool ByteCodeEmitter::emitIncPopIntAP(const SourceInfo &L) {
  return emitOp<>(OP_IncPopIntAP, L);
}
bool ByteCodeEmitter::emitIncPopIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_IncPopIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitIncPopSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncPop<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitIncPopUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncPop<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitIncPopSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncPop<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitIncPopUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncPop<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitIncPopSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncPop<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitIncPopUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncPop<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitIncPopSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncPop<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitIncPopUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncPop<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitIncPopIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncPop<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitIncPopIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncPop<PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_IncPtr,
#endif
#ifdef GET_INTERP
case OP_IncPtr: {
  if (!IncPtr(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_IncPtr:
  PrintName("IncPtr");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitIncPtr(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitIncPtr(const SourceInfo &L) {
  return emitOp<>(OP_IncPtr, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitIncPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncPtr(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Incf,
#endif
#ifdef GET_INTERP
case OP_Incf: {
  auto V0 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!Incf(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Incf:
  PrintName("Incf");
  OS << "\t" << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitIncf(llvm::RoundingMode, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitIncf(llvm::RoundingMode A0, const SourceInfo &L) {
  return emitOp<llvm::RoundingMode>(OP_Incf, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitIncf(llvm::RoundingMode A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Incf(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_IncfPop,
#endif
#ifdef GET_INTERP
case OP_IncfPop: {
  auto V0 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!IncfPop(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_IncfPop:
  PrintName("IncfPop");
  OS << "\t" << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitIncfPop(llvm::RoundingMode, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitIncfPop(llvm::RoundingMode A0, const SourceInfo &L) {
  return emitOp<llvm::RoundingMode>(OP_IncfPop, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitIncfPop(llvm::RoundingMode A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return IncfPop(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitBitFieldSint8,
OP_InitBitFieldUint8,
OP_InitBitFieldSint16,
OP_InitBitFieldUint16,
OP_InitBitFieldSint32,
OP_InitBitFieldUint32,
OP_InitBitFieldSint64,
OP_InitBitFieldUint64,
OP_InitBitFieldIntAP,
OP_InitBitFieldIntAPS,
OP_InitBitFieldBool,
#endif
#ifdef GET_INTERP
case OP_InitBitFieldSint8: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  if (!InitBitField<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitBitFieldUint8: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  if (!InitBitField<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitBitFieldSint16: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  if (!InitBitField<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitBitFieldUint16: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  if (!InitBitField<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitBitFieldSint32: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  if (!InitBitField<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitBitFieldUint32: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  if (!InitBitField<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitBitFieldSint64: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  if (!InitBitField<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitBitFieldUint64: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  if (!InitBitField<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitBitFieldIntAP: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  if (!InitBitField<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitBitFieldIntAPS: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  if (!InitBitField<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitBitFieldBool: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  if (!InitBitField<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitBitFieldSint8:
  PrintName("InitBitFieldSint8");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << "\n";
  continue;
case OP_InitBitFieldUint8:
  PrintName("InitBitFieldUint8");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << "\n";
  continue;
case OP_InitBitFieldSint16:
  PrintName("InitBitFieldSint16");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << "\n";
  continue;
case OP_InitBitFieldUint16:
  PrintName("InitBitFieldUint16");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << "\n";
  continue;
case OP_InitBitFieldSint32:
  PrintName("InitBitFieldSint32");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << "\n";
  continue;
case OP_InitBitFieldUint32:
  PrintName("InitBitFieldUint32");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << "\n";
  continue;
case OP_InitBitFieldSint64:
  PrintName("InitBitFieldSint64");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << "\n";
  continue;
case OP_InitBitFieldUint64:
  PrintName("InitBitFieldUint64");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << "\n";
  continue;
case OP_InitBitFieldIntAP:
  PrintName("InitBitFieldIntAP");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << "\n";
  continue;
case OP_InitBitFieldIntAPS:
  PrintName("InitBitFieldIntAPS");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << "\n";
  continue;
case OP_InitBitFieldBool:
  PrintName("InitBitFieldBool");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitBitFieldSint8(const Record::Field *, const SourceInfo &);
bool emitInitBitFieldUint8(const Record::Field *, const SourceInfo &);
bool emitInitBitFieldSint16(const Record::Field *, const SourceInfo &);
bool emitInitBitFieldUint16(const Record::Field *, const SourceInfo &);
bool emitInitBitFieldSint32(const Record::Field *, const SourceInfo &);
bool emitInitBitFieldUint32(const Record::Field *, const SourceInfo &);
bool emitInitBitFieldSint64(const Record::Field *, const SourceInfo &);
bool emitInitBitFieldUint64(const Record::Field *, const SourceInfo &);
bool emitInitBitFieldIntAP(const Record::Field *, const SourceInfo &);
bool emitInitBitFieldIntAPS(const Record::Field *, const SourceInfo &);
bool emitInitBitFieldBool(const Record::Field *, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitBitField(PrimType, const Record::Field *, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInitBitField(PrimType T0, const Record::Field * A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitInitBitFieldSint8(A0, I);
  case PT_Uint8:
    return emitInitBitFieldUint8(A0, I);
  case PT_Sint16:
    return emitInitBitFieldSint16(A0, I);
  case PT_Uint16:
    return emitInitBitFieldUint16(A0, I);
  case PT_Sint32:
    return emitInitBitFieldSint32(A0, I);
  case PT_Uint32:
    return emitInitBitFieldUint32(A0, I);
  case PT_Sint64:
    return emitInitBitFieldSint64(A0, I);
  case PT_Uint64:
    return emitInitBitFieldUint64(A0, I);
  case PT_IntAP:
    return emitInitBitFieldIntAP(A0, I);
  case PT_IntAPS:
    return emitInitBitFieldIntAPS(A0, I);
  case PT_Bool:
    return emitInitBitFieldBool(A0, I);
  default: llvm_unreachable("invalid type: emitInitBitField");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitBitFieldSint8(const Record::Field * A0, const SourceInfo &L) {
  return emitOp<const Record::Field *>(OP_InitBitFieldSint8, A0, L);
}
bool ByteCodeEmitter::emitInitBitFieldUint8(const Record::Field * A0, const SourceInfo &L) {
  return emitOp<const Record::Field *>(OP_InitBitFieldUint8, A0, L);
}
bool ByteCodeEmitter::emitInitBitFieldSint16(const Record::Field * A0, const SourceInfo &L) {
  return emitOp<const Record::Field *>(OP_InitBitFieldSint16, A0, L);
}
bool ByteCodeEmitter::emitInitBitFieldUint16(const Record::Field * A0, const SourceInfo &L) {
  return emitOp<const Record::Field *>(OP_InitBitFieldUint16, A0, L);
}
bool ByteCodeEmitter::emitInitBitFieldSint32(const Record::Field * A0, const SourceInfo &L) {
  return emitOp<const Record::Field *>(OP_InitBitFieldSint32, A0, L);
}
bool ByteCodeEmitter::emitInitBitFieldUint32(const Record::Field * A0, const SourceInfo &L) {
  return emitOp<const Record::Field *>(OP_InitBitFieldUint32, A0, L);
}
bool ByteCodeEmitter::emitInitBitFieldSint64(const Record::Field * A0, const SourceInfo &L) {
  return emitOp<const Record::Field *>(OP_InitBitFieldSint64, A0, L);
}
bool ByteCodeEmitter::emitInitBitFieldUint64(const Record::Field * A0, const SourceInfo &L) {
  return emitOp<const Record::Field *>(OP_InitBitFieldUint64, A0, L);
}
bool ByteCodeEmitter::emitInitBitFieldIntAP(const Record::Field * A0, const SourceInfo &L) {
  return emitOp<const Record::Field *>(OP_InitBitFieldIntAP, A0, L);
}
bool ByteCodeEmitter::emitInitBitFieldIntAPS(const Record::Field * A0, const SourceInfo &L) {
  return emitOp<const Record::Field *>(OP_InitBitFieldIntAPS, A0, L);
}
bool ByteCodeEmitter::emitInitBitFieldBool(const Record::Field * A0, const SourceInfo &L) {
  return emitOp<const Record::Field *>(OP_InitBitFieldBool, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitBitFieldSint8(const Record::Field * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitBitField<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitBitFieldUint8(const Record::Field * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitBitField<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitBitFieldSint16(const Record::Field * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitBitField<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitBitFieldUint16(const Record::Field * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitBitField<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitBitFieldSint32(const Record::Field * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitBitField<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitBitFieldUint32(const Record::Field * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitBitField<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitBitFieldSint64(const Record::Field * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitBitField<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitBitFieldUint64(const Record::Field * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitBitField<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitBitFieldIntAP(const Record::Field * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitBitField<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitInitBitFieldIntAPS(const Record::Field * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitBitField<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitInitBitFieldBool(const Record::Field * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitBitField<PT_Bool>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitElemSint8,
OP_InitElemUint8,
OP_InitElemSint16,
OP_InitElemUint16,
OP_InitElemSint32,
OP_InitElemUint32,
OP_InitElemSint64,
OP_InitElemUint64,
OP_InitElemIntAP,
OP_InitElemIntAPS,
OP_InitElemBool,
OP_InitElemPtr,
OP_InitElemFnPtr,
OP_InitElemFloat,
#endif
#ifdef GET_INTERP
case OP_InitElemSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElem<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitElemSint8:
  PrintName("InitElemSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemUint8:
  PrintName("InitElemUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemSint16:
  PrintName("InitElemSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemUint16:
  PrintName("InitElemUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemSint32:
  PrintName("InitElemSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemUint32:
  PrintName("InitElemUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemSint64:
  PrintName("InitElemSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemUint64:
  PrintName("InitElemUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemIntAP:
  PrintName("InitElemIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemIntAPS:
  PrintName("InitElemIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemBool:
  PrintName("InitElemBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPtr:
  PrintName("InitElemPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemFnPtr:
  PrintName("InitElemFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemFloat:
  PrintName("InitElemFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitElemSint8(uint32_t, const SourceInfo &);
bool emitInitElemUint8(uint32_t, const SourceInfo &);
bool emitInitElemSint16(uint32_t, const SourceInfo &);
bool emitInitElemUint16(uint32_t, const SourceInfo &);
bool emitInitElemSint32(uint32_t, const SourceInfo &);
bool emitInitElemUint32(uint32_t, const SourceInfo &);
bool emitInitElemSint64(uint32_t, const SourceInfo &);
bool emitInitElemUint64(uint32_t, const SourceInfo &);
bool emitInitElemIntAP(uint32_t, const SourceInfo &);
bool emitInitElemIntAPS(uint32_t, const SourceInfo &);
bool emitInitElemBool(uint32_t, const SourceInfo &);
bool emitInitElemPtr(uint32_t, const SourceInfo &);
bool emitInitElemFnPtr(uint32_t, const SourceInfo &);
bool emitInitElemFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitElem(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInitElem(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitInitElemSint8(A0, I);
  case PT_Uint8:
    return emitInitElemUint8(A0, I);
  case PT_Sint16:
    return emitInitElemSint16(A0, I);
  case PT_Uint16:
    return emitInitElemUint16(A0, I);
  case PT_Sint32:
    return emitInitElemSint32(A0, I);
  case PT_Uint32:
    return emitInitElemUint32(A0, I);
  case PT_Sint64:
    return emitInitElemSint64(A0, I);
  case PT_Uint64:
    return emitInitElemUint64(A0, I);
  case PT_IntAP:
    return emitInitElemIntAP(A0, I);
  case PT_IntAPS:
    return emitInitElemIntAPS(A0, I);
  case PT_Bool:
    return emitInitElemBool(A0, I);
  case PT_Ptr:
    return emitInitElemPtr(A0, I);
  case PT_FnPtr:
    return emitInitElemFnPtr(A0, I);
  case PT_Float:
    return emitInitElemFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitElemSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemSint8, A0, L);
}
bool ByteCodeEmitter::emitInitElemUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemUint8, A0, L);
}
bool ByteCodeEmitter::emitInitElemSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemSint16, A0, L);
}
bool ByteCodeEmitter::emitInitElemUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemUint16, A0, L);
}
bool ByteCodeEmitter::emitInitElemSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemSint32, A0, L);
}
bool ByteCodeEmitter::emitInitElemUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemUint32, A0, L);
}
bool ByteCodeEmitter::emitInitElemSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemSint64, A0, L);
}
bool ByteCodeEmitter::emitInitElemUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemUint64, A0, L);
}
bool ByteCodeEmitter::emitInitElemIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemIntAP, A0, L);
}
bool ByteCodeEmitter::emitInitElemIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemIntAPS, A0, L);
}
bool ByteCodeEmitter::emitInitElemBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemBool, A0, L);
}
bool ByteCodeEmitter::emitInitElemPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPtr, A0, L);
}
bool ByteCodeEmitter::emitInitElemFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemFnPtr, A0, L);
}
bool ByteCodeEmitter::emitInitElemFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitElemSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElem<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitElemPopSint8,
OP_InitElemPopUint8,
OP_InitElemPopSint16,
OP_InitElemPopUint16,
OP_InitElemPopSint32,
OP_InitElemPopUint32,
OP_InitElemPopSint64,
OP_InitElemPopUint64,
OP_InitElemPopIntAP,
OP_InitElemPopIntAPS,
OP_InitElemPopBool,
OP_InitElemPopPtr,
OP_InitElemPopFnPtr,
OP_InitElemPopFloat,
#endif
#ifdef GET_INTERP
case OP_InitElemPopSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitElemPopFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitElemPop<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitElemPopSint8:
  PrintName("InitElemPopSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopUint8:
  PrintName("InitElemPopUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopSint16:
  PrintName("InitElemPopSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopUint16:
  PrintName("InitElemPopUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopSint32:
  PrintName("InitElemPopSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopUint32:
  PrintName("InitElemPopUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopSint64:
  PrintName("InitElemPopSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopUint64:
  PrintName("InitElemPopUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopIntAP:
  PrintName("InitElemPopIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopIntAPS:
  PrintName("InitElemPopIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopBool:
  PrintName("InitElemPopBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopPtr:
  PrintName("InitElemPopPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopFnPtr:
  PrintName("InitElemPopFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitElemPopFloat:
  PrintName("InitElemPopFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitElemPopSint8(uint32_t, const SourceInfo &);
bool emitInitElemPopUint8(uint32_t, const SourceInfo &);
bool emitInitElemPopSint16(uint32_t, const SourceInfo &);
bool emitInitElemPopUint16(uint32_t, const SourceInfo &);
bool emitInitElemPopSint32(uint32_t, const SourceInfo &);
bool emitInitElemPopUint32(uint32_t, const SourceInfo &);
bool emitInitElemPopSint64(uint32_t, const SourceInfo &);
bool emitInitElemPopUint64(uint32_t, const SourceInfo &);
bool emitInitElemPopIntAP(uint32_t, const SourceInfo &);
bool emitInitElemPopIntAPS(uint32_t, const SourceInfo &);
bool emitInitElemPopBool(uint32_t, const SourceInfo &);
bool emitInitElemPopPtr(uint32_t, const SourceInfo &);
bool emitInitElemPopFnPtr(uint32_t, const SourceInfo &);
bool emitInitElemPopFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitElemPop(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInitElemPop(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitInitElemPopSint8(A0, I);
  case PT_Uint8:
    return emitInitElemPopUint8(A0, I);
  case PT_Sint16:
    return emitInitElemPopSint16(A0, I);
  case PT_Uint16:
    return emitInitElemPopUint16(A0, I);
  case PT_Sint32:
    return emitInitElemPopSint32(A0, I);
  case PT_Uint32:
    return emitInitElemPopUint32(A0, I);
  case PT_Sint64:
    return emitInitElemPopSint64(A0, I);
  case PT_Uint64:
    return emitInitElemPopUint64(A0, I);
  case PT_IntAP:
    return emitInitElemPopIntAP(A0, I);
  case PT_IntAPS:
    return emitInitElemPopIntAPS(A0, I);
  case PT_Bool:
    return emitInitElemPopBool(A0, I);
  case PT_Ptr:
    return emitInitElemPopPtr(A0, I);
  case PT_FnPtr:
    return emitInitElemPopFnPtr(A0, I);
  case PT_Float:
    return emitInitElemPopFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitElemPopSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopSint8, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopUint8, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopSint16, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopUint16, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopSint32, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopUint32, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopSint64, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopUint64, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopIntAP, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopIntAPS, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopBool, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopPtr, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopFnPtr, A0, L);
}
bool ByteCodeEmitter::emitInitElemPopFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitElemPopFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitElemPopSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitElemPopFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitElemPop<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitFieldSint8,
OP_InitFieldUint8,
OP_InitFieldSint16,
OP_InitFieldUint16,
OP_InitFieldSint32,
OP_InitFieldUint32,
OP_InitFieldSint64,
OP_InitFieldUint64,
OP_InitFieldIntAP,
OP_InitFieldIntAPS,
OP_InitFieldBool,
OP_InitFieldPtr,
OP_InitFieldFnPtr,
OP_InitFieldFloat,
#endif
#ifdef GET_INTERP
case OP_InitFieldSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitField<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitFieldSint8:
  PrintName("InitFieldSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldUint8:
  PrintName("InitFieldUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldSint16:
  PrintName("InitFieldSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldUint16:
  PrintName("InitFieldUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldSint32:
  PrintName("InitFieldSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldUint32:
  PrintName("InitFieldUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldSint64:
  PrintName("InitFieldSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldUint64:
  PrintName("InitFieldUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldIntAP:
  PrintName("InitFieldIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldIntAPS:
  PrintName("InitFieldIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldBool:
  PrintName("InitFieldBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldPtr:
  PrintName("InitFieldPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldFnPtr:
  PrintName("InitFieldFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldFloat:
  PrintName("InitFieldFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitFieldSint8(uint32_t, const SourceInfo &);
bool emitInitFieldUint8(uint32_t, const SourceInfo &);
bool emitInitFieldSint16(uint32_t, const SourceInfo &);
bool emitInitFieldUint16(uint32_t, const SourceInfo &);
bool emitInitFieldSint32(uint32_t, const SourceInfo &);
bool emitInitFieldUint32(uint32_t, const SourceInfo &);
bool emitInitFieldSint64(uint32_t, const SourceInfo &);
bool emitInitFieldUint64(uint32_t, const SourceInfo &);
bool emitInitFieldIntAP(uint32_t, const SourceInfo &);
bool emitInitFieldIntAPS(uint32_t, const SourceInfo &);
bool emitInitFieldBool(uint32_t, const SourceInfo &);
bool emitInitFieldPtr(uint32_t, const SourceInfo &);
bool emitInitFieldFnPtr(uint32_t, const SourceInfo &);
bool emitInitFieldFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitField(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInitField(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitInitFieldSint8(A0, I);
  case PT_Uint8:
    return emitInitFieldUint8(A0, I);
  case PT_Sint16:
    return emitInitFieldSint16(A0, I);
  case PT_Uint16:
    return emitInitFieldUint16(A0, I);
  case PT_Sint32:
    return emitInitFieldSint32(A0, I);
  case PT_Uint32:
    return emitInitFieldUint32(A0, I);
  case PT_Sint64:
    return emitInitFieldSint64(A0, I);
  case PT_Uint64:
    return emitInitFieldUint64(A0, I);
  case PT_IntAP:
    return emitInitFieldIntAP(A0, I);
  case PT_IntAPS:
    return emitInitFieldIntAPS(A0, I);
  case PT_Bool:
    return emitInitFieldBool(A0, I);
  case PT_Ptr:
    return emitInitFieldPtr(A0, I);
  case PT_FnPtr:
    return emitInitFieldFnPtr(A0, I);
  case PT_Float:
    return emitInitFieldFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitFieldSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldSint8, A0, L);
}
bool ByteCodeEmitter::emitInitFieldUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldUint8, A0, L);
}
bool ByteCodeEmitter::emitInitFieldSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldSint16, A0, L);
}
bool ByteCodeEmitter::emitInitFieldUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldUint16, A0, L);
}
bool ByteCodeEmitter::emitInitFieldSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldSint32, A0, L);
}
bool ByteCodeEmitter::emitInitFieldUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldUint32, A0, L);
}
bool ByteCodeEmitter::emitInitFieldSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldSint64, A0, L);
}
bool ByteCodeEmitter::emitInitFieldUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldUint64, A0, L);
}
bool ByteCodeEmitter::emitInitFieldIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldIntAP, A0, L);
}
bool ByteCodeEmitter::emitInitFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldIntAPS, A0, L);
}
bool ByteCodeEmitter::emitInitFieldBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldBool, A0, L);
}
bool ByteCodeEmitter::emitInitFieldPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldPtr, A0, L);
}
bool ByteCodeEmitter::emitInitFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldFnPtr, A0, L);
}
bool ByteCodeEmitter::emitInitFieldFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitFieldSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitField<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitFieldActiveSint8,
OP_InitFieldActiveUint8,
OP_InitFieldActiveSint16,
OP_InitFieldActiveUint16,
OP_InitFieldActiveSint32,
OP_InitFieldActiveUint32,
OP_InitFieldActiveSint64,
OP_InitFieldActiveUint64,
OP_InitFieldActiveIntAP,
OP_InitFieldActiveIntAPS,
OP_InitFieldActiveBool,
OP_InitFieldActivePtr,
OP_InitFieldActiveFnPtr,
OP_InitFieldActiveFloat,
#endif
#ifdef GET_INTERP
case OP_InitFieldActiveSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActivePtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitFieldActiveFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitFieldActive<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitFieldActiveSint8:
  PrintName("InitFieldActiveSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveUint8:
  PrintName("InitFieldActiveUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveSint16:
  PrintName("InitFieldActiveSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveUint16:
  PrintName("InitFieldActiveUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveSint32:
  PrintName("InitFieldActiveSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveUint32:
  PrintName("InitFieldActiveUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveSint64:
  PrintName("InitFieldActiveSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveUint64:
  PrintName("InitFieldActiveUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveIntAP:
  PrintName("InitFieldActiveIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveIntAPS:
  PrintName("InitFieldActiveIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveBool:
  PrintName("InitFieldActiveBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActivePtr:
  PrintName("InitFieldActivePtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveFnPtr:
  PrintName("InitFieldActiveFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitFieldActiveFloat:
  PrintName("InitFieldActiveFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitFieldActiveSint8(uint32_t, const SourceInfo &);
bool emitInitFieldActiveUint8(uint32_t, const SourceInfo &);
bool emitInitFieldActiveSint16(uint32_t, const SourceInfo &);
bool emitInitFieldActiveUint16(uint32_t, const SourceInfo &);
bool emitInitFieldActiveSint32(uint32_t, const SourceInfo &);
bool emitInitFieldActiveUint32(uint32_t, const SourceInfo &);
bool emitInitFieldActiveSint64(uint32_t, const SourceInfo &);
bool emitInitFieldActiveUint64(uint32_t, const SourceInfo &);
bool emitInitFieldActiveIntAP(uint32_t, const SourceInfo &);
bool emitInitFieldActiveIntAPS(uint32_t, const SourceInfo &);
bool emitInitFieldActiveBool(uint32_t, const SourceInfo &);
bool emitInitFieldActivePtr(uint32_t, const SourceInfo &);
bool emitInitFieldActiveFnPtr(uint32_t, const SourceInfo &);
bool emitInitFieldActiveFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitFieldActive(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInitFieldActive(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitInitFieldActiveSint8(A0, I);
  case PT_Uint8:
    return emitInitFieldActiveUint8(A0, I);
  case PT_Sint16:
    return emitInitFieldActiveSint16(A0, I);
  case PT_Uint16:
    return emitInitFieldActiveUint16(A0, I);
  case PT_Sint32:
    return emitInitFieldActiveSint32(A0, I);
  case PT_Uint32:
    return emitInitFieldActiveUint32(A0, I);
  case PT_Sint64:
    return emitInitFieldActiveSint64(A0, I);
  case PT_Uint64:
    return emitInitFieldActiveUint64(A0, I);
  case PT_IntAP:
    return emitInitFieldActiveIntAP(A0, I);
  case PT_IntAPS:
    return emitInitFieldActiveIntAPS(A0, I);
  case PT_Bool:
    return emitInitFieldActiveBool(A0, I);
  case PT_Ptr:
    return emitInitFieldActivePtr(A0, I);
  case PT_FnPtr:
    return emitInitFieldActiveFnPtr(A0, I);
  case PT_Float:
    return emitInitFieldActiveFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitFieldActiveSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveSint8, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveUint8, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveSint16, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveUint16, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveSint32, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveUint32, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveSint64, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveUint64, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveIntAP, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveIntAPS, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveBool, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActivePtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActivePtr, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveFnPtr, A0, L);
}
bool ByteCodeEmitter::emitInitFieldActiveFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitFieldActiveFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitFieldActiveSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActivePtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitFieldActiveFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitFieldActive<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitGlobalSint8,
OP_InitGlobalUint8,
OP_InitGlobalSint16,
OP_InitGlobalUint16,
OP_InitGlobalSint32,
OP_InitGlobalUint32,
OP_InitGlobalSint64,
OP_InitGlobalUint64,
OP_InitGlobalIntAP,
OP_InitGlobalIntAPS,
OP_InitGlobalBool,
OP_InitGlobalPtr,
OP_InitGlobalFnPtr,
OP_InitGlobalFloat,
#endif
#ifdef GET_INTERP
case OP_InitGlobalSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitGlobalFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitGlobal<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitGlobalSint8:
  PrintName("InitGlobalSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalUint8:
  PrintName("InitGlobalUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalSint16:
  PrintName("InitGlobalSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalUint16:
  PrintName("InitGlobalUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalSint32:
  PrintName("InitGlobalSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalUint32:
  PrintName("InitGlobalUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalSint64:
  PrintName("InitGlobalSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalUint64:
  PrintName("InitGlobalUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalIntAP:
  PrintName("InitGlobalIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalIntAPS:
  PrintName("InitGlobalIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalBool:
  PrintName("InitGlobalBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalPtr:
  PrintName("InitGlobalPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalFnPtr:
  PrintName("InitGlobalFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalFloat:
  PrintName("InitGlobalFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitGlobalSint8(uint32_t, const SourceInfo &);
bool emitInitGlobalUint8(uint32_t, const SourceInfo &);
bool emitInitGlobalSint16(uint32_t, const SourceInfo &);
bool emitInitGlobalUint16(uint32_t, const SourceInfo &);
bool emitInitGlobalSint32(uint32_t, const SourceInfo &);
bool emitInitGlobalUint32(uint32_t, const SourceInfo &);
bool emitInitGlobalSint64(uint32_t, const SourceInfo &);
bool emitInitGlobalUint64(uint32_t, const SourceInfo &);
bool emitInitGlobalIntAP(uint32_t, const SourceInfo &);
bool emitInitGlobalIntAPS(uint32_t, const SourceInfo &);
bool emitInitGlobalBool(uint32_t, const SourceInfo &);
bool emitInitGlobalPtr(uint32_t, const SourceInfo &);
bool emitInitGlobalFnPtr(uint32_t, const SourceInfo &);
bool emitInitGlobalFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitGlobal(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInitGlobal(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitInitGlobalSint8(A0, I);
  case PT_Uint8:
    return emitInitGlobalUint8(A0, I);
  case PT_Sint16:
    return emitInitGlobalSint16(A0, I);
  case PT_Uint16:
    return emitInitGlobalUint16(A0, I);
  case PT_Sint32:
    return emitInitGlobalSint32(A0, I);
  case PT_Uint32:
    return emitInitGlobalUint32(A0, I);
  case PT_Sint64:
    return emitInitGlobalSint64(A0, I);
  case PT_Uint64:
    return emitInitGlobalUint64(A0, I);
  case PT_IntAP:
    return emitInitGlobalIntAP(A0, I);
  case PT_IntAPS:
    return emitInitGlobalIntAPS(A0, I);
  case PT_Bool:
    return emitInitGlobalBool(A0, I);
  case PT_Ptr:
    return emitInitGlobalPtr(A0, I);
  case PT_FnPtr:
    return emitInitGlobalFnPtr(A0, I);
  case PT_Float:
    return emitInitGlobalFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitGlobalSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalSint8, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalUint8, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalSint16, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalUint16, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalSint32, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalUint32, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalSint64, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalUint64, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalIntAP, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalIntAPS, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalBool, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalPtr, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalFnPtr, A0, L);
}
bool ByteCodeEmitter::emitInitGlobalFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitGlobalFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitGlobalSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitGlobalFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobal<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitGlobalTempSint8,
OP_InitGlobalTempUint8,
OP_InitGlobalTempSint16,
OP_InitGlobalTempUint16,
OP_InitGlobalTempSint32,
OP_InitGlobalTempUint32,
OP_InitGlobalTempSint64,
OP_InitGlobalTempUint64,
OP_InitGlobalTempIntAP,
OP_InitGlobalTempIntAPS,
OP_InitGlobalTempBool,
OP_InitGlobalTempPtr,
OP_InitGlobalTempFnPtr,
OP_InitGlobalTempFloat,
#endif
#ifdef GET_INTERP
case OP_InitGlobalTempSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_Sint8>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_Uint8>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_Sint16>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_Uint16>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_Sint32>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_Uint32>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_Sint64>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_Uint64>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_IntAP>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_IntAPS>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_Bool>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_Ptr>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_FnPtr>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitGlobalTempFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  auto V1 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTemp<PT_Float>(S, OpPC, V0, V1))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitGlobalTempSint8:
  PrintName("InitGlobalTempSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempUint8:
  PrintName("InitGlobalTempUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempSint16:
  PrintName("InitGlobalTempSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempUint16:
  PrintName("InitGlobalTempUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempSint32:
  PrintName("InitGlobalTempSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempUint32:
  PrintName("InitGlobalTempUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempSint64:
  PrintName("InitGlobalTempSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempUint64:
  PrintName("InitGlobalTempUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempIntAP:
  PrintName("InitGlobalTempIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempIntAPS:
  PrintName("InitGlobalTempIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempBool:
  PrintName("InitGlobalTempBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempPtr:
  PrintName("InitGlobalTempPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempFnPtr:
  PrintName("InitGlobalTempFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
case OP_InitGlobalTempFloat:
  PrintName("InitGlobalTempFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitGlobalTempSint8(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempUint8(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempSint16(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempUint16(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempSint32(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempUint32(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempSint64(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempUint64(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempIntAP(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempIntAPS(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempBool(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempPtr(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempFnPtr(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
bool emitInitGlobalTempFloat(uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitGlobalTemp(PrimType, uint32_t, const LifetimeExtendedTemporaryDecl *, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInitGlobalTemp(PrimType T0, uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitInitGlobalTempSint8(A0, A1, I);
  case PT_Uint8:
    return emitInitGlobalTempUint8(A0, A1, I);
  case PT_Sint16:
    return emitInitGlobalTempSint16(A0, A1, I);
  case PT_Uint16:
    return emitInitGlobalTempUint16(A0, A1, I);
  case PT_Sint32:
    return emitInitGlobalTempSint32(A0, A1, I);
  case PT_Uint32:
    return emitInitGlobalTempUint32(A0, A1, I);
  case PT_Sint64:
    return emitInitGlobalTempSint64(A0, A1, I);
  case PT_Uint64:
    return emitInitGlobalTempUint64(A0, A1, I);
  case PT_IntAP:
    return emitInitGlobalTempIntAP(A0, A1, I);
  case PT_IntAPS:
    return emitInitGlobalTempIntAPS(A0, A1, I);
  case PT_Bool:
    return emitInitGlobalTempBool(A0, A1, I);
  case PT_Ptr:
    return emitInitGlobalTempPtr(A0, A1, I);
  case PT_FnPtr:
    return emitInitGlobalTempFnPtr(A0, A1, I);
  case PT_Float:
    return emitInitGlobalTempFloat(A0, A1, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitGlobalTempSint8(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempSint8, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempUint8(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempUint8, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempSint16(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempSint16, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempUint16(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempUint16, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempSint32(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempSint32, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempUint32(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempUint32, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempSint64(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempSint64, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempUint64(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempUint64, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempIntAP(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempIntAP, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempIntAPS(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempIntAPS, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempBool(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempBool, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempPtr(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempPtr, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempFnPtr(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempFnPtr, A0, A1, L);
}
bool ByteCodeEmitter::emitInitGlobalTempFloat(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  return emitOp<uint32_t, const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempFloat, A0, A1, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitGlobalTempSint8(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_Sint8>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempUint8(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_Uint8>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempSint16(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_Sint16>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempUint16(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_Uint16>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempSint32(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_Sint32>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempUint32(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_Uint32>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempSint64(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_Sint64>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempUint64(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_Uint64>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempIntAP(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_IntAP>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempIntAPS(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_IntAPS>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempBool(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_Bool>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempPtr(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_Ptr>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempFnPtr(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_FnPtr>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitGlobalTempFloat(uint32_t A0, const LifetimeExtendedTemporaryDecl * A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTemp<PT_Float>(S, OpPC, A0, A1);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitGlobalTempComp,
#endif
#ifdef GET_INTERP
case OP_InitGlobalTempComp: {
  auto V0 = ReadArg<const LifetimeExtendedTemporaryDecl *>(S, PC);
  if (!InitGlobalTempComp(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitGlobalTempComp:
  PrintName("InitGlobalTempComp");
  OS << "\t" << ReadArg<const LifetimeExtendedTemporaryDecl *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitGlobalTempComp(const LifetimeExtendedTemporaryDecl *, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitGlobalTempComp(const LifetimeExtendedTemporaryDecl * A0, const SourceInfo &L) {
  return emitOp<const LifetimeExtendedTemporaryDecl *>(OP_InitGlobalTempComp, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitGlobalTempComp(const LifetimeExtendedTemporaryDecl * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitGlobalTempComp(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitPopSint8,
OP_InitPopUint8,
OP_InitPopSint16,
OP_InitPopUint16,
OP_InitPopSint32,
OP_InitPopUint32,
OP_InitPopSint64,
OP_InitPopUint64,
OP_InitPopIntAP,
OP_InitPopIntAPS,
OP_InitPopBool,
OP_InitPopPtr,
OP_InitPopFnPtr,
OP_InitPopFloat,
#endif
#ifdef GET_INTERP
case OP_InitPopSint8: {
  if (!InitPop<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopUint8: {
  if (!InitPop<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopSint16: {
  if (!InitPop<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopUint16: {
  if (!InitPop<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopSint32: {
  if (!InitPop<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopUint32: {
  if (!InitPop<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopSint64: {
  if (!InitPop<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopUint64: {
  if (!InitPop<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopIntAP: {
  if (!InitPop<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopIntAPS: {
  if (!InitPop<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopBool: {
  if (!InitPop<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopPtr: {
  if (!InitPop<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopFnPtr: {
  if (!InitPop<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
case OP_InitPopFloat: {
  if (!InitPop<PT_Float>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitPopSint8:
  PrintName("InitPopSint8");
  OS << "\t" << "\n";
  continue;
case OP_InitPopUint8:
  PrintName("InitPopUint8");
  OS << "\t" << "\n";
  continue;
case OP_InitPopSint16:
  PrintName("InitPopSint16");
  OS << "\t" << "\n";
  continue;
case OP_InitPopUint16:
  PrintName("InitPopUint16");
  OS << "\t" << "\n";
  continue;
case OP_InitPopSint32:
  PrintName("InitPopSint32");
  OS << "\t" << "\n";
  continue;
case OP_InitPopUint32:
  PrintName("InitPopUint32");
  OS << "\t" << "\n";
  continue;
case OP_InitPopSint64:
  PrintName("InitPopSint64");
  OS << "\t" << "\n";
  continue;
case OP_InitPopUint64:
  PrintName("InitPopUint64");
  OS << "\t" << "\n";
  continue;
case OP_InitPopIntAP:
  PrintName("InitPopIntAP");
  OS << "\t" << "\n";
  continue;
case OP_InitPopIntAPS:
  PrintName("InitPopIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_InitPopBool:
  PrintName("InitPopBool");
  OS << "\t" << "\n";
  continue;
case OP_InitPopPtr:
  PrintName("InitPopPtr");
  OS << "\t" << "\n";
  continue;
case OP_InitPopFnPtr:
  PrintName("InitPopFnPtr");
  OS << "\t" << "\n";
  continue;
case OP_InitPopFloat:
  PrintName("InitPopFloat");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitPopSint8(const SourceInfo &);
bool emitInitPopUint8(const SourceInfo &);
bool emitInitPopSint16(const SourceInfo &);
bool emitInitPopUint16(const SourceInfo &);
bool emitInitPopSint32(const SourceInfo &);
bool emitInitPopUint32(const SourceInfo &);
bool emitInitPopSint64(const SourceInfo &);
bool emitInitPopUint64(const SourceInfo &);
bool emitInitPopIntAP(const SourceInfo &);
bool emitInitPopIntAPS(const SourceInfo &);
bool emitInitPopBool(const SourceInfo &);
bool emitInitPopPtr(const SourceInfo &);
bool emitInitPopFnPtr(const SourceInfo &);
bool emitInitPopFloat(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitPop(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInitPop(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitInitPopSint8(I);
  case PT_Uint8:
    return emitInitPopUint8(I);
  case PT_Sint16:
    return emitInitPopSint16(I);
  case PT_Uint16:
    return emitInitPopUint16(I);
  case PT_Sint32:
    return emitInitPopSint32(I);
  case PT_Uint32:
    return emitInitPopUint32(I);
  case PT_Sint64:
    return emitInitPopSint64(I);
  case PT_Uint64:
    return emitInitPopUint64(I);
  case PT_IntAP:
    return emitInitPopIntAP(I);
  case PT_IntAPS:
    return emitInitPopIntAPS(I);
  case PT_Bool:
    return emitInitPopBool(I);
  case PT_Ptr:
    return emitInitPopPtr(I);
  case PT_FnPtr:
    return emitInitPopFnPtr(I);
  case PT_Float:
    return emitInitPopFloat(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitPopSint8(const SourceInfo &L) {
  return emitOp<>(OP_InitPopSint8, L);
}
bool ByteCodeEmitter::emitInitPopUint8(const SourceInfo &L) {
  return emitOp<>(OP_InitPopUint8, L);
}
bool ByteCodeEmitter::emitInitPopSint16(const SourceInfo &L) {
  return emitOp<>(OP_InitPopSint16, L);
}
bool ByteCodeEmitter::emitInitPopUint16(const SourceInfo &L) {
  return emitOp<>(OP_InitPopUint16, L);
}
bool ByteCodeEmitter::emitInitPopSint32(const SourceInfo &L) {
  return emitOp<>(OP_InitPopSint32, L);
}
bool ByteCodeEmitter::emitInitPopUint32(const SourceInfo &L) {
  return emitOp<>(OP_InitPopUint32, L);
}
bool ByteCodeEmitter::emitInitPopSint64(const SourceInfo &L) {
  return emitOp<>(OP_InitPopSint64, L);
}
bool ByteCodeEmitter::emitInitPopUint64(const SourceInfo &L) {
  return emitOp<>(OP_InitPopUint64, L);
}
bool ByteCodeEmitter::emitInitPopIntAP(const SourceInfo &L) {
  return emitOp<>(OP_InitPopIntAP, L);
}
bool ByteCodeEmitter::emitInitPopIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_InitPopIntAPS, L);
}
bool ByteCodeEmitter::emitInitPopBool(const SourceInfo &L) {
  return emitOp<>(OP_InitPopBool, L);
}
bool ByteCodeEmitter::emitInitPopPtr(const SourceInfo &L) {
  return emitOp<>(OP_InitPopPtr, L);
}
bool ByteCodeEmitter::emitInitPopFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_InitPopFnPtr, L);
}
bool ByteCodeEmitter::emitInitPopFloat(const SourceInfo &L) {
  return emitOp<>(OP_InitPopFloat, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitPopSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitInitPopUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitInitPopSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitInitPopUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitInitPopSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitInitPopUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitInitPopSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitInitPopUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitInitPopIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitInitPopIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitInitPopBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitInitPopPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitInitPopFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_FnPtr>(S, OpPC);
}
bool EvalEmitter::emitInitPopFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPop<PT_Float>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitPtrPop,
#endif
#ifdef GET_INTERP
case OP_InitPtrPop: {
  if (!InitPtrPop(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitPtrPop:
  PrintName("InitPtrPop");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitPtrPop(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitPtrPop(const SourceInfo &L) {
  return emitOp<>(OP_InitPtrPop, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitPtrPop(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitPtrPop(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitThisBitFieldSint8,
OP_InitThisBitFieldUint8,
OP_InitThisBitFieldSint16,
OP_InitThisBitFieldUint16,
OP_InitThisBitFieldSint32,
OP_InitThisBitFieldUint32,
OP_InitThisBitFieldSint64,
OP_InitThisBitFieldUint64,
OP_InitThisBitFieldIntAP,
OP_InitThisBitFieldIntAPS,
OP_InitThisBitFieldBool,
#endif
#ifdef GET_INTERP
case OP_InitThisBitFieldSint8: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  auto V1 = ReadArg<uint32_t>(S, PC);
  if (!InitThisBitField<PT_Sint8>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitThisBitFieldUint8: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  auto V1 = ReadArg<uint32_t>(S, PC);
  if (!InitThisBitField<PT_Uint8>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitThisBitFieldSint16: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  auto V1 = ReadArg<uint32_t>(S, PC);
  if (!InitThisBitField<PT_Sint16>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitThisBitFieldUint16: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  auto V1 = ReadArg<uint32_t>(S, PC);
  if (!InitThisBitField<PT_Uint16>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitThisBitFieldSint32: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  auto V1 = ReadArg<uint32_t>(S, PC);
  if (!InitThisBitField<PT_Sint32>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitThisBitFieldUint32: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  auto V1 = ReadArg<uint32_t>(S, PC);
  if (!InitThisBitField<PT_Uint32>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitThisBitFieldSint64: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  auto V1 = ReadArg<uint32_t>(S, PC);
  if (!InitThisBitField<PT_Sint64>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitThisBitFieldUint64: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  auto V1 = ReadArg<uint32_t>(S, PC);
  if (!InitThisBitField<PT_Uint64>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitThisBitFieldIntAP: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  auto V1 = ReadArg<uint32_t>(S, PC);
  if (!InitThisBitField<PT_IntAP>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitThisBitFieldIntAPS: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  auto V1 = ReadArg<uint32_t>(S, PC);
  if (!InitThisBitField<PT_IntAPS>(S, OpPC, V0, V1))
    return false;
  continue;
}
case OP_InitThisBitFieldBool: {
  auto V0 = ReadArg<const Record::Field *>(S, PC);
  auto V1 = ReadArg<uint32_t>(S, PC);
  if (!InitThisBitField<PT_Bool>(S, OpPC, V0, V1))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitThisBitFieldSint8:
  PrintName("InitThisBitFieldSint8");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisBitFieldUint8:
  PrintName("InitThisBitFieldUint8");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisBitFieldSint16:
  PrintName("InitThisBitFieldSint16");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisBitFieldUint16:
  PrintName("InitThisBitFieldUint16");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisBitFieldSint32:
  PrintName("InitThisBitFieldSint32");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisBitFieldUint32:
  PrintName("InitThisBitFieldUint32");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisBitFieldSint64:
  PrintName("InitThisBitFieldSint64");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisBitFieldUint64:
  PrintName("InitThisBitFieldUint64");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisBitFieldIntAP:
  PrintName("InitThisBitFieldIntAP");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisBitFieldIntAPS:
  PrintName("InitThisBitFieldIntAPS");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisBitFieldBool:
  PrintName("InitThisBitFieldBool");
  OS << "\t" << ReadArg<const Record::Field *>(P, PC) << " " << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitThisBitFieldSint8(const Record::Field *, uint32_t, const SourceInfo &);
bool emitInitThisBitFieldUint8(const Record::Field *, uint32_t, const SourceInfo &);
bool emitInitThisBitFieldSint16(const Record::Field *, uint32_t, const SourceInfo &);
bool emitInitThisBitFieldUint16(const Record::Field *, uint32_t, const SourceInfo &);
bool emitInitThisBitFieldSint32(const Record::Field *, uint32_t, const SourceInfo &);
bool emitInitThisBitFieldUint32(const Record::Field *, uint32_t, const SourceInfo &);
bool emitInitThisBitFieldSint64(const Record::Field *, uint32_t, const SourceInfo &);
bool emitInitThisBitFieldUint64(const Record::Field *, uint32_t, const SourceInfo &);
bool emitInitThisBitFieldIntAP(const Record::Field *, uint32_t, const SourceInfo &);
bool emitInitThisBitFieldIntAPS(const Record::Field *, uint32_t, const SourceInfo &);
bool emitInitThisBitFieldBool(const Record::Field *, uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitThisBitField(PrimType, const Record::Field *, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInitThisBitField(PrimType T0, const Record::Field * A0, uint32_t A1, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitInitThisBitFieldSint8(A0, A1, I);
  case PT_Uint8:
    return emitInitThisBitFieldUint8(A0, A1, I);
  case PT_Sint16:
    return emitInitThisBitFieldSint16(A0, A1, I);
  case PT_Uint16:
    return emitInitThisBitFieldUint16(A0, A1, I);
  case PT_Sint32:
    return emitInitThisBitFieldSint32(A0, A1, I);
  case PT_Uint32:
    return emitInitThisBitFieldUint32(A0, A1, I);
  case PT_Sint64:
    return emitInitThisBitFieldSint64(A0, A1, I);
  case PT_Uint64:
    return emitInitThisBitFieldUint64(A0, A1, I);
  case PT_IntAP:
    return emitInitThisBitFieldIntAP(A0, A1, I);
  case PT_IntAPS:
    return emitInitThisBitFieldIntAPS(A0, A1, I);
  case PT_Bool:
    return emitInitThisBitFieldBool(A0, A1, I);
  default: llvm_unreachable("invalid type: emitInitThisBitField");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitThisBitFieldSint8(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  return emitOp<const Record::Field *, uint32_t>(OP_InitThisBitFieldSint8, A0, A1, L);
}
bool ByteCodeEmitter::emitInitThisBitFieldUint8(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  return emitOp<const Record::Field *, uint32_t>(OP_InitThisBitFieldUint8, A0, A1, L);
}
bool ByteCodeEmitter::emitInitThisBitFieldSint16(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  return emitOp<const Record::Field *, uint32_t>(OP_InitThisBitFieldSint16, A0, A1, L);
}
bool ByteCodeEmitter::emitInitThisBitFieldUint16(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  return emitOp<const Record::Field *, uint32_t>(OP_InitThisBitFieldUint16, A0, A1, L);
}
bool ByteCodeEmitter::emitInitThisBitFieldSint32(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  return emitOp<const Record::Field *, uint32_t>(OP_InitThisBitFieldSint32, A0, A1, L);
}
bool ByteCodeEmitter::emitInitThisBitFieldUint32(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  return emitOp<const Record::Field *, uint32_t>(OP_InitThisBitFieldUint32, A0, A1, L);
}
bool ByteCodeEmitter::emitInitThisBitFieldSint64(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  return emitOp<const Record::Field *, uint32_t>(OP_InitThisBitFieldSint64, A0, A1, L);
}
bool ByteCodeEmitter::emitInitThisBitFieldUint64(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  return emitOp<const Record::Field *, uint32_t>(OP_InitThisBitFieldUint64, A0, A1, L);
}
bool ByteCodeEmitter::emitInitThisBitFieldIntAP(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  return emitOp<const Record::Field *, uint32_t>(OP_InitThisBitFieldIntAP, A0, A1, L);
}
bool ByteCodeEmitter::emitInitThisBitFieldIntAPS(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  return emitOp<const Record::Field *, uint32_t>(OP_InitThisBitFieldIntAPS, A0, A1, L);
}
bool ByteCodeEmitter::emitInitThisBitFieldBool(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  return emitOp<const Record::Field *, uint32_t>(OP_InitThisBitFieldBool, A0, A1, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitThisBitFieldSint8(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisBitField<PT_Sint8>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitThisBitFieldUint8(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisBitField<PT_Uint8>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitThisBitFieldSint16(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisBitField<PT_Sint16>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitThisBitFieldUint16(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisBitField<PT_Uint16>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitThisBitFieldSint32(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisBitField<PT_Sint32>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitThisBitFieldUint32(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisBitField<PT_Uint32>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitThisBitFieldSint64(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisBitField<PT_Sint64>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitThisBitFieldUint64(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisBitField<PT_Uint64>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitThisBitFieldIntAP(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisBitField<PT_IntAP>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitThisBitFieldIntAPS(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisBitField<PT_IntAPS>(S, OpPC, A0, A1);
}
bool EvalEmitter::emitInitThisBitFieldBool(const Record::Field * A0, uint32_t A1, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisBitField<PT_Bool>(S, OpPC, A0, A1);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitThisFieldSint8,
OP_InitThisFieldUint8,
OP_InitThisFieldSint16,
OP_InitThisFieldUint16,
OP_InitThisFieldSint32,
OP_InitThisFieldUint32,
OP_InitThisFieldSint64,
OP_InitThisFieldUint64,
OP_InitThisFieldIntAP,
OP_InitThisFieldIntAPS,
OP_InitThisFieldBool,
OP_InitThisFieldPtr,
OP_InitThisFieldFnPtr,
OP_InitThisFieldFloat,
#endif
#ifdef GET_INTERP
case OP_InitThisFieldSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisField<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitThisFieldSint8:
  PrintName("InitThisFieldSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldUint8:
  PrintName("InitThisFieldUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldSint16:
  PrintName("InitThisFieldSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldUint16:
  PrintName("InitThisFieldUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldSint32:
  PrintName("InitThisFieldSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldUint32:
  PrintName("InitThisFieldUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldSint64:
  PrintName("InitThisFieldSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldUint64:
  PrintName("InitThisFieldUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldIntAP:
  PrintName("InitThisFieldIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldIntAPS:
  PrintName("InitThisFieldIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldBool:
  PrintName("InitThisFieldBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldPtr:
  PrintName("InitThisFieldPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldFnPtr:
  PrintName("InitThisFieldFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldFloat:
  PrintName("InitThisFieldFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitThisFieldSint8(uint32_t, const SourceInfo &);
bool emitInitThisFieldUint8(uint32_t, const SourceInfo &);
bool emitInitThisFieldSint16(uint32_t, const SourceInfo &);
bool emitInitThisFieldUint16(uint32_t, const SourceInfo &);
bool emitInitThisFieldSint32(uint32_t, const SourceInfo &);
bool emitInitThisFieldUint32(uint32_t, const SourceInfo &);
bool emitInitThisFieldSint64(uint32_t, const SourceInfo &);
bool emitInitThisFieldUint64(uint32_t, const SourceInfo &);
bool emitInitThisFieldIntAP(uint32_t, const SourceInfo &);
bool emitInitThisFieldIntAPS(uint32_t, const SourceInfo &);
bool emitInitThisFieldBool(uint32_t, const SourceInfo &);
bool emitInitThisFieldPtr(uint32_t, const SourceInfo &);
bool emitInitThisFieldFnPtr(uint32_t, const SourceInfo &);
bool emitInitThisFieldFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitThisField(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInitThisField(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitInitThisFieldSint8(A0, I);
  case PT_Uint8:
    return emitInitThisFieldUint8(A0, I);
  case PT_Sint16:
    return emitInitThisFieldSint16(A0, I);
  case PT_Uint16:
    return emitInitThisFieldUint16(A0, I);
  case PT_Sint32:
    return emitInitThisFieldSint32(A0, I);
  case PT_Uint32:
    return emitInitThisFieldUint32(A0, I);
  case PT_Sint64:
    return emitInitThisFieldSint64(A0, I);
  case PT_Uint64:
    return emitInitThisFieldUint64(A0, I);
  case PT_IntAP:
    return emitInitThisFieldIntAP(A0, I);
  case PT_IntAPS:
    return emitInitThisFieldIntAPS(A0, I);
  case PT_Bool:
    return emitInitThisFieldBool(A0, I);
  case PT_Ptr:
    return emitInitThisFieldPtr(A0, I);
  case PT_FnPtr:
    return emitInitThisFieldFnPtr(A0, I);
  case PT_Float:
    return emitInitThisFieldFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitThisFieldSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldSint8, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldUint8, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldSint16, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldUint16, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldSint32, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldUint32, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldSint64, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldUint64, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldIntAP, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldIntAPS, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldBool, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldPtr, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldFnPtr, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitThisFieldSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisField<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InitThisFieldActiveSint8,
OP_InitThisFieldActiveUint8,
OP_InitThisFieldActiveSint16,
OP_InitThisFieldActiveUint16,
OP_InitThisFieldActiveSint32,
OP_InitThisFieldActiveUint32,
OP_InitThisFieldActiveSint64,
OP_InitThisFieldActiveUint64,
OP_InitThisFieldActiveIntAP,
OP_InitThisFieldActiveIntAPS,
OP_InitThisFieldActiveBool,
OP_InitThisFieldActivePtr,
OP_InitThisFieldActiveFnPtr,
OP_InitThisFieldActiveFloat,
#endif
#ifdef GET_INTERP
case OP_InitThisFieldActiveSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActivePtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_InitThisFieldActiveFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!InitThisFieldActive<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InitThisFieldActiveSint8:
  PrintName("InitThisFieldActiveSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveUint8:
  PrintName("InitThisFieldActiveUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveSint16:
  PrintName("InitThisFieldActiveSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveUint16:
  PrintName("InitThisFieldActiveUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveSint32:
  PrintName("InitThisFieldActiveSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveUint32:
  PrintName("InitThisFieldActiveUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveSint64:
  PrintName("InitThisFieldActiveSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveUint64:
  PrintName("InitThisFieldActiveUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveIntAP:
  PrintName("InitThisFieldActiveIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveIntAPS:
  PrintName("InitThisFieldActiveIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveBool:
  PrintName("InitThisFieldActiveBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActivePtr:
  PrintName("InitThisFieldActivePtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveFnPtr:
  PrintName("InitThisFieldActiveFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_InitThisFieldActiveFloat:
  PrintName("InitThisFieldActiveFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitThisFieldActiveSint8(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveUint8(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveSint16(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveUint16(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveSint32(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveUint32(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveSint64(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveUint64(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveIntAP(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveIntAPS(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveBool(uint32_t, const SourceInfo &);
bool emitInitThisFieldActivePtr(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveFnPtr(uint32_t, const SourceInfo &);
bool emitInitThisFieldActiveFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInitThisFieldActive(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInitThisFieldActive(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitInitThisFieldActiveSint8(A0, I);
  case PT_Uint8:
    return emitInitThisFieldActiveUint8(A0, I);
  case PT_Sint16:
    return emitInitThisFieldActiveSint16(A0, I);
  case PT_Uint16:
    return emitInitThisFieldActiveUint16(A0, I);
  case PT_Sint32:
    return emitInitThisFieldActiveSint32(A0, I);
  case PT_Uint32:
    return emitInitThisFieldActiveUint32(A0, I);
  case PT_Sint64:
    return emitInitThisFieldActiveSint64(A0, I);
  case PT_Uint64:
    return emitInitThisFieldActiveUint64(A0, I);
  case PT_IntAP:
    return emitInitThisFieldActiveIntAP(A0, I);
  case PT_IntAPS:
    return emitInitThisFieldActiveIntAPS(A0, I);
  case PT_Bool:
    return emitInitThisFieldActiveBool(A0, I);
  case PT_Ptr:
    return emitInitThisFieldActivePtr(A0, I);
  case PT_FnPtr:
    return emitInitThisFieldActiveFnPtr(A0, I);
  case PT_Float:
    return emitInitThisFieldActiveFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInitThisFieldActiveSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveSint8, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveUint8, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveSint16, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveUint16, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveSint32, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveUint32, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveSint64, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveUint64, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveIntAP, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveIntAPS, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveBool, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActivePtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActivePtr, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveFnPtr, A0, L);
}
bool ByteCodeEmitter::emitInitThisFieldActiveFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_InitThisFieldActiveFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInitThisFieldActiveSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActivePtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitInitThisFieldActiveFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InitThisFieldActive<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InvBool,
#endif
#ifdef GET_INTERP
case OP_InvBool: {
  if (!Inv<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InvBool:
  PrintName("InvBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInvBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInv(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitInv(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Bool:
    return emitInvBool(I);
  default: llvm_unreachable("invalid type: emitInv");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInvBool(const SourceInfo &L) {
  return emitOp<>(OP_InvBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInvBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Inv<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Invalid,
#endif
#ifdef GET_INTERP
case OP_Invalid: {
  if (!Invalid(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Invalid:
  PrintName("Invalid");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInvalid(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInvalid(const SourceInfo &L) {
  return emitOp<>(OP_Invalid, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInvalid(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Invalid(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InvalidCast,
#endif
#ifdef GET_INTERP
case OP_InvalidCast: {
  auto V0 = ReadArg<CastKind>(S, PC);
  if (!InvalidCast(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InvalidCast:
  PrintName("InvalidCast");
  OS << "\t" << ReadArg<CastKind>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInvalidCast(CastKind, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInvalidCast(CastKind A0, const SourceInfo &L) {
  return emitOp<CastKind>(OP_InvalidCast, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInvalidCast(CastKind A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InvalidCast(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_InvalidDeclRef,
#endif
#ifdef GET_INTERP
case OP_InvalidDeclRef: {
  auto V0 = ReadArg<const DeclRefExpr *>(S, PC);
  if (!InvalidDeclRef(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_InvalidDeclRef:
  PrintName("InvalidDeclRef");
  OS << "\t" << ReadArg<const DeclRefExpr *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitInvalidDeclRef(const DeclRefExpr *, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitInvalidDeclRef(const DeclRefExpr * A0, const SourceInfo &L) {
  return emitOp<const DeclRefExpr *>(OP_InvalidDeclRef, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitInvalidDeclRef(const DeclRefExpr * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return InvalidDeclRef(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Jf,
#endif
#ifdef GET_INTERP
case OP_Jf: {
  auto V0 = ReadArg<int32_t>(S, PC);
  if (!Jf(S, PC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Jf:
  PrintName("Jf");
  OS << "\t" << ReadArg<int32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitJf(int32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitJf(int32_t A0, const SourceInfo &L) {
  return emitOp<int32_t>(OP_Jf, A0, L);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Jmp,
#endif
#ifdef GET_INTERP
case OP_Jmp: {
  auto V0 = ReadArg<int32_t>(S, PC);
  if (!Jmp(S, PC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Jmp:
  PrintName("Jmp");
  OS << "\t" << ReadArg<int32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitJmp(int32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitJmp(int32_t A0, const SourceInfo &L) {
  return emitOp<int32_t>(OP_Jmp, A0, L);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Jt,
#endif
#ifdef GET_INTERP
case OP_Jt: {
  auto V0 = ReadArg<int32_t>(S, PC);
  if (!Jt(S, PC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Jt:
  PrintName("Jt");
  OS << "\t" << ReadArg<int32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitJt(int32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitJt(int32_t A0, const SourceInfo &L) {
  return emitOp<int32_t>(OP_Jt, A0, L);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_LESint8,
OP_LEUint8,
OP_LESint16,
OP_LEUint16,
OP_LESint32,
OP_LEUint32,
OP_LESint64,
OP_LEUint64,
OP_LEIntAP,
OP_LEIntAPS,
OP_LEBool,
OP_LEPtr,
OP_LEFloat,
OP_LEFnPtr,
#endif
#ifdef GET_INTERP
case OP_LESint8: {
  if (!LE<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_LEUint8: {
  if (!LE<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_LESint16: {
  if (!LE<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_LEUint16: {
  if (!LE<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_LESint32: {
  if (!LE<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_LEUint32: {
  if (!LE<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_LESint64: {
  if (!LE<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_LEUint64: {
  if (!LE<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_LEIntAP: {
  if (!LE<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_LEIntAPS: {
  if (!LE<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_LEBool: {
  if (!LE<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_LEPtr: {
  if (!LE<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_LEFloat: {
  if (!LE<PT_Float>(S, OpPC))
    return false;
  continue;
}
case OP_LEFnPtr: {
  if (!LE<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_LESint8:
  PrintName("LESint8");
  OS << "\t" << "\n";
  continue;
case OP_LEUint8:
  PrintName("LEUint8");
  OS << "\t" << "\n";
  continue;
case OP_LESint16:
  PrintName("LESint16");
  OS << "\t" << "\n";
  continue;
case OP_LEUint16:
  PrintName("LEUint16");
  OS << "\t" << "\n";
  continue;
case OP_LESint32:
  PrintName("LESint32");
  OS << "\t" << "\n";
  continue;
case OP_LEUint32:
  PrintName("LEUint32");
  OS << "\t" << "\n";
  continue;
case OP_LESint64:
  PrintName("LESint64");
  OS << "\t" << "\n";
  continue;
case OP_LEUint64:
  PrintName("LEUint64");
  OS << "\t" << "\n";
  continue;
case OP_LEIntAP:
  PrintName("LEIntAP");
  OS << "\t" << "\n";
  continue;
case OP_LEIntAPS:
  PrintName("LEIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_LEBool:
  PrintName("LEBool");
  OS << "\t" << "\n";
  continue;
case OP_LEPtr:
  PrintName("LEPtr");
  OS << "\t" << "\n";
  continue;
case OP_LEFloat:
  PrintName("LEFloat");
  OS << "\t" << "\n";
  continue;
case OP_LEFnPtr:
  PrintName("LEFnPtr");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitLESint8(const SourceInfo &);
bool emitLEUint8(const SourceInfo &);
bool emitLESint16(const SourceInfo &);
bool emitLEUint16(const SourceInfo &);
bool emitLESint32(const SourceInfo &);
bool emitLEUint32(const SourceInfo &);
bool emitLESint64(const SourceInfo &);
bool emitLEUint64(const SourceInfo &);
bool emitLEIntAP(const SourceInfo &);
bool emitLEIntAPS(const SourceInfo &);
bool emitLEBool(const SourceInfo &);
bool emitLEPtr(const SourceInfo &);
bool emitLEFloat(const SourceInfo &);
bool emitLEFnPtr(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitLE(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitLE(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitLESint8(I);
  case PT_Uint8:
    return emitLEUint8(I);
  case PT_Sint16:
    return emitLESint16(I);
  case PT_Uint16:
    return emitLEUint16(I);
  case PT_Sint32:
    return emitLESint32(I);
  case PT_Uint32:
    return emitLEUint32(I);
  case PT_Sint64:
    return emitLESint64(I);
  case PT_Uint64:
    return emitLEUint64(I);
  case PT_IntAP:
    return emitLEIntAP(I);
  case PT_IntAPS:
    return emitLEIntAPS(I);
  case PT_Bool:
    return emitLEBool(I);
  case PT_Ptr:
    return emitLEPtr(I);
  case PT_Float:
    return emitLEFloat(I);
  case PT_FnPtr:
    return emitLEFnPtr(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitLESint8(const SourceInfo &L) {
  return emitOp<>(OP_LESint8, L);
}
bool ByteCodeEmitter::emitLEUint8(const SourceInfo &L) {
  return emitOp<>(OP_LEUint8, L);
}
bool ByteCodeEmitter::emitLESint16(const SourceInfo &L) {
  return emitOp<>(OP_LESint16, L);
}
bool ByteCodeEmitter::emitLEUint16(const SourceInfo &L) {
  return emitOp<>(OP_LEUint16, L);
}
bool ByteCodeEmitter::emitLESint32(const SourceInfo &L) {
  return emitOp<>(OP_LESint32, L);
}
bool ByteCodeEmitter::emitLEUint32(const SourceInfo &L) {
  return emitOp<>(OP_LEUint32, L);
}
bool ByteCodeEmitter::emitLESint64(const SourceInfo &L) {
  return emitOp<>(OP_LESint64, L);
}
bool ByteCodeEmitter::emitLEUint64(const SourceInfo &L) {
  return emitOp<>(OP_LEUint64, L);
}
bool ByteCodeEmitter::emitLEIntAP(const SourceInfo &L) {
  return emitOp<>(OP_LEIntAP, L);
}
bool ByteCodeEmitter::emitLEIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_LEIntAPS, L);
}
bool ByteCodeEmitter::emitLEBool(const SourceInfo &L) {
  return emitOp<>(OP_LEBool, L);
}
bool ByteCodeEmitter::emitLEPtr(const SourceInfo &L) {
  return emitOp<>(OP_LEPtr, L);
}
bool ByteCodeEmitter::emitLEFloat(const SourceInfo &L) {
  return emitOp<>(OP_LEFloat, L);
}
bool ByteCodeEmitter::emitLEFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_LEFnPtr, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitLESint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitLEUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitLESint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitLEUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitLESint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitLEUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitLESint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitLEUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitLEIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitLEIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitLEBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitLEPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitLEFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_Float>(S, OpPC);
}
bool EvalEmitter::emitLEFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LE<PT_FnPtr>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_LTSint8,
OP_LTUint8,
OP_LTSint16,
OP_LTUint16,
OP_LTSint32,
OP_LTUint32,
OP_LTSint64,
OP_LTUint64,
OP_LTIntAP,
OP_LTIntAPS,
OP_LTBool,
OP_LTPtr,
OP_LTFloat,
OP_LTFnPtr,
#endif
#ifdef GET_INTERP
case OP_LTSint8: {
  if (!LT<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_LTUint8: {
  if (!LT<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_LTSint16: {
  if (!LT<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_LTUint16: {
  if (!LT<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_LTSint32: {
  if (!LT<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_LTUint32: {
  if (!LT<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_LTSint64: {
  if (!LT<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_LTUint64: {
  if (!LT<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_LTIntAP: {
  if (!LT<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_LTIntAPS: {
  if (!LT<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_LTBool: {
  if (!LT<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_LTPtr: {
  if (!LT<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_LTFloat: {
  if (!LT<PT_Float>(S, OpPC))
    return false;
  continue;
}
case OP_LTFnPtr: {
  if (!LT<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_LTSint8:
  PrintName("LTSint8");
  OS << "\t" << "\n";
  continue;
case OP_LTUint8:
  PrintName("LTUint8");
  OS << "\t" << "\n";
  continue;
case OP_LTSint16:
  PrintName("LTSint16");
  OS << "\t" << "\n";
  continue;
case OP_LTUint16:
  PrintName("LTUint16");
  OS << "\t" << "\n";
  continue;
case OP_LTSint32:
  PrintName("LTSint32");
  OS << "\t" << "\n";
  continue;
case OP_LTUint32:
  PrintName("LTUint32");
  OS << "\t" << "\n";
  continue;
case OP_LTSint64:
  PrintName("LTSint64");
  OS << "\t" << "\n";
  continue;
case OP_LTUint64:
  PrintName("LTUint64");
  OS << "\t" << "\n";
  continue;
case OP_LTIntAP:
  PrintName("LTIntAP");
  OS << "\t" << "\n";
  continue;
case OP_LTIntAPS:
  PrintName("LTIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_LTBool:
  PrintName("LTBool");
  OS << "\t" << "\n";
  continue;
case OP_LTPtr:
  PrintName("LTPtr");
  OS << "\t" << "\n";
  continue;
case OP_LTFloat:
  PrintName("LTFloat");
  OS << "\t" << "\n";
  continue;
case OP_LTFnPtr:
  PrintName("LTFnPtr");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitLTSint8(const SourceInfo &);
bool emitLTUint8(const SourceInfo &);
bool emitLTSint16(const SourceInfo &);
bool emitLTUint16(const SourceInfo &);
bool emitLTSint32(const SourceInfo &);
bool emitLTUint32(const SourceInfo &);
bool emitLTSint64(const SourceInfo &);
bool emitLTUint64(const SourceInfo &);
bool emitLTIntAP(const SourceInfo &);
bool emitLTIntAPS(const SourceInfo &);
bool emitLTBool(const SourceInfo &);
bool emitLTPtr(const SourceInfo &);
bool emitLTFloat(const SourceInfo &);
bool emitLTFnPtr(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitLT(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitLT(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitLTSint8(I);
  case PT_Uint8:
    return emitLTUint8(I);
  case PT_Sint16:
    return emitLTSint16(I);
  case PT_Uint16:
    return emitLTUint16(I);
  case PT_Sint32:
    return emitLTSint32(I);
  case PT_Uint32:
    return emitLTUint32(I);
  case PT_Sint64:
    return emitLTSint64(I);
  case PT_Uint64:
    return emitLTUint64(I);
  case PT_IntAP:
    return emitLTIntAP(I);
  case PT_IntAPS:
    return emitLTIntAPS(I);
  case PT_Bool:
    return emitLTBool(I);
  case PT_Ptr:
    return emitLTPtr(I);
  case PT_Float:
    return emitLTFloat(I);
  case PT_FnPtr:
    return emitLTFnPtr(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitLTSint8(const SourceInfo &L) {
  return emitOp<>(OP_LTSint8, L);
}
bool ByteCodeEmitter::emitLTUint8(const SourceInfo &L) {
  return emitOp<>(OP_LTUint8, L);
}
bool ByteCodeEmitter::emitLTSint16(const SourceInfo &L) {
  return emitOp<>(OP_LTSint16, L);
}
bool ByteCodeEmitter::emitLTUint16(const SourceInfo &L) {
  return emitOp<>(OP_LTUint16, L);
}
bool ByteCodeEmitter::emitLTSint32(const SourceInfo &L) {
  return emitOp<>(OP_LTSint32, L);
}
bool ByteCodeEmitter::emitLTUint32(const SourceInfo &L) {
  return emitOp<>(OP_LTUint32, L);
}
bool ByteCodeEmitter::emitLTSint64(const SourceInfo &L) {
  return emitOp<>(OP_LTSint64, L);
}
bool ByteCodeEmitter::emitLTUint64(const SourceInfo &L) {
  return emitOp<>(OP_LTUint64, L);
}
bool ByteCodeEmitter::emitLTIntAP(const SourceInfo &L) {
  return emitOp<>(OP_LTIntAP, L);
}
bool ByteCodeEmitter::emitLTIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_LTIntAPS, L);
}
bool ByteCodeEmitter::emitLTBool(const SourceInfo &L) {
  return emitOp<>(OP_LTBool, L);
}
bool ByteCodeEmitter::emitLTPtr(const SourceInfo &L) {
  return emitOp<>(OP_LTPtr, L);
}
bool ByteCodeEmitter::emitLTFloat(const SourceInfo &L) {
  return emitOp<>(OP_LTFloat, L);
}
bool ByteCodeEmitter::emitLTFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_LTFnPtr, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitLTSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitLTUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitLTSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitLTUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitLTSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitLTUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitLTSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitLTUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitLTIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitLTIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitLTBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitLTPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitLTFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_Float>(S, OpPC);
}
bool EvalEmitter::emitLTFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LT<PT_FnPtr>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_LoadSint8,
OP_LoadUint8,
OP_LoadSint16,
OP_LoadUint16,
OP_LoadSint32,
OP_LoadUint32,
OP_LoadSint64,
OP_LoadUint64,
OP_LoadIntAP,
OP_LoadIntAPS,
OP_LoadBool,
OP_LoadPtr,
OP_LoadFnPtr,
OP_LoadFloat,
#endif
#ifdef GET_INTERP
case OP_LoadSint8: {
  if (!Load<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_LoadUint8: {
  if (!Load<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_LoadSint16: {
  if (!Load<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_LoadUint16: {
  if (!Load<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_LoadSint32: {
  if (!Load<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_LoadUint32: {
  if (!Load<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_LoadSint64: {
  if (!Load<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_LoadUint64: {
  if (!Load<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_LoadIntAP: {
  if (!Load<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_LoadIntAPS: {
  if (!Load<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_LoadBool: {
  if (!Load<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPtr: {
  if (!Load<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_LoadFnPtr: {
  if (!Load<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
case OP_LoadFloat: {
  if (!Load<PT_Float>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_LoadSint8:
  PrintName("LoadSint8");
  OS << "\t" << "\n";
  continue;
case OP_LoadUint8:
  PrintName("LoadUint8");
  OS << "\t" << "\n";
  continue;
case OP_LoadSint16:
  PrintName("LoadSint16");
  OS << "\t" << "\n";
  continue;
case OP_LoadUint16:
  PrintName("LoadUint16");
  OS << "\t" << "\n";
  continue;
case OP_LoadSint32:
  PrintName("LoadSint32");
  OS << "\t" << "\n";
  continue;
case OP_LoadUint32:
  PrintName("LoadUint32");
  OS << "\t" << "\n";
  continue;
case OP_LoadSint64:
  PrintName("LoadSint64");
  OS << "\t" << "\n";
  continue;
case OP_LoadUint64:
  PrintName("LoadUint64");
  OS << "\t" << "\n";
  continue;
case OP_LoadIntAP:
  PrintName("LoadIntAP");
  OS << "\t" << "\n";
  continue;
case OP_LoadIntAPS:
  PrintName("LoadIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_LoadBool:
  PrintName("LoadBool");
  OS << "\t" << "\n";
  continue;
case OP_LoadPtr:
  PrintName("LoadPtr");
  OS << "\t" << "\n";
  continue;
case OP_LoadFnPtr:
  PrintName("LoadFnPtr");
  OS << "\t" << "\n";
  continue;
case OP_LoadFloat:
  PrintName("LoadFloat");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitLoadSint8(const SourceInfo &);
bool emitLoadUint8(const SourceInfo &);
bool emitLoadSint16(const SourceInfo &);
bool emitLoadUint16(const SourceInfo &);
bool emitLoadSint32(const SourceInfo &);
bool emitLoadUint32(const SourceInfo &);
bool emitLoadSint64(const SourceInfo &);
bool emitLoadUint64(const SourceInfo &);
bool emitLoadIntAP(const SourceInfo &);
bool emitLoadIntAPS(const SourceInfo &);
bool emitLoadBool(const SourceInfo &);
bool emitLoadPtr(const SourceInfo &);
bool emitLoadFnPtr(const SourceInfo &);
bool emitLoadFloat(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitLoad(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitLoad(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitLoadSint8(I);
  case PT_Uint8:
    return emitLoadUint8(I);
  case PT_Sint16:
    return emitLoadSint16(I);
  case PT_Uint16:
    return emitLoadUint16(I);
  case PT_Sint32:
    return emitLoadSint32(I);
  case PT_Uint32:
    return emitLoadUint32(I);
  case PT_Sint64:
    return emitLoadSint64(I);
  case PT_Uint64:
    return emitLoadUint64(I);
  case PT_IntAP:
    return emitLoadIntAP(I);
  case PT_IntAPS:
    return emitLoadIntAPS(I);
  case PT_Bool:
    return emitLoadBool(I);
  case PT_Ptr:
    return emitLoadPtr(I);
  case PT_FnPtr:
    return emitLoadFnPtr(I);
  case PT_Float:
    return emitLoadFloat(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitLoadSint8(const SourceInfo &L) {
  return emitOp<>(OP_LoadSint8, L);
}
bool ByteCodeEmitter::emitLoadUint8(const SourceInfo &L) {
  return emitOp<>(OP_LoadUint8, L);
}
bool ByteCodeEmitter::emitLoadSint16(const SourceInfo &L) {
  return emitOp<>(OP_LoadSint16, L);
}
bool ByteCodeEmitter::emitLoadUint16(const SourceInfo &L) {
  return emitOp<>(OP_LoadUint16, L);
}
bool ByteCodeEmitter::emitLoadSint32(const SourceInfo &L) {
  return emitOp<>(OP_LoadSint32, L);
}
bool ByteCodeEmitter::emitLoadUint32(const SourceInfo &L) {
  return emitOp<>(OP_LoadUint32, L);
}
bool ByteCodeEmitter::emitLoadSint64(const SourceInfo &L) {
  return emitOp<>(OP_LoadSint64, L);
}
bool ByteCodeEmitter::emitLoadUint64(const SourceInfo &L) {
  return emitOp<>(OP_LoadUint64, L);
}
bool ByteCodeEmitter::emitLoadIntAP(const SourceInfo &L) {
  return emitOp<>(OP_LoadIntAP, L);
}
bool ByteCodeEmitter::emitLoadIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_LoadIntAPS, L);
}
bool ByteCodeEmitter::emitLoadBool(const SourceInfo &L) {
  return emitOp<>(OP_LoadBool, L);
}
bool ByteCodeEmitter::emitLoadPtr(const SourceInfo &L) {
  return emitOp<>(OP_LoadPtr, L);
}
bool ByteCodeEmitter::emitLoadFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_LoadFnPtr, L);
}
bool ByteCodeEmitter::emitLoadFloat(const SourceInfo &L) {
  return emitOp<>(OP_LoadFloat, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitLoadSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitLoadUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitLoadSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitLoadUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitLoadSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitLoadUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitLoadSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitLoadUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitLoadIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitLoadIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitLoadBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitLoadPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitLoadFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_FnPtr>(S, OpPC);
}
bool EvalEmitter::emitLoadFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Load<PT_Float>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_LoadPopSint8,
OP_LoadPopUint8,
OP_LoadPopSint16,
OP_LoadPopUint16,
OP_LoadPopSint32,
OP_LoadPopUint32,
OP_LoadPopSint64,
OP_LoadPopUint64,
OP_LoadPopIntAP,
OP_LoadPopIntAPS,
OP_LoadPopBool,
OP_LoadPopPtr,
OP_LoadPopFnPtr,
OP_LoadPopFloat,
#endif
#ifdef GET_INTERP
case OP_LoadPopSint8: {
  if (!LoadPop<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopUint8: {
  if (!LoadPop<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopSint16: {
  if (!LoadPop<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopUint16: {
  if (!LoadPop<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopSint32: {
  if (!LoadPop<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopUint32: {
  if (!LoadPop<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopSint64: {
  if (!LoadPop<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopUint64: {
  if (!LoadPop<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopIntAP: {
  if (!LoadPop<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopIntAPS: {
  if (!LoadPop<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopBool: {
  if (!LoadPop<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopPtr: {
  if (!LoadPop<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopFnPtr: {
  if (!LoadPop<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
case OP_LoadPopFloat: {
  if (!LoadPop<PT_Float>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_LoadPopSint8:
  PrintName("LoadPopSint8");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopUint8:
  PrintName("LoadPopUint8");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopSint16:
  PrintName("LoadPopSint16");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopUint16:
  PrintName("LoadPopUint16");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopSint32:
  PrintName("LoadPopSint32");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopUint32:
  PrintName("LoadPopUint32");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopSint64:
  PrintName("LoadPopSint64");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopUint64:
  PrintName("LoadPopUint64");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopIntAP:
  PrintName("LoadPopIntAP");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopIntAPS:
  PrintName("LoadPopIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopBool:
  PrintName("LoadPopBool");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopPtr:
  PrintName("LoadPopPtr");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopFnPtr:
  PrintName("LoadPopFnPtr");
  OS << "\t" << "\n";
  continue;
case OP_LoadPopFloat:
  PrintName("LoadPopFloat");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitLoadPopSint8(const SourceInfo &);
bool emitLoadPopUint8(const SourceInfo &);
bool emitLoadPopSint16(const SourceInfo &);
bool emitLoadPopUint16(const SourceInfo &);
bool emitLoadPopSint32(const SourceInfo &);
bool emitLoadPopUint32(const SourceInfo &);
bool emitLoadPopSint64(const SourceInfo &);
bool emitLoadPopUint64(const SourceInfo &);
bool emitLoadPopIntAP(const SourceInfo &);
bool emitLoadPopIntAPS(const SourceInfo &);
bool emitLoadPopBool(const SourceInfo &);
bool emitLoadPopPtr(const SourceInfo &);
bool emitLoadPopFnPtr(const SourceInfo &);
bool emitLoadPopFloat(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitLoadPop(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitLoadPop(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitLoadPopSint8(I);
  case PT_Uint8:
    return emitLoadPopUint8(I);
  case PT_Sint16:
    return emitLoadPopSint16(I);
  case PT_Uint16:
    return emitLoadPopUint16(I);
  case PT_Sint32:
    return emitLoadPopSint32(I);
  case PT_Uint32:
    return emitLoadPopUint32(I);
  case PT_Sint64:
    return emitLoadPopSint64(I);
  case PT_Uint64:
    return emitLoadPopUint64(I);
  case PT_IntAP:
    return emitLoadPopIntAP(I);
  case PT_IntAPS:
    return emitLoadPopIntAPS(I);
  case PT_Bool:
    return emitLoadPopBool(I);
  case PT_Ptr:
    return emitLoadPopPtr(I);
  case PT_FnPtr:
    return emitLoadPopFnPtr(I);
  case PT_Float:
    return emitLoadPopFloat(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitLoadPopSint8(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopSint8, L);
}
bool ByteCodeEmitter::emitLoadPopUint8(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopUint8, L);
}
bool ByteCodeEmitter::emitLoadPopSint16(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopSint16, L);
}
bool ByteCodeEmitter::emitLoadPopUint16(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopUint16, L);
}
bool ByteCodeEmitter::emitLoadPopSint32(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopSint32, L);
}
bool ByteCodeEmitter::emitLoadPopUint32(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopUint32, L);
}
bool ByteCodeEmitter::emitLoadPopSint64(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopSint64, L);
}
bool ByteCodeEmitter::emitLoadPopUint64(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopUint64, L);
}
bool ByteCodeEmitter::emitLoadPopIntAP(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopIntAP, L);
}
bool ByteCodeEmitter::emitLoadPopIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopIntAPS, L);
}
bool ByteCodeEmitter::emitLoadPopBool(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopBool, L);
}
bool ByteCodeEmitter::emitLoadPopPtr(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopPtr, L);
}
bool ByteCodeEmitter::emitLoadPopFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopFnPtr, L);
}
bool ByteCodeEmitter::emitLoadPopFloat(const SourceInfo &L) {
  return emitOp<>(OP_LoadPopFloat, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitLoadPopSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitLoadPopUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitLoadPopSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitLoadPopUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitLoadPopSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitLoadPopUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitLoadPopSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitLoadPopUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitLoadPopIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitLoadPopIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitLoadPopBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitLoadPopPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitLoadPopFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_FnPtr>(S, OpPC);
}
bool EvalEmitter::emitLoadPopFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return LoadPop<PT_Float>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_MulSint8,
OP_MulUint8,
OP_MulSint16,
OP_MulUint16,
OP_MulSint32,
OP_MulUint32,
OP_MulSint64,
OP_MulUint64,
OP_MulIntAP,
OP_MulIntAPS,
OP_MulBool,
#endif
#ifdef GET_INTERP
case OP_MulSint8: {
  if (!Mul<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_MulUint8: {
  if (!Mul<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_MulSint16: {
  if (!Mul<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_MulUint16: {
  if (!Mul<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_MulSint32: {
  if (!Mul<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_MulUint32: {
  if (!Mul<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_MulSint64: {
  if (!Mul<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_MulUint64: {
  if (!Mul<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_MulIntAP: {
  if (!Mul<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_MulIntAPS: {
  if (!Mul<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_MulBool: {
  if (!Mul<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_MulSint8:
  PrintName("MulSint8");
  OS << "\t" << "\n";
  continue;
case OP_MulUint8:
  PrintName("MulUint8");
  OS << "\t" << "\n";
  continue;
case OP_MulSint16:
  PrintName("MulSint16");
  OS << "\t" << "\n";
  continue;
case OP_MulUint16:
  PrintName("MulUint16");
  OS << "\t" << "\n";
  continue;
case OP_MulSint32:
  PrintName("MulSint32");
  OS << "\t" << "\n";
  continue;
case OP_MulUint32:
  PrintName("MulUint32");
  OS << "\t" << "\n";
  continue;
case OP_MulSint64:
  PrintName("MulSint64");
  OS << "\t" << "\n";
  continue;
case OP_MulUint64:
  PrintName("MulUint64");
  OS << "\t" << "\n";
  continue;
case OP_MulIntAP:
  PrintName("MulIntAP");
  OS << "\t" << "\n";
  continue;
case OP_MulIntAPS:
  PrintName("MulIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_MulBool:
  PrintName("MulBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitMulSint8(const SourceInfo &);
bool emitMulUint8(const SourceInfo &);
bool emitMulSint16(const SourceInfo &);
bool emitMulUint16(const SourceInfo &);
bool emitMulSint32(const SourceInfo &);
bool emitMulUint32(const SourceInfo &);
bool emitMulSint64(const SourceInfo &);
bool emitMulUint64(const SourceInfo &);
bool emitMulIntAP(const SourceInfo &);
bool emitMulIntAPS(const SourceInfo &);
bool emitMulBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitMul(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitMul(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitMulSint8(I);
  case PT_Uint8:
    return emitMulUint8(I);
  case PT_Sint16:
    return emitMulSint16(I);
  case PT_Uint16:
    return emitMulUint16(I);
  case PT_Sint32:
    return emitMulSint32(I);
  case PT_Uint32:
    return emitMulUint32(I);
  case PT_Sint64:
    return emitMulSint64(I);
  case PT_Uint64:
    return emitMulUint64(I);
  case PT_IntAP:
    return emitMulIntAP(I);
  case PT_IntAPS:
    return emitMulIntAPS(I);
  case PT_Bool:
    return emitMulBool(I);
  default: llvm_unreachable("invalid type: emitMul");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitMulSint8(const SourceInfo &L) {
  return emitOp<>(OP_MulSint8, L);
}
bool ByteCodeEmitter::emitMulUint8(const SourceInfo &L) {
  return emitOp<>(OP_MulUint8, L);
}
bool ByteCodeEmitter::emitMulSint16(const SourceInfo &L) {
  return emitOp<>(OP_MulSint16, L);
}
bool ByteCodeEmitter::emitMulUint16(const SourceInfo &L) {
  return emitOp<>(OP_MulUint16, L);
}
bool ByteCodeEmitter::emitMulSint32(const SourceInfo &L) {
  return emitOp<>(OP_MulSint32, L);
}
bool ByteCodeEmitter::emitMulUint32(const SourceInfo &L) {
  return emitOp<>(OP_MulUint32, L);
}
bool ByteCodeEmitter::emitMulSint64(const SourceInfo &L) {
  return emitOp<>(OP_MulSint64, L);
}
bool ByteCodeEmitter::emitMulUint64(const SourceInfo &L) {
  return emitOp<>(OP_MulUint64, L);
}
bool ByteCodeEmitter::emitMulIntAP(const SourceInfo &L) {
  return emitOp<>(OP_MulIntAP, L);
}
bool ByteCodeEmitter::emitMulIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_MulIntAPS, L);
}
bool ByteCodeEmitter::emitMulBool(const SourceInfo &L) {
  return emitOp<>(OP_MulBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitMulSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mul<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitMulUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mul<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitMulSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mul<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitMulUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mul<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitMulSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mul<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitMulUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mul<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitMulSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mul<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitMulUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mul<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitMulIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mul<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitMulIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mul<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitMulBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mul<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Mulf,
#endif
#ifdef GET_INTERP
case OP_Mulf: {
  auto V0 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!Mulf(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Mulf:
  PrintName("Mulf");
  OS << "\t" << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitMulf(llvm::RoundingMode, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitMulf(llvm::RoundingMode A0, const SourceInfo &L) {
  return emitOp<llvm::RoundingMode>(OP_Mulf, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitMulf(llvm::RoundingMode A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Mulf(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_NESint8,
OP_NEUint8,
OP_NESint16,
OP_NEUint16,
OP_NESint32,
OP_NEUint32,
OP_NESint64,
OP_NEUint64,
OP_NEIntAP,
OP_NEIntAPS,
OP_NEBool,
OP_NEPtr,
OP_NEFnPtr,
OP_NEFloat,
#endif
#ifdef GET_INTERP
case OP_NESint8: {
  if (!NE<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_NEUint8: {
  if (!NE<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_NESint16: {
  if (!NE<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_NEUint16: {
  if (!NE<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_NESint32: {
  if (!NE<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_NEUint32: {
  if (!NE<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_NESint64: {
  if (!NE<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_NEUint64: {
  if (!NE<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_NEIntAP: {
  if (!NE<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_NEIntAPS: {
  if (!NE<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_NEBool: {
  if (!NE<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_NEPtr: {
  if (!NE<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_NEFnPtr: {
  if (!NE<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
case OP_NEFloat: {
  if (!NE<PT_Float>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_NESint8:
  PrintName("NESint8");
  OS << "\t" << "\n";
  continue;
case OP_NEUint8:
  PrintName("NEUint8");
  OS << "\t" << "\n";
  continue;
case OP_NESint16:
  PrintName("NESint16");
  OS << "\t" << "\n";
  continue;
case OP_NEUint16:
  PrintName("NEUint16");
  OS << "\t" << "\n";
  continue;
case OP_NESint32:
  PrintName("NESint32");
  OS << "\t" << "\n";
  continue;
case OP_NEUint32:
  PrintName("NEUint32");
  OS << "\t" << "\n";
  continue;
case OP_NESint64:
  PrintName("NESint64");
  OS << "\t" << "\n";
  continue;
case OP_NEUint64:
  PrintName("NEUint64");
  OS << "\t" << "\n";
  continue;
case OP_NEIntAP:
  PrintName("NEIntAP");
  OS << "\t" << "\n";
  continue;
case OP_NEIntAPS:
  PrintName("NEIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_NEBool:
  PrintName("NEBool");
  OS << "\t" << "\n";
  continue;
case OP_NEPtr:
  PrintName("NEPtr");
  OS << "\t" << "\n";
  continue;
case OP_NEFnPtr:
  PrintName("NEFnPtr");
  OS << "\t" << "\n";
  continue;
case OP_NEFloat:
  PrintName("NEFloat");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitNESint8(const SourceInfo &);
bool emitNEUint8(const SourceInfo &);
bool emitNESint16(const SourceInfo &);
bool emitNEUint16(const SourceInfo &);
bool emitNESint32(const SourceInfo &);
bool emitNEUint32(const SourceInfo &);
bool emitNESint64(const SourceInfo &);
bool emitNEUint64(const SourceInfo &);
bool emitNEIntAP(const SourceInfo &);
bool emitNEIntAPS(const SourceInfo &);
bool emitNEBool(const SourceInfo &);
bool emitNEPtr(const SourceInfo &);
bool emitNEFnPtr(const SourceInfo &);
bool emitNEFloat(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitNE(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitNE(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitNESint8(I);
  case PT_Uint8:
    return emitNEUint8(I);
  case PT_Sint16:
    return emitNESint16(I);
  case PT_Uint16:
    return emitNEUint16(I);
  case PT_Sint32:
    return emitNESint32(I);
  case PT_Uint32:
    return emitNEUint32(I);
  case PT_Sint64:
    return emitNESint64(I);
  case PT_Uint64:
    return emitNEUint64(I);
  case PT_IntAP:
    return emitNEIntAP(I);
  case PT_IntAPS:
    return emitNEIntAPS(I);
  case PT_Bool:
    return emitNEBool(I);
  case PT_Ptr:
    return emitNEPtr(I);
  case PT_FnPtr:
    return emitNEFnPtr(I);
  case PT_Float:
    return emitNEFloat(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitNESint8(const SourceInfo &L) {
  return emitOp<>(OP_NESint8, L);
}
bool ByteCodeEmitter::emitNEUint8(const SourceInfo &L) {
  return emitOp<>(OP_NEUint8, L);
}
bool ByteCodeEmitter::emitNESint16(const SourceInfo &L) {
  return emitOp<>(OP_NESint16, L);
}
bool ByteCodeEmitter::emitNEUint16(const SourceInfo &L) {
  return emitOp<>(OP_NEUint16, L);
}
bool ByteCodeEmitter::emitNESint32(const SourceInfo &L) {
  return emitOp<>(OP_NESint32, L);
}
bool ByteCodeEmitter::emitNEUint32(const SourceInfo &L) {
  return emitOp<>(OP_NEUint32, L);
}
bool ByteCodeEmitter::emitNESint64(const SourceInfo &L) {
  return emitOp<>(OP_NESint64, L);
}
bool ByteCodeEmitter::emitNEUint64(const SourceInfo &L) {
  return emitOp<>(OP_NEUint64, L);
}
bool ByteCodeEmitter::emitNEIntAP(const SourceInfo &L) {
  return emitOp<>(OP_NEIntAP, L);
}
bool ByteCodeEmitter::emitNEIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_NEIntAPS, L);
}
bool ByteCodeEmitter::emitNEBool(const SourceInfo &L) {
  return emitOp<>(OP_NEBool, L);
}
bool ByteCodeEmitter::emitNEPtr(const SourceInfo &L) {
  return emitOp<>(OP_NEPtr, L);
}
bool ByteCodeEmitter::emitNEFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_NEFnPtr, L);
}
bool ByteCodeEmitter::emitNEFloat(const SourceInfo &L) {
  return emitOp<>(OP_NEFloat, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitNESint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitNEUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitNESint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitNEUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitNESint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitNEUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitNESint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitNEUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitNEIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitNEIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitNEBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitNEPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitNEFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_FnPtr>(S, OpPC);
}
bool EvalEmitter::emitNEFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NE<PT_Float>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_NarrowPtr,
#endif
#ifdef GET_INTERP
case OP_NarrowPtr: {
  if (!NarrowPtr(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_NarrowPtr:
  PrintName("NarrowPtr");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitNarrowPtr(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitNarrowPtr(const SourceInfo &L) {
  return emitOp<>(OP_NarrowPtr, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitNarrowPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NarrowPtr(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_NegSint8,
OP_NegUint8,
OP_NegSint16,
OP_NegUint16,
OP_NegSint32,
OP_NegUint32,
OP_NegSint64,
OP_NegUint64,
OP_NegIntAP,
OP_NegIntAPS,
OP_NegBool,
OP_NegFloat,
#endif
#ifdef GET_INTERP
case OP_NegSint8: {
  if (!Neg<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_NegUint8: {
  if (!Neg<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_NegSint16: {
  if (!Neg<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_NegUint16: {
  if (!Neg<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_NegSint32: {
  if (!Neg<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_NegUint32: {
  if (!Neg<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_NegSint64: {
  if (!Neg<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_NegUint64: {
  if (!Neg<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_NegIntAP: {
  if (!Neg<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_NegIntAPS: {
  if (!Neg<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_NegBool: {
  if (!Neg<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_NegFloat: {
  if (!Neg<PT_Float>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_NegSint8:
  PrintName("NegSint8");
  OS << "\t" << "\n";
  continue;
case OP_NegUint8:
  PrintName("NegUint8");
  OS << "\t" << "\n";
  continue;
case OP_NegSint16:
  PrintName("NegSint16");
  OS << "\t" << "\n";
  continue;
case OP_NegUint16:
  PrintName("NegUint16");
  OS << "\t" << "\n";
  continue;
case OP_NegSint32:
  PrintName("NegSint32");
  OS << "\t" << "\n";
  continue;
case OP_NegUint32:
  PrintName("NegUint32");
  OS << "\t" << "\n";
  continue;
case OP_NegSint64:
  PrintName("NegSint64");
  OS << "\t" << "\n";
  continue;
case OP_NegUint64:
  PrintName("NegUint64");
  OS << "\t" << "\n";
  continue;
case OP_NegIntAP:
  PrintName("NegIntAP");
  OS << "\t" << "\n";
  continue;
case OP_NegIntAPS:
  PrintName("NegIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_NegBool:
  PrintName("NegBool");
  OS << "\t" << "\n";
  continue;
case OP_NegFloat:
  PrintName("NegFloat");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitNegSint8(const SourceInfo &);
bool emitNegUint8(const SourceInfo &);
bool emitNegSint16(const SourceInfo &);
bool emitNegUint16(const SourceInfo &);
bool emitNegSint32(const SourceInfo &);
bool emitNegUint32(const SourceInfo &);
bool emitNegSint64(const SourceInfo &);
bool emitNegUint64(const SourceInfo &);
bool emitNegIntAP(const SourceInfo &);
bool emitNegIntAPS(const SourceInfo &);
bool emitNegBool(const SourceInfo &);
bool emitNegFloat(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitNeg(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitNeg(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitNegSint8(I);
  case PT_Uint8:
    return emitNegUint8(I);
  case PT_Sint16:
    return emitNegSint16(I);
  case PT_Uint16:
    return emitNegUint16(I);
  case PT_Sint32:
    return emitNegSint32(I);
  case PT_Uint32:
    return emitNegUint32(I);
  case PT_Sint64:
    return emitNegSint64(I);
  case PT_Uint64:
    return emitNegUint64(I);
  case PT_IntAP:
    return emitNegIntAP(I);
  case PT_IntAPS:
    return emitNegIntAPS(I);
  case PT_Bool:
    return emitNegBool(I);
  case PT_Float:
    return emitNegFloat(I);
  default: llvm_unreachable("invalid type: emitNeg");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitNegSint8(const SourceInfo &L) {
  return emitOp<>(OP_NegSint8, L);
}
bool ByteCodeEmitter::emitNegUint8(const SourceInfo &L) {
  return emitOp<>(OP_NegUint8, L);
}
bool ByteCodeEmitter::emitNegSint16(const SourceInfo &L) {
  return emitOp<>(OP_NegSint16, L);
}
bool ByteCodeEmitter::emitNegUint16(const SourceInfo &L) {
  return emitOp<>(OP_NegUint16, L);
}
bool ByteCodeEmitter::emitNegSint32(const SourceInfo &L) {
  return emitOp<>(OP_NegSint32, L);
}
bool ByteCodeEmitter::emitNegUint32(const SourceInfo &L) {
  return emitOp<>(OP_NegUint32, L);
}
bool ByteCodeEmitter::emitNegSint64(const SourceInfo &L) {
  return emitOp<>(OP_NegSint64, L);
}
bool ByteCodeEmitter::emitNegUint64(const SourceInfo &L) {
  return emitOp<>(OP_NegUint64, L);
}
bool ByteCodeEmitter::emitNegIntAP(const SourceInfo &L) {
  return emitOp<>(OP_NegIntAP, L);
}
bool ByteCodeEmitter::emitNegIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_NegIntAPS, L);
}
bool ByteCodeEmitter::emitNegBool(const SourceInfo &L) {
  return emitOp<>(OP_NegBool, L);
}
bool ByteCodeEmitter::emitNegFloat(const SourceInfo &L) {
  return emitOp<>(OP_NegFloat, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitNegSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitNegUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitNegSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitNegUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitNegSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitNegUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitNegSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitNegUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitNegIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitNegIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitNegBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitNegFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Neg<PT_Float>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_NoRet,
#endif
#ifdef GET_INTERP
case OP_NoRet: {
  if (!NoRet(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_NoRet:
  PrintName("NoRet");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitNoRet(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitNoRet(const SourceInfo &L) {
  return emitOp<>(OP_NoRet, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitNoRet(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return NoRet(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_NullPtr,
OP_NullFnPtr,
#endif
#ifdef GET_INTERP
case OP_NullPtr: {
  if (!Null<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_NullFnPtr: {
  if (!Null<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_NullPtr:
  PrintName("NullPtr");
  OS << "\t" << "\n";
  continue;
case OP_NullFnPtr:
  PrintName("NullFnPtr");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitNullPtr(const SourceInfo &);
bool emitNullFnPtr(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitNull(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitNull(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Ptr:
    return emitNullPtr(I);
  case PT_FnPtr:
    return emitNullFnPtr(I);
  default: llvm_unreachable("invalid type: emitNull");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitNullPtr(const SourceInfo &L) {
  return emitOp<>(OP_NullPtr, L);
}
bool ByteCodeEmitter::emitNullFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_NullFnPtr, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitNullPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Null<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitNullFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Null<PT_FnPtr>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_OffsetOfSint8,
OP_OffsetOfUint8,
OP_OffsetOfSint16,
OP_OffsetOfUint16,
OP_OffsetOfSint32,
OP_OffsetOfUint32,
OP_OffsetOfSint64,
OP_OffsetOfUint64,
OP_OffsetOfIntAP,
OP_OffsetOfIntAPS,
#endif
#ifdef GET_INTERP
case OP_OffsetOfSint8: {
  auto V0 = ReadArg<const OffsetOfExpr *>(S, PC);
  if (!OffsetOf<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_OffsetOfUint8: {
  auto V0 = ReadArg<const OffsetOfExpr *>(S, PC);
  if (!OffsetOf<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_OffsetOfSint16: {
  auto V0 = ReadArg<const OffsetOfExpr *>(S, PC);
  if (!OffsetOf<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_OffsetOfUint16: {
  auto V0 = ReadArg<const OffsetOfExpr *>(S, PC);
  if (!OffsetOf<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_OffsetOfSint32: {
  auto V0 = ReadArg<const OffsetOfExpr *>(S, PC);
  if (!OffsetOf<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_OffsetOfUint32: {
  auto V0 = ReadArg<const OffsetOfExpr *>(S, PC);
  if (!OffsetOf<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_OffsetOfSint64: {
  auto V0 = ReadArg<const OffsetOfExpr *>(S, PC);
  if (!OffsetOf<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_OffsetOfUint64: {
  auto V0 = ReadArg<const OffsetOfExpr *>(S, PC);
  if (!OffsetOf<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_OffsetOfIntAP: {
  auto V0 = ReadArg<const OffsetOfExpr *>(S, PC);
  if (!OffsetOf<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_OffsetOfIntAPS: {
  auto V0 = ReadArg<const OffsetOfExpr *>(S, PC);
  if (!OffsetOf<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_OffsetOfSint8:
  PrintName("OffsetOfSint8");
  OS << "\t" << ReadArg<const OffsetOfExpr *>(P, PC) << " " << "\n";
  continue;
case OP_OffsetOfUint8:
  PrintName("OffsetOfUint8");
  OS << "\t" << ReadArg<const OffsetOfExpr *>(P, PC) << " " << "\n";
  continue;
case OP_OffsetOfSint16:
  PrintName("OffsetOfSint16");
  OS << "\t" << ReadArg<const OffsetOfExpr *>(P, PC) << " " << "\n";
  continue;
case OP_OffsetOfUint16:
  PrintName("OffsetOfUint16");
  OS << "\t" << ReadArg<const OffsetOfExpr *>(P, PC) << " " << "\n";
  continue;
case OP_OffsetOfSint32:
  PrintName("OffsetOfSint32");
  OS << "\t" << ReadArg<const OffsetOfExpr *>(P, PC) << " " << "\n";
  continue;
case OP_OffsetOfUint32:
  PrintName("OffsetOfUint32");
  OS << "\t" << ReadArg<const OffsetOfExpr *>(P, PC) << " " << "\n";
  continue;
case OP_OffsetOfSint64:
  PrintName("OffsetOfSint64");
  OS << "\t" << ReadArg<const OffsetOfExpr *>(P, PC) << " " << "\n";
  continue;
case OP_OffsetOfUint64:
  PrintName("OffsetOfUint64");
  OS << "\t" << ReadArg<const OffsetOfExpr *>(P, PC) << " " << "\n";
  continue;
case OP_OffsetOfIntAP:
  PrintName("OffsetOfIntAP");
  OS << "\t" << ReadArg<const OffsetOfExpr *>(P, PC) << " " << "\n";
  continue;
case OP_OffsetOfIntAPS:
  PrintName("OffsetOfIntAPS");
  OS << "\t" << ReadArg<const OffsetOfExpr *>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitOffsetOfSint8(const OffsetOfExpr *, const SourceInfo &);
bool emitOffsetOfUint8(const OffsetOfExpr *, const SourceInfo &);
bool emitOffsetOfSint16(const OffsetOfExpr *, const SourceInfo &);
bool emitOffsetOfUint16(const OffsetOfExpr *, const SourceInfo &);
bool emitOffsetOfSint32(const OffsetOfExpr *, const SourceInfo &);
bool emitOffsetOfUint32(const OffsetOfExpr *, const SourceInfo &);
bool emitOffsetOfSint64(const OffsetOfExpr *, const SourceInfo &);
bool emitOffsetOfUint64(const OffsetOfExpr *, const SourceInfo &);
bool emitOffsetOfIntAP(const OffsetOfExpr *, const SourceInfo &);
bool emitOffsetOfIntAPS(const OffsetOfExpr *, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitOffsetOf(PrimType, const OffsetOfExpr *, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitOffsetOf(PrimType T0, const OffsetOfExpr * A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitOffsetOfSint8(A0, I);
  case PT_Uint8:
    return emitOffsetOfUint8(A0, I);
  case PT_Sint16:
    return emitOffsetOfSint16(A0, I);
  case PT_Uint16:
    return emitOffsetOfUint16(A0, I);
  case PT_Sint32:
    return emitOffsetOfSint32(A0, I);
  case PT_Uint32:
    return emitOffsetOfUint32(A0, I);
  case PT_Sint64:
    return emitOffsetOfSint64(A0, I);
  case PT_Uint64:
    return emitOffsetOfUint64(A0, I);
  case PT_IntAP:
    return emitOffsetOfIntAP(A0, I);
  case PT_IntAPS:
    return emitOffsetOfIntAPS(A0, I);
  default: llvm_unreachable("invalid type: emitOffsetOf");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitOffsetOfSint8(const OffsetOfExpr * A0, const SourceInfo &L) {
  return emitOp<const OffsetOfExpr *>(OP_OffsetOfSint8, A0, L);
}
bool ByteCodeEmitter::emitOffsetOfUint8(const OffsetOfExpr * A0, const SourceInfo &L) {
  return emitOp<const OffsetOfExpr *>(OP_OffsetOfUint8, A0, L);
}
bool ByteCodeEmitter::emitOffsetOfSint16(const OffsetOfExpr * A0, const SourceInfo &L) {
  return emitOp<const OffsetOfExpr *>(OP_OffsetOfSint16, A0, L);
}
bool ByteCodeEmitter::emitOffsetOfUint16(const OffsetOfExpr * A0, const SourceInfo &L) {
  return emitOp<const OffsetOfExpr *>(OP_OffsetOfUint16, A0, L);
}
bool ByteCodeEmitter::emitOffsetOfSint32(const OffsetOfExpr * A0, const SourceInfo &L) {
  return emitOp<const OffsetOfExpr *>(OP_OffsetOfSint32, A0, L);
}
bool ByteCodeEmitter::emitOffsetOfUint32(const OffsetOfExpr * A0, const SourceInfo &L) {
  return emitOp<const OffsetOfExpr *>(OP_OffsetOfUint32, A0, L);
}
bool ByteCodeEmitter::emitOffsetOfSint64(const OffsetOfExpr * A0, const SourceInfo &L) {
  return emitOp<const OffsetOfExpr *>(OP_OffsetOfSint64, A0, L);
}
bool ByteCodeEmitter::emitOffsetOfUint64(const OffsetOfExpr * A0, const SourceInfo &L) {
  return emitOp<const OffsetOfExpr *>(OP_OffsetOfUint64, A0, L);
}
bool ByteCodeEmitter::emitOffsetOfIntAP(const OffsetOfExpr * A0, const SourceInfo &L) {
  return emitOp<const OffsetOfExpr *>(OP_OffsetOfIntAP, A0, L);
}
bool ByteCodeEmitter::emitOffsetOfIntAPS(const OffsetOfExpr * A0, const SourceInfo &L) {
  return emitOp<const OffsetOfExpr *>(OP_OffsetOfIntAPS, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitOffsetOfSint8(const OffsetOfExpr * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return OffsetOf<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitOffsetOfUint8(const OffsetOfExpr * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return OffsetOf<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitOffsetOfSint16(const OffsetOfExpr * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return OffsetOf<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitOffsetOfUint16(const OffsetOfExpr * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return OffsetOf<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitOffsetOfSint32(const OffsetOfExpr * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return OffsetOf<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitOffsetOfUint32(const OffsetOfExpr * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return OffsetOf<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitOffsetOfSint64(const OffsetOfExpr * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return OffsetOf<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitOffsetOfUint64(const OffsetOfExpr * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return OffsetOf<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitOffsetOfIntAP(const OffsetOfExpr * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return OffsetOf<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitOffsetOfIntAPS(const OffsetOfExpr * A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return OffsetOf<PT_IntAPS>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_PopSint8,
OP_PopUint8,
OP_PopSint16,
OP_PopUint16,
OP_PopSint32,
OP_PopUint32,
OP_PopSint64,
OP_PopUint64,
OP_PopIntAP,
OP_PopIntAPS,
OP_PopBool,
OP_PopPtr,
OP_PopFnPtr,
OP_PopFloat,
#endif
#ifdef GET_INTERP
case OP_PopSint8: {
  if (!Pop<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_PopUint8: {
  if (!Pop<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_PopSint16: {
  if (!Pop<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_PopUint16: {
  if (!Pop<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_PopSint32: {
  if (!Pop<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_PopUint32: {
  if (!Pop<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_PopSint64: {
  if (!Pop<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_PopUint64: {
  if (!Pop<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_PopIntAP: {
  if (!Pop<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_PopIntAPS: {
  if (!Pop<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_PopBool: {
  if (!Pop<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_PopPtr: {
  if (!Pop<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_PopFnPtr: {
  if (!Pop<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
case OP_PopFloat: {
  if (!Pop<PT_Float>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_PopSint8:
  PrintName("PopSint8");
  OS << "\t" << "\n";
  continue;
case OP_PopUint8:
  PrintName("PopUint8");
  OS << "\t" << "\n";
  continue;
case OP_PopSint16:
  PrintName("PopSint16");
  OS << "\t" << "\n";
  continue;
case OP_PopUint16:
  PrintName("PopUint16");
  OS << "\t" << "\n";
  continue;
case OP_PopSint32:
  PrintName("PopSint32");
  OS << "\t" << "\n";
  continue;
case OP_PopUint32:
  PrintName("PopUint32");
  OS << "\t" << "\n";
  continue;
case OP_PopSint64:
  PrintName("PopSint64");
  OS << "\t" << "\n";
  continue;
case OP_PopUint64:
  PrintName("PopUint64");
  OS << "\t" << "\n";
  continue;
case OP_PopIntAP:
  PrintName("PopIntAP");
  OS << "\t" << "\n";
  continue;
case OP_PopIntAPS:
  PrintName("PopIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_PopBool:
  PrintName("PopBool");
  OS << "\t" << "\n";
  continue;
case OP_PopPtr:
  PrintName("PopPtr");
  OS << "\t" << "\n";
  continue;
case OP_PopFnPtr:
  PrintName("PopFnPtr");
  OS << "\t" << "\n";
  continue;
case OP_PopFloat:
  PrintName("PopFloat");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitPopSint8(const SourceInfo &);
bool emitPopUint8(const SourceInfo &);
bool emitPopSint16(const SourceInfo &);
bool emitPopUint16(const SourceInfo &);
bool emitPopSint32(const SourceInfo &);
bool emitPopUint32(const SourceInfo &);
bool emitPopSint64(const SourceInfo &);
bool emitPopUint64(const SourceInfo &);
bool emitPopIntAP(const SourceInfo &);
bool emitPopIntAPS(const SourceInfo &);
bool emitPopBool(const SourceInfo &);
bool emitPopPtr(const SourceInfo &);
bool emitPopFnPtr(const SourceInfo &);
bool emitPopFloat(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitPop(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitPop(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitPopSint8(I);
  case PT_Uint8:
    return emitPopUint8(I);
  case PT_Sint16:
    return emitPopSint16(I);
  case PT_Uint16:
    return emitPopUint16(I);
  case PT_Sint32:
    return emitPopSint32(I);
  case PT_Uint32:
    return emitPopUint32(I);
  case PT_Sint64:
    return emitPopSint64(I);
  case PT_Uint64:
    return emitPopUint64(I);
  case PT_IntAP:
    return emitPopIntAP(I);
  case PT_IntAPS:
    return emitPopIntAPS(I);
  case PT_Bool:
    return emitPopBool(I);
  case PT_Ptr:
    return emitPopPtr(I);
  case PT_FnPtr:
    return emitPopFnPtr(I);
  case PT_Float:
    return emitPopFloat(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitPopSint8(const SourceInfo &L) {
  return emitOp<>(OP_PopSint8, L);
}
bool ByteCodeEmitter::emitPopUint8(const SourceInfo &L) {
  return emitOp<>(OP_PopUint8, L);
}
bool ByteCodeEmitter::emitPopSint16(const SourceInfo &L) {
  return emitOp<>(OP_PopSint16, L);
}
bool ByteCodeEmitter::emitPopUint16(const SourceInfo &L) {
  return emitOp<>(OP_PopUint16, L);
}
bool ByteCodeEmitter::emitPopSint32(const SourceInfo &L) {
  return emitOp<>(OP_PopSint32, L);
}
bool ByteCodeEmitter::emitPopUint32(const SourceInfo &L) {
  return emitOp<>(OP_PopUint32, L);
}
bool ByteCodeEmitter::emitPopSint64(const SourceInfo &L) {
  return emitOp<>(OP_PopSint64, L);
}
bool ByteCodeEmitter::emitPopUint64(const SourceInfo &L) {
  return emitOp<>(OP_PopUint64, L);
}
bool ByteCodeEmitter::emitPopIntAP(const SourceInfo &L) {
  return emitOp<>(OP_PopIntAP, L);
}
bool ByteCodeEmitter::emitPopIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_PopIntAPS, L);
}
bool ByteCodeEmitter::emitPopBool(const SourceInfo &L) {
  return emitOp<>(OP_PopBool, L);
}
bool ByteCodeEmitter::emitPopPtr(const SourceInfo &L) {
  return emitOp<>(OP_PopPtr, L);
}
bool ByteCodeEmitter::emitPopFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_PopFnPtr, L);
}
bool ByteCodeEmitter::emitPopFloat(const SourceInfo &L) {
  return emitOp<>(OP_PopFloat, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitPopSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitPopUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitPopSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitPopUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitPopSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitPopUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitPopSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitPopUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitPopIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitPopIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitPopBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitPopPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitPopFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_FnPtr>(S, OpPC);
}
bool EvalEmitter::emitPopFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Pop<PT_Float>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_RVOPtr,
#endif
#ifdef GET_INTERP
case OP_RVOPtr: {
  if (!RVOPtr(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_RVOPtr:
  PrintName("RVOPtr");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitRVOPtr(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitRVOPtr(const SourceInfo &L) {
  return emitOp<>(OP_RVOPtr, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitRVOPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return RVOPtr(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_RemSint8,
OP_RemUint8,
OP_RemSint16,
OP_RemUint16,
OP_RemSint32,
OP_RemUint32,
OP_RemSint64,
OP_RemUint64,
OP_RemIntAP,
OP_RemIntAPS,
#endif
#ifdef GET_INTERP
case OP_RemSint8: {
  if (!Rem<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_RemUint8: {
  if (!Rem<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_RemSint16: {
  if (!Rem<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_RemUint16: {
  if (!Rem<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_RemSint32: {
  if (!Rem<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_RemUint32: {
  if (!Rem<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_RemSint64: {
  if (!Rem<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_RemUint64: {
  if (!Rem<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_RemIntAP: {
  if (!Rem<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_RemIntAPS: {
  if (!Rem<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_RemSint8:
  PrintName("RemSint8");
  OS << "\t" << "\n";
  continue;
case OP_RemUint8:
  PrintName("RemUint8");
  OS << "\t" << "\n";
  continue;
case OP_RemSint16:
  PrintName("RemSint16");
  OS << "\t" << "\n";
  continue;
case OP_RemUint16:
  PrintName("RemUint16");
  OS << "\t" << "\n";
  continue;
case OP_RemSint32:
  PrintName("RemSint32");
  OS << "\t" << "\n";
  continue;
case OP_RemUint32:
  PrintName("RemUint32");
  OS << "\t" << "\n";
  continue;
case OP_RemSint64:
  PrintName("RemSint64");
  OS << "\t" << "\n";
  continue;
case OP_RemUint64:
  PrintName("RemUint64");
  OS << "\t" << "\n";
  continue;
case OP_RemIntAP:
  PrintName("RemIntAP");
  OS << "\t" << "\n";
  continue;
case OP_RemIntAPS:
  PrintName("RemIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitRemSint8(const SourceInfo &);
bool emitRemUint8(const SourceInfo &);
bool emitRemSint16(const SourceInfo &);
bool emitRemUint16(const SourceInfo &);
bool emitRemSint32(const SourceInfo &);
bool emitRemUint32(const SourceInfo &);
bool emitRemSint64(const SourceInfo &);
bool emitRemUint64(const SourceInfo &);
bool emitRemIntAP(const SourceInfo &);
bool emitRemIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitRem(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitRem(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitRemSint8(I);
  case PT_Uint8:
    return emitRemUint8(I);
  case PT_Sint16:
    return emitRemSint16(I);
  case PT_Uint16:
    return emitRemUint16(I);
  case PT_Sint32:
    return emitRemSint32(I);
  case PT_Uint32:
    return emitRemUint32(I);
  case PT_Sint64:
    return emitRemSint64(I);
  case PT_Uint64:
    return emitRemUint64(I);
  case PT_IntAP:
    return emitRemIntAP(I);
  case PT_IntAPS:
    return emitRemIntAPS(I);
  default: llvm_unreachable("invalid type: emitRem");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitRemSint8(const SourceInfo &L) {
  return emitOp<>(OP_RemSint8, L);
}
bool ByteCodeEmitter::emitRemUint8(const SourceInfo &L) {
  return emitOp<>(OP_RemUint8, L);
}
bool ByteCodeEmitter::emitRemSint16(const SourceInfo &L) {
  return emitOp<>(OP_RemSint16, L);
}
bool ByteCodeEmitter::emitRemUint16(const SourceInfo &L) {
  return emitOp<>(OP_RemUint16, L);
}
bool ByteCodeEmitter::emitRemSint32(const SourceInfo &L) {
  return emitOp<>(OP_RemSint32, L);
}
bool ByteCodeEmitter::emitRemUint32(const SourceInfo &L) {
  return emitOp<>(OP_RemUint32, L);
}
bool ByteCodeEmitter::emitRemSint64(const SourceInfo &L) {
  return emitOp<>(OP_RemSint64, L);
}
bool ByteCodeEmitter::emitRemUint64(const SourceInfo &L) {
  return emitOp<>(OP_RemUint64, L);
}
bool ByteCodeEmitter::emitRemIntAP(const SourceInfo &L) {
  return emitOp<>(OP_RemIntAP, L);
}
bool ByteCodeEmitter::emitRemIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_RemIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitRemSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Rem<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitRemUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Rem<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitRemSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Rem<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitRemUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Rem<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitRemSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Rem<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitRemUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Rem<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitRemSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Rem<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitRemUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Rem<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitRemIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Rem<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitRemIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Rem<PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_RetSint8,
OP_RetUint8,
OP_RetSint16,
OP_RetUint16,
OP_RetSint32,
OP_RetUint32,
OP_RetSint64,
OP_RetUint64,
OP_RetIntAP,
OP_RetIntAPS,
OP_RetBool,
OP_RetPtr,
OP_RetFnPtr,
OP_RetFloat,
#endif
#ifdef GET_INTERP
case OP_RetSint8: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_Sint8>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetUint8: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_Uint8>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetSint16: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_Sint16>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetUint16: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_Uint16>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetSint32: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_Sint32>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetUint32: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_Uint32>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetSint64: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_Sint64>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetUint64: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_Uint64>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetIntAP: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_IntAP>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetIntAPS: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_IntAPS>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetBool: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_Bool>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetPtr: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_Ptr>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetFnPtr: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_FnPtr>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
case OP_RetFloat: {
  bool DoReturn = (S.Current == StartFrame);
  if (!Ret<PT_Float>(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_RetSint8:
  PrintName("RetSint8");
  OS << "\t" << "\n";
  continue;
case OP_RetUint8:
  PrintName("RetUint8");
  OS << "\t" << "\n";
  continue;
case OP_RetSint16:
  PrintName("RetSint16");
  OS << "\t" << "\n";
  continue;
case OP_RetUint16:
  PrintName("RetUint16");
  OS << "\t" << "\n";
  continue;
case OP_RetSint32:
  PrintName("RetSint32");
  OS << "\t" << "\n";
  continue;
case OP_RetUint32:
  PrintName("RetUint32");
  OS << "\t" << "\n";
  continue;
case OP_RetSint64:
  PrintName("RetSint64");
  OS << "\t" << "\n";
  continue;
case OP_RetUint64:
  PrintName("RetUint64");
  OS << "\t" << "\n";
  continue;
case OP_RetIntAP:
  PrintName("RetIntAP");
  OS << "\t" << "\n";
  continue;
case OP_RetIntAPS:
  PrintName("RetIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_RetBool:
  PrintName("RetBool");
  OS << "\t" << "\n";
  continue;
case OP_RetPtr:
  PrintName("RetPtr");
  OS << "\t" << "\n";
  continue;
case OP_RetFnPtr:
  PrintName("RetFnPtr");
  OS << "\t" << "\n";
  continue;
case OP_RetFloat:
  PrintName("RetFloat");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitRetSint8(const SourceInfo &);
bool emitRetUint8(const SourceInfo &);
bool emitRetSint16(const SourceInfo &);
bool emitRetUint16(const SourceInfo &);
bool emitRetSint32(const SourceInfo &);
bool emitRetUint32(const SourceInfo &);
bool emitRetSint64(const SourceInfo &);
bool emitRetUint64(const SourceInfo &);
bool emitRetIntAP(const SourceInfo &);
bool emitRetIntAPS(const SourceInfo &);
bool emitRetBool(const SourceInfo &);
bool emitRetPtr(const SourceInfo &);
bool emitRetFnPtr(const SourceInfo &);
bool emitRetFloat(const SourceInfo &);
#if defined(GET_EVAL_PROTO)
template<PrimType>
bool emitRet(const SourceInfo &);
#endif
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitRet(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitRet(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
#ifdef GET_LINK_IMPL
    return emitRetSint8
#else
    return emitRet<PT_Sint8>
#endif
      (I);
  case PT_Uint8:
#ifdef GET_LINK_IMPL
    return emitRetUint8
#else
    return emitRet<PT_Uint8>
#endif
      (I);
  case PT_Sint16:
#ifdef GET_LINK_IMPL
    return emitRetSint16
#else
    return emitRet<PT_Sint16>
#endif
      (I);
  case PT_Uint16:
#ifdef GET_LINK_IMPL
    return emitRetUint16
#else
    return emitRet<PT_Uint16>
#endif
      (I);
  case PT_Sint32:
#ifdef GET_LINK_IMPL
    return emitRetSint32
#else
    return emitRet<PT_Sint32>
#endif
      (I);
  case PT_Uint32:
#ifdef GET_LINK_IMPL
    return emitRetUint32
#else
    return emitRet<PT_Uint32>
#endif
      (I);
  case PT_Sint64:
#ifdef GET_LINK_IMPL
    return emitRetSint64
#else
    return emitRet<PT_Sint64>
#endif
      (I);
  case PT_Uint64:
#ifdef GET_LINK_IMPL
    return emitRetUint64
#else
    return emitRet<PT_Uint64>
#endif
      (I);
  case PT_IntAP:
#ifdef GET_LINK_IMPL
    return emitRetIntAP
#else
    return emitRet<PT_IntAP>
#endif
      (I);
  case PT_IntAPS:
#ifdef GET_LINK_IMPL
    return emitRetIntAPS
#else
    return emitRet<PT_IntAPS>
#endif
      (I);
  case PT_Bool:
#ifdef GET_LINK_IMPL
    return emitRetBool
#else
    return emitRet<PT_Bool>
#endif
      (I);
  case PT_Ptr:
#ifdef GET_LINK_IMPL
    return emitRetPtr
#else
    return emitRet<PT_Ptr>
#endif
      (I);
  case PT_FnPtr:
#ifdef GET_LINK_IMPL
    return emitRetFnPtr
#else
    return emitRet<PT_FnPtr>
#endif
      (I);
  case PT_Float:
#ifdef GET_LINK_IMPL
    return emitRetFloat
#else
    return emitRet<PT_Float>
#endif
      (I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitRetSint8(const SourceInfo &L) {
  return emitOp<>(OP_RetSint8, L);
}
bool ByteCodeEmitter::emitRetUint8(const SourceInfo &L) {
  return emitOp<>(OP_RetUint8, L);
}
bool ByteCodeEmitter::emitRetSint16(const SourceInfo &L) {
  return emitOp<>(OP_RetSint16, L);
}
bool ByteCodeEmitter::emitRetUint16(const SourceInfo &L) {
  return emitOp<>(OP_RetUint16, L);
}
bool ByteCodeEmitter::emitRetSint32(const SourceInfo &L) {
  return emitOp<>(OP_RetSint32, L);
}
bool ByteCodeEmitter::emitRetUint32(const SourceInfo &L) {
  return emitOp<>(OP_RetUint32, L);
}
bool ByteCodeEmitter::emitRetSint64(const SourceInfo &L) {
  return emitOp<>(OP_RetSint64, L);
}
bool ByteCodeEmitter::emitRetUint64(const SourceInfo &L) {
  return emitOp<>(OP_RetUint64, L);
}
bool ByteCodeEmitter::emitRetIntAP(const SourceInfo &L) {
  return emitOp<>(OP_RetIntAP, L);
}
bool ByteCodeEmitter::emitRetIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_RetIntAPS, L);
}
bool ByteCodeEmitter::emitRetBool(const SourceInfo &L) {
  return emitOp<>(OP_RetBool, L);
}
bool ByteCodeEmitter::emitRetPtr(const SourceInfo &L) {
  return emitOp<>(OP_RetPtr, L);
}
bool ByteCodeEmitter::emitRetFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_RetFnPtr, L);
}
bool ByteCodeEmitter::emitRetFloat(const SourceInfo &L) {
  return emitOp<>(OP_RetFloat, L);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_RetValue,
#endif
#ifdef GET_INTERP
case OP_RetValue: {
  bool DoReturn = (S.Current == StartFrame);
  if (!RetValue(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_RetValue:
  PrintName("RetValue");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitRetValue(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitRetValue(const SourceInfo &L) {
  return emitOp<>(OP_RetValue, L);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_RetVoid,
#endif
#ifdef GET_INTERP
case OP_RetVoid: {
  bool DoReturn = (S.Current == StartFrame);
  if (!RetVoid(S, PC, Result))
    return false;
  if (!S.Current || S.Current->isRoot())
    return true;
  if (DoReturn)
    return true;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_RetVoid:
  PrintName("RetVoid");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitRetVoid(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitRetVoid(const SourceInfo &L) {
  return emitOp<>(OP_RetVoid, L);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_SetFieldSint8,
OP_SetFieldUint8,
OP_SetFieldSint16,
OP_SetFieldUint16,
OP_SetFieldSint32,
OP_SetFieldUint32,
OP_SetFieldSint64,
OP_SetFieldUint64,
OP_SetFieldIntAP,
OP_SetFieldIntAPS,
OP_SetFieldBool,
OP_SetFieldPtr,
OP_SetFieldFnPtr,
OP_SetFieldFloat,
#endif
#ifdef GET_INTERP
case OP_SetFieldSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetFieldFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetField<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_SetFieldSint8:
  PrintName("SetFieldSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldUint8:
  PrintName("SetFieldUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldSint16:
  PrintName("SetFieldSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldUint16:
  PrintName("SetFieldUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldSint32:
  PrintName("SetFieldSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldUint32:
  PrintName("SetFieldUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldSint64:
  PrintName("SetFieldSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldUint64:
  PrintName("SetFieldUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldIntAP:
  PrintName("SetFieldIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldIntAPS:
  PrintName("SetFieldIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldBool:
  PrintName("SetFieldBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldPtr:
  PrintName("SetFieldPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldFnPtr:
  PrintName("SetFieldFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetFieldFloat:
  PrintName("SetFieldFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSetFieldSint8(uint32_t, const SourceInfo &);
bool emitSetFieldUint8(uint32_t, const SourceInfo &);
bool emitSetFieldSint16(uint32_t, const SourceInfo &);
bool emitSetFieldUint16(uint32_t, const SourceInfo &);
bool emitSetFieldSint32(uint32_t, const SourceInfo &);
bool emitSetFieldUint32(uint32_t, const SourceInfo &);
bool emitSetFieldSint64(uint32_t, const SourceInfo &);
bool emitSetFieldUint64(uint32_t, const SourceInfo &);
bool emitSetFieldIntAP(uint32_t, const SourceInfo &);
bool emitSetFieldIntAPS(uint32_t, const SourceInfo &);
bool emitSetFieldBool(uint32_t, const SourceInfo &);
bool emitSetFieldPtr(uint32_t, const SourceInfo &);
bool emitSetFieldFnPtr(uint32_t, const SourceInfo &);
bool emitSetFieldFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSetField(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitSetField(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitSetFieldSint8(A0, I);
  case PT_Uint8:
    return emitSetFieldUint8(A0, I);
  case PT_Sint16:
    return emitSetFieldSint16(A0, I);
  case PT_Uint16:
    return emitSetFieldUint16(A0, I);
  case PT_Sint32:
    return emitSetFieldSint32(A0, I);
  case PT_Uint32:
    return emitSetFieldUint32(A0, I);
  case PT_Sint64:
    return emitSetFieldSint64(A0, I);
  case PT_Uint64:
    return emitSetFieldUint64(A0, I);
  case PT_IntAP:
    return emitSetFieldIntAP(A0, I);
  case PT_IntAPS:
    return emitSetFieldIntAPS(A0, I);
  case PT_Bool:
    return emitSetFieldBool(A0, I);
  case PT_Ptr:
    return emitSetFieldPtr(A0, I);
  case PT_FnPtr:
    return emitSetFieldFnPtr(A0, I);
  case PT_Float:
    return emitSetFieldFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitSetFieldSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldSint8, A0, L);
}
bool ByteCodeEmitter::emitSetFieldUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldUint8, A0, L);
}
bool ByteCodeEmitter::emitSetFieldSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldSint16, A0, L);
}
bool ByteCodeEmitter::emitSetFieldUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldUint16, A0, L);
}
bool ByteCodeEmitter::emitSetFieldSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldSint32, A0, L);
}
bool ByteCodeEmitter::emitSetFieldUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldUint32, A0, L);
}
bool ByteCodeEmitter::emitSetFieldSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldSint64, A0, L);
}
bool ByteCodeEmitter::emitSetFieldUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldUint64, A0, L);
}
bool ByteCodeEmitter::emitSetFieldIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldIntAP, A0, L);
}
bool ByteCodeEmitter::emitSetFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldIntAPS, A0, L);
}
bool ByteCodeEmitter::emitSetFieldBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldBool, A0, L);
}
bool ByteCodeEmitter::emitSetFieldPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldPtr, A0, L);
}
bool ByteCodeEmitter::emitSetFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldFnPtr, A0, L);
}
bool ByteCodeEmitter::emitSetFieldFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetFieldFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitSetFieldSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitSetFieldFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetField<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_SetGlobalSint8,
OP_SetGlobalUint8,
OP_SetGlobalSint16,
OP_SetGlobalUint16,
OP_SetGlobalSint32,
OP_SetGlobalUint32,
OP_SetGlobalSint64,
OP_SetGlobalUint64,
OP_SetGlobalIntAP,
OP_SetGlobalIntAPS,
OP_SetGlobalBool,
OP_SetGlobalPtr,
OP_SetGlobalFnPtr,
OP_SetGlobalFloat,
#endif
#ifdef GET_INTERP
case OP_SetGlobalSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetGlobalFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetGlobal<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_SetGlobalSint8:
  PrintName("SetGlobalSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalUint8:
  PrintName("SetGlobalUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalSint16:
  PrintName("SetGlobalSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalUint16:
  PrintName("SetGlobalUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalSint32:
  PrintName("SetGlobalSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalUint32:
  PrintName("SetGlobalUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalSint64:
  PrintName("SetGlobalSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalUint64:
  PrintName("SetGlobalUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalIntAP:
  PrintName("SetGlobalIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalIntAPS:
  PrintName("SetGlobalIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalBool:
  PrintName("SetGlobalBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalPtr:
  PrintName("SetGlobalPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalFnPtr:
  PrintName("SetGlobalFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetGlobalFloat:
  PrintName("SetGlobalFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSetGlobalSint8(uint32_t, const SourceInfo &);
bool emitSetGlobalUint8(uint32_t, const SourceInfo &);
bool emitSetGlobalSint16(uint32_t, const SourceInfo &);
bool emitSetGlobalUint16(uint32_t, const SourceInfo &);
bool emitSetGlobalSint32(uint32_t, const SourceInfo &);
bool emitSetGlobalUint32(uint32_t, const SourceInfo &);
bool emitSetGlobalSint64(uint32_t, const SourceInfo &);
bool emitSetGlobalUint64(uint32_t, const SourceInfo &);
bool emitSetGlobalIntAP(uint32_t, const SourceInfo &);
bool emitSetGlobalIntAPS(uint32_t, const SourceInfo &);
bool emitSetGlobalBool(uint32_t, const SourceInfo &);
bool emitSetGlobalPtr(uint32_t, const SourceInfo &);
bool emitSetGlobalFnPtr(uint32_t, const SourceInfo &);
bool emitSetGlobalFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSetGlobal(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitSetGlobal(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitSetGlobalSint8(A0, I);
  case PT_Uint8:
    return emitSetGlobalUint8(A0, I);
  case PT_Sint16:
    return emitSetGlobalSint16(A0, I);
  case PT_Uint16:
    return emitSetGlobalUint16(A0, I);
  case PT_Sint32:
    return emitSetGlobalSint32(A0, I);
  case PT_Uint32:
    return emitSetGlobalUint32(A0, I);
  case PT_Sint64:
    return emitSetGlobalSint64(A0, I);
  case PT_Uint64:
    return emitSetGlobalUint64(A0, I);
  case PT_IntAP:
    return emitSetGlobalIntAP(A0, I);
  case PT_IntAPS:
    return emitSetGlobalIntAPS(A0, I);
  case PT_Bool:
    return emitSetGlobalBool(A0, I);
  case PT_Ptr:
    return emitSetGlobalPtr(A0, I);
  case PT_FnPtr:
    return emitSetGlobalFnPtr(A0, I);
  case PT_Float:
    return emitSetGlobalFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitSetGlobalSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalSint8, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalUint8, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalSint16, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalUint16, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalSint32, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalUint32, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalSint64, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalUint64, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalIntAP, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalIntAPS, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalBool, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalPtr, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalFnPtr, A0, L);
}
bool ByteCodeEmitter::emitSetGlobalFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetGlobalFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitSetGlobalSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitSetGlobalFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetGlobal<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_SetLocalSint8,
OP_SetLocalUint8,
OP_SetLocalSint16,
OP_SetLocalUint16,
OP_SetLocalSint32,
OP_SetLocalUint32,
OP_SetLocalSint64,
OP_SetLocalUint64,
OP_SetLocalIntAP,
OP_SetLocalIntAPS,
OP_SetLocalBool,
OP_SetLocalPtr,
OP_SetLocalFnPtr,
OP_SetLocalFloat,
#endif
#ifdef GET_INTERP
case OP_SetLocalSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetLocalFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetLocal<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_SetLocalSint8:
  PrintName("SetLocalSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalUint8:
  PrintName("SetLocalUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalSint16:
  PrintName("SetLocalSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalUint16:
  PrintName("SetLocalUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalSint32:
  PrintName("SetLocalSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalUint32:
  PrintName("SetLocalUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalSint64:
  PrintName("SetLocalSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalUint64:
  PrintName("SetLocalUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalIntAP:
  PrintName("SetLocalIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalIntAPS:
  PrintName("SetLocalIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalBool:
  PrintName("SetLocalBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalPtr:
  PrintName("SetLocalPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalFnPtr:
  PrintName("SetLocalFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetLocalFloat:
  PrintName("SetLocalFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSetLocalSint8(uint32_t, const SourceInfo &);
bool emitSetLocalUint8(uint32_t, const SourceInfo &);
bool emitSetLocalSint16(uint32_t, const SourceInfo &);
bool emitSetLocalUint16(uint32_t, const SourceInfo &);
bool emitSetLocalSint32(uint32_t, const SourceInfo &);
bool emitSetLocalUint32(uint32_t, const SourceInfo &);
bool emitSetLocalSint64(uint32_t, const SourceInfo &);
bool emitSetLocalUint64(uint32_t, const SourceInfo &);
bool emitSetLocalIntAP(uint32_t, const SourceInfo &);
bool emitSetLocalIntAPS(uint32_t, const SourceInfo &);
bool emitSetLocalBool(uint32_t, const SourceInfo &);
bool emitSetLocalPtr(uint32_t, const SourceInfo &);
bool emitSetLocalFnPtr(uint32_t, const SourceInfo &);
bool emitSetLocalFloat(uint32_t, const SourceInfo &);
#if defined(GET_EVAL_PROTO)
template<PrimType>
bool emitSetLocal(uint32_t, const SourceInfo &);
#endif
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSetLocal(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitSetLocal(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
#ifdef GET_LINK_IMPL
    return emitSetLocalSint8
#else
    return emitSetLocal<PT_Sint8>
#endif
      (A0, I);
  case PT_Uint8:
#ifdef GET_LINK_IMPL
    return emitSetLocalUint8
#else
    return emitSetLocal<PT_Uint8>
#endif
      (A0, I);
  case PT_Sint16:
#ifdef GET_LINK_IMPL
    return emitSetLocalSint16
#else
    return emitSetLocal<PT_Sint16>
#endif
      (A0, I);
  case PT_Uint16:
#ifdef GET_LINK_IMPL
    return emitSetLocalUint16
#else
    return emitSetLocal<PT_Uint16>
#endif
      (A0, I);
  case PT_Sint32:
#ifdef GET_LINK_IMPL
    return emitSetLocalSint32
#else
    return emitSetLocal<PT_Sint32>
#endif
      (A0, I);
  case PT_Uint32:
#ifdef GET_LINK_IMPL
    return emitSetLocalUint32
#else
    return emitSetLocal<PT_Uint32>
#endif
      (A0, I);
  case PT_Sint64:
#ifdef GET_LINK_IMPL
    return emitSetLocalSint64
#else
    return emitSetLocal<PT_Sint64>
#endif
      (A0, I);
  case PT_Uint64:
#ifdef GET_LINK_IMPL
    return emitSetLocalUint64
#else
    return emitSetLocal<PT_Uint64>
#endif
      (A0, I);
  case PT_IntAP:
#ifdef GET_LINK_IMPL
    return emitSetLocalIntAP
#else
    return emitSetLocal<PT_IntAP>
#endif
      (A0, I);
  case PT_IntAPS:
#ifdef GET_LINK_IMPL
    return emitSetLocalIntAPS
#else
    return emitSetLocal<PT_IntAPS>
#endif
      (A0, I);
  case PT_Bool:
#ifdef GET_LINK_IMPL
    return emitSetLocalBool
#else
    return emitSetLocal<PT_Bool>
#endif
      (A0, I);
  case PT_Ptr:
#ifdef GET_LINK_IMPL
    return emitSetLocalPtr
#else
    return emitSetLocal<PT_Ptr>
#endif
      (A0, I);
  case PT_FnPtr:
#ifdef GET_LINK_IMPL
    return emitSetLocalFnPtr
#else
    return emitSetLocal<PT_FnPtr>
#endif
      (A0, I);
  case PT_Float:
#ifdef GET_LINK_IMPL
    return emitSetLocalFloat
#else
    return emitSetLocal<PT_Float>
#endif
      (A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitSetLocalSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalSint8, A0, L);
}
bool ByteCodeEmitter::emitSetLocalUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalUint8, A0, L);
}
bool ByteCodeEmitter::emitSetLocalSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalSint16, A0, L);
}
bool ByteCodeEmitter::emitSetLocalUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalUint16, A0, L);
}
bool ByteCodeEmitter::emitSetLocalSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalSint32, A0, L);
}
bool ByteCodeEmitter::emitSetLocalUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalUint32, A0, L);
}
bool ByteCodeEmitter::emitSetLocalSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalSint64, A0, L);
}
bool ByteCodeEmitter::emitSetLocalUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalUint64, A0, L);
}
bool ByteCodeEmitter::emitSetLocalIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalIntAP, A0, L);
}
bool ByteCodeEmitter::emitSetLocalIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalIntAPS, A0, L);
}
bool ByteCodeEmitter::emitSetLocalBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalBool, A0, L);
}
bool ByteCodeEmitter::emitSetLocalPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalPtr, A0, L);
}
bool ByteCodeEmitter::emitSetLocalFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalFnPtr, A0, L);
}
bool ByteCodeEmitter::emitSetLocalFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetLocalFloat, A0, L);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_SetParamSint8,
OP_SetParamUint8,
OP_SetParamSint16,
OP_SetParamUint16,
OP_SetParamSint32,
OP_SetParamUint32,
OP_SetParamSint64,
OP_SetParamUint64,
OP_SetParamIntAP,
OP_SetParamIntAPS,
OP_SetParamBool,
OP_SetParamPtr,
OP_SetParamFnPtr,
OP_SetParamFloat,
#endif
#ifdef GET_INTERP
case OP_SetParamSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetParamFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetParam<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_SetParamSint8:
  PrintName("SetParamSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamUint8:
  PrintName("SetParamUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamSint16:
  PrintName("SetParamSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamUint16:
  PrintName("SetParamUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamSint32:
  PrintName("SetParamSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamUint32:
  PrintName("SetParamUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamSint64:
  PrintName("SetParamSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamUint64:
  PrintName("SetParamUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamIntAP:
  PrintName("SetParamIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamIntAPS:
  PrintName("SetParamIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamBool:
  PrintName("SetParamBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamPtr:
  PrintName("SetParamPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamFnPtr:
  PrintName("SetParamFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetParamFloat:
  PrintName("SetParamFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSetParamSint8(uint32_t, const SourceInfo &);
bool emitSetParamUint8(uint32_t, const SourceInfo &);
bool emitSetParamSint16(uint32_t, const SourceInfo &);
bool emitSetParamUint16(uint32_t, const SourceInfo &);
bool emitSetParamSint32(uint32_t, const SourceInfo &);
bool emitSetParamUint32(uint32_t, const SourceInfo &);
bool emitSetParamSint64(uint32_t, const SourceInfo &);
bool emitSetParamUint64(uint32_t, const SourceInfo &);
bool emitSetParamIntAP(uint32_t, const SourceInfo &);
bool emitSetParamIntAPS(uint32_t, const SourceInfo &);
bool emitSetParamBool(uint32_t, const SourceInfo &);
bool emitSetParamPtr(uint32_t, const SourceInfo &);
bool emitSetParamFnPtr(uint32_t, const SourceInfo &);
bool emitSetParamFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSetParam(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitSetParam(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitSetParamSint8(A0, I);
  case PT_Uint8:
    return emitSetParamUint8(A0, I);
  case PT_Sint16:
    return emitSetParamSint16(A0, I);
  case PT_Uint16:
    return emitSetParamUint16(A0, I);
  case PT_Sint32:
    return emitSetParamSint32(A0, I);
  case PT_Uint32:
    return emitSetParamUint32(A0, I);
  case PT_Sint64:
    return emitSetParamSint64(A0, I);
  case PT_Uint64:
    return emitSetParamUint64(A0, I);
  case PT_IntAP:
    return emitSetParamIntAP(A0, I);
  case PT_IntAPS:
    return emitSetParamIntAPS(A0, I);
  case PT_Bool:
    return emitSetParamBool(A0, I);
  case PT_Ptr:
    return emitSetParamPtr(A0, I);
  case PT_FnPtr:
    return emitSetParamFnPtr(A0, I);
  case PT_Float:
    return emitSetParamFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitSetParamSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamSint8, A0, L);
}
bool ByteCodeEmitter::emitSetParamUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamUint8, A0, L);
}
bool ByteCodeEmitter::emitSetParamSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamSint16, A0, L);
}
bool ByteCodeEmitter::emitSetParamUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamUint16, A0, L);
}
bool ByteCodeEmitter::emitSetParamSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamSint32, A0, L);
}
bool ByteCodeEmitter::emitSetParamUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamUint32, A0, L);
}
bool ByteCodeEmitter::emitSetParamSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamSint64, A0, L);
}
bool ByteCodeEmitter::emitSetParamUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamUint64, A0, L);
}
bool ByteCodeEmitter::emitSetParamIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamIntAP, A0, L);
}
bool ByteCodeEmitter::emitSetParamIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamIntAPS, A0, L);
}
bool ByteCodeEmitter::emitSetParamBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamBool, A0, L);
}
bool ByteCodeEmitter::emitSetParamPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamPtr, A0, L);
}
bool ByteCodeEmitter::emitSetParamFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamFnPtr, A0, L);
}
bool ByteCodeEmitter::emitSetParamFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetParamFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitSetParamSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitSetParamFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetParam<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_SetThisFieldSint8,
OP_SetThisFieldUint8,
OP_SetThisFieldSint16,
OP_SetThisFieldUint16,
OP_SetThisFieldSint32,
OP_SetThisFieldUint32,
OP_SetThisFieldSint64,
OP_SetThisFieldUint64,
OP_SetThisFieldIntAP,
OP_SetThisFieldIntAPS,
OP_SetThisFieldBool,
OP_SetThisFieldPtr,
OP_SetThisFieldFnPtr,
OP_SetThisFieldFloat,
#endif
#ifdef GET_INTERP
case OP_SetThisFieldSint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_Sint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldUint8: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_Uint8>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldSint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_Sint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldUint16: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_Uint16>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldSint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_Sint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldUint32: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_Uint32>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldSint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_Sint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldUint64: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_Uint64>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_IntAP>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_IntAPS>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldBool: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_Bool>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_Ptr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldFnPtr: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_FnPtr>(S, OpPC, V0))
    return false;
  continue;
}
case OP_SetThisFieldFloat: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!SetThisField<PT_Float>(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_SetThisFieldSint8:
  PrintName("SetThisFieldSint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldUint8:
  PrintName("SetThisFieldUint8");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldSint16:
  PrintName("SetThisFieldSint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldUint16:
  PrintName("SetThisFieldUint16");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldSint32:
  PrintName("SetThisFieldSint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldUint32:
  PrintName("SetThisFieldUint32");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldSint64:
  PrintName("SetThisFieldSint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldUint64:
  PrintName("SetThisFieldUint64");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldIntAP:
  PrintName("SetThisFieldIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldIntAPS:
  PrintName("SetThisFieldIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldBool:
  PrintName("SetThisFieldBool");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldPtr:
  PrintName("SetThisFieldPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldFnPtr:
  PrintName("SetThisFieldFnPtr");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
case OP_SetThisFieldFloat:
  PrintName("SetThisFieldFloat");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSetThisFieldSint8(uint32_t, const SourceInfo &);
bool emitSetThisFieldUint8(uint32_t, const SourceInfo &);
bool emitSetThisFieldSint16(uint32_t, const SourceInfo &);
bool emitSetThisFieldUint16(uint32_t, const SourceInfo &);
bool emitSetThisFieldSint32(uint32_t, const SourceInfo &);
bool emitSetThisFieldUint32(uint32_t, const SourceInfo &);
bool emitSetThisFieldSint64(uint32_t, const SourceInfo &);
bool emitSetThisFieldUint64(uint32_t, const SourceInfo &);
bool emitSetThisFieldIntAP(uint32_t, const SourceInfo &);
bool emitSetThisFieldIntAPS(uint32_t, const SourceInfo &);
bool emitSetThisFieldBool(uint32_t, const SourceInfo &);
bool emitSetThisFieldPtr(uint32_t, const SourceInfo &);
bool emitSetThisFieldFnPtr(uint32_t, const SourceInfo &);
bool emitSetThisFieldFloat(uint32_t, const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSetThisField(PrimType, uint32_t, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitSetThisField(PrimType T0, uint32_t A0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitSetThisFieldSint8(A0, I);
  case PT_Uint8:
    return emitSetThisFieldUint8(A0, I);
  case PT_Sint16:
    return emitSetThisFieldSint16(A0, I);
  case PT_Uint16:
    return emitSetThisFieldUint16(A0, I);
  case PT_Sint32:
    return emitSetThisFieldSint32(A0, I);
  case PT_Uint32:
    return emitSetThisFieldUint32(A0, I);
  case PT_Sint64:
    return emitSetThisFieldSint64(A0, I);
  case PT_Uint64:
    return emitSetThisFieldUint64(A0, I);
  case PT_IntAP:
    return emitSetThisFieldIntAP(A0, I);
  case PT_IntAPS:
    return emitSetThisFieldIntAPS(A0, I);
  case PT_Bool:
    return emitSetThisFieldBool(A0, I);
  case PT_Ptr:
    return emitSetThisFieldPtr(A0, I);
  case PT_FnPtr:
    return emitSetThisFieldFnPtr(A0, I);
  case PT_Float:
    return emitSetThisFieldFloat(A0, I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitSetThisFieldSint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldSint8, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldUint8(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldUint8, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldSint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldSint16, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldUint16(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldUint16, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldSint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldSint32, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldUint32(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldUint32, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldSint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldSint64, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldUint64(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldUint64, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldIntAP, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldIntAPS, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldBool(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldBool, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldPtr, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldFnPtr, A0, L);
}
bool ByteCodeEmitter::emitSetThisFieldFloat(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_SetThisFieldFloat, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitSetThisFieldSint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_Sint8>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldUint8(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_Uint8>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldSint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_Sint16>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldUint16(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_Uint16>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldSint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_Sint32>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldUint32(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_Uint32>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldSint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_Sint64>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldUint64(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_Uint64>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_IntAP>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_IntAPS>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldBool(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_Bool>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_Ptr>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldFnPtr(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_FnPtr>(S, OpPC, A0);
}
bool EvalEmitter::emitSetThisFieldFloat(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SetThisField<PT_Float>(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ShlSint8Sint8,
OP_ShlSint8Uint8,
OP_ShlSint8Sint16,
OP_ShlSint8Uint16,
OP_ShlSint8Sint32,
OP_ShlSint8Uint32,
OP_ShlSint8Sint64,
OP_ShlSint8Uint64,
OP_ShlSint8IntAP,
OP_ShlSint8IntAPS,
OP_ShlUint8Sint8,
OP_ShlUint8Uint8,
OP_ShlUint8Sint16,
OP_ShlUint8Uint16,
OP_ShlUint8Sint32,
OP_ShlUint8Uint32,
OP_ShlUint8Sint64,
OP_ShlUint8Uint64,
OP_ShlUint8IntAP,
OP_ShlUint8IntAPS,
OP_ShlSint16Sint8,
OP_ShlSint16Uint8,
OP_ShlSint16Sint16,
OP_ShlSint16Uint16,
OP_ShlSint16Sint32,
OP_ShlSint16Uint32,
OP_ShlSint16Sint64,
OP_ShlSint16Uint64,
OP_ShlSint16IntAP,
OP_ShlSint16IntAPS,
OP_ShlUint16Sint8,
OP_ShlUint16Uint8,
OP_ShlUint16Sint16,
OP_ShlUint16Uint16,
OP_ShlUint16Sint32,
OP_ShlUint16Uint32,
OP_ShlUint16Sint64,
OP_ShlUint16Uint64,
OP_ShlUint16IntAP,
OP_ShlUint16IntAPS,
OP_ShlSint32Sint8,
OP_ShlSint32Uint8,
OP_ShlSint32Sint16,
OP_ShlSint32Uint16,
OP_ShlSint32Sint32,
OP_ShlSint32Uint32,
OP_ShlSint32Sint64,
OP_ShlSint32Uint64,
OP_ShlSint32IntAP,
OP_ShlSint32IntAPS,
OP_ShlUint32Sint8,
OP_ShlUint32Uint8,
OP_ShlUint32Sint16,
OP_ShlUint32Uint16,
OP_ShlUint32Sint32,
OP_ShlUint32Uint32,
OP_ShlUint32Sint64,
OP_ShlUint32Uint64,
OP_ShlUint32IntAP,
OP_ShlUint32IntAPS,
OP_ShlSint64Sint8,
OP_ShlSint64Uint8,
OP_ShlSint64Sint16,
OP_ShlSint64Uint16,
OP_ShlSint64Sint32,
OP_ShlSint64Uint32,
OP_ShlSint64Sint64,
OP_ShlSint64Uint64,
OP_ShlSint64IntAP,
OP_ShlSint64IntAPS,
OP_ShlUint64Sint8,
OP_ShlUint64Uint8,
OP_ShlUint64Sint16,
OP_ShlUint64Uint16,
OP_ShlUint64Sint32,
OP_ShlUint64Uint32,
OP_ShlUint64Sint64,
OP_ShlUint64Uint64,
OP_ShlUint64IntAP,
OP_ShlUint64IntAPS,
OP_ShlIntAPSint8,
OP_ShlIntAPUint8,
OP_ShlIntAPSint16,
OP_ShlIntAPUint16,
OP_ShlIntAPSint32,
OP_ShlIntAPUint32,
OP_ShlIntAPSint64,
OP_ShlIntAPUint64,
OP_ShlIntAPIntAP,
OP_ShlIntAPIntAPS,
OP_ShlIntAPSSint8,
OP_ShlIntAPSUint8,
OP_ShlIntAPSSint16,
OP_ShlIntAPSUint16,
OP_ShlIntAPSSint32,
OP_ShlIntAPSUint32,
OP_ShlIntAPSSint64,
OP_ShlIntAPSUint64,
OP_ShlIntAPSIntAP,
OP_ShlIntAPSIntAPS,
#endif
#ifdef GET_INTERP
case OP_ShlSint8Sint8: {
  if (!Shl<PT_Sint8, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint8Uint8: {
  if (!Shl<PT_Sint8, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint8Sint16: {
  if (!Shl<PT_Sint8, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint8Uint16: {
  if (!Shl<PT_Sint8, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint8Sint32: {
  if (!Shl<PT_Sint8, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint8Uint32: {
  if (!Shl<PT_Sint8, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint8Sint64: {
  if (!Shl<PT_Sint8, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint8Uint64: {
  if (!Shl<PT_Sint8, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint8IntAP: {
  if (!Shl<PT_Sint8, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint8IntAPS: {
  if (!Shl<PT_Sint8, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint8Sint8: {
  if (!Shl<PT_Uint8, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint8Uint8: {
  if (!Shl<PT_Uint8, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint8Sint16: {
  if (!Shl<PT_Uint8, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint8Uint16: {
  if (!Shl<PT_Uint8, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint8Sint32: {
  if (!Shl<PT_Uint8, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint8Uint32: {
  if (!Shl<PT_Uint8, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint8Sint64: {
  if (!Shl<PT_Uint8, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint8Uint64: {
  if (!Shl<PT_Uint8, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint8IntAP: {
  if (!Shl<PT_Uint8, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint8IntAPS: {
  if (!Shl<PT_Uint8, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint16Sint8: {
  if (!Shl<PT_Sint16, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint16Uint8: {
  if (!Shl<PT_Sint16, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint16Sint16: {
  if (!Shl<PT_Sint16, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint16Uint16: {
  if (!Shl<PT_Sint16, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint16Sint32: {
  if (!Shl<PT_Sint16, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint16Uint32: {
  if (!Shl<PT_Sint16, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint16Sint64: {
  if (!Shl<PT_Sint16, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint16Uint64: {
  if (!Shl<PT_Sint16, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint16IntAP: {
  if (!Shl<PT_Sint16, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint16IntAPS: {
  if (!Shl<PT_Sint16, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint16Sint8: {
  if (!Shl<PT_Uint16, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint16Uint8: {
  if (!Shl<PT_Uint16, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint16Sint16: {
  if (!Shl<PT_Uint16, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint16Uint16: {
  if (!Shl<PT_Uint16, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint16Sint32: {
  if (!Shl<PT_Uint16, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint16Uint32: {
  if (!Shl<PT_Uint16, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint16Sint64: {
  if (!Shl<PT_Uint16, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint16Uint64: {
  if (!Shl<PT_Uint16, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint16IntAP: {
  if (!Shl<PT_Uint16, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint16IntAPS: {
  if (!Shl<PT_Uint16, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint32Sint8: {
  if (!Shl<PT_Sint32, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint32Uint8: {
  if (!Shl<PT_Sint32, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint32Sint16: {
  if (!Shl<PT_Sint32, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint32Uint16: {
  if (!Shl<PT_Sint32, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint32Sint32: {
  if (!Shl<PT_Sint32, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint32Uint32: {
  if (!Shl<PT_Sint32, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint32Sint64: {
  if (!Shl<PT_Sint32, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint32Uint64: {
  if (!Shl<PT_Sint32, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint32IntAP: {
  if (!Shl<PT_Sint32, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint32IntAPS: {
  if (!Shl<PT_Sint32, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint32Sint8: {
  if (!Shl<PT_Uint32, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint32Uint8: {
  if (!Shl<PT_Uint32, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint32Sint16: {
  if (!Shl<PT_Uint32, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint32Uint16: {
  if (!Shl<PT_Uint32, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint32Sint32: {
  if (!Shl<PT_Uint32, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint32Uint32: {
  if (!Shl<PT_Uint32, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint32Sint64: {
  if (!Shl<PT_Uint32, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint32Uint64: {
  if (!Shl<PT_Uint32, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint32IntAP: {
  if (!Shl<PT_Uint32, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint32IntAPS: {
  if (!Shl<PT_Uint32, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint64Sint8: {
  if (!Shl<PT_Sint64, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint64Uint8: {
  if (!Shl<PT_Sint64, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint64Sint16: {
  if (!Shl<PT_Sint64, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint64Uint16: {
  if (!Shl<PT_Sint64, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint64Sint32: {
  if (!Shl<PT_Sint64, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint64Uint32: {
  if (!Shl<PT_Sint64, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint64Sint64: {
  if (!Shl<PT_Sint64, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint64Uint64: {
  if (!Shl<PT_Sint64, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint64IntAP: {
  if (!Shl<PT_Sint64, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShlSint64IntAPS: {
  if (!Shl<PT_Sint64, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint64Sint8: {
  if (!Shl<PT_Uint64, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint64Uint8: {
  if (!Shl<PT_Uint64, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint64Sint16: {
  if (!Shl<PT_Uint64, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint64Uint16: {
  if (!Shl<PT_Uint64, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint64Sint32: {
  if (!Shl<PT_Uint64, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint64Uint32: {
  if (!Shl<PT_Uint64, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint64Sint64: {
  if (!Shl<PT_Uint64, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint64Uint64: {
  if (!Shl<PT_Uint64, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint64IntAP: {
  if (!Shl<PT_Uint64, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShlUint64IntAPS: {
  if (!Shl<PT_Uint64, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSint8: {
  if (!Shl<PT_IntAP, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPUint8: {
  if (!Shl<PT_IntAP, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSint16: {
  if (!Shl<PT_IntAP, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPUint16: {
  if (!Shl<PT_IntAP, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSint32: {
  if (!Shl<PT_IntAP, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPUint32: {
  if (!Shl<PT_IntAP, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSint64: {
  if (!Shl<PT_IntAP, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPUint64: {
  if (!Shl<PT_IntAP, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPIntAP: {
  if (!Shl<PT_IntAP, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPIntAPS: {
  if (!Shl<PT_IntAP, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSSint8: {
  if (!Shl<PT_IntAPS, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSUint8: {
  if (!Shl<PT_IntAPS, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSSint16: {
  if (!Shl<PT_IntAPS, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSUint16: {
  if (!Shl<PT_IntAPS, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSSint32: {
  if (!Shl<PT_IntAPS, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSUint32: {
  if (!Shl<PT_IntAPS, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSSint64: {
  if (!Shl<PT_IntAPS, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSUint64: {
  if (!Shl<PT_IntAPS, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSIntAP: {
  if (!Shl<PT_IntAPS, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShlIntAPSIntAPS: {
  if (!Shl<PT_IntAPS, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ShlSint8Sint8:
  PrintName("ShlSint8Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint8Uint8:
  PrintName("ShlSint8Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint8Sint16:
  PrintName("ShlSint8Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint8Uint16:
  PrintName("ShlSint8Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint8Sint32:
  PrintName("ShlSint8Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint8Uint32:
  PrintName("ShlSint8Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint8Sint64:
  PrintName("ShlSint8Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint8Uint64:
  PrintName("ShlSint8Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint8IntAP:
  PrintName("ShlSint8IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint8IntAPS:
  PrintName("ShlSint8IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint8Sint8:
  PrintName("ShlUint8Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint8Uint8:
  PrintName("ShlUint8Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint8Sint16:
  PrintName("ShlUint8Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint8Uint16:
  PrintName("ShlUint8Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint8Sint32:
  PrintName("ShlUint8Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint8Uint32:
  PrintName("ShlUint8Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint8Sint64:
  PrintName("ShlUint8Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint8Uint64:
  PrintName("ShlUint8Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint8IntAP:
  PrintName("ShlUint8IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint8IntAPS:
  PrintName("ShlUint8IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint16Sint8:
  PrintName("ShlSint16Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint16Uint8:
  PrintName("ShlSint16Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint16Sint16:
  PrintName("ShlSint16Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint16Uint16:
  PrintName("ShlSint16Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint16Sint32:
  PrintName("ShlSint16Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint16Uint32:
  PrintName("ShlSint16Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint16Sint64:
  PrintName("ShlSint16Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint16Uint64:
  PrintName("ShlSint16Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint16IntAP:
  PrintName("ShlSint16IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint16IntAPS:
  PrintName("ShlSint16IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint16Sint8:
  PrintName("ShlUint16Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint16Uint8:
  PrintName("ShlUint16Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint16Sint16:
  PrintName("ShlUint16Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint16Uint16:
  PrintName("ShlUint16Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint16Sint32:
  PrintName("ShlUint16Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint16Uint32:
  PrintName("ShlUint16Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint16Sint64:
  PrintName("ShlUint16Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint16Uint64:
  PrintName("ShlUint16Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint16IntAP:
  PrintName("ShlUint16IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint16IntAPS:
  PrintName("ShlUint16IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint32Sint8:
  PrintName("ShlSint32Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint32Uint8:
  PrintName("ShlSint32Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint32Sint16:
  PrintName("ShlSint32Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint32Uint16:
  PrintName("ShlSint32Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint32Sint32:
  PrintName("ShlSint32Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint32Uint32:
  PrintName("ShlSint32Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint32Sint64:
  PrintName("ShlSint32Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint32Uint64:
  PrintName("ShlSint32Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint32IntAP:
  PrintName("ShlSint32IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint32IntAPS:
  PrintName("ShlSint32IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint32Sint8:
  PrintName("ShlUint32Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint32Uint8:
  PrintName("ShlUint32Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint32Sint16:
  PrintName("ShlUint32Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint32Uint16:
  PrintName("ShlUint32Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint32Sint32:
  PrintName("ShlUint32Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint32Uint32:
  PrintName("ShlUint32Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint32Sint64:
  PrintName("ShlUint32Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint32Uint64:
  PrintName("ShlUint32Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint32IntAP:
  PrintName("ShlUint32IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint32IntAPS:
  PrintName("ShlUint32IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint64Sint8:
  PrintName("ShlSint64Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint64Uint8:
  PrintName("ShlSint64Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint64Sint16:
  PrintName("ShlSint64Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint64Uint16:
  PrintName("ShlSint64Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint64Sint32:
  PrintName("ShlSint64Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint64Uint32:
  PrintName("ShlSint64Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint64Sint64:
  PrintName("ShlSint64Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint64Uint64:
  PrintName("ShlSint64Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint64IntAP:
  PrintName("ShlSint64IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShlSint64IntAPS:
  PrintName("ShlSint64IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint64Sint8:
  PrintName("ShlUint64Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint64Uint8:
  PrintName("ShlUint64Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint64Sint16:
  PrintName("ShlUint64Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint64Uint16:
  PrintName("ShlUint64Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint64Sint32:
  PrintName("ShlUint64Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint64Uint32:
  PrintName("ShlUint64Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint64Sint64:
  PrintName("ShlUint64Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint64Uint64:
  PrintName("ShlUint64Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint64IntAP:
  PrintName("ShlUint64IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShlUint64IntAPS:
  PrintName("ShlUint64IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSint8:
  PrintName("ShlIntAPSint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPUint8:
  PrintName("ShlIntAPUint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSint16:
  PrintName("ShlIntAPSint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPUint16:
  PrintName("ShlIntAPUint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSint32:
  PrintName("ShlIntAPSint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPUint32:
  PrintName("ShlIntAPUint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSint64:
  PrintName("ShlIntAPSint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPUint64:
  PrintName("ShlIntAPUint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPIntAP:
  PrintName("ShlIntAPIntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPIntAPS:
  PrintName("ShlIntAPIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSSint8:
  PrintName("ShlIntAPSSint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSUint8:
  PrintName("ShlIntAPSUint8");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSSint16:
  PrintName("ShlIntAPSSint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSUint16:
  PrintName("ShlIntAPSUint16");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSSint32:
  PrintName("ShlIntAPSSint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSUint32:
  PrintName("ShlIntAPSUint32");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSSint64:
  PrintName("ShlIntAPSSint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSUint64:
  PrintName("ShlIntAPSUint64");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSIntAP:
  PrintName("ShlIntAPSIntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShlIntAPSIntAPS:
  PrintName("ShlIntAPSIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitShlSint8Sint8(const SourceInfo &);
bool emitShlSint8Uint8(const SourceInfo &);
bool emitShlSint8Sint16(const SourceInfo &);
bool emitShlSint8Uint16(const SourceInfo &);
bool emitShlSint8Sint32(const SourceInfo &);
bool emitShlSint8Uint32(const SourceInfo &);
bool emitShlSint8Sint64(const SourceInfo &);
bool emitShlSint8Uint64(const SourceInfo &);
bool emitShlSint8IntAP(const SourceInfo &);
bool emitShlSint8IntAPS(const SourceInfo &);
bool emitShlUint8Sint8(const SourceInfo &);
bool emitShlUint8Uint8(const SourceInfo &);
bool emitShlUint8Sint16(const SourceInfo &);
bool emitShlUint8Uint16(const SourceInfo &);
bool emitShlUint8Sint32(const SourceInfo &);
bool emitShlUint8Uint32(const SourceInfo &);
bool emitShlUint8Sint64(const SourceInfo &);
bool emitShlUint8Uint64(const SourceInfo &);
bool emitShlUint8IntAP(const SourceInfo &);
bool emitShlUint8IntAPS(const SourceInfo &);
bool emitShlSint16Sint8(const SourceInfo &);
bool emitShlSint16Uint8(const SourceInfo &);
bool emitShlSint16Sint16(const SourceInfo &);
bool emitShlSint16Uint16(const SourceInfo &);
bool emitShlSint16Sint32(const SourceInfo &);
bool emitShlSint16Uint32(const SourceInfo &);
bool emitShlSint16Sint64(const SourceInfo &);
bool emitShlSint16Uint64(const SourceInfo &);
bool emitShlSint16IntAP(const SourceInfo &);
bool emitShlSint16IntAPS(const SourceInfo &);
bool emitShlUint16Sint8(const SourceInfo &);
bool emitShlUint16Uint8(const SourceInfo &);
bool emitShlUint16Sint16(const SourceInfo &);
bool emitShlUint16Uint16(const SourceInfo &);
bool emitShlUint16Sint32(const SourceInfo &);
bool emitShlUint16Uint32(const SourceInfo &);
bool emitShlUint16Sint64(const SourceInfo &);
bool emitShlUint16Uint64(const SourceInfo &);
bool emitShlUint16IntAP(const SourceInfo &);
bool emitShlUint16IntAPS(const SourceInfo &);
bool emitShlSint32Sint8(const SourceInfo &);
bool emitShlSint32Uint8(const SourceInfo &);
bool emitShlSint32Sint16(const SourceInfo &);
bool emitShlSint32Uint16(const SourceInfo &);
bool emitShlSint32Sint32(const SourceInfo &);
bool emitShlSint32Uint32(const SourceInfo &);
bool emitShlSint32Sint64(const SourceInfo &);
bool emitShlSint32Uint64(const SourceInfo &);
bool emitShlSint32IntAP(const SourceInfo &);
bool emitShlSint32IntAPS(const SourceInfo &);
bool emitShlUint32Sint8(const SourceInfo &);
bool emitShlUint32Uint8(const SourceInfo &);
bool emitShlUint32Sint16(const SourceInfo &);
bool emitShlUint32Uint16(const SourceInfo &);
bool emitShlUint32Sint32(const SourceInfo &);
bool emitShlUint32Uint32(const SourceInfo &);
bool emitShlUint32Sint64(const SourceInfo &);
bool emitShlUint32Uint64(const SourceInfo &);
bool emitShlUint32IntAP(const SourceInfo &);
bool emitShlUint32IntAPS(const SourceInfo &);
bool emitShlSint64Sint8(const SourceInfo &);
bool emitShlSint64Uint8(const SourceInfo &);
bool emitShlSint64Sint16(const SourceInfo &);
bool emitShlSint64Uint16(const SourceInfo &);
bool emitShlSint64Sint32(const SourceInfo &);
bool emitShlSint64Uint32(const SourceInfo &);
bool emitShlSint64Sint64(const SourceInfo &);
bool emitShlSint64Uint64(const SourceInfo &);
bool emitShlSint64IntAP(const SourceInfo &);
bool emitShlSint64IntAPS(const SourceInfo &);
bool emitShlUint64Sint8(const SourceInfo &);
bool emitShlUint64Uint8(const SourceInfo &);
bool emitShlUint64Sint16(const SourceInfo &);
bool emitShlUint64Uint16(const SourceInfo &);
bool emitShlUint64Sint32(const SourceInfo &);
bool emitShlUint64Uint32(const SourceInfo &);
bool emitShlUint64Sint64(const SourceInfo &);
bool emitShlUint64Uint64(const SourceInfo &);
bool emitShlUint64IntAP(const SourceInfo &);
bool emitShlUint64IntAPS(const SourceInfo &);
bool emitShlIntAPSint8(const SourceInfo &);
bool emitShlIntAPUint8(const SourceInfo &);
bool emitShlIntAPSint16(const SourceInfo &);
bool emitShlIntAPUint16(const SourceInfo &);
bool emitShlIntAPSint32(const SourceInfo &);
bool emitShlIntAPUint32(const SourceInfo &);
bool emitShlIntAPSint64(const SourceInfo &);
bool emitShlIntAPUint64(const SourceInfo &);
bool emitShlIntAPIntAP(const SourceInfo &);
bool emitShlIntAPIntAPS(const SourceInfo &);
bool emitShlIntAPSSint8(const SourceInfo &);
bool emitShlIntAPSUint8(const SourceInfo &);
bool emitShlIntAPSSint16(const SourceInfo &);
bool emitShlIntAPSUint16(const SourceInfo &);
bool emitShlIntAPSSint32(const SourceInfo &);
bool emitShlIntAPSUint32(const SourceInfo &);
bool emitShlIntAPSSint64(const SourceInfo &);
bool emitShlIntAPSUint64(const SourceInfo &);
bool emitShlIntAPSIntAP(const SourceInfo &);
bool emitShlIntAPSIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitShl(PrimType, PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitShl(PrimType T0, PrimType T1, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
  switch (T1) {
  case PT_Sint8:
    return emitShlSint8Sint8(I);
  case PT_Uint8:
    return emitShlSint8Uint8(I);
  case PT_Sint16:
    return emitShlSint8Sint16(I);
  case PT_Uint16:
    return emitShlSint8Uint16(I);
  case PT_Sint32:
    return emitShlSint8Sint32(I);
  case PT_Uint32:
    return emitShlSint8Uint32(I);
  case PT_Sint64:
    return emitShlSint8Sint64(I);
  case PT_Uint64:
    return emitShlSint8Uint64(I);
  case PT_IntAP:
    return emitShlSint8IntAP(I);
  case PT_IntAPS:
    return emitShlSint8IntAPS(I);
  default: llvm_unreachable("invalid type: emitShl");
  }
  llvm_unreachable("invalid enum value");
  case PT_Uint8:
  switch (T1) {
  case PT_Sint8:
    return emitShlUint8Sint8(I);
  case PT_Uint8:
    return emitShlUint8Uint8(I);
  case PT_Sint16:
    return emitShlUint8Sint16(I);
  case PT_Uint16:
    return emitShlUint8Uint16(I);
  case PT_Sint32:
    return emitShlUint8Sint32(I);
  case PT_Uint32:
    return emitShlUint8Uint32(I);
  case PT_Sint64:
    return emitShlUint8Sint64(I);
  case PT_Uint64:
    return emitShlUint8Uint64(I);
  case PT_IntAP:
    return emitShlUint8IntAP(I);
  case PT_IntAPS:
    return emitShlUint8IntAPS(I);
  default: llvm_unreachable("invalid type: emitShl");
  }
  llvm_unreachable("invalid enum value");
  case PT_Sint16:
  switch (T1) {
  case PT_Sint8:
    return emitShlSint16Sint8(I);
  case PT_Uint8:
    return emitShlSint16Uint8(I);
  case PT_Sint16:
    return emitShlSint16Sint16(I);
  case PT_Uint16:
    return emitShlSint16Uint16(I);
  case PT_Sint32:
    return emitShlSint16Sint32(I);
  case PT_Uint32:
    return emitShlSint16Uint32(I);
  case PT_Sint64:
    return emitShlSint16Sint64(I);
  case PT_Uint64:
    return emitShlSint16Uint64(I);
  case PT_IntAP:
    return emitShlSint16IntAP(I);
  case PT_IntAPS:
    return emitShlSint16IntAPS(I);
  default: llvm_unreachable("invalid type: emitShl");
  }
  llvm_unreachable("invalid enum value");
  case PT_Uint16:
  switch (T1) {
  case PT_Sint8:
    return emitShlUint16Sint8(I);
  case PT_Uint8:
    return emitShlUint16Uint8(I);
  case PT_Sint16:
    return emitShlUint16Sint16(I);
  case PT_Uint16:
    return emitShlUint16Uint16(I);
  case PT_Sint32:
    return emitShlUint16Sint32(I);
  case PT_Uint32:
    return emitShlUint16Uint32(I);
  case PT_Sint64:
    return emitShlUint16Sint64(I);
  case PT_Uint64:
    return emitShlUint16Uint64(I);
  case PT_IntAP:
    return emitShlUint16IntAP(I);
  case PT_IntAPS:
    return emitShlUint16IntAPS(I);
  default: llvm_unreachable("invalid type: emitShl");
  }
  llvm_unreachable("invalid enum value");
  case PT_Sint32:
  switch (T1) {
  case PT_Sint8:
    return emitShlSint32Sint8(I);
  case PT_Uint8:
    return emitShlSint32Uint8(I);
  case PT_Sint16:
    return emitShlSint32Sint16(I);
  case PT_Uint16:
    return emitShlSint32Uint16(I);
  case PT_Sint32:
    return emitShlSint32Sint32(I);
  case PT_Uint32:
    return emitShlSint32Uint32(I);
  case PT_Sint64:
    return emitShlSint32Sint64(I);
  case PT_Uint64:
    return emitShlSint32Uint64(I);
  case PT_IntAP:
    return emitShlSint32IntAP(I);
  case PT_IntAPS:
    return emitShlSint32IntAPS(I);
  default: llvm_unreachable("invalid type: emitShl");
  }
  llvm_unreachable("invalid enum value");
  case PT_Uint32:
  switch (T1) {
  case PT_Sint8:
    return emitShlUint32Sint8(I);
  case PT_Uint8:
    return emitShlUint32Uint8(I);
  case PT_Sint16:
    return emitShlUint32Sint16(I);
  case PT_Uint16:
    return emitShlUint32Uint16(I);
  case PT_Sint32:
    return emitShlUint32Sint32(I);
  case PT_Uint32:
    return emitShlUint32Uint32(I);
  case PT_Sint64:
    return emitShlUint32Sint64(I);
  case PT_Uint64:
    return emitShlUint32Uint64(I);
  case PT_IntAP:
    return emitShlUint32IntAP(I);
  case PT_IntAPS:
    return emitShlUint32IntAPS(I);
  default: llvm_unreachable("invalid type: emitShl");
  }
  llvm_unreachable("invalid enum value");
  case PT_Sint64:
  switch (T1) {
  case PT_Sint8:
    return emitShlSint64Sint8(I);
  case PT_Uint8:
    return emitShlSint64Uint8(I);
  case PT_Sint16:
    return emitShlSint64Sint16(I);
  case PT_Uint16:
    return emitShlSint64Uint16(I);
  case PT_Sint32:
    return emitShlSint64Sint32(I);
  case PT_Uint32:
    return emitShlSint64Uint32(I);
  case PT_Sint64:
    return emitShlSint64Sint64(I);
  case PT_Uint64:
    return emitShlSint64Uint64(I);
  case PT_IntAP:
    return emitShlSint64IntAP(I);
  case PT_IntAPS:
    return emitShlSint64IntAPS(I);
  default: llvm_unreachable("invalid type: emitShl");
  }
  llvm_unreachable("invalid enum value");
  case PT_Uint64:
  switch (T1) {
  case PT_Sint8:
    return emitShlUint64Sint8(I);
  case PT_Uint8:
    return emitShlUint64Uint8(I);
  case PT_Sint16:
    return emitShlUint64Sint16(I);
  case PT_Uint16:
    return emitShlUint64Uint16(I);
  case PT_Sint32:
    return emitShlUint64Sint32(I);
  case PT_Uint32:
    return emitShlUint64Uint32(I);
  case PT_Sint64:
    return emitShlUint64Sint64(I);
  case PT_Uint64:
    return emitShlUint64Uint64(I);
  case PT_IntAP:
    return emitShlUint64IntAP(I);
  case PT_IntAPS:
    return emitShlUint64IntAPS(I);
  default: llvm_unreachable("invalid type: emitShl");
  }
  llvm_unreachable("invalid enum value");
  case PT_IntAP:
  switch (T1) {
  case PT_Sint8:
    return emitShlIntAPSint8(I);
  case PT_Uint8:
    return emitShlIntAPUint8(I);
  case PT_Sint16:
    return emitShlIntAPSint16(I);
  case PT_Uint16:
    return emitShlIntAPUint16(I);
  case PT_Sint32:
    return emitShlIntAPSint32(I);
  case PT_Uint32:
    return emitShlIntAPUint32(I);
  case PT_Sint64:
    return emitShlIntAPSint64(I);
  case PT_Uint64:
    return emitShlIntAPUint64(I);
  case PT_IntAP:
    return emitShlIntAPIntAP(I);
  case PT_IntAPS:
    return emitShlIntAPIntAPS(I);
  default: llvm_unreachable("invalid type: emitShl");
  }
  llvm_unreachable("invalid enum value");
  case PT_IntAPS:
  switch (T1) {
  case PT_Sint8:
    return emitShlIntAPSSint8(I);
  case PT_Uint8:
    return emitShlIntAPSUint8(I);
  case PT_Sint16:
    return emitShlIntAPSSint16(I);
  case PT_Uint16:
    return emitShlIntAPSUint16(I);
  case PT_Sint32:
    return emitShlIntAPSSint32(I);
  case PT_Uint32:
    return emitShlIntAPSUint32(I);
  case PT_Sint64:
    return emitShlIntAPSSint64(I);
  case PT_Uint64:
    return emitShlIntAPSUint64(I);
  case PT_IntAP:
    return emitShlIntAPSIntAP(I);
  case PT_IntAPS:
    return emitShlIntAPSIntAPS(I);
  default: llvm_unreachable("invalid type: emitShl");
  }
  llvm_unreachable("invalid enum value");
  default: llvm_unreachable("invalid type: emitShl");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitShlSint8Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint8Sint8, L);
}
bool ByteCodeEmitter::emitShlSint8Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint8Uint8, L);
}
bool ByteCodeEmitter::emitShlSint8Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint8Sint16, L);
}
bool ByteCodeEmitter::emitShlSint8Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint8Uint16, L);
}
bool ByteCodeEmitter::emitShlSint8Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint8Sint32, L);
}
bool ByteCodeEmitter::emitShlSint8Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint8Uint32, L);
}
bool ByteCodeEmitter::emitShlSint8Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint8Sint64, L);
}
bool ByteCodeEmitter::emitShlSint8Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint8Uint64, L);
}
bool ByteCodeEmitter::emitShlSint8IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint8IntAP, L);
}
bool ByteCodeEmitter::emitShlSint8IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint8IntAPS, L);
}
bool ByteCodeEmitter::emitShlUint8Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint8Sint8, L);
}
bool ByteCodeEmitter::emitShlUint8Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint8Uint8, L);
}
bool ByteCodeEmitter::emitShlUint8Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint8Sint16, L);
}
bool ByteCodeEmitter::emitShlUint8Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint8Uint16, L);
}
bool ByteCodeEmitter::emitShlUint8Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint8Sint32, L);
}
bool ByteCodeEmitter::emitShlUint8Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint8Uint32, L);
}
bool ByteCodeEmitter::emitShlUint8Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint8Sint64, L);
}
bool ByteCodeEmitter::emitShlUint8Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint8Uint64, L);
}
bool ByteCodeEmitter::emitShlUint8IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint8IntAP, L);
}
bool ByteCodeEmitter::emitShlUint8IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint8IntAPS, L);
}
bool ByteCodeEmitter::emitShlSint16Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint16Sint8, L);
}
bool ByteCodeEmitter::emitShlSint16Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint16Uint8, L);
}
bool ByteCodeEmitter::emitShlSint16Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint16Sint16, L);
}
bool ByteCodeEmitter::emitShlSint16Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint16Uint16, L);
}
bool ByteCodeEmitter::emitShlSint16Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint16Sint32, L);
}
bool ByteCodeEmitter::emitShlSint16Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint16Uint32, L);
}
bool ByteCodeEmitter::emitShlSint16Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint16Sint64, L);
}
bool ByteCodeEmitter::emitShlSint16Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint16Uint64, L);
}
bool ByteCodeEmitter::emitShlSint16IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint16IntAP, L);
}
bool ByteCodeEmitter::emitShlSint16IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint16IntAPS, L);
}
bool ByteCodeEmitter::emitShlUint16Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint16Sint8, L);
}
bool ByteCodeEmitter::emitShlUint16Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint16Uint8, L);
}
bool ByteCodeEmitter::emitShlUint16Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint16Sint16, L);
}
bool ByteCodeEmitter::emitShlUint16Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint16Uint16, L);
}
bool ByteCodeEmitter::emitShlUint16Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint16Sint32, L);
}
bool ByteCodeEmitter::emitShlUint16Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint16Uint32, L);
}
bool ByteCodeEmitter::emitShlUint16Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint16Sint64, L);
}
bool ByteCodeEmitter::emitShlUint16Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint16Uint64, L);
}
bool ByteCodeEmitter::emitShlUint16IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint16IntAP, L);
}
bool ByteCodeEmitter::emitShlUint16IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint16IntAPS, L);
}
bool ByteCodeEmitter::emitShlSint32Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint32Sint8, L);
}
bool ByteCodeEmitter::emitShlSint32Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint32Uint8, L);
}
bool ByteCodeEmitter::emitShlSint32Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint32Sint16, L);
}
bool ByteCodeEmitter::emitShlSint32Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint32Uint16, L);
}
bool ByteCodeEmitter::emitShlSint32Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint32Sint32, L);
}
bool ByteCodeEmitter::emitShlSint32Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint32Uint32, L);
}
bool ByteCodeEmitter::emitShlSint32Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint32Sint64, L);
}
bool ByteCodeEmitter::emitShlSint32Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint32Uint64, L);
}
bool ByteCodeEmitter::emitShlSint32IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint32IntAP, L);
}
bool ByteCodeEmitter::emitShlSint32IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint32IntAPS, L);
}
bool ByteCodeEmitter::emitShlUint32Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint32Sint8, L);
}
bool ByteCodeEmitter::emitShlUint32Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint32Uint8, L);
}
bool ByteCodeEmitter::emitShlUint32Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint32Sint16, L);
}
bool ByteCodeEmitter::emitShlUint32Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint32Uint16, L);
}
bool ByteCodeEmitter::emitShlUint32Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint32Sint32, L);
}
bool ByteCodeEmitter::emitShlUint32Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint32Uint32, L);
}
bool ByteCodeEmitter::emitShlUint32Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint32Sint64, L);
}
bool ByteCodeEmitter::emitShlUint32Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint32Uint64, L);
}
bool ByteCodeEmitter::emitShlUint32IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint32IntAP, L);
}
bool ByteCodeEmitter::emitShlUint32IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint32IntAPS, L);
}
bool ByteCodeEmitter::emitShlSint64Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint64Sint8, L);
}
bool ByteCodeEmitter::emitShlSint64Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint64Uint8, L);
}
bool ByteCodeEmitter::emitShlSint64Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint64Sint16, L);
}
bool ByteCodeEmitter::emitShlSint64Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint64Uint16, L);
}
bool ByteCodeEmitter::emitShlSint64Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint64Sint32, L);
}
bool ByteCodeEmitter::emitShlSint64Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint64Uint32, L);
}
bool ByteCodeEmitter::emitShlSint64Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint64Sint64, L);
}
bool ByteCodeEmitter::emitShlSint64Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint64Uint64, L);
}
bool ByteCodeEmitter::emitShlSint64IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint64IntAP, L);
}
bool ByteCodeEmitter::emitShlSint64IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShlSint64IntAPS, L);
}
bool ByteCodeEmitter::emitShlUint64Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint64Sint8, L);
}
bool ByteCodeEmitter::emitShlUint64Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint64Uint8, L);
}
bool ByteCodeEmitter::emitShlUint64Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint64Sint16, L);
}
bool ByteCodeEmitter::emitShlUint64Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint64Uint16, L);
}
bool ByteCodeEmitter::emitShlUint64Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint64Sint32, L);
}
bool ByteCodeEmitter::emitShlUint64Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint64Uint32, L);
}
bool ByteCodeEmitter::emitShlUint64Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint64Sint64, L);
}
bool ByteCodeEmitter::emitShlUint64Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint64Uint64, L);
}
bool ByteCodeEmitter::emitShlUint64IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint64IntAP, L);
}
bool ByteCodeEmitter::emitShlUint64IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShlUint64IntAPS, L);
}
bool ByteCodeEmitter::emitShlIntAPSint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSint8, L);
}
bool ByteCodeEmitter::emitShlIntAPUint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPUint8, L);
}
bool ByteCodeEmitter::emitShlIntAPSint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSint16, L);
}
bool ByteCodeEmitter::emitShlIntAPUint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPUint16, L);
}
bool ByteCodeEmitter::emitShlIntAPSint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSint32, L);
}
bool ByteCodeEmitter::emitShlIntAPUint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPUint32, L);
}
bool ByteCodeEmitter::emitShlIntAPSint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSint64, L);
}
bool ByteCodeEmitter::emitShlIntAPUint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPUint64, L);
}
bool ByteCodeEmitter::emitShlIntAPIntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPIntAP, L);
}
bool ByteCodeEmitter::emitShlIntAPIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPIntAPS, L);
}
bool ByteCodeEmitter::emitShlIntAPSSint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSSint8, L);
}
bool ByteCodeEmitter::emitShlIntAPSUint8(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSUint8, L);
}
bool ByteCodeEmitter::emitShlIntAPSSint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSSint16, L);
}
bool ByteCodeEmitter::emitShlIntAPSUint16(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSUint16, L);
}
bool ByteCodeEmitter::emitShlIntAPSSint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSSint32, L);
}
bool ByteCodeEmitter::emitShlIntAPSUint32(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSUint32, L);
}
bool ByteCodeEmitter::emitShlIntAPSSint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSSint64, L);
}
bool ByteCodeEmitter::emitShlIntAPSUint64(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSUint64, L);
}
bool ByteCodeEmitter::emitShlIntAPSIntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSIntAP, L);
}
bool ByteCodeEmitter::emitShlIntAPSIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShlIntAPSIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitShlSint8Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint8, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShlSint8Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint8, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShlSint8Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint8, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShlSint8Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint8, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShlSint8Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint8, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShlSint8Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint8, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShlSint8Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint8, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShlSint8Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint8, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShlSint8IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint8, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShlSint8IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint8, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShlUint8Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint8, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShlUint8Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint8, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShlUint8Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint8, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShlUint8Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint8, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShlUint8Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint8, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShlUint8Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint8, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShlUint8Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint8, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShlUint8Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint8, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShlUint8IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint8, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShlUint8IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint8, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShlSint16Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint16, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShlSint16Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint16, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShlSint16Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint16, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShlSint16Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint16, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShlSint16Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint16, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShlSint16Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint16, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShlSint16Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint16, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShlSint16Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint16, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShlSint16IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint16, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShlSint16IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint16, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShlUint16Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint16, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShlUint16Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint16, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShlUint16Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint16, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShlUint16Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint16, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShlUint16Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint16, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShlUint16Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint16, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShlUint16Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint16, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShlUint16Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint16, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShlUint16IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint16, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShlUint16IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint16, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShlSint32Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint32, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShlSint32Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint32, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShlSint32Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint32, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShlSint32Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint32, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShlSint32Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint32, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShlSint32Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint32, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShlSint32Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint32, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShlSint32Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint32, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShlSint32IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint32, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShlSint32IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint32, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShlUint32Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint32, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShlUint32Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint32, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShlUint32Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint32, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShlUint32Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint32, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShlUint32Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint32, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShlUint32Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint32, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShlUint32Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint32, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShlUint32Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint32, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShlUint32IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint32, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShlUint32IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint32, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShlSint64Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint64, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShlSint64Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint64, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShlSint64Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint64, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShlSint64Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint64, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShlSint64Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint64, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShlSint64Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint64, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShlSint64Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint64, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShlSint64Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint64, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShlSint64IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint64, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShlSint64IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Sint64, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShlUint64Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint64, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShlUint64Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint64, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShlUint64Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint64, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShlUint64Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint64, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShlUint64Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint64, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShlUint64Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint64, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShlUint64Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint64, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShlUint64Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint64, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShlUint64IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint64, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShlUint64IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_Uint64, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAP, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAP, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAP, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAP, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAP, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAP, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAP, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAP, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAP, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAP, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAPS, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAPS, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAPS, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAPS, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAPS, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAPS, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAPS, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAPS, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAPS, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShlIntAPSIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shl<PT_IntAPS, PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ShrSint8Sint8,
OP_ShrSint8Uint8,
OP_ShrSint8Sint16,
OP_ShrSint8Uint16,
OP_ShrSint8Sint32,
OP_ShrSint8Uint32,
OP_ShrSint8Sint64,
OP_ShrSint8Uint64,
OP_ShrSint8IntAP,
OP_ShrSint8IntAPS,
OP_ShrUint8Sint8,
OP_ShrUint8Uint8,
OP_ShrUint8Sint16,
OP_ShrUint8Uint16,
OP_ShrUint8Sint32,
OP_ShrUint8Uint32,
OP_ShrUint8Sint64,
OP_ShrUint8Uint64,
OP_ShrUint8IntAP,
OP_ShrUint8IntAPS,
OP_ShrSint16Sint8,
OP_ShrSint16Uint8,
OP_ShrSint16Sint16,
OP_ShrSint16Uint16,
OP_ShrSint16Sint32,
OP_ShrSint16Uint32,
OP_ShrSint16Sint64,
OP_ShrSint16Uint64,
OP_ShrSint16IntAP,
OP_ShrSint16IntAPS,
OP_ShrUint16Sint8,
OP_ShrUint16Uint8,
OP_ShrUint16Sint16,
OP_ShrUint16Uint16,
OP_ShrUint16Sint32,
OP_ShrUint16Uint32,
OP_ShrUint16Sint64,
OP_ShrUint16Uint64,
OP_ShrUint16IntAP,
OP_ShrUint16IntAPS,
OP_ShrSint32Sint8,
OP_ShrSint32Uint8,
OP_ShrSint32Sint16,
OP_ShrSint32Uint16,
OP_ShrSint32Sint32,
OP_ShrSint32Uint32,
OP_ShrSint32Sint64,
OP_ShrSint32Uint64,
OP_ShrSint32IntAP,
OP_ShrSint32IntAPS,
OP_ShrUint32Sint8,
OP_ShrUint32Uint8,
OP_ShrUint32Sint16,
OP_ShrUint32Uint16,
OP_ShrUint32Sint32,
OP_ShrUint32Uint32,
OP_ShrUint32Sint64,
OP_ShrUint32Uint64,
OP_ShrUint32IntAP,
OP_ShrUint32IntAPS,
OP_ShrSint64Sint8,
OP_ShrSint64Uint8,
OP_ShrSint64Sint16,
OP_ShrSint64Uint16,
OP_ShrSint64Sint32,
OP_ShrSint64Uint32,
OP_ShrSint64Sint64,
OP_ShrSint64Uint64,
OP_ShrSint64IntAP,
OP_ShrSint64IntAPS,
OP_ShrUint64Sint8,
OP_ShrUint64Uint8,
OP_ShrUint64Sint16,
OP_ShrUint64Uint16,
OP_ShrUint64Sint32,
OP_ShrUint64Uint32,
OP_ShrUint64Sint64,
OP_ShrUint64Uint64,
OP_ShrUint64IntAP,
OP_ShrUint64IntAPS,
OP_ShrIntAPSint8,
OP_ShrIntAPUint8,
OP_ShrIntAPSint16,
OP_ShrIntAPUint16,
OP_ShrIntAPSint32,
OP_ShrIntAPUint32,
OP_ShrIntAPSint64,
OP_ShrIntAPUint64,
OP_ShrIntAPIntAP,
OP_ShrIntAPIntAPS,
OP_ShrIntAPSSint8,
OP_ShrIntAPSUint8,
OP_ShrIntAPSSint16,
OP_ShrIntAPSUint16,
OP_ShrIntAPSSint32,
OP_ShrIntAPSUint32,
OP_ShrIntAPSSint64,
OP_ShrIntAPSUint64,
OP_ShrIntAPSIntAP,
OP_ShrIntAPSIntAPS,
#endif
#ifdef GET_INTERP
case OP_ShrSint8Sint8: {
  if (!Shr<PT_Sint8, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint8Uint8: {
  if (!Shr<PT_Sint8, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint8Sint16: {
  if (!Shr<PT_Sint8, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint8Uint16: {
  if (!Shr<PT_Sint8, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint8Sint32: {
  if (!Shr<PT_Sint8, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint8Uint32: {
  if (!Shr<PT_Sint8, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint8Sint64: {
  if (!Shr<PT_Sint8, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint8Uint64: {
  if (!Shr<PT_Sint8, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint8IntAP: {
  if (!Shr<PT_Sint8, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint8IntAPS: {
  if (!Shr<PT_Sint8, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint8Sint8: {
  if (!Shr<PT_Uint8, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint8Uint8: {
  if (!Shr<PT_Uint8, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint8Sint16: {
  if (!Shr<PT_Uint8, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint8Uint16: {
  if (!Shr<PT_Uint8, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint8Sint32: {
  if (!Shr<PT_Uint8, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint8Uint32: {
  if (!Shr<PT_Uint8, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint8Sint64: {
  if (!Shr<PT_Uint8, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint8Uint64: {
  if (!Shr<PT_Uint8, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint8IntAP: {
  if (!Shr<PT_Uint8, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint8IntAPS: {
  if (!Shr<PT_Uint8, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint16Sint8: {
  if (!Shr<PT_Sint16, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint16Uint8: {
  if (!Shr<PT_Sint16, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint16Sint16: {
  if (!Shr<PT_Sint16, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint16Uint16: {
  if (!Shr<PT_Sint16, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint16Sint32: {
  if (!Shr<PT_Sint16, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint16Uint32: {
  if (!Shr<PT_Sint16, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint16Sint64: {
  if (!Shr<PT_Sint16, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint16Uint64: {
  if (!Shr<PT_Sint16, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint16IntAP: {
  if (!Shr<PT_Sint16, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint16IntAPS: {
  if (!Shr<PT_Sint16, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint16Sint8: {
  if (!Shr<PT_Uint16, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint16Uint8: {
  if (!Shr<PT_Uint16, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint16Sint16: {
  if (!Shr<PT_Uint16, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint16Uint16: {
  if (!Shr<PT_Uint16, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint16Sint32: {
  if (!Shr<PT_Uint16, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint16Uint32: {
  if (!Shr<PT_Uint16, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint16Sint64: {
  if (!Shr<PT_Uint16, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint16Uint64: {
  if (!Shr<PT_Uint16, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint16IntAP: {
  if (!Shr<PT_Uint16, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint16IntAPS: {
  if (!Shr<PT_Uint16, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint32Sint8: {
  if (!Shr<PT_Sint32, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint32Uint8: {
  if (!Shr<PT_Sint32, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint32Sint16: {
  if (!Shr<PT_Sint32, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint32Uint16: {
  if (!Shr<PT_Sint32, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint32Sint32: {
  if (!Shr<PT_Sint32, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint32Uint32: {
  if (!Shr<PT_Sint32, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint32Sint64: {
  if (!Shr<PT_Sint32, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint32Uint64: {
  if (!Shr<PT_Sint32, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint32IntAP: {
  if (!Shr<PT_Sint32, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint32IntAPS: {
  if (!Shr<PT_Sint32, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint32Sint8: {
  if (!Shr<PT_Uint32, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint32Uint8: {
  if (!Shr<PT_Uint32, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint32Sint16: {
  if (!Shr<PT_Uint32, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint32Uint16: {
  if (!Shr<PT_Uint32, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint32Sint32: {
  if (!Shr<PT_Uint32, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint32Uint32: {
  if (!Shr<PT_Uint32, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint32Sint64: {
  if (!Shr<PT_Uint32, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint32Uint64: {
  if (!Shr<PT_Uint32, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint32IntAP: {
  if (!Shr<PT_Uint32, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint32IntAPS: {
  if (!Shr<PT_Uint32, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint64Sint8: {
  if (!Shr<PT_Sint64, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint64Uint8: {
  if (!Shr<PT_Sint64, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint64Sint16: {
  if (!Shr<PT_Sint64, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint64Uint16: {
  if (!Shr<PT_Sint64, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint64Sint32: {
  if (!Shr<PT_Sint64, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint64Uint32: {
  if (!Shr<PT_Sint64, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint64Sint64: {
  if (!Shr<PT_Sint64, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint64Uint64: {
  if (!Shr<PT_Sint64, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint64IntAP: {
  if (!Shr<PT_Sint64, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShrSint64IntAPS: {
  if (!Shr<PT_Sint64, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint64Sint8: {
  if (!Shr<PT_Uint64, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint64Uint8: {
  if (!Shr<PT_Uint64, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint64Sint16: {
  if (!Shr<PT_Uint64, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint64Uint16: {
  if (!Shr<PT_Uint64, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint64Sint32: {
  if (!Shr<PT_Uint64, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint64Uint32: {
  if (!Shr<PT_Uint64, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint64Sint64: {
  if (!Shr<PT_Uint64, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint64Uint64: {
  if (!Shr<PT_Uint64, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint64IntAP: {
  if (!Shr<PT_Uint64, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShrUint64IntAPS: {
  if (!Shr<PT_Uint64, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSint8: {
  if (!Shr<PT_IntAP, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPUint8: {
  if (!Shr<PT_IntAP, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSint16: {
  if (!Shr<PT_IntAP, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPUint16: {
  if (!Shr<PT_IntAP, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSint32: {
  if (!Shr<PT_IntAP, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPUint32: {
  if (!Shr<PT_IntAP, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSint64: {
  if (!Shr<PT_IntAP, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPUint64: {
  if (!Shr<PT_IntAP, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPIntAP: {
  if (!Shr<PT_IntAP, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPIntAPS: {
  if (!Shr<PT_IntAP, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSSint8: {
  if (!Shr<PT_IntAPS, PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSUint8: {
  if (!Shr<PT_IntAPS, PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSSint16: {
  if (!Shr<PT_IntAPS, PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSUint16: {
  if (!Shr<PT_IntAPS, PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSSint32: {
  if (!Shr<PT_IntAPS, PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSUint32: {
  if (!Shr<PT_IntAPS, PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSSint64: {
  if (!Shr<PT_IntAPS, PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSUint64: {
  if (!Shr<PT_IntAPS, PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSIntAP: {
  if (!Shr<PT_IntAPS, PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_ShrIntAPSIntAPS: {
  if (!Shr<PT_IntAPS, PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ShrSint8Sint8:
  PrintName("ShrSint8Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint8Uint8:
  PrintName("ShrSint8Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint8Sint16:
  PrintName("ShrSint8Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint8Uint16:
  PrintName("ShrSint8Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint8Sint32:
  PrintName("ShrSint8Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint8Uint32:
  PrintName("ShrSint8Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint8Sint64:
  PrintName("ShrSint8Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint8Uint64:
  PrintName("ShrSint8Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint8IntAP:
  PrintName("ShrSint8IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint8IntAPS:
  PrintName("ShrSint8IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint8Sint8:
  PrintName("ShrUint8Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint8Uint8:
  PrintName("ShrUint8Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint8Sint16:
  PrintName("ShrUint8Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint8Uint16:
  PrintName("ShrUint8Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint8Sint32:
  PrintName("ShrUint8Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint8Uint32:
  PrintName("ShrUint8Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint8Sint64:
  PrintName("ShrUint8Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint8Uint64:
  PrintName("ShrUint8Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint8IntAP:
  PrintName("ShrUint8IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint8IntAPS:
  PrintName("ShrUint8IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint16Sint8:
  PrintName("ShrSint16Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint16Uint8:
  PrintName("ShrSint16Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint16Sint16:
  PrintName("ShrSint16Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint16Uint16:
  PrintName("ShrSint16Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint16Sint32:
  PrintName("ShrSint16Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint16Uint32:
  PrintName("ShrSint16Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint16Sint64:
  PrintName("ShrSint16Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint16Uint64:
  PrintName("ShrSint16Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint16IntAP:
  PrintName("ShrSint16IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint16IntAPS:
  PrintName("ShrSint16IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint16Sint8:
  PrintName("ShrUint16Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint16Uint8:
  PrintName("ShrUint16Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint16Sint16:
  PrintName("ShrUint16Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint16Uint16:
  PrintName("ShrUint16Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint16Sint32:
  PrintName("ShrUint16Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint16Uint32:
  PrintName("ShrUint16Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint16Sint64:
  PrintName("ShrUint16Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint16Uint64:
  PrintName("ShrUint16Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint16IntAP:
  PrintName("ShrUint16IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint16IntAPS:
  PrintName("ShrUint16IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint32Sint8:
  PrintName("ShrSint32Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint32Uint8:
  PrintName("ShrSint32Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint32Sint16:
  PrintName("ShrSint32Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint32Uint16:
  PrintName("ShrSint32Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint32Sint32:
  PrintName("ShrSint32Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint32Uint32:
  PrintName("ShrSint32Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint32Sint64:
  PrintName("ShrSint32Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint32Uint64:
  PrintName("ShrSint32Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint32IntAP:
  PrintName("ShrSint32IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint32IntAPS:
  PrintName("ShrSint32IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint32Sint8:
  PrintName("ShrUint32Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint32Uint8:
  PrintName("ShrUint32Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint32Sint16:
  PrintName("ShrUint32Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint32Uint16:
  PrintName("ShrUint32Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint32Sint32:
  PrintName("ShrUint32Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint32Uint32:
  PrintName("ShrUint32Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint32Sint64:
  PrintName("ShrUint32Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint32Uint64:
  PrintName("ShrUint32Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint32IntAP:
  PrintName("ShrUint32IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint32IntAPS:
  PrintName("ShrUint32IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint64Sint8:
  PrintName("ShrSint64Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint64Uint8:
  PrintName("ShrSint64Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint64Sint16:
  PrintName("ShrSint64Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint64Uint16:
  PrintName("ShrSint64Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint64Sint32:
  PrintName("ShrSint64Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint64Uint32:
  PrintName("ShrSint64Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint64Sint64:
  PrintName("ShrSint64Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint64Uint64:
  PrintName("ShrSint64Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint64IntAP:
  PrintName("ShrSint64IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShrSint64IntAPS:
  PrintName("ShrSint64IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint64Sint8:
  PrintName("ShrUint64Sint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint64Uint8:
  PrintName("ShrUint64Uint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint64Sint16:
  PrintName("ShrUint64Sint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint64Uint16:
  PrintName("ShrUint64Uint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint64Sint32:
  PrintName("ShrUint64Sint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint64Uint32:
  PrintName("ShrUint64Uint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint64Sint64:
  PrintName("ShrUint64Sint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint64Uint64:
  PrintName("ShrUint64Uint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint64IntAP:
  PrintName("ShrUint64IntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShrUint64IntAPS:
  PrintName("ShrUint64IntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSint8:
  PrintName("ShrIntAPSint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPUint8:
  PrintName("ShrIntAPUint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSint16:
  PrintName("ShrIntAPSint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPUint16:
  PrintName("ShrIntAPUint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSint32:
  PrintName("ShrIntAPSint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPUint32:
  PrintName("ShrIntAPUint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSint64:
  PrintName("ShrIntAPSint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPUint64:
  PrintName("ShrIntAPUint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPIntAP:
  PrintName("ShrIntAPIntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPIntAPS:
  PrintName("ShrIntAPIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSSint8:
  PrintName("ShrIntAPSSint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSUint8:
  PrintName("ShrIntAPSUint8");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSSint16:
  PrintName("ShrIntAPSSint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSUint16:
  PrintName("ShrIntAPSUint16");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSSint32:
  PrintName("ShrIntAPSSint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSUint32:
  PrintName("ShrIntAPSUint32");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSSint64:
  PrintName("ShrIntAPSSint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSUint64:
  PrintName("ShrIntAPSUint64");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSIntAP:
  PrintName("ShrIntAPSIntAP");
  OS << "\t" << "\n";
  continue;
case OP_ShrIntAPSIntAPS:
  PrintName("ShrIntAPSIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitShrSint8Sint8(const SourceInfo &);
bool emitShrSint8Uint8(const SourceInfo &);
bool emitShrSint8Sint16(const SourceInfo &);
bool emitShrSint8Uint16(const SourceInfo &);
bool emitShrSint8Sint32(const SourceInfo &);
bool emitShrSint8Uint32(const SourceInfo &);
bool emitShrSint8Sint64(const SourceInfo &);
bool emitShrSint8Uint64(const SourceInfo &);
bool emitShrSint8IntAP(const SourceInfo &);
bool emitShrSint8IntAPS(const SourceInfo &);
bool emitShrUint8Sint8(const SourceInfo &);
bool emitShrUint8Uint8(const SourceInfo &);
bool emitShrUint8Sint16(const SourceInfo &);
bool emitShrUint8Uint16(const SourceInfo &);
bool emitShrUint8Sint32(const SourceInfo &);
bool emitShrUint8Uint32(const SourceInfo &);
bool emitShrUint8Sint64(const SourceInfo &);
bool emitShrUint8Uint64(const SourceInfo &);
bool emitShrUint8IntAP(const SourceInfo &);
bool emitShrUint8IntAPS(const SourceInfo &);
bool emitShrSint16Sint8(const SourceInfo &);
bool emitShrSint16Uint8(const SourceInfo &);
bool emitShrSint16Sint16(const SourceInfo &);
bool emitShrSint16Uint16(const SourceInfo &);
bool emitShrSint16Sint32(const SourceInfo &);
bool emitShrSint16Uint32(const SourceInfo &);
bool emitShrSint16Sint64(const SourceInfo &);
bool emitShrSint16Uint64(const SourceInfo &);
bool emitShrSint16IntAP(const SourceInfo &);
bool emitShrSint16IntAPS(const SourceInfo &);
bool emitShrUint16Sint8(const SourceInfo &);
bool emitShrUint16Uint8(const SourceInfo &);
bool emitShrUint16Sint16(const SourceInfo &);
bool emitShrUint16Uint16(const SourceInfo &);
bool emitShrUint16Sint32(const SourceInfo &);
bool emitShrUint16Uint32(const SourceInfo &);
bool emitShrUint16Sint64(const SourceInfo &);
bool emitShrUint16Uint64(const SourceInfo &);
bool emitShrUint16IntAP(const SourceInfo &);
bool emitShrUint16IntAPS(const SourceInfo &);
bool emitShrSint32Sint8(const SourceInfo &);
bool emitShrSint32Uint8(const SourceInfo &);
bool emitShrSint32Sint16(const SourceInfo &);
bool emitShrSint32Uint16(const SourceInfo &);
bool emitShrSint32Sint32(const SourceInfo &);
bool emitShrSint32Uint32(const SourceInfo &);
bool emitShrSint32Sint64(const SourceInfo &);
bool emitShrSint32Uint64(const SourceInfo &);
bool emitShrSint32IntAP(const SourceInfo &);
bool emitShrSint32IntAPS(const SourceInfo &);
bool emitShrUint32Sint8(const SourceInfo &);
bool emitShrUint32Uint8(const SourceInfo &);
bool emitShrUint32Sint16(const SourceInfo &);
bool emitShrUint32Uint16(const SourceInfo &);
bool emitShrUint32Sint32(const SourceInfo &);
bool emitShrUint32Uint32(const SourceInfo &);
bool emitShrUint32Sint64(const SourceInfo &);
bool emitShrUint32Uint64(const SourceInfo &);
bool emitShrUint32IntAP(const SourceInfo &);
bool emitShrUint32IntAPS(const SourceInfo &);
bool emitShrSint64Sint8(const SourceInfo &);
bool emitShrSint64Uint8(const SourceInfo &);
bool emitShrSint64Sint16(const SourceInfo &);
bool emitShrSint64Uint16(const SourceInfo &);
bool emitShrSint64Sint32(const SourceInfo &);
bool emitShrSint64Uint32(const SourceInfo &);
bool emitShrSint64Sint64(const SourceInfo &);
bool emitShrSint64Uint64(const SourceInfo &);
bool emitShrSint64IntAP(const SourceInfo &);
bool emitShrSint64IntAPS(const SourceInfo &);
bool emitShrUint64Sint8(const SourceInfo &);
bool emitShrUint64Uint8(const SourceInfo &);
bool emitShrUint64Sint16(const SourceInfo &);
bool emitShrUint64Uint16(const SourceInfo &);
bool emitShrUint64Sint32(const SourceInfo &);
bool emitShrUint64Uint32(const SourceInfo &);
bool emitShrUint64Sint64(const SourceInfo &);
bool emitShrUint64Uint64(const SourceInfo &);
bool emitShrUint64IntAP(const SourceInfo &);
bool emitShrUint64IntAPS(const SourceInfo &);
bool emitShrIntAPSint8(const SourceInfo &);
bool emitShrIntAPUint8(const SourceInfo &);
bool emitShrIntAPSint16(const SourceInfo &);
bool emitShrIntAPUint16(const SourceInfo &);
bool emitShrIntAPSint32(const SourceInfo &);
bool emitShrIntAPUint32(const SourceInfo &);
bool emitShrIntAPSint64(const SourceInfo &);
bool emitShrIntAPUint64(const SourceInfo &);
bool emitShrIntAPIntAP(const SourceInfo &);
bool emitShrIntAPIntAPS(const SourceInfo &);
bool emitShrIntAPSSint8(const SourceInfo &);
bool emitShrIntAPSUint8(const SourceInfo &);
bool emitShrIntAPSSint16(const SourceInfo &);
bool emitShrIntAPSUint16(const SourceInfo &);
bool emitShrIntAPSSint32(const SourceInfo &);
bool emitShrIntAPSUint32(const SourceInfo &);
bool emitShrIntAPSSint64(const SourceInfo &);
bool emitShrIntAPSUint64(const SourceInfo &);
bool emitShrIntAPSIntAP(const SourceInfo &);
bool emitShrIntAPSIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitShr(PrimType, PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitShr(PrimType T0, PrimType T1, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
  switch (T1) {
  case PT_Sint8:
    return emitShrSint8Sint8(I);
  case PT_Uint8:
    return emitShrSint8Uint8(I);
  case PT_Sint16:
    return emitShrSint8Sint16(I);
  case PT_Uint16:
    return emitShrSint8Uint16(I);
  case PT_Sint32:
    return emitShrSint8Sint32(I);
  case PT_Uint32:
    return emitShrSint8Uint32(I);
  case PT_Sint64:
    return emitShrSint8Sint64(I);
  case PT_Uint64:
    return emitShrSint8Uint64(I);
  case PT_IntAP:
    return emitShrSint8IntAP(I);
  case PT_IntAPS:
    return emitShrSint8IntAPS(I);
  default: llvm_unreachable("invalid type: emitShr");
  }
  llvm_unreachable("invalid enum value");
  case PT_Uint8:
  switch (T1) {
  case PT_Sint8:
    return emitShrUint8Sint8(I);
  case PT_Uint8:
    return emitShrUint8Uint8(I);
  case PT_Sint16:
    return emitShrUint8Sint16(I);
  case PT_Uint16:
    return emitShrUint8Uint16(I);
  case PT_Sint32:
    return emitShrUint8Sint32(I);
  case PT_Uint32:
    return emitShrUint8Uint32(I);
  case PT_Sint64:
    return emitShrUint8Sint64(I);
  case PT_Uint64:
    return emitShrUint8Uint64(I);
  case PT_IntAP:
    return emitShrUint8IntAP(I);
  case PT_IntAPS:
    return emitShrUint8IntAPS(I);
  default: llvm_unreachable("invalid type: emitShr");
  }
  llvm_unreachable("invalid enum value");
  case PT_Sint16:
  switch (T1) {
  case PT_Sint8:
    return emitShrSint16Sint8(I);
  case PT_Uint8:
    return emitShrSint16Uint8(I);
  case PT_Sint16:
    return emitShrSint16Sint16(I);
  case PT_Uint16:
    return emitShrSint16Uint16(I);
  case PT_Sint32:
    return emitShrSint16Sint32(I);
  case PT_Uint32:
    return emitShrSint16Uint32(I);
  case PT_Sint64:
    return emitShrSint16Sint64(I);
  case PT_Uint64:
    return emitShrSint16Uint64(I);
  case PT_IntAP:
    return emitShrSint16IntAP(I);
  case PT_IntAPS:
    return emitShrSint16IntAPS(I);
  default: llvm_unreachable("invalid type: emitShr");
  }
  llvm_unreachable("invalid enum value");
  case PT_Uint16:
  switch (T1) {
  case PT_Sint8:
    return emitShrUint16Sint8(I);
  case PT_Uint8:
    return emitShrUint16Uint8(I);
  case PT_Sint16:
    return emitShrUint16Sint16(I);
  case PT_Uint16:
    return emitShrUint16Uint16(I);
  case PT_Sint32:
    return emitShrUint16Sint32(I);
  case PT_Uint32:
    return emitShrUint16Uint32(I);
  case PT_Sint64:
    return emitShrUint16Sint64(I);
  case PT_Uint64:
    return emitShrUint16Uint64(I);
  case PT_IntAP:
    return emitShrUint16IntAP(I);
  case PT_IntAPS:
    return emitShrUint16IntAPS(I);
  default: llvm_unreachable("invalid type: emitShr");
  }
  llvm_unreachable("invalid enum value");
  case PT_Sint32:
  switch (T1) {
  case PT_Sint8:
    return emitShrSint32Sint8(I);
  case PT_Uint8:
    return emitShrSint32Uint8(I);
  case PT_Sint16:
    return emitShrSint32Sint16(I);
  case PT_Uint16:
    return emitShrSint32Uint16(I);
  case PT_Sint32:
    return emitShrSint32Sint32(I);
  case PT_Uint32:
    return emitShrSint32Uint32(I);
  case PT_Sint64:
    return emitShrSint32Sint64(I);
  case PT_Uint64:
    return emitShrSint32Uint64(I);
  case PT_IntAP:
    return emitShrSint32IntAP(I);
  case PT_IntAPS:
    return emitShrSint32IntAPS(I);
  default: llvm_unreachable("invalid type: emitShr");
  }
  llvm_unreachable("invalid enum value");
  case PT_Uint32:
  switch (T1) {
  case PT_Sint8:
    return emitShrUint32Sint8(I);
  case PT_Uint8:
    return emitShrUint32Uint8(I);
  case PT_Sint16:
    return emitShrUint32Sint16(I);
  case PT_Uint16:
    return emitShrUint32Uint16(I);
  case PT_Sint32:
    return emitShrUint32Sint32(I);
  case PT_Uint32:
    return emitShrUint32Uint32(I);
  case PT_Sint64:
    return emitShrUint32Sint64(I);
  case PT_Uint64:
    return emitShrUint32Uint64(I);
  case PT_IntAP:
    return emitShrUint32IntAP(I);
  case PT_IntAPS:
    return emitShrUint32IntAPS(I);
  default: llvm_unreachable("invalid type: emitShr");
  }
  llvm_unreachable("invalid enum value");
  case PT_Sint64:
  switch (T1) {
  case PT_Sint8:
    return emitShrSint64Sint8(I);
  case PT_Uint8:
    return emitShrSint64Uint8(I);
  case PT_Sint16:
    return emitShrSint64Sint16(I);
  case PT_Uint16:
    return emitShrSint64Uint16(I);
  case PT_Sint32:
    return emitShrSint64Sint32(I);
  case PT_Uint32:
    return emitShrSint64Uint32(I);
  case PT_Sint64:
    return emitShrSint64Sint64(I);
  case PT_Uint64:
    return emitShrSint64Uint64(I);
  case PT_IntAP:
    return emitShrSint64IntAP(I);
  case PT_IntAPS:
    return emitShrSint64IntAPS(I);
  default: llvm_unreachable("invalid type: emitShr");
  }
  llvm_unreachable("invalid enum value");
  case PT_Uint64:
  switch (T1) {
  case PT_Sint8:
    return emitShrUint64Sint8(I);
  case PT_Uint8:
    return emitShrUint64Uint8(I);
  case PT_Sint16:
    return emitShrUint64Sint16(I);
  case PT_Uint16:
    return emitShrUint64Uint16(I);
  case PT_Sint32:
    return emitShrUint64Sint32(I);
  case PT_Uint32:
    return emitShrUint64Uint32(I);
  case PT_Sint64:
    return emitShrUint64Sint64(I);
  case PT_Uint64:
    return emitShrUint64Uint64(I);
  case PT_IntAP:
    return emitShrUint64IntAP(I);
  case PT_IntAPS:
    return emitShrUint64IntAPS(I);
  default: llvm_unreachable("invalid type: emitShr");
  }
  llvm_unreachable("invalid enum value");
  case PT_IntAP:
  switch (T1) {
  case PT_Sint8:
    return emitShrIntAPSint8(I);
  case PT_Uint8:
    return emitShrIntAPUint8(I);
  case PT_Sint16:
    return emitShrIntAPSint16(I);
  case PT_Uint16:
    return emitShrIntAPUint16(I);
  case PT_Sint32:
    return emitShrIntAPSint32(I);
  case PT_Uint32:
    return emitShrIntAPUint32(I);
  case PT_Sint64:
    return emitShrIntAPSint64(I);
  case PT_Uint64:
    return emitShrIntAPUint64(I);
  case PT_IntAP:
    return emitShrIntAPIntAP(I);
  case PT_IntAPS:
    return emitShrIntAPIntAPS(I);
  default: llvm_unreachable("invalid type: emitShr");
  }
  llvm_unreachable("invalid enum value");
  case PT_IntAPS:
  switch (T1) {
  case PT_Sint8:
    return emitShrIntAPSSint8(I);
  case PT_Uint8:
    return emitShrIntAPSUint8(I);
  case PT_Sint16:
    return emitShrIntAPSSint16(I);
  case PT_Uint16:
    return emitShrIntAPSUint16(I);
  case PT_Sint32:
    return emitShrIntAPSSint32(I);
  case PT_Uint32:
    return emitShrIntAPSUint32(I);
  case PT_Sint64:
    return emitShrIntAPSSint64(I);
  case PT_Uint64:
    return emitShrIntAPSUint64(I);
  case PT_IntAP:
    return emitShrIntAPSIntAP(I);
  case PT_IntAPS:
    return emitShrIntAPSIntAPS(I);
  default: llvm_unreachable("invalid type: emitShr");
  }
  llvm_unreachable("invalid enum value");
  default: llvm_unreachable("invalid type: emitShr");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitShrSint8Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint8Sint8, L);
}
bool ByteCodeEmitter::emitShrSint8Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint8Uint8, L);
}
bool ByteCodeEmitter::emitShrSint8Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint8Sint16, L);
}
bool ByteCodeEmitter::emitShrSint8Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint8Uint16, L);
}
bool ByteCodeEmitter::emitShrSint8Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint8Sint32, L);
}
bool ByteCodeEmitter::emitShrSint8Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint8Uint32, L);
}
bool ByteCodeEmitter::emitShrSint8Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint8Sint64, L);
}
bool ByteCodeEmitter::emitShrSint8Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint8Uint64, L);
}
bool ByteCodeEmitter::emitShrSint8IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint8IntAP, L);
}
bool ByteCodeEmitter::emitShrSint8IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint8IntAPS, L);
}
bool ByteCodeEmitter::emitShrUint8Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint8Sint8, L);
}
bool ByteCodeEmitter::emitShrUint8Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint8Uint8, L);
}
bool ByteCodeEmitter::emitShrUint8Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint8Sint16, L);
}
bool ByteCodeEmitter::emitShrUint8Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint8Uint16, L);
}
bool ByteCodeEmitter::emitShrUint8Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint8Sint32, L);
}
bool ByteCodeEmitter::emitShrUint8Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint8Uint32, L);
}
bool ByteCodeEmitter::emitShrUint8Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint8Sint64, L);
}
bool ByteCodeEmitter::emitShrUint8Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint8Uint64, L);
}
bool ByteCodeEmitter::emitShrUint8IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint8IntAP, L);
}
bool ByteCodeEmitter::emitShrUint8IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint8IntAPS, L);
}
bool ByteCodeEmitter::emitShrSint16Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint16Sint8, L);
}
bool ByteCodeEmitter::emitShrSint16Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint16Uint8, L);
}
bool ByteCodeEmitter::emitShrSint16Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint16Sint16, L);
}
bool ByteCodeEmitter::emitShrSint16Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint16Uint16, L);
}
bool ByteCodeEmitter::emitShrSint16Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint16Sint32, L);
}
bool ByteCodeEmitter::emitShrSint16Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint16Uint32, L);
}
bool ByteCodeEmitter::emitShrSint16Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint16Sint64, L);
}
bool ByteCodeEmitter::emitShrSint16Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint16Uint64, L);
}
bool ByteCodeEmitter::emitShrSint16IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint16IntAP, L);
}
bool ByteCodeEmitter::emitShrSint16IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint16IntAPS, L);
}
bool ByteCodeEmitter::emitShrUint16Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint16Sint8, L);
}
bool ByteCodeEmitter::emitShrUint16Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint16Uint8, L);
}
bool ByteCodeEmitter::emitShrUint16Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint16Sint16, L);
}
bool ByteCodeEmitter::emitShrUint16Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint16Uint16, L);
}
bool ByteCodeEmitter::emitShrUint16Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint16Sint32, L);
}
bool ByteCodeEmitter::emitShrUint16Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint16Uint32, L);
}
bool ByteCodeEmitter::emitShrUint16Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint16Sint64, L);
}
bool ByteCodeEmitter::emitShrUint16Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint16Uint64, L);
}
bool ByteCodeEmitter::emitShrUint16IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint16IntAP, L);
}
bool ByteCodeEmitter::emitShrUint16IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint16IntAPS, L);
}
bool ByteCodeEmitter::emitShrSint32Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint32Sint8, L);
}
bool ByteCodeEmitter::emitShrSint32Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint32Uint8, L);
}
bool ByteCodeEmitter::emitShrSint32Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint32Sint16, L);
}
bool ByteCodeEmitter::emitShrSint32Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint32Uint16, L);
}
bool ByteCodeEmitter::emitShrSint32Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint32Sint32, L);
}
bool ByteCodeEmitter::emitShrSint32Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint32Uint32, L);
}
bool ByteCodeEmitter::emitShrSint32Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint32Sint64, L);
}
bool ByteCodeEmitter::emitShrSint32Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint32Uint64, L);
}
bool ByteCodeEmitter::emitShrSint32IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint32IntAP, L);
}
bool ByteCodeEmitter::emitShrSint32IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint32IntAPS, L);
}
bool ByteCodeEmitter::emitShrUint32Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint32Sint8, L);
}
bool ByteCodeEmitter::emitShrUint32Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint32Uint8, L);
}
bool ByteCodeEmitter::emitShrUint32Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint32Sint16, L);
}
bool ByteCodeEmitter::emitShrUint32Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint32Uint16, L);
}
bool ByteCodeEmitter::emitShrUint32Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint32Sint32, L);
}
bool ByteCodeEmitter::emitShrUint32Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint32Uint32, L);
}
bool ByteCodeEmitter::emitShrUint32Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint32Sint64, L);
}
bool ByteCodeEmitter::emitShrUint32Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint32Uint64, L);
}
bool ByteCodeEmitter::emitShrUint32IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint32IntAP, L);
}
bool ByteCodeEmitter::emitShrUint32IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint32IntAPS, L);
}
bool ByteCodeEmitter::emitShrSint64Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint64Sint8, L);
}
bool ByteCodeEmitter::emitShrSint64Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint64Uint8, L);
}
bool ByteCodeEmitter::emitShrSint64Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint64Sint16, L);
}
bool ByteCodeEmitter::emitShrSint64Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint64Uint16, L);
}
bool ByteCodeEmitter::emitShrSint64Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint64Sint32, L);
}
bool ByteCodeEmitter::emitShrSint64Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint64Uint32, L);
}
bool ByteCodeEmitter::emitShrSint64Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint64Sint64, L);
}
bool ByteCodeEmitter::emitShrSint64Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint64Uint64, L);
}
bool ByteCodeEmitter::emitShrSint64IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint64IntAP, L);
}
bool ByteCodeEmitter::emitShrSint64IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShrSint64IntAPS, L);
}
bool ByteCodeEmitter::emitShrUint64Sint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint64Sint8, L);
}
bool ByteCodeEmitter::emitShrUint64Uint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint64Uint8, L);
}
bool ByteCodeEmitter::emitShrUint64Sint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint64Sint16, L);
}
bool ByteCodeEmitter::emitShrUint64Uint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint64Uint16, L);
}
bool ByteCodeEmitter::emitShrUint64Sint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint64Sint32, L);
}
bool ByteCodeEmitter::emitShrUint64Uint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint64Uint32, L);
}
bool ByteCodeEmitter::emitShrUint64Sint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint64Sint64, L);
}
bool ByteCodeEmitter::emitShrUint64Uint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint64Uint64, L);
}
bool ByteCodeEmitter::emitShrUint64IntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint64IntAP, L);
}
bool ByteCodeEmitter::emitShrUint64IntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShrUint64IntAPS, L);
}
bool ByteCodeEmitter::emitShrIntAPSint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSint8, L);
}
bool ByteCodeEmitter::emitShrIntAPUint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPUint8, L);
}
bool ByteCodeEmitter::emitShrIntAPSint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSint16, L);
}
bool ByteCodeEmitter::emitShrIntAPUint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPUint16, L);
}
bool ByteCodeEmitter::emitShrIntAPSint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSint32, L);
}
bool ByteCodeEmitter::emitShrIntAPUint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPUint32, L);
}
bool ByteCodeEmitter::emitShrIntAPSint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSint64, L);
}
bool ByteCodeEmitter::emitShrIntAPUint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPUint64, L);
}
bool ByteCodeEmitter::emitShrIntAPIntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPIntAP, L);
}
bool ByteCodeEmitter::emitShrIntAPIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPIntAPS, L);
}
bool ByteCodeEmitter::emitShrIntAPSSint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSSint8, L);
}
bool ByteCodeEmitter::emitShrIntAPSUint8(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSUint8, L);
}
bool ByteCodeEmitter::emitShrIntAPSSint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSSint16, L);
}
bool ByteCodeEmitter::emitShrIntAPSUint16(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSUint16, L);
}
bool ByteCodeEmitter::emitShrIntAPSSint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSSint32, L);
}
bool ByteCodeEmitter::emitShrIntAPSUint32(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSUint32, L);
}
bool ByteCodeEmitter::emitShrIntAPSSint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSSint64, L);
}
bool ByteCodeEmitter::emitShrIntAPSUint64(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSUint64, L);
}
bool ByteCodeEmitter::emitShrIntAPSIntAP(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSIntAP, L);
}
bool ByteCodeEmitter::emitShrIntAPSIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_ShrIntAPSIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitShrSint8Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint8, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShrSint8Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint8, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShrSint8Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint8, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShrSint8Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint8, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShrSint8Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint8, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShrSint8Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint8, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShrSint8Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint8, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShrSint8Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint8, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShrSint8IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint8, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShrSint8IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint8, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShrUint8Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint8, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShrUint8Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint8, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShrUint8Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint8, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShrUint8Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint8, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShrUint8Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint8, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShrUint8Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint8, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShrUint8Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint8, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShrUint8Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint8, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShrUint8IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint8, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShrUint8IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint8, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShrSint16Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint16, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShrSint16Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint16, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShrSint16Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint16, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShrSint16Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint16, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShrSint16Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint16, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShrSint16Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint16, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShrSint16Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint16, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShrSint16Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint16, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShrSint16IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint16, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShrSint16IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint16, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShrUint16Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint16, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShrUint16Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint16, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShrUint16Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint16, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShrUint16Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint16, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShrUint16Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint16, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShrUint16Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint16, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShrUint16Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint16, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShrUint16Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint16, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShrUint16IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint16, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShrUint16IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint16, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShrSint32Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint32, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShrSint32Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint32, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShrSint32Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint32, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShrSint32Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint32, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShrSint32Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint32, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShrSint32Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint32, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShrSint32Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint32, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShrSint32Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint32, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShrSint32IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint32, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShrSint32IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint32, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShrUint32Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint32, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShrUint32Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint32, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShrUint32Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint32, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShrUint32Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint32, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShrUint32Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint32, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShrUint32Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint32, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShrUint32Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint32, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShrUint32Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint32, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShrUint32IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint32, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShrUint32IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint32, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShrSint64Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint64, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShrSint64Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint64, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShrSint64Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint64, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShrSint64Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint64, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShrSint64Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint64, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShrSint64Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint64, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShrSint64Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint64, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShrSint64Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint64, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShrSint64IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint64, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShrSint64IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Sint64, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShrUint64Sint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint64, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShrUint64Uint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint64, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShrUint64Sint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint64, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShrUint64Uint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint64, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShrUint64Sint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint64, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShrUint64Uint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint64, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShrUint64Sint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint64, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShrUint64Uint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint64, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShrUint64IntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint64, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShrUint64IntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_Uint64, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAP, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAP, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAP, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAP, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAP, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAP, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAP, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAP, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAP, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAP, PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAPS, PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAPS, PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAPS, PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAPS, PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAPS, PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAPS, PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAPS, PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAPS, PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAPS, PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitShrIntAPSIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Shr<PT_IntAPS, PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_StoreSint8,
OP_StoreUint8,
OP_StoreSint16,
OP_StoreUint16,
OP_StoreSint32,
OP_StoreUint32,
OP_StoreSint64,
OP_StoreUint64,
OP_StoreIntAP,
OP_StoreIntAPS,
OP_StoreBool,
OP_StorePtr,
OP_StoreFnPtr,
OP_StoreFloat,
#endif
#ifdef GET_INTERP
case OP_StoreSint8: {
  if (!Store<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_StoreUint8: {
  if (!Store<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_StoreSint16: {
  if (!Store<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_StoreUint16: {
  if (!Store<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_StoreSint32: {
  if (!Store<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_StoreUint32: {
  if (!Store<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_StoreSint64: {
  if (!Store<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_StoreUint64: {
  if (!Store<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_StoreIntAP: {
  if (!Store<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_StoreIntAPS: {
  if (!Store<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBool: {
  if (!Store<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_StorePtr: {
  if (!Store<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_StoreFnPtr: {
  if (!Store<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
case OP_StoreFloat: {
  if (!Store<PT_Float>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_StoreSint8:
  PrintName("StoreSint8");
  OS << "\t" << "\n";
  continue;
case OP_StoreUint8:
  PrintName("StoreUint8");
  OS << "\t" << "\n";
  continue;
case OP_StoreSint16:
  PrintName("StoreSint16");
  OS << "\t" << "\n";
  continue;
case OP_StoreUint16:
  PrintName("StoreUint16");
  OS << "\t" << "\n";
  continue;
case OP_StoreSint32:
  PrintName("StoreSint32");
  OS << "\t" << "\n";
  continue;
case OP_StoreUint32:
  PrintName("StoreUint32");
  OS << "\t" << "\n";
  continue;
case OP_StoreSint64:
  PrintName("StoreSint64");
  OS << "\t" << "\n";
  continue;
case OP_StoreUint64:
  PrintName("StoreUint64");
  OS << "\t" << "\n";
  continue;
case OP_StoreIntAP:
  PrintName("StoreIntAP");
  OS << "\t" << "\n";
  continue;
case OP_StoreIntAPS:
  PrintName("StoreIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_StoreBool:
  PrintName("StoreBool");
  OS << "\t" << "\n";
  continue;
case OP_StorePtr:
  PrintName("StorePtr");
  OS << "\t" << "\n";
  continue;
case OP_StoreFnPtr:
  PrintName("StoreFnPtr");
  OS << "\t" << "\n";
  continue;
case OP_StoreFloat:
  PrintName("StoreFloat");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitStoreSint8(const SourceInfo &);
bool emitStoreUint8(const SourceInfo &);
bool emitStoreSint16(const SourceInfo &);
bool emitStoreUint16(const SourceInfo &);
bool emitStoreSint32(const SourceInfo &);
bool emitStoreUint32(const SourceInfo &);
bool emitStoreSint64(const SourceInfo &);
bool emitStoreUint64(const SourceInfo &);
bool emitStoreIntAP(const SourceInfo &);
bool emitStoreIntAPS(const SourceInfo &);
bool emitStoreBool(const SourceInfo &);
bool emitStorePtr(const SourceInfo &);
bool emitStoreFnPtr(const SourceInfo &);
bool emitStoreFloat(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitStore(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitStore(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitStoreSint8(I);
  case PT_Uint8:
    return emitStoreUint8(I);
  case PT_Sint16:
    return emitStoreSint16(I);
  case PT_Uint16:
    return emitStoreUint16(I);
  case PT_Sint32:
    return emitStoreSint32(I);
  case PT_Uint32:
    return emitStoreUint32(I);
  case PT_Sint64:
    return emitStoreSint64(I);
  case PT_Uint64:
    return emitStoreUint64(I);
  case PT_IntAP:
    return emitStoreIntAP(I);
  case PT_IntAPS:
    return emitStoreIntAPS(I);
  case PT_Bool:
    return emitStoreBool(I);
  case PT_Ptr:
    return emitStorePtr(I);
  case PT_FnPtr:
    return emitStoreFnPtr(I);
  case PT_Float:
    return emitStoreFloat(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitStoreSint8(const SourceInfo &L) {
  return emitOp<>(OP_StoreSint8, L);
}
bool ByteCodeEmitter::emitStoreUint8(const SourceInfo &L) {
  return emitOp<>(OP_StoreUint8, L);
}
bool ByteCodeEmitter::emitStoreSint16(const SourceInfo &L) {
  return emitOp<>(OP_StoreSint16, L);
}
bool ByteCodeEmitter::emitStoreUint16(const SourceInfo &L) {
  return emitOp<>(OP_StoreUint16, L);
}
bool ByteCodeEmitter::emitStoreSint32(const SourceInfo &L) {
  return emitOp<>(OP_StoreSint32, L);
}
bool ByteCodeEmitter::emitStoreUint32(const SourceInfo &L) {
  return emitOp<>(OP_StoreUint32, L);
}
bool ByteCodeEmitter::emitStoreSint64(const SourceInfo &L) {
  return emitOp<>(OP_StoreSint64, L);
}
bool ByteCodeEmitter::emitStoreUint64(const SourceInfo &L) {
  return emitOp<>(OP_StoreUint64, L);
}
bool ByteCodeEmitter::emitStoreIntAP(const SourceInfo &L) {
  return emitOp<>(OP_StoreIntAP, L);
}
bool ByteCodeEmitter::emitStoreIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_StoreIntAPS, L);
}
bool ByteCodeEmitter::emitStoreBool(const SourceInfo &L) {
  return emitOp<>(OP_StoreBool, L);
}
bool ByteCodeEmitter::emitStorePtr(const SourceInfo &L) {
  return emitOp<>(OP_StorePtr, L);
}
bool ByteCodeEmitter::emitStoreFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_StoreFnPtr, L);
}
bool ByteCodeEmitter::emitStoreFloat(const SourceInfo &L) {
  return emitOp<>(OP_StoreFloat, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitStoreSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitStoreUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitStoreSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitStoreUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitStoreSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitStoreUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitStoreSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitStoreUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitStoreIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitStoreIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitStoreBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitStorePtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitStoreFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_FnPtr>(S, OpPC);
}
bool EvalEmitter::emitStoreFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Store<PT_Float>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_StoreBitFieldSint8,
OP_StoreBitFieldUint8,
OP_StoreBitFieldSint16,
OP_StoreBitFieldUint16,
OP_StoreBitFieldSint32,
OP_StoreBitFieldUint32,
OP_StoreBitFieldSint64,
OP_StoreBitFieldUint64,
OP_StoreBitFieldIntAP,
OP_StoreBitFieldIntAPS,
OP_StoreBitFieldBool,
#endif
#ifdef GET_INTERP
case OP_StoreBitFieldSint8: {
  if (!StoreBitField<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldUint8: {
  if (!StoreBitField<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldSint16: {
  if (!StoreBitField<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldUint16: {
  if (!StoreBitField<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldSint32: {
  if (!StoreBitField<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldUint32: {
  if (!StoreBitField<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldSint64: {
  if (!StoreBitField<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldUint64: {
  if (!StoreBitField<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldIntAP: {
  if (!StoreBitField<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldIntAPS: {
  if (!StoreBitField<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldBool: {
  if (!StoreBitField<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_StoreBitFieldSint8:
  PrintName("StoreBitFieldSint8");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldUint8:
  PrintName("StoreBitFieldUint8");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldSint16:
  PrintName("StoreBitFieldSint16");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldUint16:
  PrintName("StoreBitFieldUint16");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldSint32:
  PrintName("StoreBitFieldSint32");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldUint32:
  PrintName("StoreBitFieldUint32");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldSint64:
  PrintName("StoreBitFieldSint64");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldUint64:
  PrintName("StoreBitFieldUint64");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldIntAP:
  PrintName("StoreBitFieldIntAP");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldIntAPS:
  PrintName("StoreBitFieldIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldBool:
  PrintName("StoreBitFieldBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitStoreBitFieldSint8(const SourceInfo &);
bool emitStoreBitFieldUint8(const SourceInfo &);
bool emitStoreBitFieldSint16(const SourceInfo &);
bool emitStoreBitFieldUint16(const SourceInfo &);
bool emitStoreBitFieldSint32(const SourceInfo &);
bool emitStoreBitFieldUint32(const SourceInfo &);
bool emitStoreBitFieldSint64(const SourceInfo &);
bool emitStoreBitFieldUint64(const SourceInfo &);
bool emitStoreBitFieldIntAP(const SourceInfo &);
bool emitStoreBitFieldIntAPS(const SourceInfo &);
bool emitStoreBitFieldBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitStoreBitField(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitStoreBitField(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitStoreBitFieldSint8(I);
  case PT_Uint8:
    return emitStoreBitFieldUint8(I);
  case PT_Sint16:
    return emitStoreBitFieldSint16(I);
  case PT_Uint16:
    return emitStoreBitFieldUint16(I);
  case PT_Sint32:
    return emitStoreBitFieldSint32(I);
  case PT_Uint32:
    return emitStoreBitFieldUint32(I);
  case PT_Sint64:
    return emitStoreBitFieldSint64(I);
  case PT_Uint64:
    return emitStoreBitFieldUint64(I);
  case PT_IntAP:
    return emitStoreBitFieldIntAP(I);
  case PT_IntAPS:
    return emitStoreBitFieldIntAPS(I);
  case PT_Bool:
    return emitStoreBitFieldBool(I);
  default: llvm_unreachable("invalid type: emitStoreBitField");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitStoreBitFieldSint8(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldSint8, L);
}
bool ByteCodeEmitter::emitStoreBitFieldUint8(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldUint8, L);
}
bool ByteCodeEmitter::emitStoreBitFieldSint16(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldSint16, L);
}
bool ByteCodeEmitter::emitStoreBitFieldUint16(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldUint16, L);
}
bool ByteCodeEmitter::emitStoreBitFieldSint32(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldSint32, L);
}
bool ByteCodeEmitter::emitStoreBitFieldUint32(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldUint32, L);
}
bool ByteCodeEmitter::emitStoreBitFieldSint64(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldSint64, L);
}
bool ByteCodeEmitter::emitStoreBitFieldUint64(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldUint64, L);
}
bool ByteCodeEmitter::emitStoreBitFieldIntAP(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldIntAP, L);
}
bool ByteCodeEmitter::emitStoreBitFieldIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldIntAPS, L);
}
bool ByteCodeEmitter::emitStoreBitFieldBool(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitStoreBitFieldSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitField<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitField<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitField<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitField<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitField<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitField<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitField<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitField<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitField<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitField<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitField<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_StoreBitFieldPopSint8,
OP_StoreBitFieldPopUint8,
OP_StoreBitFieldPopSint16,
OP_StoreBitFieldPopUint16,
OP_StoreBitFieldPopSint32,
OP_StoreBitFieldPopUint32,
OP_StoreBitFieldPopSint64,
OP_StoreBitFieldPopUint64,
OP_StoreBitFieldPopIntAP,
OP_StoreBitFieldPopIntAPS,
OP_StoreBitFieldPopBool,
#endif
#ifdef GET_INTERP
case OP_StoreBitFieldPopSint8: {
  if (!StoreBitFieldPop<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldPopUint8: {
  if (!StoreBitFieldPop<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldPopSint16: {
  if (!StoreBitFieldPop<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldPopUint16: {
  if (!StoreBitFieldPop<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldPopSint32: {
  if (!StoreBitFieldPop<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldPopUint32: {
  if (!StoreBitFieldPop<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldPopSint64: {
  if (!StoreBitFieldPop<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldPopUint64: {
  if (!StoreBitFieldPop<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldPopIntAP: {
  if (!StoreBitFieldPop<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldPopIntAPS: {
  if (!StoreBitFieldPop<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_StoreBitFieldPopBool: {
  if (!StoreBitFieldPop<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_StoreBitFieldPopSint8:
  PrintName("StoreBitFieldPopSint8");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldPopUint8:
  PrintName("StoreBitFieldPopUint8");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldPopSint16:
  PrintName("StoreBitFieldPopSint16");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldPopUint16:
  PrintName("StoreBitFieldPopUint16");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldPopSint32:
  PrintName("StoreBitFieldPopSint32");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldPopUint32:
  PrintName("StoreBitFieldPopUint32");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldPopSint64:
  PrintName("StoreBitFieldPopSint64");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldPopUint64:
  PrintName("StoreBitFieldPopUint64");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldPopIntAP:
  PrintName("StoreBitFieldPopIntAP");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldPopIntAPS:
  PrintName("StoreBitFieldPopIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_StoreBitFieldPopBool:
  PrintName("StoreBitFieldPopBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitStoreBitFieldPopSint8(const SourceInfo &);
bool emitStoreBitFieldPopUint8(const SourceInfo &);
bool emitStoreBitFieldPopSint16(const SourceInfo &);
bool emitStoreBitFieldPopUint16(const SourceInfo &);
bool emitStoreBitFieldPopSint32(const SourceInfo &);
bool emitStoreBitFieldPopUint32(const SourceInfo &);
bool emitStoreBitFieldPopSint64(const SourceInfo &);
bool emitStoreBitFieldPopUint64(const SourceInfo &);
bool emitStoreBitFieldPopIntAP(const SourceInfo &);
bool emitStoreBitFieldPopIntAPS(const SourceInfo &);
bool emitStoreBitFieldPopBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitStoreBitFieldPop(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitStoreBitFieldPop(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitStoreBitFieldPopSint8(I);
  case PT_Uint8:
    return emitStoreBitFieldPopUint8(I);
  case PT_Sint16:
    return emitStoreBitFieldPopSint16(I);
  case PT_Uint16:
    return emitStoreBitFieldPopUint16(I);
  case PT_Sint32:
    return emitStoreBitFieldPopSint32(I);
  case PT_Uint32:
    return emitStoreBitFieldPopUint32(I);
  case PT_Sint64:
    return emitStoreBitFieldPopSint64(I);
  case PT_Uint64:
    return emitStoreBitFieldPopUint64(I);
  case PT_IntAP:
    return emitStoreBitFieldPopIntAP(I);
  case PT_IntAPS:
    return emitStoreBitFieldPopIntAPS(I);
  case PT_Bool:
    return emitStoreBitFieldPopBool(I);
  default: llvm_unreachable("invalid type: emitStoreBitFieldPop");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitStoreBitFieldPopSint8(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldPopSint8, L);
}
bool ByteCodeEmitter::emitStoreBitFieldPopUint8(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldPopUint8, L);
}
bool ByteCodeEmitter::emitStoreBitFieldPopSint16(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldPopSint16, L);
}
bool ByteCodeEmitter::emitStoreBitFieldPopUint16(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldPopUint16, L);
}
bool ByteCodeEmitter::emitStoreBitFieldPopSint32(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldPopSint32, L);
}
bool ByteCodeEmitter::emitStoreBitFieldPopUint32(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldPopUint32, L);
}
bool ByteCodeEmitter::emitStoreBitFieldPopSint64(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldPopSint64, L);
}
bool ByteCodeEmitter::emitStoreBitFieldPopUint64(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldPopUint64, L);
}
bool ByteCodeEmitter::emitStoreBitFieldPopIntAP(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldPopIntAP, L);
}
bool ByteCodeEmitter::emitStoreBitFieldPopIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldPopIntAPS, L);
}
bool ByteCodeEmitter::emitStoreBitFieldPopBool(const SourceInfo &L) {
  return emitOp<>(OP_StoreBitFieldPopBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitStoreBitFieldPopSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitFieldPop<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldPopUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitFieldPop<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldPopSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitFieldPop<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldPopUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitFieldPop<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldPopSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitFieldPop<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldPopUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitFieldPop<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldPopSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitFieldPop<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldPopUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitFieldPop<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldPopIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitFieldPop<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldPopIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitFieldPop<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitStoreBitFieldPopBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StoreBitFieldPop<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_StorePopSint8,
OP_StorePopUint8,
OP_StorePopSint16,
OP_StorePopUint16,
OP_StorePopSint32,
OP_StorePopUint32,
OP_StorePopSint64,
OP_StorePopUint64,
OP_StorePopIntAP,
OP_StorePopIntAPS,
OP_StorePopBool,
OP_StorePopPtr,
OP_StorePopFnPtr,
OP_StorePopFloat,
#endif
#ifdef GET_INTERP
case OP_StorePopSint8: {
  if (!StorePop<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopUint8: {
  if (!StorePop<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopSint16: {
  if (!StorePop<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopUint16: {
  if (!StorePop<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopSint32: {
  if (!StorePop<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopUint32: {
  if (!StorePop<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopSint64: {
  if (!StorePop<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopUint64: {
  if (!StorePop<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopIntAP: {
  if (!StorePop<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopIntAPS: {
  if (!StorePop<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopBool: {
  if (!StorePop<PT_Bool>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopPtr: {
  if (!StorePop<PT_Ptr>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopFnPtr: {
  if (!StorePop<PT_FnPtr>(S, OpPC))
    return false;
  continue;
}
case OP_StorePopFloat: {
  if (!StorePop<PT_Float>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_StorePopSint8:
  PrintName("StorePopSint8");
  OS << "\t" << "\n";
  continue;
case OP_StorePopUint8:
  PrintName("StorePopUint8");
  OS << "\t" << "\n";
  continue;
case OP_StorePopSint16:
  PrintName("StorePopSint16");
  OS << "\t" << "\n";
  continue;
case OP_StorePopUint16:
  PrintName("StorePopUint16");
  OS << "\t" << "\n";
  continue;
case OP_StorePopSint32:
  PrintName("StorePopSint32");
  OS << "\t" << "\n";
  continue;
case OP_StorePopUint32:
  PrintName("StorePopUint32");
  OS << "\t" << "\n";
  continue;
case OP_StorePopSint64:
  PrintName("StorePopSint64");
  OS << "\t" << "\n";
  continue;
case OP_StorePopUint64:
  PrintName("StorePopUint64");
  OS << "\t" << "\n";
  continue;
case OP_StorePopIntAP:
  PrintName("StorePopIntAP");
  OS << "\t" << "\n";
  continue;
case OP_StorePopIntAPS:
  PrintName("StorePopIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_StorePopBool:
  PrintName("StorePopBool");
  OS << "\t" << "\n";
  continue;
case OP_StorePopPtr:
  PrintName("StorePopPtr");
  OS << "\t" << "\n";
  continue;
case OP_StorePopFnPtr:
  PrintName("StorePopFnPtr");
  OS << "\t" << "\n";
  continue;
case OP_StorePopFloat:
  PrintName("StorePopFloat");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitStorePopSint8(const SourceInfo &);
bool emitStorePopUint8(const SourceInfo &);
bool emitStorePopSint16(const SourceInfo &);
bool emitStorePopUint16(const SourceInfo &);
bool emitStorePopSint32(const SourceInfo &);
bool emitStorePopUint32(const SourceInfo &);
bool emitStorePopSint64(const SourceInfo &);
bool emitStorePopUint64(const SourceInfo &);
bool emitStorePopIntAP(const SourceInfo &);
bool emitStorePopIntAPS(const SourceInfo &);
bool emitStorePopBool(const SourceInfo &);
bool emitStorePopPtr(const SourceInfo &);
bool emitStorePopFnPtr(const SourceInfo &);
bool emitStorePopFloat(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitStorePop(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitStorePop(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitStorePopSint8(I);
  case PT_Uint8:
    return emitStorePopUint8(I);
  case PT_Sint16:
    return emitStorePopSint16(I);
  case PT_Uint16:
    return emitStorePopUint16(I);
  case PT_Sint32:
    return emitStorePopSint32(I);
  case PT_Uint32:
    return emitStorePopUint32(I);
  case PT_Sint64:
    return emitStorePopSint64(I);
  case PT_Uint64:
    return emitStorePopUint64(I);
  case PT_IntAP:
    return emitStorePopIntAP(I);
  case PT_IntAPS:
    return emitStorePopIntAPS(I);
  case PT_Bool:
    return emitStorePopBool(I);
  case PT_Ptr:
    return emitStorePopPtr(I);
  case PT_FnPtr:
    return emitStorePopFnPtr(I);
  case PT_Float:
    return emitStorePopFloat(I);
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitStorePopSint8(const SourceInfo &L) {
  return emitOp<>(OP_StorePopSint8, L);
}
bool ByteCodeEmitter::emitStorePopUint8(const SourceInfo &L) {
  return emitOp<>(OP_StorePopUint8, L);
}
bool ByteCodeEmitter::emitStorePopSint16(const SourceInfo &L) {
  return emitOp<>(OP_StorePopSint16, L);
}
bool ByteCodeEmitter::emitStorePopUint16(const SourceInfo &L) {
  return emitOp<>(OP_StorePopUint16, L);
}
bool ByteCodeEmitter::emitStorePopSint32(const SourceInfo &L) {
  return emitOp<>(OP_StorePopSint32, L);
}
bool ByteCodeEmitter::emitStorePopUint32(const SourceInfo &L) {
  return emitOp<>(OP_StorePopUint32, L);
}
bool ByteCodeEmitter::emitStorePopSint64(const SourceInfo &L) {
  return emitOp<>(OP_StorePopSint64, L);
}
bool ByteCodeEmitter::emitStorePopUint64(const SourceInfo &L) {
  return emitOp<>(OP_StorePopUint64, L);
}
bool ByteCodeEmitter::emitStorePopIntAP(const SourceInfo &L) {
  return emitOp<>(OP_StorePopIntAP, L);
}
bool ByteCodeEmitter::emitStorePopIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_StorePopIntAPS, L);
}
bool ByteCodeEmitter::emitStorePopBool(const SourceInfo &L) {
  return emitOp<>(OP_StorePopBool, L);
}
bool ByteCodeEmitter::emitStorePopPtr(const SourceInfo &L) {
  return emitOp<>(OP_StorePopPtr, L);
}
bool ByteCodeEmitter::emitStorePopFnPtr(const SourceInfo &L) {
  return emitOp<>(OP_StorePopFnPtr, L);
}
bool ByteCodeEmitter::emitStorePopFloat(const SourceInfo &L) {
  return emitOp<>(OP_StorePopFloat, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitStorePopSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitStorePopUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitStorePopSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitStorePopUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitStorePopSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitStorePopUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitStorePopSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitStorePopUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitStorePopIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitStorePopIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitStorePopBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_Bool>(S, OpPC);
}
bool EvalEmitter::emitStorePopPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_Ptr>(S, OpPC);
}
bool EvalEmitter::emitStorePopFnPtr(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_FnPtr>(S, OpPC);
}
bool EvalEmitter::emitStorePopFloat(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return StorePop<PT_Float>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_SubSint8,
OP_SubUint8,
OP_SubSint16,
OP_SubUint16,
OP_SubSint32,
OP_SubUint32,
OP_SubSint64,
OP_SubUint64,
OP_SubIntAP,
OP_SubIntAPS,
OP_SubBool,
#endif
#ifdef GET_INTERP
case OP_SubSint8: {
  if (!Sub<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_SubUint8: {
  if (!Sub<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_SubSint16: {
  if (!Sub<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_SubUint16: {
  if (!Sub<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_SubSint32: {
  if (!Sub<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_SubUint32: {
  if (!Sub<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_SubSint64: {
  if (!Sub<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_SubUint64: {
  if (!Sub<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_SubIntAP: {
  if (!Sub<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_SubIntAPS: {
  if (!Sub<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_SubBool: {
  if (!Sub<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_SubSint8:
  PrintName("SubSint8");
  OS << "\t" << "\n";
  continue;
case OP_SubUint8:
  PrintName("SubUint8");
  OS << "\t" << "\n";
  continue;
case OP_SubSint16:
  PrintName("SubSint16");
  OS << "\t" << "\n";
  continue;
case OP_SubUint16:
  PrintName("SubUint16");
  OS << "\t" << "\n";
  continue;
case OP_SubSint32:
  PrintName("SubSint32");
  OS << "\t" << "\n";
  continue;
case OP_SubUint32:
  PrintName("SubUint32");
  OS << "\t" << "\n";
  continue;
case OP_SubSint64:
  PrintName("SubSint64");
  OS << "\t" << "\n";
  continue;
case OP_SubUint64:
  PrintName("SubUint64");
  OS << "\t" << "\n";
  continue;
case OP_SubIntAP:
  PrintName("SubIntAP");
  OS << "\t" << "\n";
  continue;
case OP_SubIntAPS:
  PrintName("SubIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_SubBool:
  PrintName("SubBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSubSint8(const SourceInfo &);
bool emitSubUint8(const SourceInfo &);
bool emitSubSint16(const SourceInfo &);
bool emitSubUint16(const SourceInfo &);
bool emitSubSint32(const SourceInfo &);
bool emitSubUint32(const SourceInfo &);
bool emitSubSint64(const SourceInfo &);
bool emitSubUint64(const SourceInfo &);
bool emitSubIntAP(const SourceInfo &);
bool emitSubIntAPS(const SourceInfo &);
bool emitSubBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSub(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitSub(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitSubSint8(I);
  case PT_Uint8:
    return emitSubUint8(I);
  case PT_Sint16:
    return emitSubSint16(I);
  case PT_Uint16:
    return emitSubUint16(I);
  case PT_Sint32:
    return emitSubSint32(I);
  case PT_Uint32:
    return emitSubUint32(I);
  case PT_Sint64:
    return emitSubSint64(I);
  case PT_Uint64:
    return emitSubUint64(I);
  case PT_IntAP:
    return emitSubIntAP(I);
  case PT_IntAPS:
    return emitSubIntAPS(I);
  case PT_Bool:
    return emitSubBool(I);
  default: llvm_unreachable("invalid type: emitSub");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitSubSint8(const SourceInfo &L) {
  return emitOp<>(OP_SubSint8, L);
}
bool ByteCodeEmitter::emitSubUint8(const SourceInfo &L) {
  return emitOp<>(OP_SubUint8, L);
}
bool ByteCodeEmitter::emitSubSint16(const SourceInfo &L) {
  return emitOp<>(OP_SubSint16, L);
}
bool ByteCodeEmitter::emitSubUint16(const SourceInfo &L) {
  return emitOp<>(OP_SubUint16, L);
}
bool ByteCodeEmitter::emitSubSint32(const SourceInfo &L) {
  return emitOp<>(OP_SubSint32, L);
}
bool ByteCodeEmitter::emitSubUint32(const SourceInfo &L) {
  return emitOp<>(OP_SubUint32, L);
}
bool ByteCodeEmitter::emitSubSint64(const SourceInfo &L) {
  return emitOp<>(OP_SubSint64, L);
}
bool ByteCodeEmitter::emitSubUint64(const SourceInfo &L) {
  return emitOp<>(OP_SubUint64, L);
}
bool ByteCodeEmitter::emitSubIntAP(const SourceInfo &L) {
  return emitOp<>(OP_SubIntAP, L);
}
bool ByteCodeEmitter::emitSubIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_SubIntAPS, L);
}
bool ByteCodeEmitter::emitSubBool(const SourceInfo &L) {
  return emitOp<>(OP_SubBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitSubSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Sub<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitSubUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Sub<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitSubSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Sub<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitSubUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Sub<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitSubSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Sub<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitSubUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Sub<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitSubSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Sub<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitSubUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Sub<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitSubIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Sub<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitSubIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Sub<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitSubBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Sub<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_SubOffsetSint8,
OP_SubOffsetUint8,
OP_SubOffsetSint16,
OP_SubOffsetUint16,
OP_SubOffsetSint32,
OP_SubOffsetUint32,
OP_SubOffsetSint64,
OP_SubOffsetUint64,
OP_SubOffsetIntAP,
OP_SubOffsetIntAPS,
OP_SubOffsetBool,
#endif
#ifdef GET_INTERP
case OP_SubOffsetSint8: {
  if (!SubOffset<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_SubOffsetUint8: {
  if (!SubOffset<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_SubOffsetSint16: {
  if (!SubOffset<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_SubOffsetUint16: {
  if (!SubOffset<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_SubOffsetSint32: {
  if (!SubOffset<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_SubOffsetUint32: {
  if (!SubOffset<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_SubOffsetSint64: {
  if (!SubOffset<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_SubOffsetUint64: {
  if (!SubOffset<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_SubOffsetIntAP: {
  if (!SubOffset<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_SubOffsetIntAPS: {
  if (!SubOffset<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
case OP_SubOffsetBool: {
  if (!SubOffset<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_SubOffsetSint8:
  PrintName("SubOffsetSint8");
  OS << "\t" << "\n";
  continue;
case OP_SubOffsetUint8:
  PrintName("SubOffsetUint8");
  OS << "\t" << "\n";
  continue;
case OP_SubOffsetSint16:
  PrintName("SubOffsetSint16");
  OS << "\t" << "\n";
  continue;
case OP_SubOffsetUint16:
  PrintName("SubOffsetUint16");
  OS << "\t" << "\n";
  continue;
case OP_SubOffsetSint32:
  PrintName("SubOffsetSint32");
  OS << "\t" << "\n";
  continue;
case OP_SubOffsetUint32:
  PrintName("SubOffsetUint32");
  OS << "\t" << "\n";
  continue;
case OP_SubOffsetSint64:
  PrintName("SubOffsetSint64");
  OS << "\t" << "\n";
  continue;
case OP_SubOffsetUint64:
  PrintName("SubOffsetUint64");
  OS << "\t" << "\n";
  continue;
case OP_SubOffsetIntAP:
  PrintName("SubOffsetIntAP");
  OS << "\t" << "\n";
  continue;
case OP_SubOffsetIntAPS:
  PrintName("SubOffsetIntAPS");
  OS << "\t" << "\n";
  continue;
case OP_SubOffsetBool:
  PrintName("SubOffsetBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSubOffsetSint8(const SourceInfo &);
bool emitSubOffsetUint8(const SourceInfo &);
bool emitSubOffsetSint16(const SourceInfo &);
bool emitSubOffsetUint16(const SourceInfo &);
bool emitSubOffsetSint32(const SourceInfo &);
bool emitSubOffsetUint32(const SourceInfo &);
bool emitSubOffsetSint64(const SourceInfo &);
bool emitSubOffsetUint64(const SourceInfo &);
bool emitSubOffsetIntAP(const SourceInfo &);
bool emitSubOffsetIntAPS(const SourceInfo &);
bool emitSubOffsetBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSubOffset(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitSubOffset(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitSubOffsetSint8(I);
  case PT_Uint8:
    return emitSubOffsetUint8(I);
  case PT_Sint16:
    return emitSubOffsetSint16(I);
  case PT_Uint16:
    return emitSubOffsetUint16(I);
  case PT_Sint32:
    return emitSubOffsetSint32(I);
  case PT_Uint32:
    return emitSubOffsetUint32(I);
  case PT_Sint64:
    return emitSubOffsetSint64(I);
  case PT_Uint64:
    return emitSubOffsetUint64(I);
  case PT_IntAP:
    return emitSubOffsetIntAP(I);
  case PT_IntAPS:
    return emitSubOffsetIntAPS(I);
  case PT_Bool:
    return emitSubOffsetBool(I);
  default: llvm_unreachable("invalid type: emitSubOffset");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitSubOffsetSint8(const SourceInfo &L) {
  return emitOp<>(OP_SubOffsetSint8, L);
}
bool ByteCodeEmitter::emitSubOffsetUint8(const SourceInfo &L) {
  return emitOp<>(OP_SubOffsetUint8, L);
}
bool ByteCodeEmitter::emitSubOffsetSint16(const SourceInfo &L) {
  return emitOp<>(OP_SubOffsetSint16, L);
}
bool ByteCodeEmitter::emitSubOffsetUint16(const SourceInfo &L) {
  return emitOp<>(OP_SubOffsetUint16, L);
}
bool ByteCodeEmitter::emitSubOffsetSint32(const SourceInfo &L) {
  return emitOp<>(OP_SubOffsetSint32, L);
}
bool ByteCodeEmitter::emitSubOffsetUint32(const SourceInfo &L) {
  return emitOp<>(OP_SubOffsetUint32, L);
}
bool ByteCodeEmitter::emitSubOffsetSint64(const SourceInfo &L) {
  return emitOp<>(OP_SubOffsetSint64, L);
}
bool ByteCodeEmitter::emitSubOffsetUint64(const SourceInfo &L) {
  return emitOp<>(OP_SubOffsetUint64, L);
}
bool ByteCodeEmitter::emitSubOffsetIntAP(const SourceInfo &L) {
  return emitOp<>(OP_SubOffsetIntAP, L);
}
bool ByteCodeEmitter::emitSubOffsetIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_SubOffsetIntAPS, L);
}
bool ByteCodeEmitter::emitSubOffsetBool(const SourceInfo &L) {
  return emitOp<>(OP_SubOffsetBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitSubOffsetSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubOffset<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitSubOffsetUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubOffset<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitSubOffsetSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubOffset<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitSubOffsetUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubOffset<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitSubOffsetSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubOffset<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitSubOffsetUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubOffset<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitSubOffsetSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubOffset<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitSubOffsetUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubOffset<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitSubOffsetIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubOffset<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitSubOffsetIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubOffset<PT_IntAPS>(S, OpPC);
}
bool EvalEmitter::emitSubOffsetBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubOffset<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_SubPtrSint8,
OP_SubPtrUint8,
OP_SubPtrSint16,
OP_SubPtrUint16,
OP_SubPtrSint32,
OP_SubPtrUint32,
OP_SubPtrSint64,
OP_SubPtrUint64,
OP_SubPtrIntAP,
OP_SubPtrIntAPS,
#endif
#ifdef GET_INTERP
case OP_SubPtrSint8: {
  if (!SubPtr<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_SubPtrUint8: {
  if (!SubPtr<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_SubPtrSint16: {
  if (!SubPtr<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_SubPtrUint16: {
  if (!SubPtr<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_SubPtrSint32: {
  if (!SubPtr<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_SubPtrUint32: {
  if (!SubPtr<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_SubPtrSint64: {
  if (!SubPtr<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_SubPtrUint64: {
  if (!SubPtr<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_SubPtrIntAP: {
  if (!SubPtr<PT_IntAP>(S, OpPC))
    return false;
  continue;
}
case OP_SubPtrIntAPS: {
  if (!SubPtr<PT_IntAPS>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_SubPtrSint8:
  PrintName("SubPtrSint8");
  OS << "\t" << "\n";
  continue;
case OP_SubPtrUint8:
  PrintName("SubPtrUint8");
  OS << "\t" << "\n";
  continue;
case OP_SubPtrSint16:
  PrintName("SubPtrSint16");
  OS << "\t" << "\n";
  continue;
case OP_SubPtrUint16:
  PrintName("SubPtrUint16");
  OS << "\t" << "\n";
  continue;
case OP_SubPtrSint32:
  PrintName("SubPtrSint32");
  OS << "\t" << "\n";
  continue;
case OP_SubPtrUint32:
  PrintName("SubPtrUint32");
  OS << "\t" << "\n";
  continue;
case OP_SubPtrSint64:
  PrintName("SubPtrSint64");
  OS << "\t" << "\n";
  continue;
case OP_SubPtrUint64:
  PrintName("SubPtrUint64");
  OS << "\t" << "\n";
  continue;
case OP_SubPtrIntAP:
  PrintName("SubPtrIntAP");
  OS << "\t" << "\n";
  continue;
case OP_SubPtrIntAPS:
  PrintName("SubPtrIntAPS");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSubPtrSint8(const SourceInfo &);
bool emitSubPtrUint8(const SourceInfo &);
bool emitSubPtrSint16(const SourceInfo &);
bool emitSubPtrUint16(const SourceInfo &);
bool emitSubPtrSint32(const SourceInfo &);
bool emitSubPtrUint32(const SourceInfo &);
bool emitSubPtrSint64(const SourceInfo &);
bool emitSubPtrUint64(const SourceInfo &);
bool emitSubPtrIntAP(const SourceInfo &);
bool emitSubPtrIntAPS(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSubPtr(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitSubPtr(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitSubPtrSint8(I);
  case PT_Uint8:
    return emitSubPtrUint8(I);
  case PT_Sint16:
    return emitSubPtrSint16(I);
  case PT_Uint16:
    return emitSubPtrUint16(I);
  case PT_Sint32:
    return emitSubPtrSint32(I);
  case PT_Uint32:
    return emitSubPtrUint32(I);
  case PT_Sint64:
    return emitSubPtrSint64(I);
  case PT_Uint64:
    return emitSubPtrUint64(I);
  case PT_IntAP:
    return emitSubPtrIntAP(I);
  case PT_IntAPS:
    return emitSubPtrIntAPS(I);
  default: llvm_unreachable("invalid type: emitSubPtr");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitSubPtrSint8(const SourceInfo &L) {
  return emitOp<>(OP_SubPtrSint8, L);
}
bool ByteCodeEmitter::emitSubPtrUint8(const SourceInfo &L) {
  return emitOp<>(OP_SubPtrUint8, L);
}
bool ByteCodeEmitter::emitSubPtrSint16(const SourceInfo &L) {
  return emitOp<>(OP_SubPtrSint16, L);
}
bool ByteCodeEmitter::emitSubPtrUint16(const SourceInfo &L) {
  return emitOp<>(OP_SubPtrUint16, L);
}
bool ByteCodeEmitter::emitSubPtrSint32(const SourceInfo &L) {
  return emitOp<>(OP_SubPtrSint32, L);
}
bool ByteCodeEmitter::emitSubPtrUint32(const SourceInfo &L) {
  return emitOp<>(OP_SubPtrUint32, L);
}
bool ByteCodeEmitter::emitSubPtrSint64(const SourceInfo &L) {
  return emitOp<>(OP_SubPtrSint64, L);
}
bool ByteCodeEmitter::emitSubPtrUint64(const SourceInfo &L) {
  return emitOp<>(OP_SubPtrUint64, L);
}
bool ByteCodeEmitter::emitSubPtrIntAP(const SourceInfo &L) {
  return emitOp<>(OP_SubPtrIntAP, L);
}
bool ByteCodeEmitter::emitSubPtrIntAPS(const SourceInfo &L) {
  return emitOp<>(OP_SubPtrIntAPS, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitSubPtrSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubPtr<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitSubPtrUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubPtr<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitSubPtrSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubPtr<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitSubPtrUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubPtr<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitSubPtrSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubPtr<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitSubPtrUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubPtr<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitSubPtrSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubPtr<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitSubPtrUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubPtr<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitSubPtrIntAP(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubPtr<PT_IntAP>(S, OpPC);
}
bool EvalEmitter::emitSubPtrIntAPS(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return SubPtr<PT_IntAPS>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_Subf,
#endif
#ifdef GET_INTERP
case OP_Subf: {
  auto V0 = ReadArg<llvm::RoundingMode>(S, PC);
  if (!Subf(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_Subf:
  PrintName("Subf");
  OS << "\t" << ReadArg<llvm::RoundingMode>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitSubf(llvm::RoundingMode, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitSubf(llvm::RoundingMode A0, const SourceInfo &L) {
  return emitOp<llvm::RoundingMode>(OP_Subf, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitSubf(llvm::RoundingMode A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Subf(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_This,
#endif
#ifdef GET_INTERP
case OP_This: {
  if (!This(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_This:
  PrintName("This");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitThis(const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitThis(const SourceInfo &L) {
  return emitOp<>(OP_This, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitThis(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return This(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ZeroSint8,
OP_ZeroUint8,
OP_ZeroSint16,
OP_ZeroUint16,
OP_ZeroSint32,
OP_ZeroUint32,
OP_ZeroSint64,
OP_ZeroUint64,
OP_ZeroBool,
#endif
#ifdef GET_INTERP
case OP_ZeroSint8: {
  if (!Zero<PT_Sint8>(S, OpPC))
    return false;
  continue;
}
case OP_ZeroUint8: {
  if (!Zero<PT_Uint8>(S, OpPC))
    return false;
  continue;
}
case OP_ZeroSint16: {
  if (!Zero<PT_Sint16>(S, OpPC))
    return false;
  continue;
}
case OP_ZeroUint16: {
  if (!Zero<PT_Uint16>(S, OpPC))
    return false;
  continue;
}
case OP_ZeroSint32: {
  if (!Zero<PT_Sint32>(S, OpPC))
    return false;
  continue;
}
case OP_ZeroUint32: {
  if (!Zero<PT_Uint32>(S, OpPC))
    return false;
  continue;
}
case OP_ZeroSint64: {
  if (!Zero<PT_Sint64>(S, OpPC))
    return false;
  continue;
}
case OP_ZeroUint64: {
  if (!Zero<PT_Uint64>(S, OpPC))
    return false;
  continue;
}
case OP_ZeroBool: {
  if (!Zero<PT_Bool>(S, OpPC))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ZeroSint8:
  PrintName("ZeroSint8");
  OS << "\t" << "\n";
  continue;
case OP_ZeroUint8:
  PrintName("ZeroUint8");
  OS << "\t" << "\n";
  continue;
case OP_ZeroSint16:
  PrintName("ZeroSint16");
  OS << "\t" << "\n";
  continue;
case OP_ZeroUint16:
  PrintName("ZeroUint16");
  OS << "\t" << "\n";
  continue;
case OP_ZeroSint32:
  PrintName("ZeroSint32");
  OS << "\t" << "\n";
  continue;
case OP_ZeroUint32:
  PrintName("ZeroUint32");
  OS << "\t" << "\n";
  continue;
case OP_ZeroSint64:
  PrintName("ZeroSint64");
  OS << "\t" << "\n";
  continue;
case OP_ZeroUint64:
  PrintName("ZeroUint64");
  OS << "\t" << "\n";
  continue;
case OP_ZeroBool:
  PrintName("ZeroBool");
  OS << "\t" << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitZeroSint8(const SourceInfo &);
bool emitZeroUint8(const SourceInfo &);
bool emitZeroSint16(const SourceInfo &);
bool emitZeroUint16(const SourceInfo &);
bool emitZeroSint32(const SourceInfo &);
bool emitZeroUint32(const SourceInfo &);
bool emitZeroSint64(const SourceInfo &);
bool emitZeroUint64(const SourceInfo &);
bool emitZeroBool(const SourceInfo &);
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitZero(PrimType, const SourceInfo &I);
#endif
#if defined(GET_EVAL_IMPL) || defined(GET_LINK_IMPL)
bool
#if defined(GET_EVAL_IMPL)
EvalEmitter
#else
ByteCodeEmitter
#endif
::emitZero(PrimType T0, const SourceInfo &I) {
  switch (T0) {
  case PT_Sint8:
    return emitZeroSint8(I);
  case PT_Uint8:
    return emitZeroUint8(I);
  case PT_Sint16:
    return emitZeroSint16(I);
  case PT_Uint16:
    return emitZeroUint16(I);
  case PT_Sint32:
    return emitZeroSint32(I);
  case PT_Uint32:
    return emitZeroUint32(I);
  case PT_Sint64:
    return emitZeroSint64(I);
  case PT_Uint64:
    return emitZeroUint64(I);
  case PT_Bool:
    return emitZeroBool(I);
  default: llvm_unreachable("invalid type: emitZero");
  }
  llvm_unreachable("invalid enum value");
}
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitZeroSint8(const SourceInfo &L) {
  return emitOp<>(OP_ZeroSint8, L);
}
bool ByteCodeEmitter::emitZeroUint8(const SourceInfo &L) {
  return emitOp<>(OP_ZeroUint8, L);
}
bool ByteCodeEmitter::emitZeroSint16(const SourceInfo &L) {
  return emitOp<>(OP_ZeroSint16, L);
}
bool ByteCodeEmitter::emitZeroUint16(const SourceInfo &L) {
  return emitOp<>(OP_ZeroUint16, L);
}
bool ByteCodeEmitter::emitZeroSint32(const SourceInfo &L) {
  return emitOp<>(OP_ZeroSint32, L);
}
bool ByteCodeEmitter::emitZeroUint32(const SourceInfo &L) {
  return emitOp<>(OP_ZeroUint32, L);
}
bool ByteCodeEmitter::emitZeroSint64(const SourceInfo &L) {
  return emitOp<>(OP_ZeroSint64, L);
}
bool ByteCodeEmitter::emitZeroUint64(const SourceInfo &L) {
  return emitOp<>(OP_ZeroUint64, L);
}
bool ByteCodeEmitter::emitZeroBool(const SourceInfo &L) {
  return emitOp<>(OP_ZeroBool, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitZeroSint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Zero<PT_Sint8>(S, OpPC);
}
bool EvalEmitter::emitZeroUint8(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Zero<PT_Uint8>(S, OpPC);
}
bool EvalEmitter::emitZeroSint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Zero<PT_Sint16>(S, OpPC);
}
bool EvalEmitter::emitZeroUint16(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Zero<PT_Uint16>(S, OpPC);
}
bool EvalEmitter::emitZeroSint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Zero<PT_Sint32>(S, OpPC);
}
bool EvalEmitter::emitZeroUint32(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Zero<PT_Uint32>(S, OpPC);
}
bool EvalEmitter::emitZeroSint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Zero<PT_Sint64>(S, OpPC);
}
bool EvalEmitter::emitZeroUint64(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Zero<PT_Uint64>(S, OpPC);
}
bool EvalEmitter::emitZeroBool(const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return Zero<PT_Bool>(S, OpPC);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ZeroIntAP,
#endif
#ifdef GET_INTERP
case OP_ZeroIntAP: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!ZeroIntAP(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ZeroIntAP:
  PrintName("ZeroIntAP");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitZeroIntAP(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitZeroIntAP(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_ZeroIntAP, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitZeroIntAP(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ZeroIntAP(S, OpPC, A0);
}
#endif
#ifdef GET_OPCODE_NAMES
OP_ZeroIntAPS,
#endif
#ifdef GET_INTERP
case OP_ZeroIntAPS: {
  auto V0 = ReadArg<uint32_t>(S, PC);
  if (!ZeroIntAPS(S, OpPC, V0))
    return false;
  continue;
}
#endif
#ifdef GET_DISASM
case OP_ZeroIntAPS:
  PrintName("ZeroIntAPS");
  OS << "\t" << ReadArg<uint32_t>(P, PC) << " " << "\n";
  continue;
#endif
#if defined(GET_EVAL_PROTO) || defined(GET_LINK_PROTO)
bool emitZeroIntAPS(uint32_t, const SourceInfo &);
#endif
#ifdef GET_LINK_IMPL
bool ByteCodeEmitter::emitZeroIntAPS(uint32_t A0, const SourceInfo &L) {
  return emitOp<uint32_t>(OP_ZeroIntAPS, A0, L);
}
#endif
#ifdef GET_EVAL_IMPL
bool EvalEmitter::emitZeroIntAPS(uint32_t A0, const SourceInfo &L) {
  if (!isActive()) return true;
  CurrentSource = L;
  return ZeroIntAPS(S, OpPC, A0);
}
#endif
