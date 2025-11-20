/*===- TableGen'erated file -------------------------------------*- C++ -*-===*\
|*                                                                            *|
|* OpenCL Builtin handling                                                    *|
|*                                                                            *|
|* Automatically generated file, do not edit!                                 *|
|* From: OpenCLBuiltins.td                                                    *|
|*                                                                            *|
\*===----------------------------------------------------------------------===*/

#include "llvm/ADT/StringRef.h"
using namespace clang;

enum OpenCLTypeID {
  OCLT_atomic_double,
  OCLT_atomic_flag,
  OCLT_atomic_float,
  OCLT_atomic_half,
  OCLT_atomic_int,
  OCLT_atomic_intptr_t,
  OCLT_atomic_long,
  OCLT_atomic_ptrdiff_t,
  OCLT_atomic_size_t,
  OCLT_atomic_uint,
  OCLT_atomic_uintptr_t,
  OCLT_atomic_ulong,
  OCLT_bool,
  OCLT_char,
  OCLT_clk_event_t,
  OCLT_clk_profiling_info,
  OCLT_double,
  OCLT_event_t,
  OCLT_float,
  OCLT_half,
  OCLT___half,
  OCLT_image1d_t,
  OCLT_image1d_array_t,
  OCLT_image1d_buffer_t,
  OCLT_image2d_t,
  OCLT_image2d_array_t,
  OCLT_image2d_array_depth_t,
  OCLT_image2d_array_msaa_t,
  OCLT_image2d_array_msaa_depth_t,
  OCLT_image2d_depth_t,
  OCLT_image2d_msaa_t,
  OCLT_image2d_msaa_depth_t,
  OCLT_image3d_t,
  OCLT_int,
  OCLT_intptr_t,
  OCLT_long,
  OCLT_cl_mem_fence_flags,
  OCLT_memory_order,
  OCLT_memory_scope,
  OCLT_ndrange_t,
  OCLT_ptrdiff_t,
  OCLT_queue_t,
  OCLT_reserve_id_t,
  OCLT_sampler_t,
  OCLT_short,
  OCLT_size_t,
  OCLT_uchar,
  OCLT_uint,
  OCLT_uintptr_t,
  OCLT_ulong,
  OCLT_ushort,
  OCLT_void,
  OCLT_AGenType1,
  OCLT_AGenTypeN,
  OCLT_AGenTypeNNoScalar,
  OCLT_AI2UGenTypeN,
  OCLT_AIGenType1,
  OCLT_AIGenTypeN,
  OCLT_AIGenTypeNNoScalar,
  OCLT_CharShortGenType1,
  OCLT_FGenTypeN,
  OCLT_GenTypeCharVecAndScalar,
  OCLT_GenTypeCharVecNoScalar,
  OCLT_GenTypeDoubleVec1234,
  OCLT_GenTypeDoubleVecAndScalar,
  OCLT_GenTypeDoubleVecNoScalar,
  OCLT_GenTypeFloatVec1234,
  OCLT_GenTypeFloatVecAndScalar,
  OCLT_GenTypeFloatVecNoScalar,
  OCLT_GenTypeHalfVec1234,
  OCLT_GenTypeHalfVecAndScalar,
  OCLT_GenTypeHalfVecNoScalar,
  OCLT_GenTypeIntVecAndScalar,
  OCLT_GenTypeIntVecNoScalar,
  OCLT_GenTypeLongVecAndScalar,
  OCLT_GenTypeLongVecNoScalar,
  OCLT_GenTypeShortVecAndScalar,
  OCLT_GenTypeShortVecNoScalar,
  OCLT_GenTypeUCharVecAndScalar,
  OCLT_GenTypeUCharVecNoScalar,
  OCLT_GenTypeUIntVecAndScalar,
  OCLT_GenTypeUIntVecNoScalar,
  OCLT_GenTypeULongVecAndScalar,
  OCLT_GenTypeULongVecNoScalar,
  OCLT_GenTypeUShortVecAndScalar,
  OCLT_GenTypeUShortVecNoScalar,
  OCLT_IntLongFloatGenType1,
  OCLT_SGenTypeN,
  OCLT_UGenTypeN,
};

// Image access qualifier.
enum OpenCLAccessQual : unsigned char {
  OCLAQ_None,
  OCLAQ_ReadOnly,
  OCLAQ_WriteOnly,
  OCLAQ_ReadWrite
};

// Represents a return type or argument type.
struct OpenCLTypeStruct {
  // A type (e.g. float, int, ...).
  const OpenCLTypeID ID;
  // Vector size (if applicable; 0 for scalars and generic types).
  const unsigned VectorWidth;
  // 0 if the type is not a pointer.
  const bool IsPointer : 1;
  // 0 if the type is not const.
  const bool IsConst : 1;
  // 0 if the type is not volatile.
  const bool IsVolatile : 1;
  // Access qualifier.
  const OpenCLAccessQual AccessQualifier;
  // Address space of the pointer (if applicable).
  const LangAS AS;
};

// One overload of an OpenCL builtin function.
struct OpenCLBuiltinStruct {
  // Index of the signature in the OpenCLTypeStruct table.
  const unsigned SigTableIndex;
  // Entries between index SigTableIndex and (SigTableIndex + NumTypes - 1) in
  // the SignatureTable represent the complete signature.  The first type at
  // index SigTableIndex is the return type.
  const unsigned NumTypes;
  // Function attribute __attribute__((pure))
  const bool IsPure : 1;
  // Function attribute __attribute__((const))
  const bool IsConst : 1;
  // Function attribute __attribute__((convergent))
  const bool IsConv : 1;
  // OpenCL extension(s) required for this overload.
  const unsigned short Extension;
  // OpenCL versions in which this overload is available.
  const unsigned short Versions;
};

static const char *FunctionExtensionTable[] = {
  // 0: ArmIntegerDotProductAccumulateInt8
  "cl_arm_integer_dot_product_accumulate_int8",
  // 1: ArmIntegerDotProductAccumulateInt16
  "cl_arm_integer_dot_product_accumulate_int16",
  // 2: ArmIntegerDotProductAccumulateSaturateInt8
  "cl_arm_integer_dot_product_accumulate_saturate_int8",
  // 3: ArmIntegerDotProductInt8
  "cl_arm_integer_dot_product_int8",
  // 4: FuncExtFloatAtomicsFp16GenericASAdd
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_add __opencl_c_ext_fp16_global_atomic_add",
  // 5: FuncExtFloatAtomicsFp16GenericASLoadStore
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_load_store __opencl_c_ext_fp16_local_atomic_load_store",
  // 6: FuncExtFloatAtomicsFp16GenericASMinMax
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_min_max __opencl_c_ext_fp16_global_atomic_min_max",
  // 7: FuncExtFloatAtomicsFp16GlobalASAdd
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_add",
  // 8: FuncExtFloatAtomicsFp16GlobalASLoadStore
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_load_store",
  // 9: FuncExtFloatAtomicsFp16GlobalASMinMax
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_min_max",
  // 10: FuncExtFloatAtomicsFp16LocalASAdd
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_add",
  // 11: FuncExtFloatAtomicsFp16LocalASLoadStore
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_load_store",
  // 12: FuncExtFloatAtomicsFp16LocalASMinMax
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_min_max",
  // 13: FuncExtFloatAtomicsFp32GenericASAdd
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_add __opencl_c_ext_fp32_global_atomic_add",
  // 14: FuncExtFloatAtomicsFp32GenericASMinMax
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_min_max __opencl_c_ext_fp32_global_atomic_min_max",
  // 15: FuncExtFloatAtomicsFp32GlobalASAdd
  "cl_ext_float_atomics __opencl_c_ext_fp32_global_atomic_add",
  // 16: FuncExtFloatAtomicsFp32GlobalASMinMax
  "cl_ext_float_atomics __opencl_c_ext_fp32_global_atomic_min_max",
  // 17: FuncExtFloatAtomicsFp32LocalASAdd
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_add",
  // 18: FuncExtFloatAtomicsFp32LocalASMinMax
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_min_max",
  // 19: FuncExtFloatAtomicsFp64GenericASAdd
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_add __opencl_c_ext_fp64_global_atomic_add",
  // 20: FuncExtFloatAtomicsFp64GenericASMinMax
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_min_max __opencl_c_ext_fp64_global_atomic_min_max",
  // 21: FuncExtFloatAtomicsFp64GlobalASAdd
  "cl_ext_float_atomics __opencl_c_ext_fp64_global_atomic_add",
  // 22: FuncExtFloatAtomicsFp64GlobalASMinMax
  "cl_ext_float_atomics __opencl_c_ext_fp64_global_atomic_min_max",
  // 23: FuncExtFloatAtomicsFp64LocalASAdd
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_add",
  // 24: FuncExtFloatAtomicsFp64LocalASMinMax
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_min_max",
  // 25: FuncExtKhrExtendedBitOps
  "cl_khr_extended_bit_ops",
  // 26: FuncExtKhrGlMsaaSharing
  "cl_khr_gl_msaa_sharing",
  // 27: FuncExtKhrGlobalInt32BaseAtomics
  "cl_khr_global_int32_base_atomics",
  // 28: FuncExtKhrGlobalInt32ExtendedAtomics
  "cl_khr_global_int32_extended_atomics",
  // 29: FuncExtKhrInt64BaseAtomics
  "cl_khr_int64_base_atomics",
  // 30: FuncExtKhrInt64ExtendedAtomics
  "cl_khr_int64_extended_atomics",
  // 31: FuncExtKhrLocalInt32BaseAtomics
  "cl_khr_local_int32_base_atomics",
  // 32: FuncExtKhrLocalInt32ExtendedAtomics
  "cl_khr_local_int32_extended_atomics",
  // 33: FuncExtKhrMipmapImage
  "cl_khr_mipmap_image",
  // 34: FuncExtKhrMipmapImageWrites
  "cl_khr_mipmap_image_writes",
  // 35: FuncExtKhrSubgroupBallot
  "cl_khr_subgroup_ballot",
  // 36: FuncExtKhrSubgroupClusteredReduce
  "cl_khr_subgroup_clustered_reduce",
  // 37: FuncExtKhrSubgroupExtendedTypes
  "cl_khr_subgroup_extended_types",
  // 38: FuncExtKhrSubgroupNonUniformArithmetic
  "cl_khr_subgroup_non_uniform_arithmetic",
  // 39: FuncExtKhrSubgroupNonUniformVote
  "cl_khr_subgroup_non_uniform_vote",
  // 40: FuncExtKhrSubgroupShuffle
  "cl_khr_subgroup_shuffle",
  // 41: FuncExtKhrSubgroupShuffleRelative
  "cl_khr_subgroup_shuffle_relative",
  // 42: FuncExtKhrSubgroups
  "__opencl_subgroup_builtins",
  // 43: FuncExtNone
  "",
  // 44: FuncExtOpenCLCDeviceEnqueue
  "__opencl_c_device_enqueue",
  // 45: FuncExtOpenCLCGenericAddressSpace
  "__opencl_c_generic_address_space",
  // 46: FuncExtOpenCLCNamedAddressSpaceBuiltins
  "__opencl_c_named_address_space_builtins",
  // 47: FuncExtOpenCLCPipes
  "__opencl_c_pipes",
  // 48: FuncExtOpenCLCReadWriteImages
  "__opencl_c_read_write_images",
  // 49: FuncExtOpenCLCWGCollectiveFunctions
  "__opencl_c_work_group_collective_functions",
  // 50: FuncExtOpenCLCxx
  "__cplusplus",
  // 51: anonymous_8060
  "__opencl_c_generic_address_space __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 52: anonymous_8062
  "__opencl_c_generic_address_space __opencl_c_atomic_scope_device",
  // 53: anonymous_8258
  "__opencl_c_named_address_space_builtins __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 54: anonymous_8260
  "__opencl_c_named_address_space_builtins __opencl_c_atomic_scope_device",
  // 55: anonymous_8817
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_load_store __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 56: anonymous_8820
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_load_store __opencl_c_atomic_scope_device",
  // 57: anonymous_8830
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_add __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 58: anonymous_8833
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_add __opencl_c_atomic_scope_device",
  // 59: anonymous_8837
  "cl_ext_float_atomics __opencl_c_ext_fp32_global_atomic_add __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 60: anonymous_8840
  "cl_ext_float_atomics __opencl_c_ext_fp32_global_atomic_add __opencl_c_atomic_scope_device",
  // 61: anonymous_8844
  "cl_ext_float_atomics __opencl_c_ext_fp64_global_atomic_add __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 62: anonymous_8847
  "cl_ext_float_atomics __opencl_c_ext_fp64_global_atomic_add __opencl_c_atomic_scope_device",
  // 63: anonymous_8860
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_min_max __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 64: anonymous_8863
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_min_max __opencl_c_atomic_scope_device",
  // 65: anonymous_8867
  "cl_ext_float_atomics __opencl_c_ext_fp32_global_atomic_min_max __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 66: anonymous_8870
  "cl_ext_float_atomics __opencl_c_ext_fp32_global_atomic_min_max __opencl_c_atomic_scope_device",
  // 67: anonymous_8874
  "cl_ext_float_atomics __opencl_c_ext_fp64_global_atomic_min_max __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 68: anonymous_8877
  "cl_ext_float_atomics __opencl_c_ext_fp64_global_atomic_min_max __opencl_c_atomic_scope_device",
  // 69: anonymous_8891
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_load_store __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 70: anonymous_8894
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_load_store __opencl_c_atomic_scope_device",
  // 71: anonymous_8904
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_add __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 72: anonymous_8907
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_add __opencl_c_atomic_scope_device",
  // 73: anonymous_8911
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_add __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 74: anonymous_8914
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_add __opencl_c_atomic_scope_device",
  // 75: anonymous_8918
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_add __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 76: anonymous_8921
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_add __opencl_c_atomic_scope_device",
  // 77: anonymous_8934
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_min_max __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 78: anonymous_8937
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_min_max __opencl_c_atomic_scope_device",
  // 79: anonymous_8941
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_min_max __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 80: anonymous_8944
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_min_max __opencl_c_atomic_scope_device",
  // 81: anonymous_8948
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_min_max __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 82: anonymous_8951
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_min_max __opencl_c_atomic_scope_device",
  // 83: anonymous_8965
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_load_store __opencl_c_ext_fp16_local_atomic_load_store __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 84: anonymous_8968
  "cl_ext_float_atomics __opencl_c_ext_fp16_global_atomic_load_store __opencl_c_ext_fp16_local_atomic_load_store __opencl_c_atomic_scope_device",
  // 85: anonymous_8978
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_add __opencl_c_ext_fp16_global_atomic_add __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 86: anonymous_8981
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_add __opencl_c_ext_fp16_global_atomic_add __opencl_c_atomic_scope_device",
  // 87: anonymous_8985
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_add __opencl_c_ext_fp32_global_atomic_add __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 88: anonymous_8988
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_add __opencl_c_ext_fp32_global_atomic_add __opencl_c_atomic_scope_device",
  // 89: anonymous_8992
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_add __opencl_c_ext_fp64_global_atomic_add __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 90: anonymous_8995
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_add __opencl_c_ext_fp64_global_atomic_add __opencl_c_atomic_scope_device",
  // 91: anonymous_9008
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_min_max __opencl_c_ext_fp16_global_atomic_min_max __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 92: anonymous_9011
  "cl_ext_float_atomics __opencl_c_ext_fp16_local_atomic_min_max __opencl_c_ext_fp16_global_atomic_min_max __opencl_c_atomic_scope_device",
  // 93: anonymous_9015
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_min_max __opencl_c_ext_fp32_global_atomic_min_max __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 94: anonymous_9018
  "cl_ext_float_atomics __opencl_c_ext_fp32_local_atomic_min_max __opencl_c_ext_fp32_global_atomic_min_max __opencl_c_atomic_scope_device",
  // 95: anonymous_9022
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_min_max __opencl_c_ext_fp64_global_atomic_min_max __opencl_c_atomic_order_seq_cst __opencl_c_atomic_scope_device",
  // 96: anonymous_9025
  "cl_ext_float_atomics __opencl_c_ext_fp64_local_atomic_min_max __opencl_c_ext_fp64_global_atomic_min_max __opencl_c_atomic_scope_device",
  // 97: anonymous_10046
  "__opencl_c_integer_dot_product_input_4x8bit",
  // 98: anonymous_10055
  "__opencl_c_integer_dot_product_input_4x8bit_packed",
  // 99: anonymous_10064
  "cl_khr_subgroup_rotate",
};

static const OpenCLTypeStruct TypeTable[] = {
  // 0
  {OCLT_AGenType1, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 1
  {OCLT_AGenTypeN, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 2
  {OCLT_AGenTypeNNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 3
  {OCLT_AI2UGenTypeN, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 4
  {OCLT_AIGenType1, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 5
  {OCLT_AIGenTypeN, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 6
  {OCLT_AIGenTypeNNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 7
  {OCLT_atomic_double, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 8
  {OCLT_atomic_flag, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 9
  {OCLT_atomic_float, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 10
  {OCLT_atomic_half, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 11
  {OCLT_atomic_int, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 12
  {OCLT_atomic_intptr_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 13
  {OCLT_atomic_long, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 14
  {OCLT_atomic_ptrdiff_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 15
  {OCLT_atomic_size_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 16
  {OCLT_atomic_uint, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 17
  {OCLT_atomic_uintptr_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 18
  {OCLT_atomic_ulong, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 19
  {OCLT_bool, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 20
  {OCLT_char, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 21
  {OCLT_CharShortGenType1, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 22
  {OCLT_clk_event_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 23
  {OCLT_clk_profiling_info, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 24
  {OCLT_double, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 25
  {OCLT_event_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 26
  {OCLT_FGenTypeN, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 27
  {OCLT_float, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 28
  {OCLT_GenTypeCharVecAndScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 29
  {OCLT_GenTypeCharVecNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 30
  {OCLT_GenTypeDoubleVec1234, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 31
  {OCLT_GenTypeDoubleVecAndScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 32
  {OCLT_GenTypeDoubleVecNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 33
  {OCLT_GenTypeFloatVec1234, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 34
  {OCLT_GenTypeFloatVecAndScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 35
  {OCLT_GenTypeFloatVecNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 36
  {OCLT_GenTypeHalfVec1234, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 37
  {OCLT_GenTypeHalfVecAndScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 38
  {OCLT_GenTypeHalfVecNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 39
  {OCLT_GenTypeIntVecAndScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 40
  {OCLT_GenTypeIntVecNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 41
  {OCLT_GenTypeLongVecAndScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 42
  {OCLT_GenTypeLongVecNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 43
  {OCLT_GenTypeShortVecAndScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 44
  {OCLT_GenTypeShortVecNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 45
  {OCLT_GenTypeUCharVecAndScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 46
  {OCLT_GenTypeUCharVecNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 47
  {OCLT_GenTypeUIntVecAndScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 48
  {OCLT_GenTypeUIntVecNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 49
  {OCLT_GenTypeULongVecAndScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 50
  {OCLT_GenTypeULongVecNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 51
  {OCLT_GenTypeUShortVecAndScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 52
  {OCLT_GenTypeUShortVecNoScalar, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 53
  {OCLT_half, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 54
  {OCLT___half, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 55
  {OCLT___half, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 56
  {OCLT___half, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 57
  {OCLT___half, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 58
  {OCLT___half, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 59
  {OCLT___half, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 60
  {OCLT___half, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 61
  {OCLT___half, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 62
  {OCLT___half, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 63
  {OCLT___half, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 64
  {OCLT_image1d_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 65
  {OCLT_image1d_array_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 66
  {OCLT_image1d_buffer_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 67
  {OCLT_image2d_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 68
  {OCLT_image2d_array_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 69
  {OCLT_image2d_array_depth_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 70
  {OCLT_image2d_array_msaa_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 71
  {OCLT_image2d_array_msaa_depth_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 72
  {OCLT_image2d_depth_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 73
  {OCLT_image2d_msaa_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 74
  {OCLT_image2d_msaa_depth_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 75
  {OCLT_image3d_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 76
  {OCLT_int, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 77
  {OCLT_IntLongFloatGenType1, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 78
  {OCLT_intptr_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 79
  {OCLT_long, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 80
  {OCLT_cl_mem_fence_flags, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 81
  {OCLT_memory_order, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 82
  {OCLT_memory_scope, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 83
  {OCLT_ndrange_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 84
  {OCLT_ptrdiff_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 85
  {OCLT_queue_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 86
  {OCLT_reserve_id_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 87
  {OCLT_SGenTypeN, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 88
  {OCLT_sampler_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 89
  {OCLT_short, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 90
  {OCLT_size_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 91
  {OCLT_uchar, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 92
  {OCLT_UGenTypeN, 0, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 93
  {OCLT_uint, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 94
  {OCLT_uintptr_t, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 95
  {OCLT_ulong, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 96
  {OCLT_ushort, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 97
  {OCLT_void, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 98
  {OCLT___half, 1, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 99
  {OCLT___half, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 100
  {OCLT_float, 2, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 101
  {OCLT_float, 3, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 102
  {OCLT_float, 4, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 103
  {OCLT_float, 8, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 104
  {OCLT_float, 16, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 105
  {OCLT_double, 2, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 106
  {OCLT_double, 3, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 107
  {OCLT_double, 4, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 108
  {OCLT_double, 8, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 109
  {OCLT_double, 16, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 110
  {OCLT_half, 2, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 111
  {OCLT_half, 3, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 112
  {OCLT_half, 4, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 113
  {OCLT_half, 8, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 114
  {OCLT_half, 16, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 115
  {OCLT_char, 2, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 116
  {OCLT_char, 3, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 117
  {OCLT_char, 4, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 118
  {OCLT_char, 8, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 119
  {OCLT_char, 16, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 120
  {OCLT_uchar, 2, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 121
  {OCLT_uchar, 3, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 122
  {OCLT_uchar, 4, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 123
  {OCLT_uchar, 8, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 124
  {OCLT_uchar, 16, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 125
  {OCLT_short, 2, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 126
  {OCLT_short, 3, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 127
  {OCLT_short, 4, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 128
  {OCLT_short, 8, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 129
  {OCLT_short, 16, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 130
  {OCLT_ushort, 2, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 131
  {OCLT_ushort, 3, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 132
  {OCLT_ushort, 4, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 133
  {OCLT_ushort, 8, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 134
  {OCLT_ushort, 16, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 135
  {OCLT_int, 2, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 136
  {OCLT_int, 3, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 137
  {OCLT_int, 4, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 138
  {OCLT_int, 8, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 139
  {OCLT_int, 16, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 140
  {OCLT_uint, 2, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 141
  {OCLT_uint, 3, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 142
  {OCLT_uint, 4, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 143
  {OCLT_uint, 8, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 144
  {OCLT_uint, 16, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 145
  {OCLT_long, 2, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 146
  {OCLT_long, 3, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 147
  {OCLT_long, 4, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 148
  {OCLT_long, 8, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 149
  {OCLT_long, 16, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 150
  {OCLT_ulong, 2, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 151
  {OCLT_ulong, 3, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 152
  {OCLT_ulong, 4, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 153
  {OCLT_ulong, 8, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 154
  {OCLT_ulong, 16, 0, 0, 0, OCLAQ_None, clang::LangAS::Default},
  // 155
  {OCLT_FGenTypeN, 0, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 156
  {OCLT_GenTypeIntVecAndScalar, 0, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 157
  {OCLT_FGenTypeN, 0, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 158
  {OCLT_GenTypeIntVecAndScalar, 0, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 159
  {OCLT_FGenTypeN, 0, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 160
  {OCLT_GenTypeIntVecAndScalar, 0, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 161
  {OCLT_FGenTypeN, 0, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 162
  {OCLT_GenTypeIntVecAndScalar, 0, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 163
  {OCLT_char, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 164
  {OCLT_uchar, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 165
  {OCLT_short, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 166
  {OCLT_ushort, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 167
  {OCLT_int, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 168
  {OCLT_uint, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 169
  {OCLT_long, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 170
  {OCLT_ulong, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 171
  {OCLT_float, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 172
  {OCLT_double, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 173
  {OCLT_half, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 174
  {OCLT_char, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 175
  {OCLT_uchar, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 176
  {OCLT_short, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 177
  {OCLT_ushort, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 178
  {OCLT_int, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 179
  {OCLT_uint, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 180
  {OCLT_long, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 181
  {OCLT_ulong, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 182
  {OCLT_float, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 183
  {OCLT_double, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 184
  {OCLT_half, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 185
  {OCLT_char, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 186
  {OCLT_uchar, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 187
  {OCLT_short, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 188
  {OCLT_ushort, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 189
  {OCLT_int, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 190
  {OCLT_uint, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 191
  {OCLT_long, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 192
  {OCLT_ulong, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 193
  {OCLT_float, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 194
  {OCLT_double, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 195
  {OCLT_half, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 196
  {OCLT_char, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 197
  {OCLT_uchar, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 198
  {OCLT_short, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 199
  {OCLT_ushort, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 200
  {OCLT_int, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 201
  {OCLT_uint, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 202
  {OCLT_long, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 203
  {OCLT_ulong, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 204
  {OCLT_float, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 205
  {OCLT_double, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 206
  {OCLT_half, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 207
  {OCLT_char, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 208
  {OCLT_uchar, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 209
  {OCLT_short, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 210
  {OCLT_ushort, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 211
  {OCLT_int, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 212
  {OCLT_uint, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 213
  {OCLT_long, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 214
  {OCLT_ulong, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 215
  {OCLT_float, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 216
  {OCLT_double, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 217
  {OCLT_half, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 218
  {OCLT_char, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 219
  {OCLT_uchar, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 220
  {OCLT_short, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 221
  {OCLT_ushort, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 222
  {OCLT_int, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 223
  {OCLT_uint, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 224
  {OCLT_long, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 225
  {OCLT_ulong, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 226
  {OCLT_float, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 227
  {OCLT_double, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 228
  {OCLT_half, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 229
  {OCLT_char, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 230
  {OCLT_uchar, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 231
  {OCLT_short, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 232
  {OCLT_ushort, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 233
  {OCLT_int, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 234
  {OCLT_uint, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 235
  {OCLT_long, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 236
  {OCLT_ulong, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 237
  {OCLT_float, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 238
  {OCLT_double, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 239
  {OCLT_half, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 240
  {OCLT_char, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 241
  {OCLT_uchar, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 242
  {OCLT_short, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 243
  {OCLT_ushort, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 244
  {OCLT_int, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 245
  {OCLT_uint, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 246
  {OCLT_long, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 247
  {OCLT_ulong, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 248
  {OCLT_float, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 249
  {OCLT_double, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 250
  {OCLT_half, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 251
  {OCLT_char, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 252
  {OCLT_uchar, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 253
  {OCLT_short, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 254
  {OCLT_ushort, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 255
  {OCLT_int, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 256
  {OCLT_uint, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 257
  {OCLT_long, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 258
  {OCLT_ulong, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 259
  {OCLT_float, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 260
  {OCLT_double, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 261
  {OCLT_half, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 262
  {OCLT_char, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 263
  {OCLT_uchar, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 264
  {OCLT_short, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 265
  {OCLT_ushort, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 266
  {OCLT_int, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 267
  {OCLT_uint, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 268
  {OCLT_long, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 269
  {OCLT_ulong, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 270
  {OCLT_float, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 271
  {OCLT_double, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 272
  {OCLT_half, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_constant},
  // 273
  {OCLT_void, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 274
  {OCLT_void, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 275
  {OCLT_void, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 276
  {OCLT_AGenTypeN, 0, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 277
  {OCLT_AGenTypeN, 0, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 278
  {OCLT_AGenTypeN, 0, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 279
  {OCLT_AGenTypeN, 0, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 280
  {OCLT_AGenTypeN, 0, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_local},
  // 281
  {OCLT_event_t, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 282
  {OCLT_int, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 283
  {OCLT_int, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 284
  {OCLT_uint, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 285
  {OCLT_uint, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 286
  {OCLT_int, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 287
  {OCLT_uint, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 288
  {OCLT_long, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 289
  {OCLT_long, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 290
  {OCLT_ulong, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 291
  {OCLT_ulong, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 292
  {OCLT_long, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 293
  {OCLT_ulong, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 294
  {OCLT_float, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 295
  {OCLT_float, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 296
  {OCLT_float, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 297
  {OCLT_int, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_generic},
  // 298
  {OCLT_uint, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_generic},
  // 299
  {OCLT_atomic_int, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 300
  {OCLT_atomic_uint, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 301
  {OCLT_atomic_long, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 302
  {OCLT_atomic_ulong, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 303
  {OCLT_atomic_float, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 304
  {OCLT_atomic_double, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 305
  {OCLT_atomic_uintptr_t, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 306
  {OCLT_atomic_flag, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 307
  {OCLT_atomic_int, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_generic},
  // 308
  {OCLT_atomic_uint, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_generic},
  // 309
  {OCLT_atomic_long, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_generic},
  // 310
  {OCLT_atomic_ulong, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_generic},
  // 311
  {OCLT_atomic_float, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_generic},
  // 312
  {OCLT_atomic_double, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_generic},
  // 313
  {OCLT_atomic_uintptr_t, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_generic},
  // 314
  {OCLT_atomic_flag, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_generic},
  // 315
  {OCLT_atomic_int, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 316
  {OCLT_atomic_uint, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 317
  {OCLT_atomic_long, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 318
  {OCLT_atomic_ulong, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 319
  {OCLT_atomic_float, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 320
  {OCLT_atomic_double, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 321
  {OCLT_atomic_uintptr_t, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 322
  {OCLT_atomic_flag, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 323
  {OCLT_atomic_int, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 324
  {OCLT_atomic_uint, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 325
  {OCLT_atomic_long, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 326
  {OCLT_atomic_ulong, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 327
  {OCLT_atomic_float, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 328
  {OCLT_atomic_double, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 329
  {OCLT_atomic_uintptr_t, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 330
  {OCLT_atomic_flag, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 331
  {OCLT_atomic_half, 1, 0, 0, 1, OCLAQ_None, clang::LangAS::Default},
  // 332
  {OCLT_atomic_half, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_global},
  // 333
  {OCLT_atomic_half, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_local},
  // 334
  {OCLT_atomic_half, 1, 1, 0, 1, OCLAQ_None, clang::LangAS::opencl_generic},
  // 335
  {OCLT_image1d_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 336
  {OCLT_image2d_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 337
  {OCLT_image1d_array_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 338
  {OCLT_image3d_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 339
  {OCLT_image2d_array_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 340
  {OCLT_image2d_depth_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 341
  {OCLT_image2d_array_depth_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 342
  {OCLT_image1d_buffer_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 343
  {OCLT_image2d_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
  // 344
  {OCLT_image1d_array_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
  // 345
  {OCLT_image3d_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
  // 346
  {OCLT_image2d_array_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
  // 347
  {OCLT_image1d_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
  // 348
  {OCLT_image1d_buffer_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
  // 349
  {OCLT_image2d_depth_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
  // 350
  {OCLT_image2d_array_depth_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
  // 351
  {OCLT_image2d_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 352
  {OCLT_image2d_array_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 353
  {OCLT_image1d_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 354
  {OCLT_image1d_buffer_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 355
  {OCLT_image1d_array_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 356
  {OCLT_image3d_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 357
  {OCLT_image2d_depth_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 358
  {OCLT_image2d_array_depth_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 359
  {OCLT_clk_event_t, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 360
  {OCLT_clk_event_t, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 361
  {OCLT_clk_event_t, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_generic},
  // 362
  {OCLT_void, 1, 1, 0, 0, OCLAQ_None, clang::LangAS::opencl_global},
  // 363
  {OCLT_size_t, 1, 0, 1, 0, OCLAQ_None, clang::LangAS::Default},
  // 364
  {OCLT_size_t, 1, 1, 1, 0, OCLAQ_None, clang::LangAS::opencl_private},
  // 365
  {OCLT_image2d_msaa_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 366
  {OCLT_image2d_array_msaa_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 367
  {OCLT_image2d_msaa_depth_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 368
  {OCLT_image2d_array_msaa_depth_t, 0, 0, 0, 0, OCLAQ_ReadOnly, clang::LangAS::Default},
  // 369
  {OCLT_image2d_msaa_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 370
  {OCLT_image2d_array_msaa_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 371
  {OCLT_image2d_msaa_depth_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 372
  {OCLT_image2d_array_msaa_depth_t, 0, 0, 0, 0, OCLAQ_WriteOnly, clang::LangAS::Default},
  // 373
  {OCLT_image2d_msaa_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
  // 374
  {OCLT_image2d_array_msaa_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
  // 375
  {OCLT_image2d_msaa_depth_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
  // 376
  {OCLT_image2d_array_msaa_depth_t, 0, 0, 0, 0, OCLAQ_ReadWrite, clang::LangAS::Default},
};

static const unsigned short SignatureTable[] = {
  // 0
  27, 27, 
  // 2
  100, 100, 
  // 4
  101, 101, 
  // 6
  102, 102, 
  // 8
  103, 103, 
  // 10
  104, 104, 
  // 12
  27, 24, 
  // 14
  100, 105, 
  // 16
  101, 106, 
  // 18
  102, 107, 
  // 20
  103, 108, 
  // 22
  104, 109, 
  // 24
  27, 53, 
  // 26
  100, 110, 
  // 28
  101, 111, 
  // 30
  102, 112, 
  // 32
  103, 113, 
  // 34
  104, 114, 
  // 36
  27, 20, 
  // 38
  100, 115, 
  // 40
  101, 116, 
  // 42
  102, 117, 
  // 44
  103, 118, 
  // 46
  104, 119, 
  // 48
  27, 91, 
  // 50
  100, 120, 
  // 52
  101, 121, 
  // 54
  102, 122, 
  // 56
  103, 123, 
  // 58
  104, 124, 
  // 60
  27, 89, 
  // 62
  100, 125, 
  // 64
  101, 126, 
  // 66
  102, 127, 
  // 68
  103, 128, 
  // 70
  104, 129, 
  // 72
  27, 96, 
  // 74
  100, 130, 
  // 76
  101, 131, 
  // 78
  102, 132, 
  // 80
  103, 133, 
  // 82
  104, 134, 
  // 84
  27, 76, 
  // 86
  100, 135, 
  // 88
  101, 136, 
  // 90
  102, 137, 
  // 92
  103, 138, 
  // 94
  104, 139, 
  // 96
  27, 93, 
  // 98
  100, 140, 
  // 100
  101, 141, 
  // 102
  102, 142, 
  // 104
  103, 143, 
  // 106
  104, 144, 
  // 108
  27, 79, 
  // 110
  100, 145, 
  // 112
  101, 146, 
  // 114
  102, 147, 
  // 116
  103, 148, 
  // 118
  104, 149, 
  // 120
  27, 95, 
  // 122
  100, 150, 
  // 124
  101, 151, 
  // 126
  102, 152, 
  // 128
  103, 153, 
  // 130
  104, 154, 
  // 132
  24, 27, 
  // 134
  105, 100, 
  // 136
  106, 101, 
  // 138
  107, 102, 
  // 140
  108, 103, 
  // 142
  109, 104, 
  // 144
  24, 24, 
  // 146
  105, 105, 
  // 148
  106, 106, 
  // 150
  107, 107, 
  // 152
  108, 108, 
  // 154
  109, 109, 
  // 156
  24, 53, 
  // 158
  105, 110, 
  // 160
  106, 111, 
  // 162
  107, 112, 
  // 164
  108, 113, 
  // 166
  109, 114, 
  // 168
  24, 20, 
  // 170
  105, 115, 
  // 172
  106, 116, 
  // 174
  107, 117, 
  // 176
  108, 118, 
  // 178
  109, 119, 
  // 180
  24, 91, 
  // 182
  105, 120, 
  // 184
  106, 121, 
  // 186
  107, 122, 
  // 188
  108, 123, 
  // 190
  109, 124, 
  // 192
  24, 89, 
  // 194
  105, 125, 
  // 196
  106, 126, 
  // 198
  107, 127, 
  // 200
  108, 128, 
  // 202
  109, 129, 
  // 204
  24, 96, 
  // 206
  105, 130, 
  // 208
  106, 131, 
  // 210
  107, 132, 
  // 212
  108, 133, 
  // 214
  109, 134, 
  // 216
  24, 76, 
  // 218
  105, 135, 
  // 220
  106, 136, 
  // 222
  107, 137, 
  // 224
  108, 138, 
  // 226
  109, 139, 
  // 228
  24, 93, 
  // 230
  105, 140, 
  // 232
  106, 141, 
  // 234
  107, 142, 
  // 236
  108, 143, 
  // 238
  109, 144, 
  // 240
  24, 79, 
  // 242
  105, 145, 
  // 244
  106, 146, 
  // 246
  107, 147, 
  // 248
  108, 148, 
  // 250
  109, 149, 
  // 252
  24, 95, 
  // 254
  105, 150, 
  // 256
  106, 151, 
  // 258
  107, 152, 
  // 260
  108, 153, 
  // 262
  109, 154, 
  // 264
  53, 27, 
  // 266
  110, 100, 
  // 268
  111, 101, 
  // 270
  112, 102, 
  // 272
  113, 103, 
  // 274
  114, 104, 
  // 276
  53, 24, 
  // 278
  110, 105, 
  // 280
  111, 106, 
  // 282
  112, 107, 
  // 284
  113, 108, 
  // 286
  114, 109, 
  // 288
  53, 53, 
  // 290
  110, 110, 
  // 292
  111, 111, 
  // 294
  112, 112, 
  // 296
  113, 113, 
  // 298
  114, 114, 
  // 300
  53, 20, 
  // 302
  110, 115, 
  // 304
  111, 116, 
  // 306
  112, 117, 
  // 308
  113, 118, 
  // 310
  114, 119, 
  // 312
  53, 91, 
  // 314
  110, 120, 
  // 316
  111, 121, 
  // 318
  112, 122, 
  // 320
  113, 123, 
  // 322
  114, 124, 
  // 324
  53, 89, 
  // 326
  110, 125, 
  // 328
  111, 126, 
  // 330
  112, 127, 
  // 332
  113, 128, 
  // 334
  114, 129, 
  // 336
  53, 96, 
  // 338
  110, 130, 
  // 340
  111, 131, 
  // 342
  112, 132, 
  // 344
  113, 133, 
  // 346
  114, 134, 
  // 348
  53, 76, 
  // 350
  110, 135, 
  // 352
  111, 136, 
  // 354
  112, 137, 
  // 356
  113, 138, 
  // 358
  114, 139, 
  // 360
  53, 93, 
  // 362
  110, 140, 
  // 364
  111, 141, 
  // 366
  112, 142, 
  // 368
  113, 143, 
  // 370
  114, 144, 
  // 372
  53, 79, 
  // 374
  110, 145, 
  // 376
  111, 146, 
  // 378
  112, 147, 
  // 380
  113, 148, 
  // 382
  114, 149, 
  // 384
  53, 95, 
  // 386
  110, 150, 
  // 388
  111, 151, 
  // 390
  112, 152, 
  // 392
  113, 153, 
  // 394
  114, 154, 
  // 396
  20, 27, 
  // 398
  115, 100, 
  // 400
  116, 101, 
  // 402
  117, 102, 
  // 404
  118, 103, 
  // 406
  119, 104, 
  // 408
  20, 24, 
  // 410
  115, 105, 
  // 412
  116, 106, 
  // 414
  117, 107, 
  // 416
  118, 108, 
  // 418
  119, 109, 
  // 420
  20, 53, 
  // 422
  115, 110, 
  // 424
  116, 111, 
  // 426
  117, 112, 
  // 428
  118, 113, 
  // 430
  119, 114, 
  // 432
  20, 20, 
  // 434
  115, 115, 
  // 436
  116, 116, 
  // 438
  117, 117, 
  // 440
  118, 118, 
  // 442
  119, 119, 
  // 444
  20, 91, 
  // 446
  115, 120, 
  // 448
  116, 121, 
  // 450
  117, 122, 
  // 452
  118, 123, 
  // 454
  119, 124, 
  // 456
  20, 89, 
  // 458
  115, 125, 
  // 460
  116, 126, 
  // 462
  117, 127, 
  // 464
  118, 128, 
  // 466
  119, 129, 
  // 468
  20, 96, 
  // 470
  115, 130, 
  // 472
  116, 131, 
  // 474
  117, 132, 
  // 476
  118, 133, 
  // 478
  119, 134, 
  // 480
  20, 76, 
  // 482
  115, 135, 
  // 484
  116, 136, 
  // 486
  117, 137, 
  // 488
  118, 138, 
  // 490
  119, 139, 
  // 492
  20, 93, 
  // 494
  115, 140, 
  // 496
  116, 141, 
  // 498
  117, 142, 
  // 500
  118, 143, 
  // 502
  119, 144, 
  // 504
  20, 79, 
  // 506
  115, 145, 
  // 508
  116, 146, 
  // 510
  117, 147, 
  // 512
  118, 148, 
  // 514
  119, 149, 
  // 516
  20, 95, 
  // 518
  115, 150, 
  // 520
  116, 151, 
  // 522
  117, 152, 
  // 524
  118, 153, 
  // 526
  119, 154, 
  // 528
  91, 27, 
  // 530
  120, 100, 
  // 532
  121, 101, 
  // 534
  122, 102, 
  // 536
  123, 103, 
  // 538
  124, 104, 
  // 540
  91, 24, 
  // 542
  120, 105, 
  // 544
  121, 106, 
  // 546
  122, 107, 
  // 548
  123, 108, 
  // 550
  124, 109, 
  // 552
  91, 53, 
  // 554
  120, 110, 
  // 556
  121, 111, 
  // 558
  122, 112, 
  // 560
  123, 113, 
  // 562
  124, 114, 
  // 564
  91, 20, 
  // 566
  120, 115, 
  // 568
  121, 116, 
  // 570
  122, 117, 
  // 572
  123, 118, 
  // 574
  124, 119, 
  // 576
  91, 91, 
  // 578
  120, 120, 
  // 580
  121, 121, 
  // 582
  122, 122, 
  // 584
  123, 123, 
  // 586
  124, 124, 
  // 588
  91, 89, 
  // 590
  120, 125, 
  // 592
  121, 126, 
  // 594
  122, 127, 
  // 596
  123, 128, 
  // 598
  124, 129, 
  // 600
  91, 96, 
  // 602
  120, 130, 
  // 604
  121, 131, 
  // 606
  122, 132, 
  // 608
  123, 133, 
  // 610
  124, 134, 
  // 612
  91, 76, 
  // 614
  120, 135, 
  // 616
  121, 136, 
  // 618
  122, 137, 
  // 620
  123, 138, 
  // 622
  124, 139, 
  // 624
  91, 93, 
  // 626
  120, 140, 
  // 628
  121, 141, 
  // 630
  122, 142, 
  // 632
  123, 143, 
  // 634
  124, 144, 
  // 636
  91, 79, 
  // 638
  120, 145, 
  // 640
  121, 146, 
  // 642
  122, 147, 
  // 644
  123, 148, 
  // 646
  124, 149, 
  // 648
  91, 95, 
  // 650
  120, 150, 
  // 652
  121, 151, 
  // 654
  122, 152, 
  // 656
  123, 153, 
  // 658
  124, 154, 
  // 660
  89, 27, 
  // 662
  125, 100, 
  // 664
  126, 101, 
  // 666
  127, 102, 
  // 668
  128, 103, 
  // 670
  129, 104, 
  // 672
  89, 24, 
  // 674
  125, 105, 
  // 676
  126, 106, 
  // 678
  127, 107, 
  // 680
  128, 108, 
  // 682
  129, 109, 
  // 684
  89, 53, 
  // 686
  125, 110, 
  // 688
  126, 111, 
  // 690
  127, 112, 
  // 692
  128, 113, 
  // 694
  129, 114, 
  // 696
  89, 20, 
  // 698
  125, 115, 
  // 700
  126, 116, 
  // 702
  127, 117, 
  // 704
  128, 118, 
  // 706
  129, 119, 
  // 708
  89, 91, 
  // 710
  125, 120, 
  // 712
  126, 121, 
  // 714
  127, 122, 
  // 716
  128, 123, 
  // 718
  129, 124, 
  // 720
  89, 89, 
  // 722
  125, 125, 
  // 724
  126, 126, 
  // 726
  127, 127, 
  // 728
  128, 128, 
  // 730
  129, 129, 
  // 732
  89, 96, 
  // 734
  125, 130, 
  // 736
  126, 131, 
  // 738
  127, 132, 
  // 740
  128, 133, 
  // 742
  129, 134, 
  // 744
  89, 76, 
  // 746
  125, 135, 
  // 748
  126, 136, 
  // 750
  127, 137, 
  // 752
  128, 138, 
  // 754
  129, 139, 
  // 756
  89, 93, 
  // 758
  125, 140, 
  // 760
  126, 141, 
  // 762
  127, 142, 
  // 764
  128, 143, 
  // 766
  129, 144, 
  // 768
  89, 79, 
  // 770
  125, 145, 
  // 772
  126, 146, 
  // 774
  127, 147, 
  // 776
  128, 148, 
  // 778
  129, 149, 
  // 780
  89, 95, 
  // 782
  125, 150, 
  // 784
  126, 151, 
  // 786
  127, 152, 
  // 788
  128, 153, 
  // 790
  129, 154, 
  // 792
  96, 27, 
  // 794
  130, 100, 
  // 796
  131, 101, 
  // 798
  132, 102, 
  // 800
  133, 103, 
  // 802
  134, 104, 
  // 804
  96, 24, 
  // 806
  130, 105, 
  // 808
  131, 106, 
  // 810
  132, 107, 
  // 812
  133, 108, 
  // 814
  134, 109, 
  // 816
  96, 53, 
  // 818
  130, 110, 
  // 820
  131, 111, 
  // 822
  132, 112, 
  // 824
  133, 113, 
  // 826
  134, 114, 
  // 828
  96, 20, 
  // 830
  130, 115, 
  // 832
  131, 116, 
  // 834
  132, 117, 
  // 836
  133, 118, 
  // 838
  134, 119, 
  // 840
  96, 91, 
  // 842
  130, 120, 
  // 844
  131, 121, 
  // 846
  132, 122, 
  // 848
  133, 123, 
  // 850
  134, 124, 
  // 852
  96, 89, 
  // 854
  130, 125, 
  // 856
  131, 126, 
  // 858
  132, 127, 
  // 860
  133, 128, 
  // 862
  134, 129, 
  // 864
  96, 96, 
  // 866
  130, 130, 
  // 868
  131, 131, 
  // 870
  132, 132, 
  // 872
  133, 133, 
  // 874
  134, 134, 
  // 876
  96, 76, 
  // 878
  130, 135, 
  // 880
  131, 136, 
  // 882
  132, 137, 
  // 884
  133, 138, 
  // 886
  134, 139, 
  // 888
  96, 93, 
  // 890
  130, 140, 
  // 892
  131, 141, 
  // 894
  132, 142, 
  // 896
  133, 143, 
  // 898
  134, 144, 
  // 900
  96, 79, 
  // 902
  130, 145, 
  // 904
  131, 146, 
  // 906
  132, 147, 
  // 908
  133, 148, 
  // 910
  134, 149, 
  // 912
  96, 95, 
  // 914
  130, 150, 
  // 916
  131, 151, 
  // 918
  132, 152, 
  // 920
  133, 153, 
  // 922
  134, 154, 
  // 924
  76, 27, 
  // 926
  135, 100, 
  // 928
  136, 101, 
  // 930
  137, 102, 
  // 932
  138, 103, 
  // 934
  139, 104, 
  // 936
  76, 24, 
  // 938
  135, 105, 
  // 940
  136, 106, 
  // 942
  137, 107, 
  // 944
  138, 108, 
  // 946
  139, 109, 
  // 948
  76, 53, 
  // 950
  135, 110, 
  // 952
  136, 111, 
  // 954
  137, 112, 
  // 956
  138, 113, 
  // 958
  139, 114, 
  // 960
  76, 20, 
  // 962
  135, 115, 
  // 964
  136, 116, 
  // 966
  137, 117, 
  // 968
  138, 118, 
  // 970
  139, 119, 
  // 972
  76, 91, 
  // 974
  135, 120, 
  // 976
  136, 121, 
  // 978
  137, 122, 
  // 980
  138, 123, 
  // 982
  139, 124, 
  // 984
  76, 89, 
  // 986
  135, 125, 
  // 988
  136, 126, 
  // 990
  137, 127, 
  // 992
  138, 128, 
  // 994
  139, 129, 
  // 996
  76, 96, 
  // 998
  135, 130, 
  // 1000
  136, 131, 
  // 1002
  137, 132, 
  // 1004
  138, 133, 
  // 1006
  139, 134, 
  // 1008
  76, 76, 
  // 1010
  135, 135, 
  // 1012
  136, 136, 
  // 1014
  137, 137, 
  // 1016
  138, 138, 
  // 1018
  139, 139, 
  // 1020
  76, 93, 
  // 1022
  135, 140, 
  // 1024
  136, 141, 
  // 1026
  137, 142, 
  // 1028
  138, 143, 
  // 1030
  139, 144, 
  // 1032
  76, 79, 
  // 1034
  135, 145, 
  // 1036
  136, 146, 
  // 1038
  137, 147, 
  // 1040
  138, 148, 
  // 1042
  139, 149, 
  // 1044
  76, 95, 
  // 1046
  135, 150, 
  // 1048
  136, 151, 
  // 1050
  137, 152, 
  // 1052
  138, 153, 
  // 1054
  139, 154, 
  // 1056
  93, 27, 
  // 1058
  140, 100, 
  // 1060
  141, 101, 
  // 1062
  142, 102, 
  // 1064
  143, 103, 
  // 1066
  144, 104, 
  // 1068
  93, 24, 
  // 1070
  140, 105, 
  // 1072
  141, 106, 
  // 1074
  142, 107, 
  // 1076
  143, 108, 
  // 1078
  144, 109, 
  // 1080
  93, 53, 
  // 1082
  140, 110, 
  // 1084
  141, 111, 
  // 1086
  142, 112, 
  // 1088
  143, 113, 
  // 1090
  144, 114, 
  // 1092
  93, 20, 
  // 1094
  140, 115, 
  // 1096
  141, 116, 
  // 1098
  142, 117, 
  // 1100
  143, 118, 
  // 1102
  144, 119, 
  // 1104
  93, 91, 
  // 1106
  140, 120, 
  // 1108
  141, 121, 
  // 1110
  142, 122, 
  // 1112
  143, 123, 
  // 1114
  144, 124, 
  // 1116
  93, 89, 
  // 1118
  140, 125, 
  // 1120
  141, 126, 
  // 1122
  142, 127, 
  // 1124
  143, 128, 
  // 1126
  144, 129, 
  // 1128
  93, 96, 
  // 1130
  140, 130, 
  // 1132
  141, 131, 
  // 1134
  142, 132, 
  // 1136
  143, 133, 
  // 1138
  144, 134, 
  // 1140
  93, 76, 
  // 1142
  140, 135, 
  // 1144
  141, 136, 
  // 1146
  142, 137, 
  // 1148
  143, 138, 
  // 1150
  144, 139, 
  // 1152
  93, 93, 
  // 1154
  140, 140, 
  // 1156
  141, 141, 
  // 1158
  142, 142, 
  // 1160
  143, 143, 
  // 1162
  144, 144, 
  // 1164
  93, 79, 
  // 1166
  140, 145, 
  // 1168
  141, 146, 
  // 1170
  142, 147, 
  // 1172
  143, 148, 
  // 1174
  144, 149, 
  // 1176
  93, 95, 
  // 1178
  140, 150, 
  // 1180
  141, 151, 
  // 1182
  142, 152, 
  // 1184
  143, 153, 
  // 1186
  144, 154, 
  // 1188
  79, 27, 
  // 1190
  145, 100, 
  // 1192
  146, 101, 
  // 1194
  147, 102, 
  // 1196
  148, 103, 
  // 1198
  149, 104, 
  // 1200
  79, 24, 
  // 1202
  145, 105, 
  // 1204
  146, 106, 
  // 1206
  147, 107, 
  // 1208
  148, 108, 
  // 1210
  149, 109, 
  // 1212
  79, 53, 
  // 1214
  145, 110, 
  // 1216
  146, 111, 
  // 1218
  147, 112, 
  // 1220
  148, 113, 
  // 1222
  149, 114, 
  // 1224
  79, 20, 
  // 1226
  145, 115, 
  // 1228
  146, 116, 
  // 1230
  147, 117, 
  // 1232
  148, 118, 
  // 1234
  149, 119, 
  // 1236
  79, 91, 
  // 1238
  145, 120, 
  // 1240
  146, 121, 
  // 1242
  147, 122, 
  // 1244
  148, 123, 
  // 1246
  149, 124, 
  // 1248
  79, 89, 
  // 1250
  145, 125, 
  // 1252
  146, 126, 
  // 1254
  147, 127, 
  // 1256
  148, 128, 
  // 1258
  149, 129, 
  // 1260
  79, 96, 
  // 1262
  145, 130, 
  // 1264
  146, 131, 
  // 1266
  147, 132, 
  // 1268
  148, 133, 
  // 1270
  149, 134, 
  // 1272
  79, 76, 
  // 1274
  145, 135, 
  // 1276
  146, 136, 
  // 1278
  147, 137, 
  // 1280
  148, 138, 
  // 1282
  149, 139, 
  // 1284
  79, 93, 
  // 1286
  145, 140, 
  // 1288
  146, 141, 
  // 1290
  147, 142, 
  // 1292
  148, 143, 
  // 1294
  149, 144, 
  // 1296
  79, 79, 
  // 1298
  145, 145, 
  // 1300
  146, 146, 
  // 1302
  147, 147, 
  // 1304
  148, 148, 
  // 1306
  149, 149, 
  // 1308
  79, 95, 
  // 1310
  145, 150, 
  // 1312
  146, 151, 
  // 1314
  147, 152, 
  // 1316
  148, 153, 
  // 1318
  149, 154, 
  // 1320
  95, 27, 
  // 1322
  150, 100, 
  // 1324
  151, 101, 
  // 1326
  152, 102, 
  // 1328
  153, 103, 
  // 1330
  154, 104, 
  // 1332
  95, 24, 
  // 1334
  150, 105, 
  // 1336
  151, 106, 
  // 1338
  152, 107, 
  // 1340
  153, 108, 
  // 1342
  154, 109, 
  // 1344
  95, 53, 
  // 1346
  150, 110, 
  // 1348
  151, 111, 
  // 1350
  152, 112, 
  // 1352
  153, 113, 
  // 1354
  154, 114, 
  // 1356
  95, 20, 
  // 1358
  150, 115, 
  // 1360
  151, 116, 
  // 1362
  152, 117, 
  // 1364
  153, 118, 
  // 1366
  154, 119, 
  // 1368
  95, 91, 
  // 1370
  150, 120, 
  // 1372
  151, 121, 
  // 1374
  152, 122, 
  // 1376
  153, 123, 
  // 1378
  154, 124, 
  // 1380
  95, 89, 
  // 1382
  150, 125, 
  // 1384
  151, 126, 
  // 1386
  152, 127, 
  // 1388
  153, 128, 
  // 1390
  154, 129, 
  // 1392
  95, 96, 
  // 1394
  150, 130, 
  // 1396
  151, 131, 
  // 1398
  152, 132, 
  // 1400
  153, 133, 
  // 1402
  154, 134, 
  // 1404
  95, 76, 
  // 1406
  150, 135, 
  // 1408
  151, 136, 
  // 1410
  152, 137, 
  // 1412
  153, 138, 
  // 1414
  154, 139, 
  // 1416
  95, 93, 
  // 1418
  150, 140, 
  // 1420
  151, 141, 
  // 1422
  152, 142, 
  // 1424
  153, 143, 
  // 1426
  154, 144, 
  // 1428
  95, 79, 
  // 1430
  150, 145, 
  // 1432
  151, 146, 
  // 1434
  152, 147, 
  // 1436
  153, 148, 
  // 1438
  154, 149, 
  // 1440
  95, 95, 
  // 1442
  150, 150, 
  // 1444
  151, 151, 
  // 1446
  152, 152, 
  // 1448
  153, 153, 
  // 1450
  154, 154, 
  // 1452
  93, 
  // 1453
  90, 93, 
  // 1455
  90, 
  // 1456
  26, 26, 
  // 1458
  34, 47, 
  // 1460
  31, 49, 
  // 1462
  37, 51, 
  // 1464
  26, 26, 26, 
  // 1467
  35, 35, 27, 
  // 1470
  32, 32, 24, 
  // 1473
  38, 38, 53, 
  // 1476
  39, 34, 
  // 1478
  39, 31, 
  // 1480
  39, 37, 
  // 1482
  34, 34, 39, 
  // 1485
  35, 35, 76, 
  // 1488
  31, 31, 39, 
  // 1491
  32, 32, 76, 
  // 1494
  37, 37, 39, 
  // 1497
  38, 38, 76, 
  // 1500
  26, 26, 26, 26, 
  // 1504
  26, 26, 155, 
  // 1507
  34, 34, 156, 
  // 1510
  34, 34, 34, 156, 
  // 1514
  31, 31, 156, 
  // 1517
  37, 37, 156, 
  // 1520
  31, 31, 31, 156, 
  // 1524
  37, 37, 37, 156, 
  // 1528
  26, 26, 157, 
  // 1531
  34, 34, 158, 
  // 1534
  31, 31, 158, 
  // 1537
  37, 37, 158, 
  // 1540
  34, 34, 34, 158, 
  // 1544
  31, 31, 31, 158, 
  // 1548
  37, 37, 37, 158, 
  // 1552
  26, 26, 159, 
  // 1555
  34, 34, 160, 
  // 1558
  31, 31, 160, 
  // 1561
  37, 37, 160, 
  // 1564
  34, 34, 34, 160, 
  // 1568
  31, 31, 31, 160, 
  // 1572
  37, 37, 37, 160, 
  // 1576
  26, 26, 161, 
  // 1579
  34, 34, 162, 
  // 1582
  31, 31, 162, 
  // 1585
  37, 37, 162, 
  // 1588
  34, 34, 34, 162, 
  // 1592
  31, 31, 31, 162, 
  // 1596
  37, 37, 37, 162, 
  // 1600
  34, 34, 
  // 1602
  34, 34, 34, 
  // 1605
  3, 5, 
  // 1607
  5, 5, 
  // 1609
  3, 5, 5, 
  // 1612
  5, 5, 5, 
  // 1615
  6, 6, 4, 
  // 1618
  43, 28, 45, 
  // 1621
  51, 45, 45, 
  // 1624
  39, 43, 51, 
  // 1627
  47, 51, 51, 
  // 1630
  41, 39, 47, 
  // 1633
  49, 47, 47, 
  // 1636
  5, 5, 5, 5, 
  // 1640
  6, 6, 4, 4, 
  // 1644
  39, 39, 39, 39, 
  // 1648
  47, 47, 47, 47, 
  // 1652
  39, 39, 39, 
  // 1655
  47, 47, 47, 
  // 1658
  35, 27, 35, 
  // 1661
  32, 24, 32, 
  // 1664
  38, 53, 38, 
  // 1667
  35, 35, 27, 27, 
  // 1671
  32, 32, 24, 24, 
  // 1675
  38, 38, 53, 53, 
  // 1679
  35, 35, 35, 27, 
  // 1683
  32, 32, 32, 24, 
  // 1687
  38, 38, 38, 53, 
  // 1691
  35, 27, 27, 35, 
  // 1695
  32, 24, 24, 32, 
  // 1699
  38, 53, 53, 38, 
  // 1703
  27, 33, 
  // 1705
  24, 30, 
  // 1707
  53, 36, 
  // 1709
  33, 33, 
  // 1711
  30, 30, 
  // 1713
  36, 36, 
  // 1715
  101, 101, 101, 
  // 1718
  106, 106, 106, 
  // 1721
  111, 111, 111, 
  // 1724
  102, 102, 102, 
  // 1727
  107, 107, 107, 
  // 1730
  112, 112, 112, 
  // 1733
  27, 33, 33, 
  // 1736
  24, 30, 30, 
  // 1739
  53, 36, 36, 
  // 1742
  42, 32, 
  // 1744
  44, 38, 
  // 1746
  76, 87, 
  // 1748
  39, 34, 34, 
  // 1751
  76, 24, 24, 
  // 1754
  42, 32, 32, 
  // 1757
  76, 53, 53, 
  // 1760
  44, 38, 38, 
  // 1763
  1, 1, 1, 1, 
  // 1767
  87, 87, 87, 87, 
  // 1771
  87, 87, 87, 92, 
  // 1775
  92, 92, 92, 92, 
  // 1779
  92, 92, 92, 87, 
  // 1783
  34, 34, 34, 39, 
  // 1787
  34, 34, 34, 47, 
  // 1791
  31, 31, 31, 41, 
  // 1795
  31, 31, 31, 49, 
  // 1799
  37, 37, 37, 43, 
  // 1803
  37, 37, 37, 51, 
  // 1807
  115, 90, 174, 
  // 1810
  120, 90, 175, 
  // 1813
  125, 90, 176, 
  // 1816
  130, 90, 177, 
  // 1819
  135, 90, 178, 
  // 1822
  140, 90, 179, 
  // 1825
  145, 90, 180, 
  // 1828
  150, 90, 181, 
  // 1831
  100, 90, 182, 
  // 1834
  105, 90, 183, 
  // 1837
  110, 90, 184, 
  // 1840
  97, 115, 90, 185, 
  // 1844
  97, 120, 90, 186, 
  // 1848
  97, 125, 90, 187, 
  // 1852
  97, 130, 90, 188, 
  // 1856
  97, 135, 90, 189, 
  // 1860
  97, 140, 90, 190, 
  // 1864
  97, 145, 90, 191, 
  // 1868
  97, 150, 90, 192, 
  // 1872
  97, 100, 90, 193, 
  // 1876
  97, 105, 90, 194, 
  // 1880
  97, 110, 90, 195, 
  // 1884
  116, 90, 174, 
  // 1887
  121, 90, 175, 
  // 1890
  126, 90, 176, 
  // 1893
  131, 90, 177, 
  // 1896
  136, 90, 178, 
  // 1899
  141, 90, 179, 
  // 1902
  146, 90, 180, 
  // 1905
  151, 90, 181, 
  // 1908
  101, 90, 182, 
  // 1911
  106, 90, 183, 
  // 1914
  111, 90, 184, 
  // 1917
  97, 116, 90, 185, 
  // 1921
  97, 121, 90, 186, 
  // 1925
  97, 126, 90, 187, 
  // 1929
  97, 131, 90, 188, 
  // 1933
  97, 136, 90, 189, 
  // 1937
  97, 141, 90, 190, 
  // 1941
  97, 146, 90, 191, 
  // 1945
  97, 151, 90, 192, 
  // 1949
  97, 101, 90, 193, 
  // 1953
  97, 106, 90, 194, 
  // 1957
  97, 111, 90, 195, 
  // 1961
  117, 90, 174, 
  // 1964
  122, 90, 175, 
  // 1967
  127, 90, 176, 
  // 1970
  132, 90, 177, 
  // 1973
  137, 90, 178, 
  // 1976
  142, 90, 179, 
  // 1979
  147, 90, 180, 
  // 1982
  152, 90, 181, 
  // 1985
  102, 90, 182, 
  // 1988
  107, 90, 183, 
  // 1991
  112, 90, 184, 
  // 1994
  97, 117, 90, 185, 
  // 1998
  97, 122, 90, 186, 
  // 2002
  97, 127, 90, 187, 
  // 2006
  97, 132, 90, 188, 
  // 2010
  97, 137, 90, 189, 
  // 2014
  97, 142, 90, 190, 
  // 2018
  97, 147, 90, 191, 
  // 2022
  97, 152, 90, 192, 
  // 2026
  97, 102, 90, 193, 
  // 2030
  97, 107, 90, 194, 
  // 2034
  97, 112, 90, 195, 
  // 2038
  118, 90, 174, 
  // 2041
  123, 90, 175, 
  // 2044
  128, 90, 176, 
  // 2047
  133, 90, 177, 
  // 2050
  138, 90, 178, 
  // 2053
  143, 90, 179, 
  // 2056
  148, 90, 180, 
  // 2059
  153, 90, 181, 
  // 2062
  103, 90, 182, 
  // 2065
  108, 90, 183, 
  // 2068
  113, 90, 184, 
  // 2071
  97, 118, 90, 185, 
  // 2075
  97, 123, 90, 186, 
  // 2079
  97, 128, 90, 187, 
  // 2083
  97, 133, 90, 188, 
  // 2087
  97, 138, 90, 189, 
  // 2091
  97, 143, 90, 190, 
  // 2095
  97, 148, 90, 191, 
  // 2099
  97, 153, 90, 192, 
  // 2103
  97, 103, 90, 193, 
  // 2107
  97, 108, 90, 194, 
  // 2111
  97, 113, 90, 195, 
  // 2115
  119, 90, 174, 
  // 2118
  124, 90, 175, 
  // 2121
  129, 90, 176, 
  // 2124
  134, 90, 177, 
  // 2127
  139, 90, 178, 
  // 2130
  144, 90, 179, 
  // 2133
  149, 90, 180, 
  // 2136
  154, 90, 181, 
  // 2139
  104, 90, 182, 
  // 2142
  109, 90, 183, 
  // 2145
  114, 90, 184, 
  // 2148
  97, 119, 90, 185, 
  // 2152
  97, 124, 90, 186, 
  // 2156
  97, 129, 90, 187, 
  // 2160
  97, 134, 90, 188, 
  // 2164
  97, 139, 90, 189, 
  // 2168
  97, 144, 90, 190, 
  // 2172
  97, 149, 90, 191, 
  // 2176
  97, 154, 90, 192, 
  // 2180
  97, 104, 90, 193, 
  // 2184
  97, 109, 90, 194, 
  // 2188
  97, 114, 90, 195, 
  // 2192
  115, 90, 196, 
  // 2195
  120, 90, 197, 
  // 2198
  125, 90, 198, 
  // 2201
  130, 90, 199, 
  // 2204
  135, 90, 200, 
  // 2207
  140, 90, 201, 
  // 2210
  145, 90, 202, 
  // 2213
  150, 90, 203, 
  // 2216
  100, 90, 204, 
  // 2219
  105, 90, 205, 
  // 2222
  110, 90, 206, 
  // 2225
  97, 115, 90, 207, 
  // 2229
  97, 120, 90, 208, 
  // 2233
  97, 125, 90, 209, 
  // 2237
  97, 130, 90, 210, 
  // 2241
  97, 135, 90, 211, 
  // 2245
  97, 140, 90, 212, 
  // 2249
  97, 145, 90, 213, 
  // 2253
  97, 150, 90, 214, 
  // 2257
  97, 100, 90, 215, 
  // 2261
  97, 105, 90, 216, 
  // 2265
  97, 110, 90, 217, 
  // 2269
  116, 90, 196, 
  // 2272
  121, 90, 197, 
  // 2275
  126, 90, 198, 
  // 2278
  131, 90, 199, 
  // 2281
  136, 90, 200, 
  // 2284
  141, 90, 201, 
  // 2287
  146, 90, 202, 
  // 2290
  151, 90, 203, 
  // 2293
  101, 90, 204, 
  // 2296
  106, 90, 205, 
  // 2299
  111, 90, 206, 
  // 2302
  97, 116, 90, 207, 
  // 2306
  97, 121, 90, 208, 
  // 2310
  97, 126, 90, 209, 
  // 2314
  97, 131, 90, 210, 
  // 2318
  97, 136, 90, 211, 
  // 2322
  97, 141, 90, 212, 
  // 2326
  97, 146, 90, 213, 
  // 2330
  97, 151, 90, 214, 
  // 2334
  97, 101, 90, 215, 
  // 2338
  97, 106, 90, 216, 
  // 2342
  97, 111, 90, 217, 
  // 2346
  117, 90, 196, 
  // 2349
  122, 90, 197, 
  // 2352
  127, 90, 198, 
  // 2355
  132, 90, 199, 
  // 2358
  137, 90, 200, 
  // 2361
  142, 90, 201, 
  // 2364
  147, 90, 202, 
  // 2367
  152, 90, 203, 
  // 2370
  102, 90, 204, 
  // 2373
  107, 90, 205, 
  // 2376
  112, 90, 206, 
  // 2379
  97, 117, 90, 207, 
  // 2383
  97, 122, 90, 208, 
  // 2387
  97, 127, 90, 209, 
  // 2391
  97, 132, 90, 210, 
  // 2395
  97, 137, 90, 211, 
  // 2399
  97, 142, 90, 212, 
  // 2403
  97, 147, 90, 213, 
  // 2407
  97, 152, 90, 214, 
  // 2411
  97, 102, 90, 215, 
  // 2415
  97, 107, 90, 216, 
  // 2419
  97, 112, 90, 217, 
  // 2423
  118, 90, 196, 
  // 2426
  123, 90, 197, 
  // 2429
  128, 90, 198, 
  // 2432
  133, 90, 199, 
  // 2435
  138, 90, 200, 
  // 2438
  143, 90, 201, 
  // 2441
  148, 90, 202, 
  // 2444
  153, 90, 203, 
  // 2447
  103, 90, 204, 
  // 2450
  108, 90, 205, 
  // 2453
  113, 90, 206, 
  // 2456
  97, 118, 90, 207, 
  // 2460
  97, 123, 90, 208, 
  // 2464
  97, 128, 90, 209, 
  // 2468
  97, 133, 90, 210, 
  // 2472
  97, 138, 90, 211, 
  // 2476
  97, 143, 90, 212, 
  // 2480
  97, 148, 90, 213, 
  // 2484
  97, 153, 90, 214, 
  // 2488
  97, 103, 90, 215, 
  // 2492
  97, 108, 90, 216, 
  // 2496
  97, 113, 90, 217, 
  // 2500
  119, 90, 196, 
  // 2503
  124, 90, 197, 
  // 2506
  129, 90, 198, 
  // 2509
  134, 90, 199, 
  // 2512
  139, 90, 200, 
  // 2515
  144, 90, 201, 
  // 2518
  149, 90, 202, 
  // 2521
  154, 90, 203, 
  // 2524
  104, 90, 204, 
  // 2527
  109, 90, 205, 
  // 2530
  114, 90, 206, 
  // 2533
  97, 119, 90, 207, 
  // 2537
  97, 124, 90, 208, 
  // 2541
  97, 129, 90, 209, 
  // 2545
  97, 134, 90, 210, 
  // 2549
  97, 139, 90, 211, 
  // 2553
  97, 144, 90, 212, 
  // 2557
  97, 149, 90, 213, 
  // 2561
  97, 154, 90, 214, 
  // 2565
  97, 104, 90, 215, 
  // 2569
  97, 109, 90, 216, 
  // 2573
  97, 114, 90, 217, 
  // 2577
  115, 90, 218, 
  // 2580
  120, 90, 219, 
  // 2583
  125, 90, 220, 
  // 2586
  130, 90, 221, 
  // 2589
  135, 90, 222, 
  // 2592
  140, 90, 223, 
  // 2595
  145, 90, 224, 
  // 2598
  150, 90, 225, 
  // 2601
  100, 90, 226, 
  // 2604
  105, 90, 227, 
  // 2607
  110, 90, 228, 
  // 2610
  97, 115, 90, 229, 
  // 2614
  97, 120, 90, 230, 
  // 2618
  97, 125, 90, 231, 
  // 2622
  97, 130, 90, 232, 
  // 2626
  97, 135, 90, 233, 
  // 2630
  97, 140, 90, 234, 
  // 2634
  97, 145, 90, 235, 
  // 2638
  97, 150, 90, 236, 
  // 2642
  97, 100, 90, 237, 
  // 2646
  97, 105, 90, 238, 
  // 2650
  97, 110, 90, 239, 
  // 2654
  116, 90, 218, 
  // 2657
  121, 90, 219, 
  // 2660
  126, 90, 220, 
  // 2663
  131, 90, 221, 
  // 2666
  136, 90, 222, 
  // 2669
  141, 90, 223, 
  // 2672
  146, 90, 224, 
  // 2675
  151, 90, 225, 
  // 2678
  101, 90, 226, 
  // 2681
  106, 90, 227, 
  // 2684
  111, 90, 228, 
  // 2687
  97, 116, 90, 229, 
  // 2691
  97, 121, 90, 230, 
  // 2695
  97, 126, 90, 231, 
  // 2699
  97, 131, 90, 232, 
  // 2703
  97, 136, 90, 233, 
  // 2707
  97, 141, 90, 234, 
  // 2711
  97, 146, 90, 235, 
  // 2715
  97, 151, 90, 236, 
  // 2719
  97, 101, 90, 237, 
  // 2723
  97, 106, 90, 238, 
  // 2727
  97, 111, 90, 239, 
  // 2731
  117, 90, 218, 
  // 2734
  122, 90, 219, 
  // 2737
  127, 90, 220, 
  // 2740
  132, 90, 221, 
  // 2743
  137, 90, 222, 
  // 2746
  142, 90, 223, 
  // 2749
  147, 90, 224, 
  // 2752
  152, 90, 225, 
  // 2755
  102, 90, 226, 
  // 2758
  107, 90, 227, 
  // 2761
  112, 90, 228, 
  // 2764
  97, 117, 90, 229, 
  // 2768
  97, 122, 90, 230, 
  // 2772
  97, 127, 90, 231, 
  // 2776
  97, 132, 90, 232, 
  // 2780
  97, 137, 90, 233, 
  // 2784
  97, 142, 90, 234, 
  // 2788
  97, 147, 90, 235, 
  // 2792
  97, 152, 90, 236, 
  // 2796
  97, 102, 90, 237, 
  // 2800
  97, 107, 90, 238, 
  // 2804
  97, 112, 90, 239, 
  // 2808
  118, 90, 218, 
  // 2811
  123, 90, 219, 
  // 2814
  128, 90, 220, 
  // 2817
  133, 90, 221, 
  // 2820
  138, 90, 222, 
  // 2823
  143, 90, 223, 
  // 2826
  148, 90, 224, 
  // 2829
  153, 90, 225, 
  // 2832
  103, 90, 226, 
  // 2835
  108, 90, 227, 
  // 2838
  113, 90, 228, 
  // 2841
  97, 118, 90, 229, 
  // 2845
  97, 123, 90, 230, 
  // 2849
  97, 128, 90, 231, 
  // 2853
  97, 133, 90, 232, 
  // 2857
  97, 138, 90, 233, 
  // 2861
  97, 143, 90, 234, 
  // 2865
  97, 148, 90, 235, 
  // 2869
  97, 153, 90, 236, 
  // 2873
  97, 103, 90, 237, 
  // 2877
  97, 108, 90, 238, 
  // 2881
  97, 113, 90, 239, 
  // 2885
  119, 90, 218, 
  // 2888
  124, 90, 219, 
  // 2891
  129, 90, 220, 
  // 2894
  134, 90, 221, 
  // 2897
  139, 90, 222, 
  // 2900
  144, 90, 223, 
  // 2903
  149, 90, 224, 
  // 2906
  154, 90, 225, 
  // 2909
  104, 90, 226, 
  // 2912
  109, 90, 227, 
  // 2915
  114, 90, 228, 
  // 2918
  97, 119, 90, 229, 
  // 2922
  97, 124, 90, 230, 
  // 2926
  97, 129, 90, 231, 
  // 2930
  97, 134, 90, 232, 
  // 2934
  97, 139, 90, 233, 
  // 2938
  97, 144, 90, 234, 
  // 2942
  97, 149, 90, 235, 
  // 2946
  97, 154, 90, 236, 
  // 2950
  97, 104, 90, 237, 
  // 2954
  97, 109, 90, 238, 
  // 2958
  97, 114, 90, 239, 
  // 2962
  115, 90, 240, 
  // 2965
  120, 90, 241, 
  // 2968
  125, 90, 242, 
  // 2971
  130, 90, 243, 
  // 2974
  135, 90, 244, 
  // 2977
  140, 90, 245, 
  // 2980
  145, 90, 246, 
  // 2983
  150, 90, 247, 
  // 2986
  100, 90, 248, 
  // 2989
  105, 90, 249, 
  // 2992
  110, 90, 250, 
  // 2995
  97, 115, 90, 251, 
  // 2999
  97, 120, 90, 252, 
  // 3003
  97, 125, 90, 253, 
  // 3007
  97, 130, 90, 254, 
  // 3011
  97, 135, 90, 255, 
  // 3015
  97, 140, 90, 256, 
  // 3019
  97, 145, 90, 257, 
  // 3023
  97, 150, 90, 258, 
  // 3027
  97, 100, 90, 259, 
  // 3031
  97, 105, 90, 260, 
  // 3035
  97, 110, 90, 261, 
  // 3039
  116, 90, 240, 
  // 3042
  121, 90, 241, 
  // 3045
  126, 90, 242, 
  // 3048
  131, 90, 243, 
  // 3051
  136, 90, 244, 
  // 3054
  141, 90, 245, 
  // 3057
  146, 90, 246, 
  // 3060
  151, 90, 247, 
  // 3063
  101, 90, 248, 
  // 3066
  106, 90, 249, 
  // 3069
  111, 90, 250, 
  // 3072
  97, 116, 90, 251, 
  // 3076
  97, 121, 90, 252, 
  // 3080
  97, 126, 90, 253, 
  // 3084
  97, 131, 90, 254, 
  // 3088
  97, 136, 90, 255, 
  // 3092
  97, 141, 90, 256, 
  // 3096
  97, 146, 90, 257, 
  // 3100
  97, 151, 90, 258, 
  // 3104
  97, 101, 90, 259, 
  // 3108
  97, 106, 90, 260, 
  // 3112
  97, 111, 90, 261, 
  // 3116
  117, 90, 240, 
  // 3119
  122, 90, 241, 
  // 3122
  127, 90, 242, 
  // 3125
  132, 90, 243, 
  // 3128
  137, 90, 244, 
  // 3131
  142, 90, 245, 
  // 3134
  147, 90, 246, 
  // 3137
  152, 90, 247, 
  // 3140
  102, 90, 248, 
  // 3143
  107, 90, 249, 
  // 3146
  112, 90, 250, 
  // 3149
  97, 117, 90, 251, 
  // 3153
  97, 122, 90, 252, 
  // 3157
  97, 127, 90, 253, 
  // 3161
  97, 132, 90, 254, 
  // 3165
  97, 137, 90, 255, 
  // 3169
  97, 142, 90, 256, 
  // 3173
  97, 147, 90, 257, 
  // 3177
  97, 152, 90, 258, 
  // 3181
  97, 102, 90, 259, 
  // 3185
  97, 107, 90, 260, 
  // 3189
  97, 112, 90, 261, 
  // 3193
  118, 90, 240, 
  // 3196
  123, 90, 241, 
  // 3199
  128, 90, 242, 
  // 3202
  133, 90, 243, 
  // 3205
  138, 90, 244, 
  // 3208
  143, 90, 245, 
  // 3211
  148, 90, 246, 
  // 3214
  153, 90, 247, 
  // 3217
  103, 90, 248, 
  // 3220
  108, 90, 249, 
  // 3223
  113, 90, 250, 
  // 3226
  97, 118, 90, 251, 
  // 3230
  97, 123, 90, 252, 
  // 3234
  97, 128, 90, 253, 
  // 3238
  97, 133, 90, 254, 
  // 3242
  97, 138, 90, 255, 
  // 3246
  97, 143, 90, 256, 
  // 3250
  97, 148, 90, 257, 
  // 3254
  97, 153, 90, 258, 
  // 3258
  97, 103, 90, 259, 
  // 3262
  97, 108, 90, 260, 
  // 3266
  97, 113, 90, 261, 
  // 3270
  119, 90, 240, 
  // 3273
  124, 90, 241, 
  // 3276
  129, 90, 242, 
  // 3279
  134, 90, 243, 
  // 3282
  139, 90, 244, 
  // 3285
  144, 90, 245, 
  // 3288
  149, 90, 246, 
  // 3291
  154, 90, 247, 
  // 3294
  104, 90, 248, 
  // 3297
  109, 90, 249, 
  // 3300
  114, 90, 250, 
  // 3303
  97, 119, 90, 251, 
  // 3307
  97, 124, 90, 252, 
  // 3311
  97, 129, 90, 253, 
  // 3315
  97, 134, 90, 254, 
  // 3319
  97, 139, 90, 255, 
  // 3323
  97, 144, 90, 256, 
  // 3327
  97, 149, 90, 257, 
  // 3331
  97, 154, 90, 258, 
  // 3335
  97, 104, 90, 259, 
  // 3339
  97, 109, 90, 260, 
  // 3343
  97, 114, 90, 261, 
  // 3347
  115, 90, 262, 
  // 3350
  120, 90, 263, 
  // 3353
  125, 90, 264, 
  // 3356
  130, 90, 265, 
  // 3359
  135, 90, 266, 
  // 3362
  140, 90, 267, 
  // 3365
  145, 90, 268, 
  // 3368
  150, 90, 269, 
  // 3371
  100, 90, 270, 
  // 3374
  105, 90, 271, 
  // 3377
  110, 90, 272, 
  // 3380
  116, 90, 262, 
  // 3383
  121, 90, 263, 
  // 3386
  126, 90, 264, 
  // 3389
  131, 90, 265, 
  // 3392
  136, 90, 266, 
  // 3395
  141, 90, 267, 
  // 3398
  146, 90, 268, 
  // 3401
  151, 90, 269, 
  // 3404
  101, 90, 270, 
  // 3407
  106, 90, 271, 
  // 3410
  111, 90, 272, 
  // 3413
  117, 90, 262, 
  // 3416
  122, 90, 263, 
  // 3419
  127, 90, 264, 
  // 3422
  132, 90, 265, 
  // 3425
  137, 90, 266, 
  // 3428
  142, 90, 267, 
  // 3431
  147, 90, 268, 
  // 3434
  152, 90, 269, 
  // 3437
  102, 90, 270, 
  // 3440
  107, 90, 271, 
  // 3443
  112, 90, 272, 
  // 3446
  118, 90, 262, 
  // 3449
  123, 90, 263, 
  // 3452
  128, 90, 264, 
  // 3455
  133, 90, 265, 
  // 3458
  138, 90, 266, 
  // 3461
  143, 90, 267, 
  // 3464
  148, 90, 268, 
  // 3467
  153, 90, 269, 
  // 3470
  103, 90, 270, 
  // 3473
  108, 90, 271, 
  // 3476
  113, 90, 272, 
  // 3479
  119, 90, 262, 
  // 3482
  124, 90, 263, 
  // 3485
  129, 90, 264, 
  // 3488
  134, 90, 265, 
  // 3491
  139, 90, 266, 
  // 3494
  144, 90, 267, 
  // 3497
  149, 90, 268, 
  // 3500
  154, 90, 269, 
  // 3503
  104, 90, 270, 
  // 3506
  109, 90, 271, 
  // 3509
  114, 90, 272, 
  // 3512
  27, 90, 56, 
  // 3515
  100, 90, 56, 
  // 3518
  97, 27, 90, 61, 
  // 3522
  97, 24, 90, 61, 
  // 3526
  97, 100, 90, 61, 
  // 3530
  97, 105, 90, 61, 
  // 3534
  101, 90, 56, 
  // 3537
  102, 90, 56, 
  // 3540
  103, 90, 56, 
  // 3543
  104, 90, 56, 
  // 3546
  97, 101, 90, 61, 
  // 3550
  97, 106, 90, 61, 
  // 3554
  97, 102, 90, 61, 
  // 3558
  97, 107, 90, 61, 
  // 3562
  97, 103, 90, 61, 
  // 3566
  97, 108, 90, 61, 
  // 3570
  97, 104, 90, 61, 
  // 3574
  97, 109, 90, 61, 
  // 3578
  27, 90, 57, 
  // 3581
  100, 90, 57, 
  // 3584
  101, 90, 57, 
  // 3587
  102, 90, 57, 
  // 3590
  103, 90, 57, 
  // 3593
  104, 90, 57, 
  // 3596
  97, 27, 90, 62, 
  // 3600
  97, 24, 90, 62, 
  // 3604
  97, 100, 90, 62, 
  // 3608
  97, 105, 90, 62, 
  // 3612
  97, 101, 90, 62, 
  // 3616
  97, 106, 90, 62, 
  // 3620
  97, 102, 90, 62, 
  // 3624
  97, 107, 90, 62, 
  // 3628
  97, 103, 90, 62, 
  // 3632
  97, 108, 90, 62, 
  // 3636
  97, 104, 90, 62, 
  // 3640
  97, 109, 90, 62, 
  // 3644
  27, 90, 58, 
  // 3647
  100, 90, 58, 
  // 3650
  101, 90, 58, 
  // 3653
  102, 90, 58, 
  // 3656
  103, 90, 58, 
  // 3659
  104, 90, 58, 
  // 3662
  97, 27, 90, 63, 
  // 3666
  97, 24, 90, 63, 
  // 3670
  97, 100, 90, 63, 
  // 3674
  97, 105, 90, 63, 
  // 3678
  97, 101, 90, 63, 
  // 3682
  97, 106, 90, 63, 
  // 3686
  97, 102, 90, 63, 
  // 3690
  97, 107, 90, 63, 
  // 3694
  97, 103, 90, 63, 
  // 3698
  97, 108, 90, 63, 
  // 3702
  97, 104, 90, 63, 
  // 3706
  97, 109, 90, 63, 
  // 3710
  27, 90, 55, 
  // 3713
  100, 90, 55, 
  // 3716
  101, 90, 55, 
  // 3719
  102, 90, 55, 
  // 3722
  103, 90, 55, 
  // 3725
  104, 90, 55, 
  // 3728
  97, 27, 90, 60, 
  // 3732
  97, 24, 90, 60, 
  // 3736
  97, 100, 90, 60, 
  // 3740
  97, 105, 90, 60, 
  // 3744
  97, 101, 90, 60, 
  // 3748
  97, 106, 90, 60, 
  // 3752
  97, 102, 90, 60, 
  // 3756
  97, 107, 90, 60, 
  // 3760
  97, 103, 90, 60, 
  // 3764
  97, 108, 90, 60, 
  // 3768
  97, 104, 90, 60, 
  // 3772
  97, 109, 90, 60, 
  // 3776
  27, 90, 54, 
  // 3779
  100, 90, 54, 
  // 3782
  101, 90, 54, 
  // 3785
  102, 90, 54, 
  // 3788
  103, 90, 54, 
  // 3791
  104, 90, 54, 
  // 3794
  97, 80, 
  // 3796
  97, 80, 82, 
  // 3799
  80, 273, 
  // 3801
  80, 275, 
  // 3803
  25, 276, 278, 90, 25, 
  // 3808
  25, 279, 280, 90, 25, 
  // 3813
  25, 276, 278, 90, 90, 25, 
  // 3819
  25, 279, 280, 90, 90, 25, 
  // 3825
  97, 76, 281, 
  // 3828
  97, 278, 90, 
  // 3831
  76, 283, 76, 
  // 3834
  76, 283, 
  // 3836
  76, 283, 76, 76, 
  // 3840
  93, 285, 93, 
  // 3843
  93, 285, 
  // 3845
  93, 285, 93, 93, 
  // 3849
  76, 286, 76, 
  // 3852
  76, 286, 
  // 3854
  76, 286, 76, 76, 
  // 3858
  93, 287, 93, 
  // 3861
  93, 287, 
  // 3863
  93, 287, 93, 93, 
  // 3867
  79, 289, 79, 
  // 3870
  79, 289, 
  // 3872
  79, 289, 79, 79, 
  // 3876
  95, 291, 95, 
  // 3879
  95, 291, 
  // 3881
  95, 291, 95, 95, 
  // 3885
  79, 292, 79, 
  // 3888
  79, 292, 
  // 3890
  79, 292, 79, 79, 
  // 3894
  95, 293, 95, 
  // 3897
  95, 293, 
  // 3899
  95, 293, 95, 95, 
  // 3903
  27, 295, 27, 
  // 3906
  27, 296, 27, 
  // 3909
  76, 297, 76, 
  // 3912
  76, 297, 
  // 3914
  76, 297, 76, 76, 
  // 3918
  93, 298, 93, 
  // 3921
  93, 298, 
  // 3923
  93, 298, 93, 93, 
  // 3927
  97, 307, 76, 
  // 3930
  97, 307, 76, 81, 
  // 3934
  97, 307, 76, 81, 82, 
  // 3939
  19, 307, 255, 76, 
  // 3943
  19, 307, 255, 76, 81, 81, 
  // 3949
  19, 307, 255, 76, 81, 81, 82, 
  // 3956
  97, 80, 81, 82, 
  // 3960
  76, 307, 
  // 3962
  76, 307, 81, 
  // 3965
  76, 307, 81, 82, 
  // 3969
  76, 307, 76, 
  // 3972
  76, 307, 76, 81, 
  // 3976
  76, 307, 76, 81, 82, 
  // 3981
  97, 308, 93, 
  // 3984
  97, 308, 93, 81, 
  // 3988
  97, 308, 93, 81, 82, 
  // 3993
  93, 308, 
  // 3995
  93, 308, 81, 
  // 3998
  93, 308, 81, 82, 
  // 4002
  93, 308, 93, 
  // 4005
  93, 308, 93, 81, 
  // 4009
  93, 308, 93, 81, 82, 
  // 4014
  19, 308, 256, 93, 
  // 4018
  19, 308, 256, 93, 81, 81, 
  // 4024
  19, 308, 256, 93, 81, 81, 82, 
  // 4031
  97, 309, 79, 
  // 4034
  97, 309, 79, 81, 
  // 4038
  97, 309, 79, 81, 82, 
  // 4043
  79, 309, 
  // 4045
  79, 309, 81, 
  // 4048
  79, 309, 81, 82, 
  // 4052
  79, 309, 79, 
  // 4055
  79, 309, 79, 81, 
  // 4059
  79, 309, 79, 81, 82, 
  // 4064
  19, 309, 257, 79, 
  // 4068
  19, 309, 257, 79, 81, 81, 
  // 4074
  19, 309, 257, 79, 81, 81, 82, 
  // 4081
  97, 310, 95, 
  // 4084
  97, 310, 95, 81, 
  // 4088
  97, 310, 95, 81, 82, 
  // 4093
  95, 310, 
  // 4095
  95, 310, 81, 
  // 4098
  95, 310, 81, 82, 
  // 4102
  95, 310, 95, 
  // 4105
  95, 310, 95, 81, 
  // 4109
  95, 310, 95, 81, 82, 
  // 4114
  19, 310, 258, 95, 
  // 4118
  19, 310, 258, 95, 81, 81, 
  // 4124
  19, 310, 258, 95, 81, 81, 82, 
  // 4131
  97, 311, 27, 
  // 4134
  97, 311, 27, 81, 
  // 4138
  97, 311, 27, 81, 82, 
  // 4143
  27, 311, 
  // 4145
  27, 311, 81, 
  // 4148
  27, 311, 81, 82, 
  // 4152
  27, 311, 27, 
  // 4155
  27, 311, 27, 81, 
  // 4159
  27, 311, 27, 81, 82, 
  // 4164
  19, 311, 259, 27, 
  // 4168
  19, 311, 259, 27, 81, 81, 
  // 4174
  19, 311, 259, 27, 81, 81, 82, 
  // 4181
  97, 312, 24, 
  // 4184
  97, 312, 24, 81, 
  // 4188
  97, 312, 24, 81, 82, 
  // 4193
  24, 312, 
  // 4195
  24, 312, 81, 
  // 4198
  24, 312, 81, 82, 
  // 4202
  24, 312, 24, 
  // 4205
  24, 312, 24, 81, 
  // 4209
  24, 312, 24, 81, 82, 
  // 4214
  19, 312, 260, 24, 
  // 4218
  19, 312, 260, 24, 81, 81, 
  // 4224
  19, 312, 260, 24, 81, 81, 82, 
  // 4231
  94, 313, 84, 
  // 4234
  94, 313, 84, 81, 
  // 4238
  94, 313, 84, 81, 82, 
  // 4243
  97, 314, 
  // 4245
  97, 314, 81, 
  // 4248
  97, 314, 81, 82, 
  // 4252
  19, 314, 
  // 4254
  19, 314, 81, 
  // 4257
  19, 314, 81, 82, 
  // 4261
  97, 315, 76, 
  // 4264
  97, 315, 76, 81, 
  // 4268
  97, 315, 76, 81, 82, 
  // 4273
  76, 315, 
  // 4275
  76, 315, 81, 
  // 4278
  76, 315, 81, 82, 
  // 4282
  76, 315, 76, 
  // 4285
  76, 315, 76, 81, 
  // 4289
  76, 315, 76, 81, 82, 
  // 4294
  19, 315, 189, 76, 
  // 4298
  19, 315, 189, 76, 81, 81, 
  // 4304
  19, 315, 189, 76, 81, 81, 82, 
  // 4311
  19, 315, 211, 76, 
  // 4315
  19, 315, 211, 76, 81, 81, 
  // 4321
  19, 315, 211, 76, 81, 81, 82, 
  // 4328
  19, 315, 233, 76, 
  // 4332
  19, 315, 233, 76, 81, 81, 
  // 4338
  19, 315, 233, 76, 81, 81, 82, 
  // 4345
  97, 316, 93, 
  // 4348
  97, 316, 93, 81, 
  // 4352
  97, 316, 93, 81, 82, 
  // 4357
  93, 316, 
  // 4359
  93, 316, 81, 
  // 4362
  93, 316, 81, 82, 
  // 4366
  93, 316, 93, 
  // 4369
  93, 316, 93, 81, 
  // 4373
  93, 316, 93, 81, 82, 
  // 4378
  19, 316, 190, 93, 
  // 4382
  19, 316, 190, 93, 81, 81, 
  // 4388
  19, 316, 190, 93, 81, 81, 82, 
  // 4395
  19, 316, 212, 93, 
  // 4399
  19, 316, 212, 93, 81, 81, 
  // 4405
  19, 316, 212, 93, 81, 81, 82, 
  // 4412
  19, 316, 234, 93, 
  // 4416
  19, 316, 234, 93, 81, 81, 
  // 4422
  19, 316, 234, 93, 81, 81, 82, 
  // 4429
  97, 317, 79, 
  // 4432
  97, 317, 79, 81, 
  // 4436
  97, 317, 79, 81, 82, 
  // 4441
  79, 317, 
  // 4443
  79, 317, 81, 
  // 4446
  79, 317, 81, 82, 
  // 4450
  79, 317, 79, 
  // 4453
  79, 317, 79, 81, 
  // 4457
  79, 317, 79, 81, 82, 
  // 4462
  19, 317, 191, 79, 
  // 4466
  19, 317, 191, 79, 81, 81, 
  // 4472
  19, 317, 191, 79, 81, 81, 82, 
  // 4479
  19, 317, 213, 79, 
  // 4483
  19, 317, 213, 79, 81, 81, 
  // 4489
  19, 317, 213, 79, 81, 81, 82, 
  // 4496
  19, 317, 235, 79, 
  // 4500
  19, 317, 235, 79, 81, 81, 
  // 4506
  19, 317, 235, 79, 81, 81, 82, 
  // 4513
  97, 318, 95, 
  // 4516
  97, 318, 95, 81, 
  // 4520
  97, 318, 95, 81, 82, 
  // 4525
  95, 318, 
  // 4527
  95, 318, 81, 
  // 4530
  95, 318, 81, 82, 
  // 4534
  95, 318, 95, 
  // 4537
  95, 318, 95, 81, 
  // 4541
  95, 318, 95, 81, 82, 
  // 4546
  19, 318, 192, 95, 
  // 4550
  19, 318, 192, 95, 81, 81, 
  // 4556
  19, 318, 192, 95, 81, 81, 82, 
  // 4563
  19, 318, 214, 95, 
  // 4567
  19, 318, 214, 95, 81, 81, 
  // 4573
  19, 318, 214, 95, 81, 81, 82, 
  // 4580
  19, 318, 236, 95, 
  // 4584
  19, 318, 236, 95, 81, 81, 
  // 4590
  19, 318, 236, 95, 81, 81, 82, 
  // 4597
  97, 319, 27, 
  // 4600
  97, 319, 27, 81, 
  // 4604
  97, 319, 27, 81, 82, 
  // 4609
  27, 319, 
  // 4611
  27, 319, 81, 
  // 4614
  27, 319, 81, 82, 
  // 4618
  27, 319, 27, 
  // 4621
  27, 319, 27, 81, 
  // 4625
  27, 319, 27, 81, 82, 
  // 4630
  19, 319, 193, 27, 
  // 4634
  19, 319, 193, 27, 81, 81, 
  // 4640
  19, 319, 193, 27, 81, 81, 82, 
  // 4647
  19, 319, 215, 27, 
  // 4651
  19, 319, 215, 27, 81, 81, 
  // 4657
  19, 319, 215, 27, 81, 81, 82, 
  // 4664
  19, 319, 237, 27, 
  // 4668
  19, 319, 237, 27, 81, 81, 
  // 4674
  19, 319, 237, 27, 81, 81, 82, 
  // 4681
  97, 320, 24, 
  // 4684
  97, 320, 24, 81, 
  // 4688
  97, 320, 24, 81, 82, 
  // 4693
  24, 320, 
  // 4695
  24, 320, 81, 
  // 4698
  24, 320, 81, 82, 
  // 4702
  24, 320, 24, 
  // 4705
  24, 320, 24, 81, 
  // 4709
  24, 320, 24, 81, 82, 
  // 4714
  19, 320, 194, 24, 
  // 4718
  19, 320, 194, 24, 81, 81, 
  // 4724
  19, 320, 194, 24, 81, 81, 82, 
  // 4731
  19, 320, 216, 24, 
  // 4735
  19, 320, 216, 24, 81, 81, 
  // 4741
  19, 320, 216, 24, 81, 81, 82, 
  // 4748
  19, 320, 238, 24, 
  // 4752
  19, 320, 238, 24, 81, 81, 
  // 4758
  19, 320, 238, 24, 81, 81, 82, 
  // 4765
  94, 321, 84, 
  // 4768
  94, 321, 84, 81, 
  // 4772
  94, 321, 84, 81, 82, 
  // 4777
  97, 322, 
  // 4779
  97, 322, 81, 
  // 4782
  97, 322, 81, 82, 
  // 4786
  19, 322, 
  // 4788
  19, 322, 81, 
  // 4791
  19, 322, 81, 82, 
  // 4795
  97, 323, 76, 
  // 4798
  97, 323, 76, 81, 
  // 4802
  97, 323, 76, 81, 82, 
  // 4807
  76, 323, 
  // 4809
  76, 323, 81, 
  // 4812
  76, 323, 81, 82, 
  // 4816
  76, 323, 76, 
  // 4819
  76, 323, 76, 81, 
  // 4823
  76, 323, 76, 81, 82, 
  // 4828
  19, 323, 189, 76, 
  // 4832
  19, 323, 189, 76, 81, 81, 
  // 4838
  19, 323, 189, 76, 81, 81, 82, 
  // 4845
  19, 323, 211, 76, 
  // 4849
  19, 323, 211, 76, 81, 81, 
  // 4855
  19, 323, 211, 76, 81, 81, 82, 
  // 4862
  19, 323, 233, 76, 
  // 4866
  19, 323, 233, 76, 81, 81, 
  // 4872
  19, 323, 233, 76, 81, 81, 82, 
  // 4879
  97, 324, 93, 
  // 4882
  97, 324, 93, 81, 
  // 4886
  97, 324, 93, 81, 82, 
  // 4891
  93, 324, 
  // 4893
  93, 324, 81, 
  // 4896
  93, 324, 81, 82, 
  // 4900
  93, 324, 93, 
  // 4903
  93, 324, 93, 81, 
  // 4907
  93, 324, 93, 81, 82, 
  // 4912
  19, 324, 190, 93, 
  // 4916
  19, 324, 190, 93, 81, 81, 
  // 4922
  19, 324, 190, 93, 81, 81, 82, 
  // 4929
  19, 324, 212, 93, 
  // 4933
  19, 324, 212, 93, 81, 81, 
  // 4939
  19, 324, 212, 93, 81, 81, 82, 
  // 4946
  19, 324, 234, 93, 
  // 4950
  19, 324, 234, 93, 81, 81, 
  // 4956
  19, 324, 234, 93, 81, 81, 82, 
  // 4963
  97, 325, 79, 
  // 4966
  97, 325, 79, 81, 
  // 4970
  97, 325, 79, 81, 82, 
  // 4975
  79, 325, 
  // 4977
  79, 325, 81, 
  // 4980
  79, 325, 81, 82, 
  // 4984
  79, 325, 79, 
  // 4987
  79, 325, 79, 81, 
  // 4991
  79, 325, 79, 81, 82, 
  // 4996
  19, 325, 191, 79, 
  // 5000
  19, 325, 191, 79, 81, 81, 
  // 5006
  19, 325, 191, 79, 81, 81, 82, 
  // 5013
  19, 325, 213, 79, 
  // 5017
  19, 325, 213, 79, 81, 81, 
  // 5023
  19, 325, 213, 79, 81, 81, 82, 
  // 5030
  19, 325, 235, 79, 
  // 5034
  19, 325, 235, 79, 81, 81, 
  // 5040
  19, 325, 235, 79, 81, 81, 82, 
  // 5047
  97, 326, 95, 
  // 5050
  97, 326, 95, 81, 
  // 5054
  97, 326, 95, 81, 82, 
  // 5059
  95, 326, 
  // 5061
  95, 326, 81, 
  // 5064
  95, 326, 81, 82, 
  // 5068
  95, 326, 95, 
  // 5071
  95, 326, 95, 81, 
  // 5075
  95, 326, 95, 81, 82, 
  // 5080
  19, 326, 192, 95, 
  // 5084
  19, 326, 192, 95, 81, 81, 
  // 5090
  19, 326, 192, 95, 81, 81, 82, 
  // 5097
  19, 326, 214, 95, 
  // 5101
  19, 326, 214, 95, 81, 81, 
  // 5107
  19, 326, 214, 95, 81, 81, 82, 
  // 5114
  19, 326, 236, 95, 
  // 5118
  19, 326, 236, 95, 81, 81, 
  // 5124
  19, 326, 236, 95, 81, 81, 82, 
  // 5131
  97, 327, 27, 
  // 5134
  97, 327, 27, 81, 
  // 5138
  97, 327, 27, 81, 82, 
  // 5143
  27, 327, 
  // 5145
  27, 327, 81, 
  // 5148
  27, 327, 81, 82, 
  // 5152
  27, 327, 27, 
  // 5155
  27, 327, 27, 81, 
  // 5159
  27, 327, 27, 81, 82, 
  // 5164
  19, 327, 193, 27, 
  // 5168
  19, 327, 193, 27, 81, 81, 
  // 5174
  19, 327, 193, 27, 81, 81, 82, 
  // 5181
  19, 327, 215, 27, 
  // 5185
  19, 327, 215, 27, 81, 81, 
  // 5191
  19, 327, 215, 27, 81, 81, 82, 
  // 5198
  19, 327, 237, 27, 
  // 5202
  19, 327, 237, 27, 81, 81, 
  // 5208
  19, 327, 237, 27, 81, 81, 82, 
  // 5215
  97, 328, 24, 
  // 5218
  97, 328, 24, 81, 
  // 5222
  97, 328, 24, 81, 82, 
  // 5227
  24, 328, 
  // 5229
  24, 328, 81, 
  // 5232
  24, 328, 81, 82, 
  // 5236
  24, 328, 24, 
  // 5239
  24, 328, 24, 81, 
  // 5243
  24, 328, 24, 81, 82, 
  // 5248
  19, 328, 194, 24, 
  // 5252
  19, 328, 194, 24, 81, 81, 
  // 5258
  19, 328, 194, 24, 81, 81, 82, 
  // 5265
  19, 328, 216, 24, 
  // 5269
  19, 328, 216, 24, 81, 81, 
  // 5275
  19, 328, 216, 24, 81, 81, 82, 
  // 5282
  19, 328, 238, 24, 
  // 5286
  19, 328, 238, 24, 81, 81, 
  // 5292
  19, 328, 238, 24, 81, 81, 82, 
  // 5299
  94, 329, 84, 
  // 5302
  94, 329, 84, 81, 
  // 5306
  94, 329, 84, 81, 82, 
  // 5311
  97, 330, 
  // 5313
  97, 330, 81, 
  // 5316
  97, 330, 81, 82, 
  // 5320
  19, 330, 
  // 5322
  19, 330, 81, 
  // 5325
  19, 330, 81, 82, 
  // 5329
  97, 332, 10, 
  // 5332
  97, 332, 10, 81, 
  // 5336
  97, 332, 10, 81, 82, 
  // 5341
  53, 332, 
  // 5343
  53, 332, 81, 
  // 5346
  53, 332, 81, 82, 
  // 5350
  53, 332, 53, 
  // 5353
  53, 332, 53, 81, 
  // 5357
  53, 332, 53, 81, 82, 
  // 5362
  97, 333, 10, 
  // 5365
  97, 333, 10, 81, 
  // 5369
  97, 333, 10, 81, 82, 
  // 5374
  53, 333, 
  // 5376
  53, 333, 81, 
  // 5379
  53, 333, 81, 82, 
  // 5383
  53, 333, 53, 
  // 5386
  53, 333, 53, 81, 
  // 5390
  53, 333, 53, 81, 82, 
  // 5395
  97, 334, 10, 
  // 5398
  97, 334, 10, 81, 
  // 5402
  97, 334, 10, 81, 82, 
  // 5407
  53, 334, 
  // 5409
  53, 334, 81, 
  // 5412
  53, 334, 81, 82, 
  // 5416
  53, 334, 53, 
  // 5419
  53, 334, 53, 81, 
  // 5423
  53, 334, 53, 81, 82, 
  // 5428
  115, 115, 120, 
  // 5431
  120, 120, 120, 
  // 5434
  125, 125, 130, 
  // 5437
  130, 130, 130, 
  // 5440
  135, 135, 140, 
  // 5443
  140, 140, 140, 
  // 5446
  145, 145, 150, 
  // 5449
  150, 150, 150, 
  // 5452
  100, 100, 140, 
  // 5455
  105, 105, 150, 
  // 5458
  110, 110, 130, 
  // 5461
  115, 117, 120, 
  // 5464
  120, 122, 120, 
  // 5467
  125, 127, 130, 
  // 5470
  130, 132, 130, 
  // 5473
  135, 137, 140, 
  // 5476
  140, 142, 140, 
  // 5479
  145, 147, 150, 
  // 5482
  150, 152, 150, 
  // 5485
  100, 102, 140, 
  // 5488
  105, 107, 150, 
  // 5491
  110, 112, 130, 
  // 5494
  115, 118, 120, 
  // 5497
  120, 123, 120, 
  // 5500
  125, 128, 130, 
  // 5503
  130, 133, 130, 
  // 5506
  135, 138, 140, 
  // 5509
  140, 143, 140, 
  // 5512
  145, 148, 150, 
  // 5515
  150, 153, 150, 
  // 5518
  100, 103, 140, 
  // 5521
  105, 108, 150, 
  // 5524
  110, 113, 130, 
  // 5527
  115, 119, 120, 
  // 5530
  120, 124, 120, 
  // 5533
  125, 129, 130, 
  // 5536
  130, 134, 130, 
  // 5539
  135, 139, 140, 
  // 5542
  140, 144, 140, 
  // 5545
  145, 149, 150, 
  // 5548
  150, 154, 150, 
  // 5551
  100, 104, 140, 
  // 5554
  105, 109, 150, 
  // 5557
  110, 114, 130, 
  // 5560
  117, 115, 122, 
  // 5563
  122, 120, 122, 
  // 5566
  127, 125, 132, 
  // 5569
  132, 130, 132, 
  // 5572
  137, 135, 142, 
  // 5575
  142, 140, 142, 
  // 5578
  147, 145, 152, 
  // 5581
  152, 150, 152, 
  // 5584
  102, 100, 142, 
  // 5587
  107, 105, 152, 
  // 5590
  112, 110, 132, 
  // 5593
  117, 117, 122, 
  // 5596
  122, 122, 122, 
  // 5599
  127, 127, 132, 
  // 5602
  132, 132, 132, 
  // 5605
  137, 137, 142, 
  // 5608
  142, 142, 142, 
  // 5611
  147, 147, 152, 
  // 5614
  152, 152, 152, 
  // 5617
  102, 102, 142, 
  // 5620
  107, 107, 152, 
  // 5623
  112, 112, 132, 
  // 5626
  117, 118, 122, 
  // 5629
  122, 123, 122, 
  // 5632
  127, 128, 132, 
  // 5635
  132, 133, 132, 
  // 5638
  137, 138, 142, 
  // 5641
  142, 143, 142, 
  // 5644
  147, 148, 152, 
  // 5647
  152, 153, 152, 
  // 5650
  102, 103, 142, 
  // 5653
  107, 108, 152, 
  // 5656
  112, 113, 132, 
  // 5659
  117, 119, 122, 
  // 5662
  122, 124, 122, 
  // 5665
  127, 129, 132, 
  // 5668
  132, 134, 132, 
  // 5671
  137, 139, 142, 
  // 5674
  142, 144, 142, 
  // 5677
  147, 149, 152, 
  // 5680
  152, 154, 152, 
  // 5683
  102, 104, 142, 
  // 5686
  107, 109, 152, 
  // 5689
  112, 114, 132, 
  // 5692
  118, 115, 123, 
  // 5695
  123, 120, 123, 
  // 5698
  128, 125, 133, 
  // 5701
  133, 130, 133, 
  // 5704
  138, 135, 143, 
  // 5707
  143, 140, 143, 
  // 5710
  148, 145, 153, 
  // 5713
  153, 150, 153, 
  // 5716
  103, 100, 143, 
  // 5719
  108, 105, 153, 
  // 5722
  113, 110, 133, 
  // 5725
  118, 117, 123, 
  // 5728
  123, 122, 123, 
  // 5731
  128, 127, 133, 
  // 5734
  133, 132, 133, 
  // 5737
  138, 137, 143, 
  // 5740
  143, 142, 143, 
  // 5743
  148, 147, 153, 
  // 5746
  153, 152, 153, 
  // 5749
  103, 102, 143, 
  // 5752
  108, 107, 153, 
  // 5755
  113, 112, 133, 
  // 5758
  118, 118, 123, 
  // 5761
  123, 123, 123, 
  // 5764
  128, 128, 133, 
  // 5767
  133, 133, 133, 
  // 5770
  138, 138, 143, 
  // 5773
  143, 143, 143, 
  // 5776
  148, 148, 153, 
  // 5779
  153, 153, 153, 
  // 5782
  103, 103, 143, 
  // 5785
  108, 108, 153, 
  // 5788
  113, 113, 133, 
  // 5791
  118, 119, 123, 
  // 5794
  123, 124, 123, 
  // 5797
  128, 129, 133, 
  // 5800
  133, 134, 133, 
  // 5803
  138, 139, 143, 
  // 5806
  143, 144, 143, 
  // 5809
  148, 149, 153, 
  // 5812
  153, 154, 153, 
  // 5815
  103, 104, 143, 
  // 5818
  108, 109, 153, 
  // 5821
  113, 114, 133, 
  // 5824
  119, 115, 124, 
  // 5827
  124, 120, 124, 
  // 5830
  129, 125, 134, 
  // 5833
  134, 130, 134, 
  // 5836
  139, 135, 144, 
  // 5839
  144, 140, 144, 
  // 5842
  149, 145, 154, 
  // 5845
  154, 150, 154, 
  // 5848
  104, 100, 144, 
  // 5851
  109, 105, 154, 
  // 5854
  114, 110, 134, 
  // 5857
  119, 117, 124, 
  // 5860
  124, 122, 124, 
  // 5863
  129, 127, 134, 
  // 5866
  134, 132, 134, 
  // 5869
  139, 137, 144, 
  // 5872
  144, 142, 144, 
  // 5875
  149, 147, 154, 
  // 5878
  154, 152, 154, 
  // 5881
  104, 102, 144, 
  // 5884
  109, 107, 154, 
  // 5887
  114, 112, 134, 
  // 5890
  119, 118, 124, 
  // 5893
  124, 123, 124, 
  // 5896
  129, 128, 134, 
  // 5899
  134, 133, 134, 
  // 5902
  139, 138, 144, 
  // 5905
  144, 143, 144, 
  // 5908
  149, 148, 154, 
  // 5911
  154, 153, 154, 
  // 5914
  104, 103, 144, 
  // 5917
  109, 108, 154, 
  // 5920
  114, 113, 134, 
  // 5923
  119, 119, 124, 
  // 5926
  124, 124, 124, 
  // 5929
  129, 129, 134, 
  // 5932
  134, 134, 134, 
  // 5935
  139, 139, 144, 
  // 5938
  144, 144, 144, 
  // 5941
  149, 149, 154, 
  // 5944
  154, 154, 154, 
  // 5947
  104, 104, 144, 
  // 5950
  109, 109, 154, 
  // 5953
  114, 114, 134, 
  // 5956
  115, 115, 115, 120, 
  // 5960
  120, 120, 120, 120, 
  // 5964
  125, 125, 125, 130, 
  // 5968
  130, 130, 130, 130, 
  // 5972
  135, 135, 135, 140, 
  // 5976
  140, 140, 140, 140, 
  // 5980
  145, 145, 145, 150, 
  // 5984
  150, 150, 150, 150, 
  // 5988
  100, 100, 100, 140, 
  // 5992
  105, 105, 105, 150, 
  // 5996
  110, 110, 110, 130, 
  // 6000
  115, 117, 117, 120, 
  // 6004
  120, 122, 122, 120, 
  // 6008
  125, 127, 127, 130, 
  // 6012
  130, 132, 132, 130, 
  // 6016
  135, 137, 137, 140, 
  // 6020
  140, 142, 142, 140, 
  // 6024
  145, 147, 147, 150, 
  // 6028
  150, 152, 152, 150, 
  // 6032
  100, 102, 102, 140, 
  // 6036
  105, 107, 107, 150, 
  // 6040
  110, 112, 112, 130, 
  // 6044
  115, 118, 118, 120, 
  // 6048
  120, 123, 123, 120, 
  // 6052
  125, 128, 128, 130, 
  // 6056
  130, 133, 133, 130, 
  // 6060
  135, 138, 138, 140, 
  // 6064
  140, 143, 143, 140, 
  // 6068
  145, 148, 148, 150, 
  // 6072
  150, 153, 153, 150, 
  // 6076
  100, 103, 103, 140, 
  // 6080
  105, 108, 108, 150, 
  // 6084
  110, 113, 113, 130, 
  // 6088
  115, 119, 119, 120, 
  // 6092
  120, 124, 124, 120, 
  // 6096
  125, 129, 129, 130, 
  // 6100
  130, 134, 134, 130, 
  // 6104
  135, 139, 139, 140, 
  // 6108
  140, 144, 144, 140, 
  // 6112
  145, 149, 149, 150, 
  // 6116
  150, 154, 154, 150, 
  // 6120
  100, 104, 104, 140, 
  // 6124
  105, 109, 109, 150, 
  // 6128
  110, 114, 114, 130, 
  // 6132
  117, 115, 115, 122, 
  // 6136
  122, 120, 120, 122, 
  // 6140
  127, 125, 125, 132, 
  // 6144
  132, 130, 130, 132, 
  // 6148
  137, 135, 135, 142, 
  // 6152
  142, 140, 140, 142, 
  // 6156
  147, 145, 145, 152, 
  // 6160
  152, 150, 150, 152, 
  // 6164
  102, 100, 100, 142, 
  // 6168
  107, 105, 105, 152, 
  // 6172
  112, 110, 110, 132, 
  // 6176
  117, 117, 117, 122, 
  // 6180
  122, 122, 122, 122, 
  // 6184
  127, 127, 127, 132, 
  // 6188
  132, 132, 132, 132, 
  // 6192
  137, 137, 137, 142, 
  // 6196
  142, 142, 142, 142, 
  // 6200
  147, 147, 147, 152, 
  // 6204
  152, 152, 152, 152, 
  // 6208
  102, 102, 102, 142, 
  // 6212
  107, 107, 107, 152, 
  // 6216
  112, 112, 112, 132, 
  // 6220
  117, 118, 118, 122, 
  // 6224
  122, 123, 123, 122, 
  // 6228
  127, 128, 128, 132, 
  // 6232
  132, 133, 133, 132, 
  // 6236
  137, 138, 138, 142, 
  // 6240
  142, 143, 143, 142, 
  // 6244
  147, 148, 148, 152, 
  // 6248
  152, 153, 153, 152, 
  // 6252
  102, 103, 103, 142, 
  // 6256
  107, 108, 108, 152, 
  // 6260
  112, 113, 113, 132, 
  // 6264
  117, 119, 119, 122, 
  // 6268
  122, 124, 124, 122, 
  // 6272
  127, 129, 129, 132, 
  // 6276
  132, 134, 134, 132, 
  // 6280
  137, 139, 139, 142, 
  // 6284
  142, 144, 144, 142, 
  // 6288
  147, 149, 149, 152, 
  // 6292
  152, 154, 154, 152, 
  // 6296
  102, 104, 104, 142, 
  // 6300
  107, 109, 109, 152, 
  // 6304
  112, 114, 114, 132, 
  // 6308
  118, 115, 115, 123, 
  // 6312
  123, 120, 120, 123, 
  // 6316
  128, 125, 125, 133, 
  // 6320
  133, 130, 130, 133, 
  // 6324
  138, 135, 135, 143, 
  // 6328
  143, 140, 140, 143, 
  // 6332
  148, 145, 145, 153, 
  // 6336
  153, 150, 150, 153, 
  // 6340
  103, 100, 100, 143, 
  // 6344
  108, 105, 105, 153, 
  // 6348
  113, 110, 110, 133, 
  // 6352
  118, 117, 117, 123, 
  // 6356
  123, 122, 122, 123, 
  // 6360
  128, 127, 127, 133, 
  // 6364
  133, 132, 132, 133, 
  // 6368
  138, 137, 137, 143, 
  // 6372
  143, 142, 142, 143, 
  // 6376
  148, 147, 147, 153, 
  // 6380
  153, 152, 152, 153, 
  // 6384
  103, 102, 102, 143, 
  // 6388
  108, 107, 107, 153, 
  // 6392
  113, 112, 112, 133, 
  // 6396
  118, 118, 118, 123, 
  // 6400
  123, 123, 123, 123, 
  // 6404
  128, 128, 128, 133, 
  // 6408
  133, 133, 133, 133, 
  // 6412
  138, 138, 138, 143, 
  // 6416
  143, 143, 143, 143, 
  // 6420
  148, 148, 148, 153, 
  // 6424
  153, 153, 153, 153, 
  // 6428
  103, 103, 103, 143, 
  // 6432
  108, 108, 108, 153, 
  // 6436
  113, 113, 113, 133, 
  // 6440
  118, 119, 119, 123, 
  // 6444
  123, 124, 124, 123, 
  // 6448
  128, 129, 129, 133, 
  // 6452
  133, 134, 134, 133, 
  // 6456
  138, 139, 139, 143, 
  // 6460
  143, 144, 144, 143, 
  // 6464
  148, 149, 149, 153, 
  // 6468
  153, 154, 154, 153, 
  // 6472
  103, 104, 104, 143, 
  // 6476
  108, 109, 109, 153, 
  // 6480
  113, 114, 114, 133, 
  // 6484
  119, 115, 115, 124, 
  // 6488
  124, 120, 120, 124, 
  // 6492
  129, 125, 125, 134, 
  // 6496
  134, 130, 130, 134, 
  // 6500
  139, 135, 135, 144, 
  // 6504
  144, 140, 140, 144, 
  // 6508
  149, 145, 145, 154, 
  // 6512
  154, 150, 150, 154, 
  // 6516
  104, 100, 100, 144, 
  // 6520
  109, 105, 105, 154, 
  // 6524
  114, 110, 110, 134, 
  // 6528
  119, 117, 117, 124, 
  // 6532
  124, 122, 122, 124, 
  // 6536
  129, 127, 127, 134, 
  // 6540
  134, 132, 132, 134, 
  // 6544
  139, 137, 137, 144, 
  // 6548
  144, 142, 142, 144, 
  // 6552
  149, 147, 147, 154, 
  // 6556
  154, 152, 152, 154, 
  // 6560
  104, 102, 102, 144, 
  // 6564
  109, 107, 107, 154, 
  // 6568
  114, 112, 112, 134, 
  // 6572
  119, 118, 118, 124, 
  // 6576
  124, 123, 123, 124, 
  // 6580
  129, 128, 128, 134, 
  // 6584
  134, 133, 133, 134, 
  // 6588
  139, 138, 138, 144, 
  // 6592
  144, 143, 143, 144, 
  // 6596
  149, 148, 148, 154, 
  // 6600
  154, 153, 153, 154, 
  // 6604
  104, 103, 103, 144, 
  // 6608
  109, 108, 108, 154, 
  // 6612
  114, 113, 113, 134, 
  // 6616
  119, 119, 119, 124, 
  // 6620
  124, 124, 124, 124, 
  // 6624
  129, 129, 129, 134, 
  // 6628
  134, 134, 134, 134, 
  // 6632
  139, 139, 139, 144, 
  // 6636
  144, 144, 144, 144, 
  // 6640
  149, 149, 149, 154, 
  // 6644
  154, 154, 154, 154, 
  // 6648
  104, 104, 104, 144, 
  // 6652
  109, 109, 109, 154, 
  // 6656
  114, 114, 114, 134, 
  // 6660
  102, 335, 88, 76, 
  // 6664
  137, 335, 88, 76, 
  // 6668
  142, 335, 88, 76, 
  // 6672
  102, 335, 88, 27, 
  // 6676
  137, 335, 88, 27, 
  // 6680
  142, 335, 88, 27, 
  // 6684
  102, 336, 88, 135, 
  // 6688
  137, 336, 88, 135, 
  // 6692
  142, 336, 88, 135, 
  // 6696
  102, 336, 88, 100, 
  // 6700
  137, 336, 88, 100, 
  // 6704
  142, 336, 88, 100, 
  // 6708
  102, 337, 88, 135, 
  // 6712
  137, 337, 88, 135, 
  // 6716
  142, 337, 88, 135, 
  // 6720
  102, 337, 88, 100, 
  // 6724
  137, 337, 88, 100, 
  // 6728
  142, 337, 88, 100, 
  // 6732
  102, 338, 88, 137, 
  // 6736
  137, 338, 88, 137, 
  // 6740
  142, 338, 88, 137, 
  // 6744
  102, 338, 88, 102, 
  // 6748
  137, 338, 88, 102, 
  // 6752
  142, 338, 88, 102, 
  // 6756
  102, 339, 88, 137, 
  // 6760
  137, 339, 88, 137, 
  // 6764
  142, 339, 88, 137, 
  // 6768
  102, 339, 88, 102, 
  // 6772
  137, 339, 88, 102, 
  // 6776
  142, 339, 88, 102, 
  // 6780
  27, 340, 88, 135, 
  // 6784
  27, 341, 88, 137, 
  // 6788
  27, 340, 88, 100, 
  // 6792
  27, 341, 88, 102, 
  // 6796
  102, 336, 135, 
  // 6799
  137, 336, 135, 
  // 6802
  142, 336, 135, 
  // 6805
  102, 338, 137, 
  // 6808
  137, 338, 137, 
  // 6811
  142, 338, 137, 
  // 6814
  102, 335, 76, 
  // 6817
  137, 335, 76, 
  // 6820
  142, 335, 76, 
  // 6823
  27, 340, 135, 
  // 6826
  27, 341, 137, 
  // 6829
  102, 337, 135, 
  // 6832
  137, 337, 135, 
  // 6835
  142, 337, 135, 
  // 6838
  102, 339, 137, 
  // 6841
  137, 339, 137, 
  // 6844
  142, 339, 137, 
  // 6847
  102, 342, 76, 
  // 6850
  137, 342, 76, 
  // 6853
  142, 342, 76, 
  // 6856
  102, 343, 135, 
  // 6859
  137, 343, 135, 
  // 6862
  142, 343, 135, 
  // 6865
  102, 344, 135, 
  // 6868
  137, 344, 135, 
  // 6871
  142, 344, 135, 
  // 6874
  102, 345, 137, 
  // 6877
  137, 345, 137, 
  // 6880
  142, 345, 137, 
  // 6883
  102, 346, 137, 
  // 6886
  137, 346, 137, 
  // 6889
  142, 346, 137, 
  // 6892
  102, 347, 76, 
  // 6895
  137, 347, 76, 
  // 6898
  142, 347, 76, 
  // 6901
  102, 348, 76, 
  // 6904
  137, 348, 76, 
  // 6907
  142, 348, 76, 
  // 6910
  27, 349, 135, 
  // 6913
  27, 350, 137, 
  // 6916
  97, 351, 135, 102, 
  // 6920
  97, 351, 135, 137, 
  // 6924
  97, 351, 135, 142, 
  // 6928
  97, 352, 137, 102, 
  // 6932
  97, 352, 137, 137, 
  // 6936
  97, 352, 137, 142, 
  // 6940
  97, 353, 76, 102, 
  // 6944
  97, 353, 76, 137, 
  // 6948
  97, 353, 76, 142, 
  // 6952
  97, 355, 135, 102, 
  // 6956
  97, 355, 135, 137, 
  // 6960
  97, 355, 135, 142, 
  // 6964
  97, 356, 137, 102, 
  // 6968
  97, 356, 137, 137, 
  // 6972
  97, 356, 137, 142, 
  // 6976
  97, 357, 135, 27, 
  // 6980
  97, 358, 137, 27, 
  // 6984
  97, 354, 76, 102, 
  // 6988
  97, 354, 76, 137, 
  // 6992
  97, 354, 76, 142, 
  // 6996
  97, 343, 135, 102, 
  // 7000
  97, 343, 135, 137, 
  // 7004
  97, 343, 135, 142, 
  // 7008
  97, 346, 137, 102, 
  // 7012
  97, 346, 137, 137, 
  // 7016
  97, 346, 137, 142, 
  // 7020
  97, 347, 76, 102, 
  // 7024
  97, 347, 76, 137, 
  // 7028
  97, 347, 76, 142, 
  // 7032
  97, 348, 76, 102, 
  // 7036
  97, 348, 76, 137, 
  // 7040
  97, 348, 76, 142, 
  // 7044
  97, 344, 135, 102, 
  // 7048
  97, 344, 135, 137, 
  // 7052
  97, 344, 135, 142, 
  // 7056
  97, 345, 137, 102, 
  // 7060
  97, 345, 137, 137, 
  // 7064
  97, 345, 137, 142, 
  // 7068
  97, 349, 135, 27, 
  // 7072
  97, 350, 137, 27, 
  // 7076
  76, 335, 
  // 7078
  76, 336, 
  // 7080
  76, 338, 
  // 7082
  135, 336, 
  // 7084
  137, 338, 
  // 7086
  90, 337, 
  // 7088
  76, 342, 
  // 7090
  76, 337, 
  // 7092
  76, 339, 
  // 7094
  76, 340, 
  // 7096
  76, 341, 
  // 7098
  135, 339, 
  // 7100
  135, 340, 
  // 7102
  135, 341, 
  // 7104
  90, 339, 
  // 7106
  90, 341, 
  // 7108
  76, 353, 
  // 7110
  76, 354, 
  // 7112
  76, 351, 
  // 7114
  76, 356, 
  // 7116
  76, 355, 
  // 7118
  76, 352, 
  // 7120
  76, 357, 
  // 7122
  76, 358, 
  // 7124
  135, 351, 
  // 7126
  135, 352, 
  // 7128
  135, 357, 
  // 7130
  135, 358, 
  // 7132
  137, 356, 
  // 7134
  90, 355, 
  // 7136
  90, 352, 
  // 7138
  90, 358, 
  // 7140
  76, 347, 
  // 7142
  76, 348, 
  // 7144
  76, 343, 
  // 7146
  76, 345, 
  // 7148
  76, 344, 
  // 7150
  76, 346, 
  // 7152
  76, 349, 
  // 7154
  76, 350, 
  // 7156
  135, 343, 
  // 7158
  135, 346, 
  // 7160
  135, 349, 
  // 7162
  135, 350, 
  // 7164
  137, 345, 
  // 7166
  90, 344, 
  // 7168
  90, 346, 
  // 7170
  90, 350, 
  // 7172
  112, 336, 88, 135, 
  // 7176
  112, 338, 88, 137, 
  // 7180
  112, 335, 88, 76, 
  // 7184
  112, 337, 88, 135, 
  // 7188
  112, 339, 88, 137, 
  // 7192
  112, 336, 88, 100, 
  // 7196
  112, 337, 88, 100, 
  // 7200
  112, 338, 88, 102, 
  // 7204
  112, 339, 88, 102, 
  // 7208
  112, 335, 88, 27, 
  // 7212
  112, 336, 135, 
  // 7215
  112, 338, 137, 
  // 7218
  112, 335, 76, 
  // 7221
  112, 337, 135, 
  // 7224
  112, 339, 137, 
  // 7227
  112, 342, 76, 
  // 7230
  112, 343, 135, 
  // 7233
  112, 344, 135, 
  // 7236
  112, 345, 137, 
  // 7239
  112, 346, 137, 
  // 7242
  112, 347, 76, 
  // 7245
  112, 348, 76, 
  // 7248
  97, 351, 135, 112, 
  // 7252
  97, 352, 137, 112, 
  // 7256
  97, 353, 76, 112, 
  // 7260
  97, 354, 76, 112, 
  // 7264
  97, 355, 135, 112, 
  // 7268
  97, 356, 137, 112, 
  // 7272
  97, 343, 135, 112, 
  // 7276
  97, 346, 137, 112, 
  // 7280
  97, 347, 76, 112, 
  // 7284
  97, 348, 76, 112, 
  // 7288
  97, 344, 135, 112, 
  // 7292
  97, 345, 137, 112, 
  // 7296
  77, 77, 90, 
  // 7299
  77, 77, 90, 90, 
  // 7303
  77, 77, 90, 90, 90, 
  // 7308
  77, 77, 
  // 7310
  19, 86, 
  // 7312
  76, 85, 93, 360, 361, 
  // 7317
  97, 22, 
  // 7319
  22, 
  // 7320
  19, 22, 
  // 7322
  97, 22, 76, 
  // 7325
  97, 22, 23, 362, 
  // 7329
  85, 
  // 7330
  83, 90, 
  // 7332
  83, 90, 90, 
  // 7335
  83, 90, 90, 90, 
  // 7339
  83, 364, 
  // 7341
  83, 364, 364, 
  // 7344
  83, 364, 364, 364, 
  // 7348
  102, 336, 88, 100, 27, 
  // 7353
  102, 336, 88, 100, 100, 100, 
  // 7359
  137, 336, 88, 100, 27, 
  // 7364
  137, 336, 88, 100, 100, 100, 
  // 7370
  142, 336, 88, 100, 27, 
  // 7375
  142, 336, 88, 100, 100, 100, 
  // 7381
  27, 340, 88, 100, 27, 
  // 7386
  27, 340, 88, 100, 100, 100, 
  // 7392
  102, 335, 88, 27, 27, 
  // 7397
  102, 335, 88, 27, 27, 27, 
  // 7403
  137, 335, 88, 27, 27, 
  // 7408
  137, 335, 88, 27, 27, 27, 
  // 7414
  142, 335, 88, 27, 27, 
  // 7419
  142, 335, 88, 27, 27, 27, 
  // 7425
  102, 338, 88, 102, 102, 102, 
  // 7431
  102, 338, 88, 102, 27, 
  // 7436
  137, 338, 88, 102, 102, 102, 
  // 7442
  137, 338, 88, 102, 27, 
  // 7447
  142, 338, 88, 102, 102, 102, 
  // 7453
  142, 338, 88, 102, 27, 
  // 7458
  102, 337, 88, 100, 27, 
  // 7463
  102, 337, 88, 100, 27, 27, 
  // 7469
  137, 337, 88, 100, 27, 
  // 7474
  137, 337, 88, 100, 27, 27, 
  // 7480
  142, 337, 88, 100, 27, 
  // 7485
  142, 337, 88, 100, 27, 27, 
  // 7491
  102, 339, 88, 102, 27, 
  // 7496
  102, 339, 88, 102, 100, 100, 
  // 7502
  137, 339, 88, 102, 27, 
  // 7507
  137, 339, 88, 102, 100, 100, 
  // 7513
  142, 339, 88, 102, 27, 
  // 7518
  142, 339, 88, 102, 100, 100, 
  // 7524
  27, 341, 88, 102, 27, 
  // 7529
  27, 341, 88, 102, 100, 100, 
  // 7535
  97, 351, 135, 76, 102, 
  // 7540
  97, 351, 135, 76, 137, 
  // 7545
  97, 351, 135, 76, 142, 
  // 7550
  97, 357, 135, 76, 27, 
  // 7555
  97, 353, 76, 76, 102, 
  // 7560
  97, 353, 76, 76, 137, 
  // 7565
  97, 353, 76, 76, 142, 
  // 7570
  97, 355, 135, 76, 102, 
  // 7575
  97, 355, 135, 76, 137, 
  // 7580
  97, 355, 135, 76, 142, 
  // 7585
  97, 352, 137, 76, 102, 
  // 7590
  97, 352, 137, 76, 137, 
  // 7595
  97, 352, 137, 76, 142, 
  // 7600
  97, 358, 137, 76, 27, 
  // 7605
  97, 356, 137, 76, 102, 
  // 7610
  97, 356, 137, 76, 137, 
  // 7615
  97, 356, 137, 76, 142, 
  // 7620
  102, 365, 135, 76, 
  // 7624
  137, 365, 135, 76, 
  // 7628
  142, 365, 135, 76, 
  // 7632
  102, 366, 137, 76, 
  // 7636
  137, 366, 137, 76, 
  // 7640
  142, 366, 137, 76, 
  // 7644
  27, 367, 135, 76, 
  // 7648
  27, 368, 137, 76, 
  // 7652
  76, 365, 
  // 7654
  135, 365, 
  // 7656
  90, 366, 
  // 7658
  76, 366, 
  // 7660
  135, 366, 
  // 7662
  76, 367, 
  // 7664
  135, 367, 
  // 7666
  76, 368, 
  // 7668
  135, 368, 
  // 7670
  90, 368, 
  // 7672
  76, 369, 
  // 7674
  135, 369, 
  // 7676
  76, 370, 
  // 7678
  135, 370, 
  // 7680
  76, 371, 
  // 7682
  135, 371, 
  // 7684
  76, 372, 
  // 7686
  135, 372, 
  // 7688
  90, 370, 
  // 7690
  90, 372, 
  // 7692
  102, 373, 135, 76, 
  // 7696
  137, 373, 135, 76, 
  // 7700
  142, 373, 135, 76, 
  // 7704
  102, 374, 137, 76, 
  // 7708
  137, 374, 137, 76, 
  // 7712
  142, 374, 137, 76, 
  // 7716
  27, 375, 135, 76, 
  // 7720
  27, 376, 137, 76, 
  // 7724
  76, 373, 
  // 7726
  135, 373, 
  // 7728
  76, 374, 
  // 7730
  135, 374, 
  // 7732
  76, 375, 
  // 7734
  135, 375, 
  // 7736
  76, 376, 
  // 7738
  135, 376, 
  // 7740
  90, 374, 
  // 7742
  90, 376, 
  // 7744
  77, 77, 93, 
  // 7747
  21, 21, 93, 
  // 7750
  2, 2, 93, 
  // 7753
  21, 21, 
  // 7755
  76, 
  // 7756
  76, 0, 
  // 7758
  1, 1, 93, 
  // 7761
  0, 0, 
  // 7763
  142, 76, 
  // 7765
  76, 142, 
  // 7767
  76, 142, 93, 
  // 7770
  93, 142, 
  // 7772
  142, 
  // 7773
  4, 4, 
  // 7775
  0, 0, 93, 
  // 7778
  4, 4, 93, 
  // 7781
  76, 76, 93, 
  // 7784
  5, 5, 5, 93, 93, 
  // 7789
  87, 87, 93, 93, 
  // 7793
  87, 92, 93, 93, 
  // 7797
  92, 87, 93, 93, 
  // 7801
  92, 92, 93, 93, 
  // 7805
  93, 122, 122, 
  // 7808
  76, 117, 117, 
  // 7811
  76, 122, 117, 
  // 7814
  76, 117, 122, 
  // 7817
  93, 122, 122, 93, 
  // 7821
  76, 117, 117, 76, 
  // 7825
  76, 122, 117, 76, 
  // 7829
  76, 117, 122, 76, 
  // 7833
  93, 93, 93, 
  // 7836
  76, 93, 93, 
  // 7839
  93, 93, 93, 93, 
  // 7843
  76, 93, 93, 76, 
  // 7847
  0, 0, 76, 
  // 7850
  0, 0, 76, 93, 
  // 7854
  93, 130, 130, 93, 
  // 7858
  76, 125, 125, 76, 
};

static const OpenCLBuiltinStruct BuiltinTable[] = {
  // 1: convert_float, convert_float_rte, convert_float_rtn, convert_float_rtp, convert_float_rtz, 
  { 0, 2, 0, 1, 0, 43, 31 },
  { 12, 2, 0, 1, 0, 43, 31 },
  { 24, 2, 0, 1, 0, 43, 31 },
  { 36, 2, 0, 1, 0, 43, 31 },
  { 48, 2, 0, 1, 0, 43, 31 },
  { 60, 2, 0, 1, 0, 43, 31 },
  { 72, 2, 0, 1, 0, 43, 31 },
  { 84, 2, 0, 1, 0, 43, 31 },
  { 96, 2, 0, 1, 0, 43, 31 },
  { 108, 2, 0, 1, 0, 43, 31 },
  { 120, 2, 0, 1, 0, 43, 31 },
  // 12: convert_float2, convert_float2_rte, convert_float2_rtn, convert_float2_rtp, convert_float2_rtz, 
  { 2, 2, 0, 1, 0, 43, 31 },
  { 14, 2, 0, 1, 0, 43, 31 },
  { 26, 2, 0, 1, 0, 43, 31 },
  { 38, 2, 0, 1, 0, 43, 31 },
  { 50, 2, 0, 1, 0, 43, 31 },
  { 62, 2, 0, 1, 0, 43, 31 },
  { 74, 2, 0, 1, 0, 43, 31 },
  { 86, 2, 0, 1, 0, 43, 31 },
  { 98, 2, 0, 1, 0, 43, 31 },
  { 110, 2, 0, 1, 0, 43, 31 },
  { 122, 2, 0, 1, 0, 43, 31 },
  // 23: convert_float3, convert_float3_rte, convert_float3_rtn, convert_float3_rtp, convert_float3_rtz, 
  { 4, 2, 0, 1, 0, 43, 31 },
  { 16, 2, 0, 1, 0, 43, 31 },
  { 28, 2, 0, 1, 0, 43, 31 },
  { 40, 2, 0, 1, 0, 43, 31 },
  { 52, 2, 0, 1, 0, 43, 31 },
  { 64, 2, 0, 1, 0, 43, 31 },
  { 76, 2, 0, 1, 0, 43, 31 },
  { 88, 2, 0, 1, 0, 43, 31 },
  { 100, 2, 0, 1, 0, 43, 31 },
  { 112, 2, 0, 1, 0, 43, 31 },
  { 124, 2, 0, 1, 0, 43, 31 },
  // 34: convert_float4, convert_float4_rte, convert_float4_rtn, convert_float4_rtp, convert_float4_rtz, 
  { 6, 2, 0, 1, 0, 43, 31 },
  { 18, 2, 0, 1, 0, 43, 31 },
  { 30, 2, 0, 1, 0, 43, 31 },
  { 42, 2, 0, 1, 0, 43, 31 },
  { 54, 2, 0, 1, 0, 43, 31 },
  { 66, 2, 0, 1, 0, 43, 31 },
  { 78, 2, 0, 1, 0, 43, 31 },
  { 90, 2, 0, 1, 0, 43, 31 },
  { 102, 2, 0, 1, 0, 43, 31 },
  { 114, 2, 0, 1, 0, 43, 31 },
  { 126, 2, 0, 1, 0, 43, 31 },
  // 45: convert_float8, convert_float8_rte, convert_float8_rtn, convert_float8_rtp, convert_float8_rtz, 
  { 8, 2, 0, 1, 0, 43, 31 },
  { 20, 2, 0, 1, 0, 43, 31 },
  { 32, 2, 0, 1, 0, 43, 31 },
  { 44, 2, 0, 1, 0, 43, 31 },
  { 56, 2, 0, 1, 0, 43, 31 },
  { 68, 2, 0, 1, 0, 43, 31 },
  { 80, 2, 0, 1, 0, 43, 31 },
  { 92, 2, 0, 1, 0, 43, 31 },
  { 104, 2, 0, 1, 0, 43, 31 },
  { 116, 2, 0, 1, 0, 43, 31 },
  { 128, 2, 0, 1, 0, 43, 31 },
  // 56: convert_float16, convert_float16_rte, convert_float16_rtn, convert_float16_rtp, convert_float16_rtz, 
  { 10, 2, 0, 1, 0, 43, 31 },
  { 22, 2, 0, 1, 0, 43, 31 },
  { 34, 2, 0, 1, 0, 43, 31 },
  { 46, 2, 0, 1, 0, 43, 31 },
  { 58, 2, 0, 1, 0, 43, 31 },
  { 70, 2, 0, 1, 0, 43, 31 },
  { 82, 2, 0, 1, 0, 43, 31 },
  { 94, 2, 0, 1, 0, 43, 31 },
  { 106, 2, 0, 1, 0, 43, 31 },
  { 118, 2, 0, 1, 0, 43, 31 },
  { 130, 2, 0, 1, 0, 43, 31 },
  // 67: convert_double, convert_double_rte, convert_double_rtn, convert_double_rtp, convert_double_rtz, 
  { 132, 2, 0, 1, 0, 43, 31 },
  { 144, 2, 0, 1, 0, 43, 31 },
  { 156, 2, 0, 1, 0, 43, 31 },
  { 168, 2, 0, 1, 0, 43, 31 },
  { 180, 2, 0, 1, 0, 43, 31 },
  { 192, 2, 0, 1, 0, 43, 31 },
  { 204, 2, 0, 1, 0, 43, 31 },
  { 216, 2, 0, 1, 0, 43, 31 },
  { 228, 2, 0, 1, 0, 43, 31 },
  { 240, 2, 0, 1, 0, 43, 31 },
  { 252, 2, 0, 1, 0, 43, 31 },
  // 78: convert_double2, convert_double2_rte, convert_double2_rtn, convert_double2_rtp, convert_double2_rtz, 
  { 134, 2, 0, 1, 0, 43, 31 },
  { 146, 2, 0, 1, 0, 43, 31 },
  { 158, 2, 0, 1, 0, 43, 31 },
  { 170, 2, 0, 1, 0, 43, 31 },
  { 182, 2, 0, 1, 0, 43, 31 },
  { 194, 2, 0, 1, 0, 43, 31 },
  { 206, 2, 0, 1, 0, 43, 31 },
  { 218, 2, 0, 1, 0, 43, 31 },
  { 230, 2, 0, 1, 0, 43, 31 },
  { 242, 2, 0, 1, 0, 43, 31 },
  { 254, 2, 0, 1, 0, 43, 31 },
  // 89: convert_double3, convert_double3_rte, convert_double3_rtn, convert_double3_rtp, convert_double3_rtz, 
  { 136, 2, 0, 1, 0, 43, 31 },
  { 148, 2, 0, 1, 0, 43, 31 },
  { 160, 2, 0, 1, 0, 43, 31 },
  { 172, 2, 0, 1, 0, 43, 31 },
  { 184, 2, 0, 1, 0, 43, 31 },
  { 196, 2, 0, 1, 0, 43, 31 },
  { 208, 2, 0, 1, 0, 43, 31 },
  { 220, 2, 0, 1, 0, 43, 31 },
  { 232, 2, 0, 1, 0, 43, 31 },
  { 244, 2, 0, 1, 0, 43, 31 },
  { 256, 2, 0, 1, 0, 43, 31 },
  // 100: convert_double4, convert_double4_rte, convert_double4_rtn, convert_double4_rtp, convert_double4_rtz, 
  { 138, 2, 0, 1, 0, 43, 31 },
  { 150, 2, 0, 1, 0, 43, 31 },
  { 162, 2, 0, 1, 0, 43, 31 },
  { 174, 2, 0, 1, 0, 43, 31 },
  { 186, 2, 0, 1, 0, 43, 31 },
  { 198, 2, 0, 1, 0, 43, 31 },
  { 210, 2, 0, 1, 0, 43, 31 },
  { 222, 2, 0, 1, 0, 43, 31 },
  { 234, 2, 0, 1, 0, 43, 31 },
  { 246, 2, 0, 1, 0, 43, 31 },
  { 258, 2, 0, 1, 0, 43, 31 },
  // 111: convert_double8, convert_double8_rte, convert_double8_rtn, convert_double8_rtp, convert_double8_rtz, 
  { 140, 2, 0, 1, 0, 43, 31 },
  { 152, 2, 0, 1, 0, 43, 31 },
  { 164, 2, 0, 1, 0, 43, 31 },
  { 176, 2, 0, 1, 0, 43, 31 },
  { 188, 2, 0, 1, 0, 43, 31 },
  { 200, 2, 0, 1, 0, 43, 31 },
  { 212, 2, 0, 1, 0, 43, 31 },
  { 224, 2, 0, 1, 0, 43, 31 },
  { 236, 2, 0, 1, 0, 43, 31 },
  { 248, 2, 0, 1, 0, 43, 31 },
  { 260, 2, 0, 1, 0, 43, 31 },
  // 122: convert_double16, convert_double16_rte, convert_double16_rtn, convert_double16_rtp, convert_double16_rtz, 
  { 142, 2, 0, 1, 0, 43, 31 },
  { 154, 2, 0, 1, 0, 43, 31 },
  { 166, 2, 0, 1, 0, 43, 31 },
  { 178, 2, 0, 1, 0, 43, 31 },
  { 190, 2, 0, 1, 0, 43, 31 },
  { 202, 2, 0, 1, 0, 43, 31 },
  { 214, 2, 0, 1, 0, 43, 31 },
  { 226, 2, 0, 1, 0, 43, 31 },
  { 238, 2, 0, 1, 0, 43, 31 },
  { 250, 2, 0, 1, 0, 43, 31 },
  { 262, 2, 0, 1, 0, 43, 31 },
  // 133: convert_half, convert_half_rte, convert_half_rtn, convert_half_rtp, convert_half_rtz, 
  { 264, 2, 0, 1, 0, 43, 31 },
  { 276, 2, 0, 1, 0, 43, 31 },
  { 288, 2, 0, 1, 0, 43, 31 },
  { 300, 2, 0, 1, 0, 43, 31 },
  { 312, 2, 0, 1, 0, 43, 31 },
  { 324, 2, 0, 1, 0, 43, 31 },
  { 336, 2, 0, 1, 0, 43, 31 },
  { 348, 2, 0, 1, 0, 43, 31 },
  { 360, 2, 0, 1, 0, 43, 31 },
  { 372, 2, 0, 1, 0, 43, 31 },
  { 384, 2, 0, 1, 0, 43, 31 },
  // 144: convert_half2, convert_half2_rte, convert_half2_rtn, convert_half2_rtp, convert_half2_rtz, 
  { 266, 2, 0, 1, 0, 43, 31 },
  { 278, 2, 0, 1, 0, 43, 31 },
  { 290, 2, 0, 1, 0, 43, 31 },
  { 302, 2, 0, 1, 0, 43, 31 },
  { 314, 2, 0, 1, 0, 43, 31 },
  { 326, 2, 0, 1, 0, 43, 31 },
  { 338, 2, 0, 1, 0, 43, 31 },
  { 350, 2, 0, 1, 0, 43, 31 },
  { 362, 2, 0, 1, 0, 43, 31 },
  { 374, 2, 0, 1, 0, 43, 31 },
  { 386, 2, 0, 1, 0, 43, 31 },
  // 155: convert_half3, convert_half3_rte, convert_half3_rtn, convert_half3_rtp, convert_half3_rtz, 
  { 268, 2, 0, 1, 0, 43, 31 },
  { 280, 2, 0, 1, 0, 43, 31 },
  { 292, 2, 0, 1, 0, 43, 31 },
  { 304, 2, 0, 1, 0, 43, 31 },
  { 316, 2, 0, 1, 0, 43, 31 },
  { 328, 2, 0, 1, 0, 43, 31 },
  { 340, 2, 0, 1, 0, 43, 31 },
  { 352, 2, 0, 1, 0, 43, 31 },
  { 364, 2, 0, 1, 0, 43, 31 },
  { 376, 2, 0, 1, 0, 43, 31 },
  { 388, 2, 0, 1, 0, 43, 31 },
  // 166: convert_half4, convert_half4_rte, convert_half4_rtn, convert_half4_rtp, convert_half4_rtz, 
  { 270, 2, 0, 1, 0, 43, 31 },
  { 282, 2, 0, 1, 0, 43, 31 },
  { 294, 2, 0, 1, 0, 43, 31 },
  { 306, 2, 0, 1, 0, 43, 31 },
  { 318, 2, 0, 1, 0, 43, 31 },
  { 330, 2, 0, 1, 0, 43, 31 },
  { 342, 2, 0, 1, 0, 43, 31 },
  { 354, 2, 0, 1, 0, 43, 31 },
  { 366, 2, 0, 1, 0, 43, 31 },
  { 378, 2, 0, 1, 0, 43, 31 },
  { 390, 2, 0, 1, 0, 43, 31 },
  // 177: convert_half8, convert_half8_rte, convert_half8_rtn, convert_half8_rtp, convert_half8_rtz, 
  { 272, 2, 0, 1, 0, 43, 31 },
  { 284, 2, 0, 1, 0, 43, 31 },
  { 296, 2, 0, 1, 0, 43, 31 },
  { 308, 2, 0, 1, 0, 43, 31 },
  { 320, 2, 0, 1, 0, 43, 31 },
  { 332, 2, 0, 1, 0, 43, 31 },
  { 344, 2, 0, 1, 0, 43, 31 },
  { 356, 2, 0, 1, 0, 43, 31 },
  { 368, 2, 0, 1, 0, 43, 31 },
  { 380, 2, 0, 1, 0, 43, 31 },
  { 392, 2, 0, 1, 0, 43, 31 },
  // 188: convert_half16, convert_half16_rte, convert_half16_rtn, convert_half16_rtp, convert_half16_rtz, 
  { 274, 2, 0, 1, 0, 43, 31 },
  { 286, 2, 0, 1, 0, 43, 31 },
  { 298, 2, 0, 1, 0, 43, 31 },
  { 310, 2, 0, 1, 0, 43, 31 },
  { 322, 2, 0, 1, 0, 43, 31 },
  { 334, 2, 0, 1, 0, 43, 31 },
  { 346, 2, 0, 1, 0, 43, 31 },
  { 358, 2, 0, 1, 0, 43, 31 },
  { 370, 2, 0, 1, 0, 43, 31 },
  { 382, 2, 0, 1, 0, 43, 31 },
  { 394, 2, 0, 1, 0, 43, 31 },
  // 199: convert_char, convert_char_rte, convert_char_rtn, convert_char_rtp, convert_char_rtz, convert_char_sat, convert_char_sat_rte, convert_char_sat_rtn, convert_char_sat_rtp, convert_char_sat_rtz, 
  { 396, 2, 0, 1, 0, 43, 31 },
  { 408, 2, 0, 1, 0, 43, 31 },
  { 420, 2, 0, 1, 0, 43, 31 },
  { 432, 2, 0, 1, 0, 43, 31 },
  { 444, 2, 0, 1, 0, 43, 31 },
  { 456, 2, 0, 1, 0, 43, 31 },
  { 468, 2, 0, 1, 0, 43, 31 },
  { 480, 2, 0, 1, 0, 43, 31 },
  { 492, 2, 0, 1, 0, 43, 31 },
  { 504, 2, 0, 1, 0, 43, 31 },
  { 516, 2, 0, 1, 0, 43, 31 },
  // 210: convert_char2, convert_char2_rte, convert_char2_rtn, convert_char2_rtp, convert_char2_rtz, convert_char2_sat, convert_char2_sat_rte, convert_char2_sat_rtn, convert_char2_sat_rtp, convert_char2_sat_rtz, 
  { 398, 2, 0, 1, 0, 43, 31 },
  { 410, 2, 0, 1, 0, 43, 31 },
  { 422, 2, 0, 1, 0, 43, 31 },
  { 434, 2, 0, 1, 0, 43, 31 },
  { 446, 2, 0, 1, 0, 43, 31 },
  { 458, 2, 0, 1, 0, 43, 31 },
  { 470, 2, 0, 1, 0, 43, 31 },
  { 482, 2, 0, 1, 0, 43, 31 },
  { 494, 2, 0, 1, 0, 43, 31 },
  { 506, 2, 0, 1, 0, 43, 31 },
  { 518, 2, 0, 1, 0, 43, 31 },
  // 221: convert_char3, convert_char3_rte, convert_char3_rtn, convert_char3_rtp, convert_char3_rtz, convert_char3_sat, convert_char3_sat_rte, convert_char3_sat_rtn, convert_char3_sat_rtp, convert_char3_sat_rtz, 
  { 400, 2, 0, 1, 0, 43, 31 },
  { 412, 2, 0, 1, 0, 43, 31 },
  { 424, 2, 0, 1, 0, 43, 31 },
  { 436, 2, 0, 1, 0, 43, 31 },
  { 448, 2, 0, 1, 0, 43, 31 },
  { 460, 2, 0, 1, 0, 43, 31 },
  { 472, 2, 0, 1, 0, 43, 31 },
  { 484, 2, 0, 1, 0, 43, 31 },
  { 496, 2, 0, 1, 0, 43, 31 },
  { 508, 2, 0, 1, 0, 43, 31 },
  { 520, 2, 0, 1, 0, 43, 31 },
  // 232: convert_char4, convert_char4_rte, convert_char4_rtn, convert_char4_rtp, convert_char4_rtz, convert_char4_sat, convert_char4_sat_rte, convert_char4_sat_rtn, convert_char4_sat_rtp, convert_char4_sat_rtz, 
  { 402, 2, 0, 1, 0, 43, 31 },
  { 414, 2, 0, 1, 0, 43, 31 },
  { 426, 2, 0, 1, 0, 43, 31 },
  { 438, 2, 0, 1, 0, 43, 31 },
  { 450, 2, 0, 1, 0, 43, 31 },
  { 462, 2, 0, 1, 0, 43, 31 },
  { 474, 2, 0, 1, 0, 43, 31 },
  { 486, 2, 0, 1, 0, 43, 31 },
  { 498, 2, 0, 1, 0, 43, 31 },
  { 510, 2, 0, 1, 0, 43, 31 },
  { 522, 2, 0, 1, 0, 43, 31 },
  // 243: convert_char8, convert_char8_rte, convert_char8_rtn, convert_char8_rtp, convert_char8_rtz, convert_char8_sat, convert_char8_sat_rte, convert_char8_sat_rtn, convert_char8_sat_rtp, convert_char8_sat_rtz, 
  { 404, 2, 0, 1, 0, 43, 31 },
  { 416, 2, 0, 1, 0, 43, 31 },
  { 428, 2, 0, 1, 0, 43, 31 },
  { 440, 2, 0, 1, 0, 43, 31 },
  { 452, 2, 0, 1, 0, 43, 31 },
  { 464, 2, 0, 1, 0, 43, 31 },
  { 476, 2, 0, 1, 0, 43, 31 },
  { 488, 2, 0, 1, 0, 43, 31 },
  { 500, 2, 0, 1, 0, 43, 31 },
  { 512, 2, 0, 1, 0, 43, 31 },
  { 524, 2, 0, 1, 0, 43, 31 },
  // 254: convert_char16, convert_char16_rte, convert_char16_rtn, convert_char16_rtp, convert_char16_rtz, convert_char16_sat, convert_char16_sat_rte, convert_char16_sat_rtn, convert_char16_sat_rtp, convert_char16_sat_rtz, 
  { 406, 2, 0, 1, 0, 43, 31 },
  { 418, 2, 0, 1, 0, 43, 31 },
  { 430, 2, 0, 1, 0, 43, 31 },
  { 442, 2, 0, 1, 0, 43, 31 },
  { 454, 2, 0, 1, 0, 43, 31 },
  { 466, 2, 0, 1, 0, 43, 31 },
  { 478, 2, 0, 1, 0, 43, 31 },
  { 490, 2, 0, 1, 0, 43, 31 },
  { 502, 2, 0, 1, 0, 43, 31 },
  { 514, 2, 0, 1, 0, 43, 31 },
  { 526, 2, 0, 1, 0, 43, 31 },
  // 265: convert_uchar, convert_uchar_rte, convert_uchar_rtn, convert_uchar_rtp, convert_uchar_rtz, convert_uchar_sat, convert_uchar_sat_rte, convert_uchar_sat_rtn, convert_uchar_sat_rtp, convert_uchar_sat_rtz, 
  { 528, 2, 0, 1, 0, 43, 31 },
  { 540, 2, 0, 1, 0, 43, 31 },
  { 552, 2, 0, 1, 0, 43, 31 },
  { 564, 2, 0, 1, 0, 43, 31 },
  { 576, 2, 0, 1, 0, 43, 31 },
  { 588, 2, 0, 1, 0, 43, 31 },
  { 600, 2, 0, 1, 0, 43, 31 },
  { 612, 2, 0, 1, 0, 43, 31 },
  { 624, 2, 0, 1, 0, 43, 31 },
  { 636, 2, 0, 1, 0, 43, 31 },
  { 648, 2, 0, 1, 0, 43, 31 },
  // 276: convert_uchar2, convert_uchar2_rte, convert_uchar2_rtn, convert_uchar2_rtp, convert_uchar2_rtz, convert_uchar2_sat, convert_uchar2_sat_rte, convert_uchar2_sat_rtn, convert_uchar2_sat_rtp, convert_uchar2_sat_rtz, 
  { 530, 2, 0, 1, 0, 43, 31 },
  { 542, 2, 0, 1, 0, 43, 31 },
  { 554, 2, 0, 1, 0, 43, 31 },
  { 566, 2, 0, 1, 0, 43, 31 },
  { 578, 2, 0, 1, 0, 43, 31 },
  { 590, 2, 0, 1, 0, 43, 31 },
  { 602, 2, 0, 1, 0, 43, 31 },
  { 614, 2, 0, 1, 0, 43, 31 },
  { 626, 2, 0, 1, 0, 43, 31 },
  { 638, 2, 0, 1, 0, 43, 31 },
  { 650, 2, 0, 1, 0, 43, 31 },
  // 287: convert_uchar3, convert_uchar3_rte, convert_uchar3_rtn, convert_uchar3_rtp, convert_uchar3_rtz, convert_uchar3_sat, convert_uchar3_sat_rte, convert_uchar3_sat_rtn, convert_uchar3_sat_rtp, convert_uchar3_sat_rtz, 
  { 532, 2, 0, 1, 0, 43, 31 },
  { 544, 2, 0, 1, 0, 43, 31 },
  { 556, 2, 0, 1, 0, 43, 31 },
  { 568, 2, 0, 1, 0, 43, 31 },
  { 580, 2, 0, 1, 0, 43, 31 },
  { 592, 2, 0, 1, 0, 43, 31 },
  { 604, 2, 0, 1, 0, 43, 31 },
  { 616, 2, 0, 1, 0, 43, 31 },
  { 628, 2, 0, 1, 0, 43, 31 },
  { 640, 2, 0, 1, 0, 43, 31 },
  { 652, 2, 0, 1, 0, 43, 31 },
  // 298: convert_uchar4, convert_uchar4_rte, convert_uchar4_rtn, convert_uchar4_rtp, convert_uchar4_rtz, convert_uchar4_sat, convert_uchar4_sat_rte, convert_uchar4_sat_rtn, convert_uchar4_sat_rtp, convert_uchar4_sat_rtz, 
  { 534, 2, 0, 1, 0, 43, 31 },
  { 546, 2, 0, 1, 0, 43, 31 },
  { 558, 2, 0, 1, 0, 43, 31 },
  { 570, 2, 0, 1, 0, 43, 31 },
  { 582, 2, 0, 1, 0, 43, 31 },
  { 594, 2, 0, 1, 0, 43, 31 },
  { 606, 2, 0, 1, 0, 43, 31 },
  { 618, 2, 0, 1, 0, 43, 31 },
  { 630, 2, 0, 1, 0, 43, 31 },
  { 642, 2, 0, 1, 0, 43, 31 },
  { 654, 2, 0, 1, 0, 43, 31 },
  // 309: convert_uchar8, convert_uchar8_rte, convert_uchar8_rtn, convert_uchar8_rtp, convert_uchar8_rtz, convert_uchar8_sat, convert_uchar8_sat_rte, convert_uchar8_sat_rtn, convert_uchar8_sat_rtp, convert_uchar8_sat_rtz, 
  { 536, 2, 0, 1, 0, 43, 31 },
  { 548, 2, 0, 1, 0, 43, 31 },
  { 560, 2, 0, 1, 0, 43, 31 },
  { 572, 2, 0, 1, 0, 43, 31 },
  { 584, 2, 0, 1, 0, 43, 31 },
  { 596, 2, 0, 1, 0, 43, 31 },
  { 608, 2, 0, 1, 0, 43, 31 },
  { 620, 2, 0, 1, 0, 43, 31 },
  { 632, 2, 0, 1, 0, 43, 31 },
  { 644, 2, 0, 1, 0, 43, 31 },
  { 656, 2, 0, 1, 0, 43, 31 },
  // 320: convert_uchar16, convert_uchar16_rte, convert_uchar16_rtn, convert_uchar16_rtp, convert_uchar16_rtz, convert_uchar16_sat, convert_uchar16_sat_rte, convert_uchar16_sat_rtn, convert_uchar16_sat_rtp, convert_uchar16_sat_rtz, 
  { 538, 2, 0, 1, 0, 43, 31 },
  { 550, 2, 0, 1, 0, 43, 31 },
  { 562, 2, 0, 1, 0, 43, 31 },
  { 574, 2, 0, 1, 0, 43, 31 },
  { 586, 2, 0, 1, 0, 43, 31 },
  { 598, 2, 0, 1, 0, 43, 31 },
  { 610, 2, 0, 1, 0, 43, 31 },
  { 622, 2, 0, 1, 0, 43, 31 },
  { 634, 2, 0, 1, 0, 43, 31 },
  { 646, 2, 0, 1, 0, 43, 31 },
  { 658, 2, 0, 1, 0, 43, 31 },
  // 331: convert_short, convert_short_rte, convert_short_rtn, convert_short_rtp, convert_short_rtz, convert_short_sat, convert_short_sat_rte, convert_short_sat_rtn, convert_short_sat_rtp, convert_short_sat_rtz, 
  { 660, 2, 0, 1, 0, 43, 31 },
  { 672, 2, 0, 1, 0, 43, 31 },
  { 684, 2, 0, 1, 0, 43, 31 },
  { 696, 2, 0, 1, 0, 43, 31 },
  { 708, 2, 0, 1, 0, 43, 31 },
  { 720, 2, 0, 1, 0, 43, 31 },
  { 732, 2, 0, 1, 0, 43, 31 },
  { 744, 2, 0, 1, 0, 43, 31 },
  { 756, 2, 0, 1, 0, 43, 31 },
  { 768, 2, 0, 1, 0, 43, 31 },
  { 780, 2, 0, 1, 0, 43, 31 },
  // 342: convert_short2, convert_short2_rte, convert_short2_rtn, convert_short2_rtp, convert_short2_rtz, convert_short2_sat, convert_short2_sat_rte, convert_short2_sat_rtn, convert_short2_sat_rtp, convert_short2_sat_rtz, 
  { 662, 2, 0, 1, 0, 43, 31 },
  { 674, 2, 0, 1, 0, 43, 31 },
  { 686, 2, 0, 1, 0, 43, 31 },
  { 698, 2, 0, 1, 0, 43, 31 },
  { 710, 2, 0, 1, 0, 43, 31 },
  { 722, 2, 0, 1, 0, 43, 31 },
  { 734, 2, 0, 1, 0, 43, 31 },
  { 746, 2, 0, 1, 0, 43, 31 },
  { 758, 2, 0, 1, 0, 43, 31 },
  { 770, 2, 0, 1, 0, 43, 31 },
  { 782, 2, 0, 1, 0, 43, 31 },
  // 353: convert_short3, convert_short3_rte, convert_short3_rtn, convert_short3_rtp, convert_short3_rtz, convert_short3_sat, convert_short3_sat_rte, convert_short3_sat_rtn, convert_short3_sat_rtp, convert_short3_sat_rtz, 
  { 664, 2, 0, 1, 0, 43, 31 },
  { 676, 2, 0, 1, 0, 43, 31 },
  { 688, 2, 0, 1, 0, 43, 31 },
  { 700, 2, 0, 1, 0, 43, 31 },
  { 712, 2, 0, 1, 0, 43, 31 },
  { 724, 2, 0, 1, 0, 43, 31 },
  { 736, 2, 0, 1, 0, 43, 31 },
  { 748, 2, 0, 1, 0, 43, 31 },
  { 760, 2, 0, 1, 0, 43, 31 },
  { 772, 2, 0, 1, 0, 43, 31 },
  { 784, 2, 0, 1, 0, 43, 31 },
  // 364: convert_short4, convert_short4_rte, convert_short4_rtn, convert_short4_rtp, convert_short4_rtz, convert_short4_sat, convert_short4_sat_rte, convert_short4_sat_rtn, convert_short4_sat_rtp, convert_short4_sat_rtz, 
  { 666, 2, 0, 1, 0, 43, 31 },
  { 678, 2, 0, 1, 0, 43, 31 },
  { 690, 2, 0, 1, 0, 43, 31 },
  { 702, 2, 0, 1, 0, 43, 31 },
  { 714, 2, 0, 1, 0, 43, 31 },
  { 726, 2, 0, 1, 0, 43, 31 },
  { 738, 2, 0, 1, 0, 43, 31 },
  { 750, 2, 0, 1, 0, 43, 31 },
  { 762, 2, 0, 1, 0, 43, 31 },
  { 774, 2, 0, 1, 0, 43, 31 },
  { 786, 2, 0, 1, 0, 43, 31 },
  // 375: convert_short8, convert_short8_rte, convert_short8_rtn, convert_short8_rtp, convert_short8_rtz, convert_short8_sat, convert_short8_sat_rte, convert_short8_sat_rtn, convert_short8_sat_rtp, convert_short8_sat_rtz, 
  { 668, 2, 0, 1, 0, 43, 31 },
  { 680, 2, 0, 1, 0, 43, 31 },
  { 692, 2, 0, 1, 0, 43, 31 },
  { 704, 2, 0, 1, 0, 43, 31 },
  { 716, 2, 0, 1, 0, 43, 31 },
  { 728, 2, 0, 1, 0, 43, 31 },
  { 740, 2, 0, 1, 0, 43, 31 },
  { 752, 2, 0, 1, 0, 43, 31 },
  { 764, 2, 0, 1, 0, 43, 31 },
  { 776, 2, 0, 1, 0, 43, 31 },
  { 788, 2, 0, 1, 0, 43, 31 },
  // 386: convert_short16, convert_short16_rte, convert_short16_rtn, convert_short16_rtp, convert_short16_rtz, convert_short16_sat, convert_short16_sat_rte, convert_short16_sat_rtn, convert_short16_sat_rtp, convert_short16_sat_rtz, 
  { 670, 2, 0, 1, 0, 43, 31 },
  { 682, 2, 0, 1, 0, 43, 31 },
  { 694, 2, 0, 1, 0, 43, 31 },
  { 706, 2, 0, 1, 0, 43, 31 },
  { 718, 2, 0, 1, 0, 43, 31 },
  { 730, 2, 0, 1, 0, 43, 31 },
  { 742, 2, 0, 1, 0, 43, 31 },
  { 754, 2, 0, 1, 0, 43, 31 },
  { 766, 2, 0, 1, 0, 43, 31 },
  { 778, 2, 0, 1, 0, 43, 31 },
  { 790, 2, 0, 1, 0, 43, 31 },
  // 397: convert_ushort, convert_ushort_rte, convert_ushort_rtn, convert_ushort_rtp, convert_ushort_rtz, convert_ushort_sat, convert_ushort_sat_rte, convert_ushort_sat_rtn, convert_ushort_sat_rtp, convert_ushort_sat_rtz, 
  { 792, 2, 0, 1, 0, 43, 31 },
  { 804, 2, 0, 1, 0, 43, 31 },
  { 816, 2, 0, 1, 0, 43, 31 },
  { 828, 2, 0, 1, 0, 43, 31 },
  { 840, 2, 0, 1, 0, 43, 31 },
  { 852, 2, 0, 1, 0, 43, 31 },
  { 864, 2, 0, 1, 0, 43, 31 },
  { 876, 2, 0, 1, 0, 43, 31 },
  { 888, 2, 0, 1, 0, 43, 31 },
  { 900, 2, 0, 1, 0, 43, 31 },
  { 912, 2, 0, 1, 0, 43, 31 },
  // 408: convert_ushort2, convert_ushort2_rte, convert_ushort2_rtn, convert_ushort2_rtp, convert_ushort2_rtz, convert_ushort2_sat, convert_ushort2_sat_rte, convert_ushort2_sat_rtn, convert_ushort2_sat_rtp, convert_ushort2_sat_rtz, 
  { 794, 2, 0, 1, 0, 43, 31 },
  { 806, 2, 0, 1, 0, 43, 31 },
  { 818, 2, 0, 1, 0, 43, 31 },
  { 830, 2, 0, 1, 0, 43, 31 },
  { 842, 2, 0, 1, 0, 43, 31 },
  { 854, 2, 0, 1, 0, 43, 31 },
  { 866, 2, 0, 1, 0, 43, 31 },
  { 878, 2, 0, 1, 0, 43, 31 },
  { 890, 2, 0, 1, 0, 43, 31 },
  { 902, 2, 0, 1, 0, 43, 31 },
  { 914, 2, 0, 1, 0, 43, 31 },
  // 419: convert_ushort3, convert_ushort3_rte, convert_ushort3_rtn, convert_ushort3_rtp, convert_ushort3_rtz, convert_ushort3_sat, convert_ushort3_sat_rte, convert_ushort3_sat_rtn, convert_ushort3_sat_rtp, convert_ushort3_sat_rtz, 
  { 796, 2, 0, 1, 0, 43, 31 },
  { 808, 2, 0, 1, 0, 43, 31 },
  { 820, 2, 0, 1, 0, 43, 31 },
  { 832, 2, 0, 1, 0, 43, 31 },
  { 844, 2, 0, 1, 0, 43, 31 },
  { 856, 2, 0, 1, 0, 43, 31 },
  { 868, 2, 0, 1, 0, 43, 31 },
  { 880, 2, 0, 1, 0, 43, 31 },
  { 892, 2, 0, 1, 0, 43, 31 },
  { 904, 2, 0, 1, 0, 43, 31 },
  { 916, 2, 0, 1, 0, 43, 31 },
  // 430: convert_ushort4, convert_ushort4_rte, convert_ushort4_rtn, convert_ushort4_rtp, convert_ushort4_rtz, convert_ushort4_sat, convert_ushort4_sat_rte, convert_ushort4_sat_rtn, convert_ushort4_sat_rtp, convert_ushort4_sat_rtz, 
  { 798, 2, 0, 1, 0, 43, 31 },
  { 810, 2, 0, 1, 0, 43, 31 },
  { 822, 2, 0, 1, 0, 43, 31 },
  { 834, 2, 0, 1, 0, 43, 31 },
  { 846, 2, 0, 1, 0, 43, 31 },
  { 858, 2, 0, 1, 0, 43, 31 },
  { 870, 2, 0, 1, 0, 43, 31 },
  { 882, 2, 0, 1, 0, 43, 31 },
  { 894, 2, 0, 1, 0, 43, 31 },
  { 906, 2, 0, 1, 0, 43, 31 },
  { 918, 2, 0, 1, 0, 43, 31 },
  // 441: convert_ushort8, convert_ushort8_rte, convert_ushort8_rtn, convert_ushort8_rtp, convert_ushort8_rtz, convert_ushort8_sat, convert_ushort8_sat_rte, convert_ushort8_sat_rtn, convert_ushort8_sat_rtp, convert_ushort8_sat_rtz, 
  { 800, 2, 0, 1, 0, 43, 31 },
  { 812, 2, 0, 1, 0, 43, 31 },
  { 824, 2, 0, 1, 0, 43, 31 },
  { 836, 2, 0, 1, 0, 43, 31 },
  { 848, 2, 0, 1, 0, 43, 31 },
  { 860, 2, 0, 1, 0, 43, 31 },
  { 872, 2, 0, 1, 0, 43, 31 },
  { 884, 2, 0, 1, 0, 43, 31 },
  { 896, 2, 0, 1, 0, 43, 31 },
  { 908, 2, 0, 1, 0, 43, 31 },
  { 920, 2, 0, 1, 0, 43, 31 },
  // 452: convert_ushort16, convert_ushort16_rte, convert_ushort16_rtn, convert_ushort16_rtp, convert_ushort16_rtz, convert_ushort16_sat, convert_ushort16_sat_rte, convert_ushort16_sat_rtn, convert_ushort16_sat_rtp, convert_ushort16_sat_rtz, 
  { 802, 2, 0, 1, 0, 43, 31 },
  { 814, 2, 0, 1, 0, 43, 31 },
  { 826, 2, 0, 1, 0, 43, 31 },
  { 838, 2, 0, 1, 0, 43, 31 },
  { 850, 2, 0, 1, 0, 43, 31 },
  { 862, 2, 0, 1, 0, 43, 31 },
  { 874, 2, 0, 1, 0, 43, 31 },
  { 886, 2, 0, 1, 0, 43, 31 },
  { 898, 2, 0, 1, 0, 43, 31 },
  { 910, 2, 0, 1, 0, 43, 31 },
  { 922, 2, 0, 1, 0, 43, 31 },
  // 463: convert_int, convert_int_rte, convert_int_rtn, convert_int_rtp, convert_int_rtz, convert_int_sat, convert_int_sat_rte, convert_int_sat_rtn, convert_int_sat_rtp, convert_int_sat_rtz, 
  { 924, 2, 0, 1, 0, 43, 31 },
  { 936, 2, 0, 1, 0, 43, 31 },
  { 948, 2, 0, 1, 0, 43, 31 },
  { 960, 2, 0, 1, 0, 43, 31 },
  { 972, 2, 0, 1, 0, 43, 31 },
  { 984, 2, 0, 1, 0, 43, 31 },
  { 996, 2, 0, 1, 0, 43, 31 },
  { 1008, 2, 0, 1, 0, 43, 31 },
  { 1020, 2, 0, 1, 0, 43, 31 },
  { 1032, 2, 0, 1, 0, 43, 31 },
  { 1044, 2, 0, 1, 0, 43, 31 },
  // 474: convert_int2, convert_int2_rte, convert_int2_rtn, convert_int2_rtp, convert_int2_rtz, convert_int2_sat, convert_int2_sat_rte, convert_int2_sat_rtn, convert_int2_sat_rtp, convert_int2_sat_rtz, 
  { 926, 2, 0, 1, 0, 43, 31 },
  { 938, 2, 0, 1, 0, 43, 31 },
  { 950, 2, 0, 1, 0, 43, 31 },
  { 962, 2, 0, 1, 0, 43, 31 },
  { 974, 2, 0, 1, 0, 43, 31 },
  { 986, 2, 0, 1, 0, 43, 31 },
  { 998, 2, 0, 1, 0, 43, 31 },
  { 1010, 2, 0, 1, 0, 43, 31 },
  { 1022, 2, 0, 1, 0, 43, 31 },
  { 1034, 2, 0, 1, 0, 43, 31 },
  { 1046, 2, 0, 1, 0, 43, 31 },
  // 485: convert_int3, convert_int3_rte, convert_int3_rtn, convert_int3_rtp, convert_int3_rtz, convert_int3_sat, convert_int3_sat_rte, convert_int3_sat_rtn, convert_int3_sat_rtp, convert_int3_sat_rtz, 
  { 928, 2, 0, 1, 0, 43, 31 },
  { 940, 2, 0, 1, 0, 43, 31 },
  { 952, 2, 0, 1, 0, 43, 31 },
  { 964, 2, 0, 1, 0, 43, 31 },
  { 976, 2, 0, 1, 0, 43, 31 },
  { 988, 2, 0, 1, 0, 43, 31 },
  { 1000, 2, 0, 1, 0, 43, 31 },
  { 1012, 2, 0, 1, 0, 43, 31 },
  { 1024, 2, 0, 1, 0, 43, 31 },
  { 1036, 2, 0, 1, 0, 43, 31 },
  { 1048, 2, 0, 1, 0, 43, 31 },
  // 496: convert_int4, convert_int4_rte, convert_int4_rtn, convert_int4_rtp, convert_int4_rtz, convert_int4_sat, convert_int4_sat_rte, convert_int4_sat_rtn, convert_int4_sat_rtp, convert_int4_sat_rtz, 
  { 930, 2, 0, 1, 0, 43, 31 },
  { 942, 2, 0, 1, 0, 43, 31 },
  { 954, 2, 0, 1, 0, 43, 31 },
  { 966, 2, 0, 1, 0, 43, 31 },
  { 978, 2, 0, 1, 0, 43, 31 },
  { 990, 2, 0, 1, 0, 43, 31 },
  { 1002, 2, 0, 1, 0, 43, 31 },
  { 1014, 2, 0, 1, 0, 43, 31 },
  { 1026, 2, 0, 1, 0, 43, 31 },
  { 1038, 2, 0, 1, 0, 43, 31 },
  { 1050, 2, 0, 1, 0, 43, 31 },
  // 507: convert_int8, convert_int8_rte, convert_int8_rtn, convert_int8_rtp, convert_int8_rtz, convert_int8_sat, convert_int8_sat_rte, convert_int8_sat_rtn, convert_int8_sat_rtp, convert_int8_sat_rtz, 
  { 932, 2, 0, 1, 0, 43, 31 },
  { 944, 2, 0, 1, 0, 43, 31 },
  { 956, 2, 0, 1, 0, 43, 31 },
  { 968, 2, 0, 1, 0, 43, 31 },
  { 980, 2, 0, 1, 0, 43, 31 },
  { 992, 2, 0, 1, 0, 43, 31 },
  { 1004, 2, 0, 1, 0, 43, 31 },
  { 1016, 2, 0, 1, 0, 43, 31 },
  { 1028, 2, 0, 1, 0, 43, 31 },
  { 1040, 2, 0, 1, 0, 43, 31 },
  { 1052, 2, 0, 1, 0, 43, 31 },
  // 518: convert_int16, convert_int16_rte, convert_int16_rtn, convert_int16_rtp, convert_int16_rtz, convert_int16_sat, convert_int16_sat_rte, convert_int16_sat_rtn, convert_int16_sat_rtp, convert_int16_sat_rtz, 
  { 934, 2, 0, 1, 0, 43, 31 },
  { 946, 2, 0, 1, 0, 43, 31 },
  { 958, 2, 0, 1, 0, 43, 31 },
  { 970, 2, 0, 1, 0, 43, 31 },
  { 982, 2, 0, 1, 0, 43, 31 },
  { 994, 2, 0, 1, 0, 43, 31 },
  { 1006, 2, 0, 1, 0, 43, 31 },
  { 1018, 2, 0, 1, 0, 43, 31 },
  { 1030, 2, 0, 1, 0, 43, 31 },
  { 1042, 2, 0, 1, 0, 43, 31 },
  { 1054, 2, 0, 1, 0, 43, 31 },
  // 529: convert_uint, convert_uint_rte, convert_uint_rtn, convert_uint_rtp, convert_uint_rtz, convert_uint_sat, convert_uint_sat_rte, convert_uint_sat_rtn, convert_uint_sat_rtp, convert_uint_sat_rtz, 
  { 1056, 2, 0, 1, 0, 43, 31 },
  { 1068, 2, 0, 1, 0, 43, 31 },
  { 1080, 2, 0, 1, 0, 43, 31 },
  { 1092, 2, 0, 1, 0, 43, 31 },
  { 1104, 2, 0, 1, 0, 43, 31 },
  { 1116, 2, 0, 1, 0, 43, 31 },
  { 1128, 2, 0, 1, 0, 43, 31 },
  { 1140, 2, 0, 1, 0, 43, 31 },
  { 1152, 2, 0, 1, 0, 43, 31 },
  { 1164, 2, 0, 1, 0, 43, 31 },
  { 1176, 2, 0, 1, 0, 43, 31 },
  // 540: convert_uint2, convert_uint2_rte, convert_uint2_rtn, convert_uint2_rtp, convert_uint2_rtz, convert_uint2_sat, convert_uint2_sat_rte, convert_uint2_sat_rtn, convert_uint2_sat_rtp, convert_uint2_sat_rtz, 
  { 1058, 2, 0, 1, 0, 43, 31 },
  { 1070, 2, 0, 1, 0, 43, 31 },
  { 1082, 2, 0, 1, 0, 43, 31 },
  { 1094, 2, 0, 1, 0, 43, 31 },
  { 1106, 2, 0, 1, 0, 43, 31 },
  { 1118, 2, 0, 1, 0, 43, 31 },
  { 1130, 2, 0, 1, 0, 43, 31 },
  { 1142, 2, 0, 1, 0, 43, 31 },
  { 1154, 2, 0, 1, 0, 43, 31 },
  { 1166, 2, 0, 1, 0, 43, 31 },
  { 1178, 2, 0, 1, 0, 43, 31 },
  // 551: convert_uint3, convert_uint3_rte, convert_uint3_rtn, convert_uint3_rtp, convert_uint3_rtz, convert_uint3_sat, convert_uint3_sat_rte, convert_uint3_sat_rtn, convert_uint3_sat_rtp, convert_uint3_sat_rtz, 
  { 1060, 2, 0, 1, 0, 43, 31 },
  { 1072, 2, 0, 1, 0, 43, 31 },
  { 1084, 2, 0, 1, 0, 43, 31 },
  { 1096, 2, 0, 1, 0, 43, 31 },
  { 1108, 2, 0, 1, 0, 43, 31 },
  { 1120, 2, 0, 1, 0, 43, 31 },
  { 1132, 2, 0, 1, 0, 43, 31 },
  { 1144, 2, 0, 1, 0, 43, 31 },
  { 1156, 2, 0, 1, 0, 43, 31 },
  { 1168, 2, 0, 1, 0, 43, 31 },
  { 1180, 2, 0, 1, 0, 43, 31 },
  // 562: convert_uint4, convert_uint4_rte, convert_uint4_rtn, convert_uint4_rtp, convert_uint4_rtz, convert_uint4_sat, convert_uint4_sat_rte, convert_uint4_sat_rtn, convert_uint4_sat_rtp, convert_uint4_sat_rtz, 
  { 1062, 2, 0, 1, 0, 43, 31 },
  { 1074, 2, 0, 1, 0, 43, 31 },
  { 1086, 2, 0, 1, 0, 43, 31 },
  { 1098, 2, 0, 1, 0, 43, 31 },
  { 1110, 2, 0, 1, 0, 43, 31 },
  { 1122, 2, 0, 1, 0, 43, 31 },
  { 1134, 2, 0, 1, 0, 43, 31 },
  { 1146, 2, 0, 1, 0, 43, 31 },
  { 1158, 2, 0, 1, 0, 43, 31 },
  { 1170, 2, 0, 1, 0, 43, 31 },
  { 1182, 2, 0, 1, 0, 43, 31 },
  // 573: convert_uint8, convert_uint8_rte, convert_uint8_rtn, convert_uint8_rtp, convert_uint8_rtz, convert_uint8_sat, convert_uint8_sat_rte, convert_uint8_sat_rtn, convert_uint8_sat_rtp, convert_uint8_sat_rtz, 
  { 1064, 2, 0, 1, 0, 43, 31 },
  { 1076, 2, 0, 1, 0, 43, 31 },
  { 1088, 2, 0, 1, 0, 43, 31 },
  { 1100, 2, 0, 1, 0, 43, 31 },
  { 1112, 2, 0, 1, 0, 43, 31 },
  { 1124, 2, 0, 1, 0, 43, 31 },
  { 1136, 2, 0, 1, 0, 43, 31 },
  { 1148, 2, 0, 1, 0, 43, 31 },
  { 1160, 2, 0, 1, 0, 43, 31 },
  { 1172, 2, 0, 1, 0, 43, 31 },
  { 1184, 2, 0, 1, 0, 43, 31 },
  // 584: convert_uint16, convert_uint16_rte, convert_uint16_rtn, convert_uint16_rtp, convert_uint16_rtz, convert_uint16_sat, convert_uint16_sat_rte, convert_uint16_sat_rtn, convert_uint16_sat_rtp, convert_uint16_sat_rtz, 
  { 1066, 2, 0, 1, 0, 43, 31 },
  { 1078, 2, 0, 1, 0, 43, 31 },
  { 1090, 2, 0, 1, 0, 43, 31 },
  { 1102, 2, 0, 1, 0, 43, 31 },
  { 1114, 2, 0, 1, 0, 43, 31 },
  { 1126, 2, 0, 1, 0, 43, 31 },
  { 1138, 2, 0, 1, 0, 43, 31 },
  { 1150, 2, 0, 1, 0, 43, 31 },
  { 1162, 2, 0, 1, 0, 43, 31 },
  { 1174, 2, 0, 1, 0, 43, 31 },
  { 1186, 2, 0, 1, 0, 43, 31 },
  // 595: convert_long, convert_long_rte, convert_long_rtn, convert_long_rtp, convert_long_rtz, convert_long_sat, convert_long_sat_rte, convert_long_sat_rtn, convert_long_sat_rtp, convert_long_sat_rtz, 
  { 1188, 2, 0, 1, 0, 43, 31 },
  { 1200, 2, 0, 1, 0, 43, 31 },
  { 1212, 2, 0, 1, 0, 43, 31 },
  { 1224, 2, 0, 1, 0, 43, 31 },
  { 1236, 2, 0, 1, 0, 43, 31 },
  { 1248, 2, 0, 1, 0, 43, 31 },
  { 1260, 2, 0, 1, 0, 43, 31 },
  { 1272, 2, 0, 1, 0, 43, 31 },
  { 1284, 2, 0, 1, 0, 43, 31 },
  { 1296, 2, 0, 1, 0, 43, 31 },
  { 1308, 2, 0, 1, 0, 43, 31 },
  // 606: convert_long2, convert_long2_rte, convert_long2_rtn, convert_long2_rtp, convert_long2_rtz, convert_long2_sat, convert_long2_sat_rte, convert_long2_sat_rtn, convert_long2_sat_rtp, convert_long2_sat_rtz, 
  { 1190, 2, 0, 1, 0, 43, 31 },
  { 1202, 2, 0, 1, 0, 43, 31 },
  { 1214, 2, 0, 1, 0, 43, 31 },
  { 1226, 2, 0, 1, 0, 43, 31 },
  { 1238, 2, 0, 1, 0, 43, 31 },
  { 1250, 2, 0, 1, 0, 43, 31 },
  { 1262, 2, 0, 1, 0, 43, 31 },
  { 1274, 2, 0, 1, 0, 43, 31 },
  { 1286, 2, 0, 1, 0, 43, 31 },
  { 1298, 2, 0, 1, 0, 43, 31 },
  { 1310, 2, 0, 1, 0, 43, 31 },
  // 617: convert_long3, convert_long3_rte, convert_long3_rtn, convert_long3_rtp, convert_long3_rtz, convert_long3_sat, convert_long3_sat_rte, convert_long3_sat_rtn, convert_long3_sat_rtp, convert_long3_sat_rtz, 
  { 1192, 2, 0, 1, 0, 43, 31 },
  { 1204, 2, 0, 1, 0, 43, 31 },
  { 1216, 2, 0, 1, 0, 43, 31 },
  { 1228, 2, 0, 1, 0, 43, 31 },
  { 1240, 2, 0, 1, 0, 43, 31 },
  { 1252, 2, 0, 1, 0, 43, 31 },
  { 1264, 2, 0, 1, 0, 43, 31 },
  { 1276, 2, 0, 1, 0, 43, 31 },
  { 1288, 2, 0, 1, 0, 43, 31 },
  { 1300, 2, 0, 1, 0, 43, 31 },
  { 1312, 2, 0, 1, 0, 43, 31 },
  // 628: convert_long4, convert_long4_rte, convert_long4_rtn, convert_long4_rtp, convert_long4_rtz, convert_long4_sat, convert_long4_sat_rte, convert_long4_sat_rtn, convert_long4_sat_rtp, convert_long4_sat_rtz, 
  { 1194, 2, 0, 1, 0, 43, 31 },
  { 1206, 2, 0, 1, 0, 43, 31 },
  { 1218, 2, 0, 1, 0, 43, 31 },
  { 1230, 2, 0, 1, 0, 43, 31 },
  { 1242, 2, 0, 1, 0, 43, 31 },
  { 1254, 2, 0, 1, 0, 43, 31 },
  { 1266, 2, 0, 1, 0, 43, 31 },
  { 1278, 2, 0, 1, 0, 43, 31 },
  { 1290, 2, 0, 1, 0, 43, 31 },
  { 1302, 2, 0, 1, 0, 43, 31 },
  { 1314, 2, 0, 1, 0, 43, 31 },
  // 639: convert_long8, convert_long8_rte, convert_long8_rtn, convert_long8_rtp, convert_long8_rtz, convert_long8_sat, convert_long8_sat_rte, convert_long8_sat_rtn, convert_long8_sat_rtp, convert_long8_sat_rtz, 
  { 1196, 2, 0, 1, 0, 43, 31 },
  { 1208, 2, 0, 1, 0, 43, 31 },
  { 1220, 2, 0, 1, 0, 43, 31 },
  { 1232, 2, 0, 1, 0, 43, 31 },
  { 1244, 2, 0, 1, 0, 43, 31 },
  { 1256, 2, 0, 1, 0, 43, 31 },
  { 1268, 2, 0, 1, 0, 43, 31 },
  { 1280, 2, 0, 1, 0, 43, 31 },
  { 1292, 2, 0, 1, 0, 43, 31 },
  { 1304, 2, 0, 1, 0, 43, 31 },
  { 1316, 2, 0, 1, 0, 43, 31 },
  // 650: convert_long16, convert_long16_rte, convert_long16_rtn, convert_long16_rtp, convert_long16_rtz, convert_long16_sat, convert_long16_sat_rte, convert_long16_sat_rtn, convert_long16_sat_rtp, convert_long16_sat_rtz, 
  { 1198, 2, 0, 1, 0, 43, 31 },
  { 1210, 2, 0, 1, 0, 43, 31 },
  { 1222, 2, 0, 1, 0, 43, 31 },
  { 1234, 2, 0, 1, 0, 43, 31 },
  { 1246, 2, 0, 1, 0, 43, 31 },
  { 1258, 2, 0, 1, 0, 43, 31 },
  { 1270, 2, 0, 1, 0, 43, 31 },
  { 1282, 2, 0, 1, 0, 43, 31 },
  { 1294, 2, 0, 1, 0, 43, 31 },
  { 1306, 2, 0, 1, 0, 43, 31 },
  { 1318, 2, 0, 1, 0, 43, 31 },
  // 661: convert_ulong, convert_ulong_rte, convert_ulong_rtn, convert_ulong_rtp, convert_ulong_rtz, convert_ulong_sat, convert_ulong_sat_rte, convert_ulong_sat_rtn, convert_ulong_sat_rtp, convert_ulong_sat_rtz, 
  { 1320, 2, 0, 1, 0, 43, 31 },
  { 1332, 2, 0, 1, 0, 43, 31 },
  { 1344, 2, 0, 1, 0, 43, 31 },
  { 1356, 2, 0, 1, 0, 43, 31 },
  { 1368, 2, 0, 1, 0, 43, 31 },
  { 1380, 2, 0, 1, 0, 43, 31 },
  { 1392, 2, 0, 1, 0, 43, 31 },
  { 1404, 2, 0, 1, 0, 43, 31 },
  { 1416, 2, 0, 1, 0, 43, 31 },
  { 1428, 2, 0, 1, 0, 43, 31 },
  { 1440, 2, 0, 1, 0, 43, 31 },
  // 672: convert_ulong2, convert_ulong2_rte, convert_ulong2_rtn, convert_ulong2_rtp, convert_ulong2_rtz, convert_ulong2_sat, convert_ulong2_sat_rte, convert_ulong2_sat_rtn, convert_ulong2_sat_rtp, convert_ulong2_sat_rtz, 
  { 1322, 2, 0, 1, 0, 43, 31 },
  { 1334, 2, 0, 1, 0, 43, 31 },
  { 1346, 2, 0, 1, 0, 43, 31 },
  { 1358, 2, 0, 1, 0, 43, 31 },
  { 1370, 2, 0, 1, 0, 43, 31 },
  { 1382, 2, 0, 1, 0, 43, 31 },
  { 1394, 2, 0, 1, 0, 43, 31 },
  { 1406, 2, 0, 1, 0, 43, 31 },
  { 1418, 2, 0, 1, 0, 43, 31 },
  { 1430, 2, 0, 1, 0, 43, 31 },
  { 1442, 2, 0, 1, 0, 43, 31 },
  // 683: convert_ulong3, convert_ulong3_rte, convert_ulong3_rtn, convert_ulong3_rtp, convert_ulong3_rtz, convert_ulong3_sat, convert_ulong3_sat_rte, convert_ulong3_sat_rtn, convert_ulong3_sat_rtp, convert_ulong3_sat_rtz, 
  { 1324, 2, 0, 1, 0, 43, 31 },
  { 1336, 2, 0, 1, 0, 43, 31 },
  { 1348, 2, 0, 1, 0, 43, 31 },
  { 1360, 2, 0, 1, 0, 43, 31 },
  { 1372, 2, 0, 1, 0, 43, 31 },
  { 1384, 2, 0, 1, 0, 43, 31 },
  { 1396, 2, 0, 1, 0, 43, 31 },
  { 1408, 2, 0, 1, 0, 43, 31 },
  { 1420, 2, 0, 1, 0, 43, 31 },
  { 1432, 2, 0, 1, 0, 43, 31 },
  { 1444, 2, 0, 1, 0, 43, 31 },
  // 694: convert_ulong4, convert_ulong4_rte, convert_ulong4_rtn, convert_ulong4_rtp, convert_ulong4_rtz, convert_ulong4_sat, convert_ulong4_sat_rte, convert_ulong4_sat_rtn, convert_ulong4_sat_rtp, convert_ulong4_sat_rtz, 
  { 1326, 2, 0, 1, 0, 43, 31 },
  { 1338, 2, 0, 1, 0, 43, 31 },
  { 1350, 2, 0, 1, 0, 43, 31 },
  { 1362, 2, 0, 1, 0, 43, 31 },
  { 1374, 2, 0, 1, 0, 43, 31 },
  { 1386, 2, 0, 1, 0, 43, 31 },
  { 1398, 2, 0, 1, 0, 43, 31 },
  { 1410, 2, 0, 1, 0, 43, 31 },
  { 1422, 2, 0, 1, 0, 43, 31 },
  { 1434, 2, 0, 1, 0, 43, 31 },
  { 1446, 2, 0, 1, 0, 43, 31 },
  // 705: convert_ulong8, convert_ulong8_rte, convert_ulong8_rtn, convert_ulong8_rtp, convert_ulong8_rtz, convert_ulong8_sat, convert_ulong8_sat_rte, convert_ulong8_sat_rtn, convert_ulong8_sat_rtp, convert_ulong8_sat_rtz, 
  { 1328, 2, 0, 1, 0, 43, 31 },
  { 1340, 2, 0, 1, 0, 43, 31 },
  { 1352, 2, 0, 1, 0, 43, 31 },
  { 1364, 2, 0, 1, 0, 43, 31 },
  { 1376, 2, 0, 1, 0, 43, 31 },
  { 1388, 2, 0, 1, 0, 43, 31 },
  { 1400, 2, 0, 1, 0, 43, 31 },
  { 1412, 2, 0, 1, 0, 43, 31 },
  { 1424, 2, 0, 1, 0, 43, 31 },
  { 1436, 2, 0, 1, 0, 43, 31 },
  { 1448, 2, 0, 1, 0, 43, 31 },
  // 716: convert_ulong16, convert_ulong16_rte, convert_ulong16_rtn, convert_ulong16_rtp, convert_ulong16_rtz, convert_ulong16_sat, convert_ulong16_sat_rte, convert_ulong16_sat_rtn, convert_ulong16_sat_rtp, convert_ulong16_sat_rtz, 
  { 1330, 2, 0, 1, 0, 43, 31 },
  { 1342, 2, 0, 1, 0, 43, 31 },
  { 1354, 2, 0, 1, 0, 43, 31 },
  { 1366, 2, 0, 1, 0, 43, 31 },
  { 1378, 2, 0, 1, 0, 43, 31 },
  { 1390, 2, 0, 1, 0, 43, 31 },
  { 1402, 2, 0, 1, 0, 43, 31 },
  { 1414, 2, 0, 1, 0, 43, 31 },
  { 1426, 2, 0, 1, 0, 43, 31 },
  { 1438, 2, 0, 1, 0, 43, 31 },
  { 1450, 2, 0, 1, 0, 43, 31 },
  // 727: get_work_dim, 
  { 1452, 1, 0, 1, 0, 43, 31 },
  // 728: get_global_size, get_global_id, get_local_size, get_local_id, get_num_groups, get_group_id, get_global_offset, 
  { 1453, 2, 0, 1, 0, 43, 31 },
  // 729: get_enqueued_local_size, 
  { 1453, 2, 0, 0, 0, 43, 24 },
  // 730: get_global_linear_id, get_local_linear_id, 
  { 1455, 1, 0, 0, 0, 43, 24 },
  // 731: acos, acosh, acospi, asin, asinh, asinpi, atan, atanh, atanpi, cbrt, ceil, cos, cosh, cospi, erfc, erf, exp, exp2, exp10, expm1, fabs, floor, log, log2, log10, log1p, logb, rint, round, rsqrt, sin, sinh, sinpi, sqrt, tan, tanh, tanpi, tgamma, trunc, lgamma, degrees, radians, sign, 
  { 1456, 2, 0, 1, 0, 43, 31 },
  // 732: nan, 
  { 1458, 2, 0, 1, 0, 43, 31 },
  { 1460, 2, 0, 1, 0, 43, 31 },
  { 1462, 2, 0, 1, 0, 43, 31 },
  // 735: atan2, atan2pi, copysign, fdim, fmod, hypot, maxmag, minmag, nextafter, pow, powr, remainder, 
  { 1464, 3, 0, 1, 0, 43, 31 },
  // 736: fmax, fmin, 
  { 1464, 3, 0, 1, 0, 43, 31 },
  { 1467, 3, 0, 1, 0, 43, 31 },
  { 1470, 3, 0, 1, 0, 43, 31 },
  { 1473, 3, 0, 1, 0, 43, 31 },
  // 740: ilogb, 
  { 1476, 2, 0, 1, 0, 43, 31 },
  { 1478, 2, 0, 1, 0, 43, 31 },
  { 1480, 2, 0, 1, 0, 43, 31 },
  // 743: ldexp, 
  { 1482, 3, 0, 1, 0, 43, 31 },
  { 1485, 3, 0, 1, 0, 43, 31 },
  { 1488, 3, 0, 1, 0, 43, 31 },
  { 1491, 3, 0, 1, 0, 43, 31 },
  { 1494, 3, 0, 1, 0, 43, 31 },
  { 1497, 3, 0, 1, 0, 43, 31 },
  // 749: pown, rootn, 
  { 1482, 3, 0, 1, 0, 43, 31 },
  { 1488, 3, 0, 1, 0, 43, 31 },
  { 1494, 3, 0, 1, 0, 43, 31 },
  // 752: fma, mad, 
  { 1500, 4, 0, 1, 0, 43, 31 },
  // 753: fract, modf, sincos, 
  { 1504, 3, 0, 0, 0, 46, 31 },
  { 1528, 3, 0, 0, 0, 46, 31 },
  { 1552, 3, 0, 0, 0, 46, 31 },
  { 1576, 3, 0, 0, 0, 45, 31 },
  // 757: frexp, lgamma_r, 
  { 1507, 3, 0, 0, 0, 46, 31 },
  { 1514, 3, 0, 0, 0, 46, 31 },
  { 1517, 3, 0, 0, 0, 46, 31 },
  { 1531, 3, 0, 0, 0, 46, 31 },
  { 1534, 3, 0, 0, 0, 46, 31 },
  { 1537, 3, 0, 0, 0, 46, 31 },
  { 1555, 3, 0, 0, 0, 46, 31 },
  { 1558, 3, 0, 0, 0, 46, 31 },
  { 1561, 3, 0, 0, 0, 46, 31 },
  { 1579, 3, 0, 0, 0, 45, 31 },
  { 1582, 3, 0, 0, 0, 45, 31 },
  { 1585, 3, 0, 0, 0, 45, 31 },
  // 769: remquo, 
  { 1510, 4, 0, 0, 0, 46, 31 },
  { 1520, 4, 0, 0, 0, 46, 31 },
  { 1524, 4, 0, 0, 0, 46, 31 },
  { 1540, 4, 0, 0, 0, 46, 31 },
  { 1544, 4, 0, 0, 0, 46, 31 },
  { 1548, 4, 0, 0, 0, 46, 31 },
  { 1564, 4, 0, 0, 0, 46, 31 },
  { 1568, 4, 0, 0, 0, 46, 31 },
  { 1572, 4, 0, 0, 0, 46, 31 },
  { 1588, 4, 0, 0, 0, 45, 31 },
  { 1592, 4, 0, 0, 0, 45, 31 },
  { 1596, 4, 0, 0, 0, 45, 31 },
  // 781: half_cos, half_exp, half_exp2, half_exp10, half_log, half_log2, half_log10, half_recip, half_rsqrt, half_sin, half_sqrt, half_tan, native_cos, native_exp, native_exp2, native_exp10, native_log, native_log2, native_log10, native_recip, native_rsqrt, native_sin, native_sqrt, native_tan, 
  { 1600, 2, 0, 1, 0, 43, 31 },
  // 782: half_divide, half_powr, native_divide, native_powr, 
  { 1602, 3, 0, 1, 0, 43, 31 },
  // 783: abs, 
  { 1605, 2, 0, 1, 0, 43, 31 },
  // 784: clz, 
  { 1607, 2, 0, 1, 0, 43, 31 },
  // 785: popcount, 
  { 1607, 2, 0, 1, 0, 43, 28 },
  // 786: ctz, 
  { 1607, 2, 0, 1, 0, 43, 24 },
  // 787: abs_diff, 
  { 1609, 3, 0, 1, 0, 43, 31 },
  // 788: add_sat, hadd, rhadd, mul_hi, rotate, sub_sat, 
  { 1612, 3, 0, 1, 0, 43, 31 },
  // 789: max, min, 
  { 1612, 3, 0, 1, 0, 43, 31 },
  { 1615, 3, 0, 1, 0, 43, 31 },
  { 1464, 3, 0, 1, 0, 43, 31 },
  { 1467, 3, 0, 1, 0, 43, 31 },
  { 1470, 3, 0, 1, 0, 43, 31 },
  { 1473, 3, 0, 1, 0, 43, 31 },
  // 795: upsample, 
  { 1618, 3, 0, 1, 0, 43, 31 },
  { 1621, 3, 0, 1, 0, 43, 31 },
  { 1624, 3, 0, 1, 0, 43, 31 },
  { 1627, 3, 0, 1, 0, 43, 31 },
  { 1630, 3, 0, 1, 0, 43, 31 },
  { 1633, 3, 0, 1, 0, 43, 31 },
  // 801: clamp, 
  { 1636, 4, 0, 1, 0, 43, 31 },
  { 1640, 4, 0, 1, 0, 43, 31 },
  { 1500, 4, 0, 1, 0, 43, 31 },
  { 1667, 4, 0, 1, 0, 43, 31 },
  { 1671, 4, 0, 1, 0, 43, 31 },
  { 1675, 4, 0, 1, 0, 43, 31 },
  // 807: mad_hi, mad_sat, 
  { 1636, 4, 0, 1, 0, 43, 31 },
  // 808: mad24, 
  { 1644, 4, 0, 1, 0, 43, 31 },
  { 1648, 4, 0, 1, 0, 43, 31 },
  // 810: mul24, 
  { 1652, 3, 0, 1, 0, 43, 31 },
  { 1655, 3, 0, 1, 0, 43, 31 },
  // 812: step, 
  { 1464, 3, 0, 1, 0, 43, 31 },
  { 1658, 3, 0, 1, 0, 43, 31 },
  { 1661, 3, 0, 1, 0, 43, 31 },
  { 1664, 3, 0, 1, 0, 43, 31 },
  // 816: mix, 
  { 1500, 4, 0, 1, 0, 43, 31 },
  { 1679, 4, 0, 1, 0, 43, 31 },
  { 1683, 4, 0, 1, 0, 43, 31 },
  { 1687, 4, 0, 1, 0, 43, 31 },
  // 820: smoothstep, 
  { 1500, 4, 0, 1, 0, 43, 31 },
  { 1691, 4, 0, 1, 0, 43, 31 },
  { 1695, 4, 0, 1, 0, 43, 31 },
  { 1699, 4, 0, 1, 0, 43, 31 },
  // 824: length, 
  { 1703, 2, 0, 1, 0, 43, 31 },
  { 1705, 2, 0, 1, 0, 43, 31 },
  { 1707, 2, 0, 1, 0, 43, 31 },
  // 827: normalize, 
  { 1709, 2, 0, 1, 0, 43, 31 },
  { 1711, 2, 0, 1, 0, 43, 31 },
  { 1713, 2, 0, 1, 0, 43, 31 },
  // 830: fast_length, 
  { 1703, 2, 0, 1, 0, 43, 31 },
  // 831: fast_normalize, 
  { 1709, 2, 0, 1, 0, 43, 31 },
  // 832: cross, 
  { 1715, 3, 0, 1, 0, 43, 31 },
  { 1718, 3, 0, 1, 0, 43, 31 },
  { 1721, 3, 0, 1, 0, 43, 31 },
  { 1724, 3, 0, 1, 0, 43, 31 },
  { 1727, 3, 0, 1, 0, 43, 31 },
  { 1730, 3, 0, 1, 0, 43, 31 },
  // 838: dot, 
  { 1733, 3, 0, 1, 0, 43, 31 },
  { 1736, 3, 0, 1, 0, 43, 31 },
  { 1739, 3, 0, 1, 0, 43, 31 },
  { 7805, 3, 0, 1, 0, 97, 31 },
  { 7808, 3, 0, 1, 0, 97, 31 },
  { 7811, 3, 0, 1, 0, 97, 31 },
  { 7814, 3, 0, 1, 0, 97, 31 },
  // 845: distance, 
  { 1733, 3, 0, 1, 0, 43, 31 },
  { 1736, 3, 0, 1, 0, 43, 31 },
  { 1739, 3, 0, 1, 0, 43, 31 },
  // 848: fast_distance, 
  { 1733, 3, 0, 1, 0, 43, 31 },
  // 849: isfinite, isinf, isnan, isnormal, signbit, 
  { 1476, 2, 0, 1, 0, 43, 31 },
  { 936, 2, 0, 1, 0, 43, 31 },
  { 1742, 2, 0, 1, 0, 43, 31 },
  { 948, 2, 0, 1, 0, 43, 31 },
  { 1744, 2, 0, 1, 0, 43, 31 },
  // 854: any, all, 
  { 1746, 2, 0, 1, 0, 43, 31 },
  // 855: isequal, isnotequal, isgreater, isgreaterequal, isless, islessequal, islessgreater, isordered, isunordered, 
  { 1748, 3, 0, 1, 0, 43, 31 },
  { 1751, 3, 0, 1, 0, 43, 31 },
  { 1754, 3, 0, 1, 0, 43, 31 },
  { 1757, 3, 0, 1, 0, 43, 31 },
  { 1760, 3, 0, 1, 0, 43, 31 },
  // 860: bitselect, 
  { 1763, 4, 0, 1, 0, 43, 31 },
  // 861: select, 
  { 1767, 4, 0, 1, 0, 43, 31 },
  { 1771, 4, 0, 1, 0, 43, 31 },
  { 1775, 4, 0, 1, 0, 43, 31 },
  { 1779, 4, 0, 1, 0, 43, 31 },
  { 1783, 4, 0, 1, 0, 43, 31 },
  { 1787, 4, 0, 1, 0, 43, 31 },
  { 1791, 4, 0, 1, 0, 43, 31 },
  { 1795, 4, 0, 1, 0, 43, 31 },
  { 1799, 4, 0, 1, 0, 43, 31 },
  { 1803, 4, 0, 1, 0, 43, 31 },
  // 871: vload2, 
  { 1807, 3, 1, 0, 0, 46, 31 },
  { 1810, 3, 1, 0, 0, 46, 31 },
  { 1813, 3, 1, 0, 0, 46, 31 },
  { 1816, 3, 1, 0, 0, 46, 31 },
  { 1819, 3, 1, 0, 0, 46, 31 },
  { 1822, 3, 1, 0, 0, 46, 31 },
  { 1825, 3, 1, 0, 0, 46, 31 },
  { 1828, 3, 1, 0, 0, 46, 31 },
  { 1831, 3, 1, 0, 0, 46, 31 },
  { 1834, 3, 1, 0, 0, 46, 31 },
  { 1837, 3, 1, 0, 0, 46, 31 },
  { 2192, 3, 1, 0, 0, 46, 31 },
  { 2195, 3, 1, 0, 0, 46, 31 },
  { 2198, 3, 1, 0, 0, 46, 31 },
  { 2201, 3, 1, 0, 0, 46, 31 },
  { 2204, 3, 1, 0, 0, 46, 31 },
  { 2207, 3, 1, 0, 0, 46, 31 },
  { 2210, 3, 1, 0, 0, 46, 31 },
  { 2213, 3, 1, 0, 0, 46, 31 },
  { 2216, 3, 1, 0, 0, 46, 31 },
  { 2219, 3, 1, 0, 0, 46, 31 },
  { 2222, 3, 1, 0, 0, 46, 31 },
  { 2577, 3, 1, 0, 0, 46, 31 },
  { 2580, 3, 1, 0, 0, 46, 31 },
  { 2583, 3, 1, 0, 0, 46, 31 },
  { 2586, 3, 1, 0, 0, 46, 31 },
  { 2589, 3, 1, 0, 0, 46, 31 },
  { 2592, 3, 1, 0, 0, 46, 31 },
  { 2595, 3, 1, 0, 0, 46, 31 },
  { 2598, 3, 1, 0, 0, 46, 31 },
  { 2601, 3, 1, 0, 0, 46, 31 },
  { 2604, 3, 1, 0, 0, 46, 31 },
  { 2607, 3, 1, 0, 0, 46, 31 },
  { 2962, 3, 1, 0, 0, 45, 31 },
  { 2965, 3, 1, 0, 0, 45, 31 },
  { 2968, 3, 1, 0, 0, 45, 31 },
  { 2971, 3, 1, 0, 0, 45, 31 },
  { 2974, 3, 1, 0, 0, 45, 31 },
  { 2977, 3, 1, 0, 0, 45, 31 },
  { 2980, 3, 1, 0, 0, 45, 31 },
  { 2983, 3, 1, 0, 0, 45, 31 },
  { 2986, 3, 1, 0, 0, 45, 31 },
  { 2989, 3, 1, 0, 0, 45, 31 },
  { 2992, 3, 1, 0, 0, 45, 31 },
  { 3347, 3, 1, 0, 0, 43, 31 },
  { 3350, 3, 1, 0, 0, 43, 31 },
  { 3353, 3, 1, 0, 0, 43, 31 },
  { 3356, 3, 1, 0, 0, 43, 31 },
  { 3359, 3, 1, 0, 0, 43, 31 },
  { 3362, 3, 1, 0, 0, 43, 31 },
  { 3365, 3, 1, 0, 0, 43, 31 },
  { 3368, 3, 1, 0, 0, 43, 31 },
  { 3371, 3, 1, 0, 0, 43, 31 },
  { 3374, 3, 1, 0, 0, 43, 31 },
  { 3377, 3, 1, 0, 0, 43, 31 },
  // 926: vstore2, 
  { 1840, 4, 0, 0, 0, 46, 31 },
  { 1844, 4, 0, 0, 0, 46, 31 },
  { 1848, 4, 0, 0, 0, 46, 31 },
  { 1852, 4, 0, 0, 0, 46, 31 },
  { 1856, 4, 0, 0, 0, 46, 31 },
  { 1860, 4, 0, 0, 0, 46, 31 },
  { 1864, 4, 0, 0, 0, 46, 31 },
  { 1868, 4, 0, 0, 0, 46, 31 },
  { 1872, 4, 0, 0, 0, 46, 31 },
  { 1876, 4, 0, 0, 0, 46, 31 },
  { 1880, 4, 0, 0, 0, 46, 31 },
  { 2225, 4, 0, 0, 0, 46, 31 },
  { 2229, 4, 0, 0, 0, 46, 31 },
  { 2233, 4, 0, 0, 0, 46, 31 },
  { 2237, 4, 0, 0, 0, 46, 31 },
  { 2241, 4, 0, 0, 0, 46, 31 },
  { 2245, 4, 0, 0, 0, 46, 31 },
  { 2249, 4, 0, 0, 0, 46, 31 },
  { 2253, 4, 0, 0, 0, 46, 31 },
  { 2257, 4, 0, 0, 0, 46, 31 },
  { 2261, 4, 0, 0, 0, 46, 31 },
  { 2265, 4, 0, 0, 0, 46, 31 },
  { 2610, 4, 0, 0, 0, 46, 31 },
  { 2614, 4, 0, 0, 0, 46, 31 },
  { 2618, 4, 0, 0, 0, 46, 31 },
  { 2622, 4, 0, 0, 0, 46, 31 },
  { 2626, 4, 0, 0, 0, 46, 31 },
  { 2630, 4, 0, 0, 0, 46, 31 },
  { 2634, 4, 0, 0, 0, 46, 31 },
  { 2638, 4, 0, 0, 0, 46, 31 },
  { 2642, 4, 0, 0, 0, 46, 31 },
  { 2646, 4, 0, 0, 0, 46, 31 },
  { 2650, 4, 0, 0, 0, 46, 31 },
  { 2995, 4, 0, 0, 0, 45, 31 },
  { 2999, 4, 0, 0, 0, 45, 31 },
  { 3003, 4, 0, 0, 0, 45, 31 },
  { 3007, 4, 0, 0, 0, 45, 31 },
  { 3011, 4, 0, 0, 0, 45, 31 },
  { 3015, 4, 0, 0, 0, 45, 31 },
  { 3019, 4, 0, 0, 0, 45, 31 },
  { 3023, 4, 0, 0, 0, 45, 31 },
  { 3027, 4, 0, 0, 0, 45, 31 },
  { 3031, 4, 0, 0, 0, 45, 31 },
  { 3035, 4, 0, 0, 0, 45, 31 },
  // 970: vload3, 
  { 1884, 3, 1, 0, 0, 46, 31 },
  { 1887, 3, 1, 0, 0, 46, 31 },
  { 1890, 3, 1, 0, 0, 46, 31 },
  { 1893, 3, 1, 0, 0, 46, 31 },
  { 1896, 3, 1, 0, 0, 46, 31 },
  { 1899, 3, 1, 0, 0, 46, 31 },
  { 1902, 3, 1, 0, 0, 46, 31 },
  { 1905, 3, 1, 0, 0, 46, 31 },
  { 1908, 3, 1, 0, 0, 46, 31 },
  { 1911, 3, 1, 0, 0, 46, 31 },
  { 1914, 3, 1, 0, 0, 46, 31 },
  { 2269, 3, 1, 0, 0, 46, 31 },
  { 2272, 3, 1, 0, 0, 46, 31 },
  { 2275, 3, 1, 0, 0, 46, 31 },
  { 2278, 3, 1, 0, 0, 46, 31 },
  { 2281, 3, 1, 0, 0, 46, 31 },
  { 2284, 3, 1, 0, 0, 46, 31 },
  { 2287, 3, 1, 0, 0, 46, 31 },
  { 2290, 3, 1, 0, 0, 46, 31 },
  { 2293, 3, 1, 0, 0, 46, 31 },
  { 2296, 3, 1, 0, 0, 46, 31 },
  { 2299, 3, 1, 0, 0, 46, 31 },
  { 2654, 3, 1, 0, 0, 46, 31 },
  { 2657, 3, 1, 0, 0, 46, 31 },
  { 2660, 3, 1, 0, 0, 46, 31 },
  { 2663, 3, 1, 0, 0, 46, 31 },
  { 2666, 3, 1, 0, 0, 46, 31 },
  { 2669, 3, 1, 0, 0, 46, 31 },
  { 2672, 3, 1, 0, 0, 46, 31 },
  { 2675, 3, 1, 0, 0, 46, 31 },
  { 2678, 3, 1, 0, 0, 46, 31 },
  { 2681, 3, 1, 0, 0, 46, 31 },
  { 2684, 3, 1, 0, 0, 46, 31 },
  { 3039, 3, 1, 0, 0, 45, 31 },
  { 3042, 3, 1, 0, 0, 45, 31 },
  { 3045, 3, 1, 0, 0, 45, 31 },
  { 3048, 3, 1, 0, 0, 45, 31 },
  { 3051, 3, 1, 0, 0, 45, 31 },
  { 3054, 3, 1, 0, 0, 45, 31 },
  { 3057, 3, 1, 0, 0, 45, 31 },
  { 3060, 3, 1, 0, 0, 45, 31 },
  { 3063, 3, 1, 0, 0, 45, 31 },
  { 3066, 3, 1, 0, 0, 45, 31 },
  { 3069, 3, 1, 0, 0, 45, 31 },
  { 3380, 3, 1, 0, 0, 43, 31 },
  { 3383, 3, 1, 0, 0, 43, 31 },
  { 3386, 3, 1, 0, 0, 43, 31 },
  { 3389, 3, 1, 0, 0, 43, 31 },
  { 3392, 3, 1, 0, 0, 43, 31 },
  { 3395, 3, 1, 0, 0, 43, 31 },
  { 3398, 3, 1, 0, 0, 43, 31 },
  { 3401, 3, 1, 0, 0, 43, 31 },
  { 3404, 3, 1, 0, 0, 43, 31 },
  { 3407, 3, 1, 0, 0, 43, 31 },
  { 3410, 3, 1, 0, 0, 43, 31 },
  // 1025: vstore3, 
  { 1917, 4, 0, 0, 0, 46, 31 },
  { 1921, 4, 0, 0, 0, 46, 31 },
  { 1925, 4, 0, 0, 0, 46, 31 },
  { 1929, 4, 0, 0, 0, 46, 31 },
  { 1933, 4, 0, 0, 0, 46, 31 },
  { 1937, 4, 0, 0, 0, 46, 31 },
  { 1941, 4, 0, 0, 0, 46, 31 },
  { 1945, 4, 0, 0, 0, 46, 31 },
  { 1949, 4, 0, 0, 0, 46, 31 },
  { 1953, 4, 0, 0, 0, 46, 31 },
  { 1957, 4, 0, 0, 0, 46, 31 },
  { 2302, 4, 0, 0, 0, 46, 31 },
  { 2306, 4, 0, 0, 0, 46, 31 },
  { 2310, 4, 0, 0, 0, 46, 31 },
  { 2314, 4, 0, 0, 0, 46, 31 },
  { 2318, 4, 0, 0, 0, 46, 31 },
  { 2322, 4, 0, 0, 0, 46, 31 },
  { 2326, 4, 0, 0, 0, 46, 31 },
  { 2330, 4, 0, 0, 0, 46, 31 },
  { 2334, 4, 0, 0, 0, 46, 31 },
  { 2338, 4, 0, 0, 0, 46, 31 },
  { 2342, 4, 0, 0, 0, 46, 31 },
  { 2687, 4, 0, 0, 0, 46, 31 },
  { 2691, 4, 0, 0, 0, 46, 31 },
  { 2695, 4, 0, 0, 0, 46, 31 },
  { 2699, 4, 0, 0, 0, 46, 31 },
  { 2703, 4, 0, 0, 0, 46, 31 },
  { 2707, 4, 0, 0, 0, 46, 31 },
  { 2711, 4, 0, 0, 0, 46, 31 },
  { 2715, 4, 0, 0, 0, 46, 31 },
  { 2719, 4, 0, 0, 0, 46, 31 },
  { 2723, 4, 0, 0, 0, 46, 31 },
  { 2727, 4, 0, 0, 0, 46, 31 },
  { 3072, 4, 0, 0, 0, 45, 31 },
  { 3076, 4, 0, 0, 0, 45, 31 },
  { 3080, 4, 0, 0, 0, 45, 31 },
  { 3084, 4, 0, 0, 0, 45, 31 },
  { 3088, 4, 0, 0, 0, 45, 31 },
  { 3092, 4, 0, 0, 0, 45, 31 },
  { 3096, 4, 0, 0, 0, 45, 31 },
  { 3100, 4, 0, 0, 0, 45, 31 },
  { 3104, 4, 0, 0, 0, 45, 31 },
  { 3108, 4, 0, 0, 0, 45, 31 },
  { 3112, 4, 0, 0, 0, 45, 31 },
  // 1069: vload4, 
  { 1961, 3, 1, 0, 0, 46, 31 },
  { 1964, 3, 1, 0, 0, 46, 31 },
  { 1967, 3, 1, 0, 0, 46, 31 },
  { 1970, 3, 1, 0, 0, 46, 31 },
  { 1973, 3, 1, 0, 0, 46, 31 },
  { 1976, 3, 1, 0, 0, 46, 31 },
  { 1979, 3, 1, 0, 0, 46, 31 },
  { 1982, 3, 1, 0, 0, 46, 31 },
  { 1985, 3, 1, 0, 0, 46, 31 },
  { 1988, 3, 1, 0, 0, 46, 31 },
  { 1991, 3, 1, 0, 0, 46, 31 },
  { 2346, 3, 1, 0, 0, 46, 31 },
  { 2349, 3, 1, 0, 0, 46, 31 },
  { 2352, 3, 1, 0, 0, 46, 31 },
  { 2355, 3, 1, 0, 0, 46, 31 },
  { 2358, 3, 1, 0, 0, 46, 31 },
  { 2361, 3, 1, 0, 0, 46, 31 },
  { 2364, 3, 1, 0, 0, 46, 31 },
  { 2367, 3, 1, 0, 0, 46, 31 },
  { 2370, 3, 1, 0, 0, 46, 31 },
  { 2373, 3, 1, 0, 0, 46, 31 },
  { 2376, 3, 1, 0, 0, 46, 31 },
  { 2731, 3, 1, 0, 0, 46, 31 },
  { 2734, 3, 1, 0, 0, 46, 31 },
  { 2737, 3, 1, 0, 0, 46, 31 },
  { 2740, 3, 1, 0, 0, 46, 31 },
  { 2743, 3, 1, 0, 0, 46, 31 },
  { 2746, 3, 1, 0, 0, 46, 31 },
  { 2749, 3, 1, 0, 0, 46, 31 },
  { 2752, 3, 1, 0, 0, 46, 31 },
  { 2755, 3, 1, 0, 0, 46, 31 },
  { 2758, 3, 1, 0, 0, 46, 31 },
  { 2761, 3, 1, 0, 0, 46, 31 },
  { 3116, 3, 1, 0, 0, 45, 31 },
  { 3119, 3, 1, 0, 0, 45, 31 },
  { 3122, 3, 1, 0, 0, 45, 31 },
  { 3125, 3, 1, 0, 0, 45, 31 },
  { 3128, 3, 1, 0, 0, 45, 31 },
  { 3131, 3, 1, 0, 0, 45, 31 },
  { 3134, 3, 1, 0, 0, 45, 31 },
  { 3137, 3, 1, 0, 0, 45, 31 },
  { 3140, 3, 1, 0, 0, 45, 31 },
  { 3143, 3, 1, 0, 0, 45, 31 },
  { 3146, 3, 1, 0, 0, 45, 31 },
  { 3413, 3, 1, 0, 0, 43, 31 },
  { 3416, 3, 1, 0, 0, 43, 31 },
  { 3419, 3, 1, 0, 0, 43, 31 },
  { 3422, 3, 1, 0, 0, 43, 31 },
  { 3425, 3, 1, 0, 0, 43, 31 },
  { 3428, 3, 1, 0, 0, 43, 31 },
  { 3431, 3, 1, 0, 0, 43, 31 },
  { 3434, 3, 1, 0, 0, 43, 31 },
  { 3437, 3, 1, 0, 0, 43, 31 },
  { 3440, 3, 1, 0, 0, 43, 31 },
  { 3443, 3, 1, 0, 0, 43, 31 },
  // 1124: vstore4, 
  { 1994, 4, 0, 0, 0, 46, 31 },
  { 1998, 4, 0, 0, 0, 46, 31 },
  { 2002, 4, 0, 0, 0, 46, 31 },
  { 2006, 4, 0, 0, 0, 46, 31 },
  { 2010, 4, 0, 0, 0, 46, 31 },
  { 2014, 4, 0, 0, 0, 46, 31 },
  { 2018, 4, 0, 0, 0, 46, 31 },
  { 2022, 4, 0, 0, 0, 46, 31 },
  { 2026, 4, 0, 0, 0, 46, 31 },
  { 2030, 4, 0, 0, 0, 46, 31 },
  { 2034, 4, 0, 0, 0, 46, 31 },
  { 2379, 4, 0, 0, 0, 46, 31 },
  { 2383, 4, 0, 0, 0, 46, 31 },
  { 2387, 4, 0, 0, 0, 46, 31 },
  { 2391, 4, 0, 0, 0, 46, 31 },
  { 2395, 4, 0, 0, 0, 46, 31 },
  { 2399, 4, 0, 0, 0, 46, 31 },
  { 2403, 4, 0, 0, 0, 46, 31 },
  { 2407, 4, 0, 0, 0, 46, 31 },
  { 2411, 4, 0, 0, 0, 46, 31 },
  { 2415, 4, 0, 0, 0, 46, 31 },
  { 2419, 4, 0, 0, 0, 46, 31 },
  { 2764, 4, 0, 0, 0, 46, 31 },
  { 2768, 4, 0, 0, 0, 46, 31 },
  { 2772, 4, 0, 0, 0, 46, 31 },
  { 2776, 4, 0, 0, 0, 46, 31 },
  { 2780, 4, 0, 0, 0, 46, 31 },
  { 2784, 4, 0, 0, 0, 46, 31 },
  { 2788, 4, 0, 0, 0, 46, 31 },
  { 2792, 4, 0, 0, 0, 46, 31 },
  { 2796, 4, 0, 0, 0, 46, 31 },
  { 2800, 4, 0, 0, 0, 46, 31 },
  { 2804, 4, 0, 0, 0, 46, 31 },
  { 3149, 4, 0, 0, 0, 45, 31 },
  { 3153, 4, 0, 0, 0, 45, 31 },
  { 3157, 4, 0, 0, 0, 45, 31 },
  { 3161, 4, 0, 0, 0, 45, 31 },
  { 3165, 4, 0, 0, 0, 45, 31 },
  { 3169, 4, 0, 0, 0, 45, 31 },
  { 3173, 4, 0, 0, 0, 45, 31 },
  { 3177, 4, 0, 0, 0, 45, 31 },
  { 3181, 4, 0, 0, 0, 45, 31 },
  { 3185, 4, 0, 0, 0, 45, 31 },
  { 3189, 4, 0, 0, 0, 45, 31 },
  // 1168: vload8, 
  { 2038, 3, 1, 0, 0, 46, 31 },
  { 2041, 3, 1, 0, 0, 46, 31 },
  { 2044, 3, 1, 0, 0, 46, 31 },
  { 2047, 3, 1, 0, 0, 46, 31 },
  { 2050, 3, 1, 0, 0, 46, 31 },
  { 2053, 3, 1, 0, 0, 46, 31 },
  { 2056, 3, 1, 0, 0, 46, 31 },
  { 2059, 3, 1, 0, 0, 46, 31 },
  { 2062, 3, 1, 0, 0, 46, 31 },
  { 2065, 3, 1, 0, 0, 46, 31 },
  { 2068, 3, 1, 0, 0, 46, 31 },
  { 2423, 3, 1, 0, 0, 46, 31 },
  { 2426, 3, 1, 0, 0, 46, 31 },
  { 2429, 3, 1, 0, 0, 46, 31 },
  { 2432, 3, 1, 0, 0, 46, 31 },
  { 2435, 3, 1, 0, 0, 46, 31 },
  { 2438, 3, 1, 0, 0, 46, 31 },
  { 2441, 3, 1, 0, 0, 46, 31 },
  { 2444, 3, 1, 0, 0, 46, 31 },
  { 2447, 3, 1, 0, 0, 46, 31 },
  { 2450, 3, 1, 0, 0, 46, 31 },
  { 2453, 3, 1, 0, 0, 46, 31 },
  { 2808, 3, 1, 0, 0, 46, 31 },
  { 2811, 3, 1, 0, 0, 46, 31 },
  { 2814, 3, 1, 0, 0, 46, 31 },
  { 2817, 3, 1, 0, 0, 46, 31 },
  { 2820, 3, 1, 0, 0, 46, 31 },
  { 2823, 3, 1, 0, 0, 46, 31 },
  { 2826, 3, 1, 0, 0, 46, 31 },
  { 2829, 3, 1, 0, 0, 46, 31 },
  { 2832, 3, 1, 0, 0, 46, 31 },
  { 2835, 3, 1, 0, 0, 46, 31 },
  { 2838, 3, 1, 0, 0, 46, 31 },
  { 3193, 3, 1, 0, 0, 45, 31 },
  { 3196, 3, 1, 0, 0, 45, 31 },
  { 3199, 3, 1, 0, 0, 45, 31 },
  { 3202, 3, 1, 0, 0, 45, 31 },
  { 3205, 3, 1, 0, 0, 45, 31 },
  { 3208, 3, 1, 0, 0, 45, 31 },
  { 3211, 3, 1, 0, 0, 45, 31 },
  { 3214, 3, 1, 0, 0, 45, 31 },
  { 3217, 3, 1, 0, 0, 45, 31 },
  { 3220, 3, 1, 0, 0, 45, 31 },
  { 3223, 3, 1, 0, 0, 45, 31 },
  { 3446, 3, 1, 0, 0, 43, 31 },
  { 3449, 3, 1, 0, 0, 43, 31 },
  { 3452, 3, 1, 0, 0, 43, 31 },
  { 3455, 3, 1, 0, 0, 43, 31 },
  { 3458, 3, 1, 0, 0, 43, 31 },
  { 3461, 3, 1, 0, 0, 43, 31 },
  { 3464, 3, 1, 0, 0, 43, 31 },
  { 3467, 3, 1, 0, 0, 43, 31 },
  { 3470, 3, 1, 0, 0, 43, 31 },
  { 3473, 3, 1, 0, 0, 43, 31 },
  { 3476, 3, 1, 0, 0, 43, 31 },
  // 1223: vstore8, 
  { 2071, 4, 0, 0, 0, 46, 31 },
  { 2075, 4, 0, 0, 0, 46, 31 },
  { 2079, 4, 0, 0, 0, 46, 31 },
  { 2083, 4, 0, 0, 0, 46, 31 },
  { 2087, 4, 0, 0, 0, 46, 31 },
  { 2091, 4, 0, 0, 0, 46, 31 },
  { 2095, 4, 0, 0, 0, 46, 31 },
  { 2099, 4, 0, 0, 0, 46, 31 },
  { 2103, 4, 0, 0, 0, 46, 31 },
  { 2107, 4, 0, 0, 0, 46, 31 },
  { 2111, 4, 0, 0, 0, 46, 31 },
  { 2456, 4, 0, 0, 0, 46, 31 },
  { 2460, 4, 0, 0, 0, 46, 31 },
  { 2464, 4, 0, 0, 0, 46, 31 },
  { 2468, 4, 0, 0, 0, 46, 31 },
  { 2472, 4, 0, 0, 0, 46, 31 },
  { 2476, 4, 0, 0, 0, 46, 31 },
  { 2480, 4, 0, 0, 0, 46, 31 },
  { 2484, 4, 0, 0, 0, 46, 31 },
  { 2488, 4, 0, 0, 0, 46, 31 },
  { 2492, 4, 0, 0, 0, 46, 31 },
  { 2496, 4, 0, 0, 0, 46, 31 },
  { 2841, 4, 0, 0, 0, 46, 31 },
  { 2845, 4, 0, 0, 0, 46, 31 },
  { 2849, 4, 0, 0, 0, 46, 31 },
  { 2853, 4, 0, 0, 0, 46, 31 },
  { 2857, 4, 0, 0, 0, 46, 31 },
  { 2861, 4, 0, 0, 0, 46, 31 },
  { 2865, 4, 0, 0, 0, 46, 31 },
  { 2869, 4, 0, 0, 0, 46, 31 },
  { 2873, 4, 0, 0, 0, 46, 31 },
  { 2877, 4, 0, 0, 0, 46, 31 },
  { 2881, 4, 0, 0, 0, 46, 31 },
  { 3226, 4, 0, 0, 0, 45, 31 },
  { 3230, 4, 0, 0, 0, 45, 31 },
  { 3234, 4, 0, 0, 0, 45, 31 },
  { 3238, 4, 0, 0, 0, 45, 31 },
  { 3242, 4, 0, 0, 0, 45, 31 },
  { 3246, 4, 0, 0, 0, 45, 31 },
  { 3250, 4, 0, 0, 0, 45, 31 },
  { 3254, 4, 0, 0, 0, 45, 31 },
  { 3258, 4, 0, 0, 0, 45, 31 },
  { 3262, 4, 0, 0, 0, 45, 31 },
  { 3266, 4, 0, 0, 0, 45, 31 },
  // 1267: vload16, 
  { 2115, 3, 1, 0, 0, 46, 31 },
  { 2118, 3, 1, 0, 0, 46, 31 },
  { 2121, 3, 1, 0, 0, 46, 31 },
  { 2124, 3, 1, 0, 0, 46, 31 },
  { 2127, 3, 1, 0, 0, 46, 31 },
  { 2130, 3, 1, 0, 0, 46, 31 },
  { 2133, 3, 1, 0, 0, 46, 31 },
  { 2136, 3, 1, 0, 0, 46, 31 },
  { 2139, 3, 1, 0, 0, 46, 31 },
  { 2142, 3, 1, 0, 0, 46, 31 },
  { 2145, 3, 1, 0, 0, 46, 31 },
  { 2500, 3, 1, 0, 0, 46, 31 },
  { 2503, 3, 1, 0, 0, 46, 31 },
  { 2506, 3, 1, 0, 0, 46, 31 },
  { 2509, 3, 1, 0, 0, 46, 31 },
  { 2512, 3, 1, 0, 0, 46, 31 },
  { 2515, 3, 1, 0, 0, 46, 31 },
  { 2518, 3, 1, 0, 0, 46, 31 },
  { 2521, 3, 1, 0, 0, 46, 31 },
  { 2524, 3, 1, 0, 0, 46, 31 },
  { 2527, 3, 1, 0, 0, 46, 31 },
  { 2530, 3, 1, 0, 0, 46, 31 },
  { 2885, 3, 1, 0, 0, 46, 31 },
  { 2888, 3, 1, 0, 0, 46, 31 },
  { 2891, 3, 1, 0, 0, 46, 31 },
  { 2894, 3, 1, 0, 0, 46, 31 },
  { 2897, 3, 1, 0, 0, 46, 31 },
  { 2900, 3, 1, 0, 0, 46, 31 },
  { 2903, 3, 1, 0, 0, 46, 31 },
  { 2906, 3, 1, 0, 0, 46, 31 },
  { 2909, 3, 1, 0, 0, 46, 31 },
  { 2912, 3, 1, 0, 0, 46, 31 },
  { 2915, 3, 1, 0, 0, 46, 31 },
  { 3270, 3, 1, 0, 0, 45, 31 },
  { 3273, 3, 1, 0, 0, 45, 31 },
  { 3276, 3, 1, 0, 0, 45, 31 },
  { 3279, 3, 1, 0, 0, 45, 31 },
  { 3282, 3, 1, 0, 0, 45, 31 },
  { 3285, 3, 1, 0, 0, 45, 31 },
  { 3288, 3, 1, 0, 0, 45, 31 },
  { 3291, 3, 1, 0, 0, 45, 31 },
  { 3294, 3, 1, 0, 0, 45, 31 },
  { 3297, 3, 1, 0, 0, 45, 31 },
  { 3300, 3, 1, 0, 0, 45, 31 },
  { 3479, 3, 1, 0, 0, 43, 31 },
  { 3482, 3, 1, 0, 0, 43, 31 },
  { 3485, 3, 1, 0, 0, 43, 31 },
  { 3488, 3, 1, 0, 0, 43, 31 },
  { 3491, 3, 1, 0, 0, 43, 31 },
  { 3494, 3, 1, 0, 0, 43, 31 },
  { 3497, 3, 1, 0, 0, 43, 31 },
  { 3500, 3, 1, 0, 0, 43, 31 },
  { 3503, 3, 1, 0, 0, 43, 31 },
  { 3506, 3, 1, 0, 0, 43, 31 },
  { 3509, 3, 1, 0, 0, 43, 31 },
  // 1322: vstore16, 
  { 2148, 4, 0, 0, 0, 46, 31 },
  { 2152, 4, 0, 0, 0, 46, 31 },
  { 2156, 4, 0, 0, 0, 46, 31 },
  { 2160, 4, 0, 0, 0, 46, 31 },
  { 2164, 4, 0, 0, 0, 46, 31 },
  { 2168, 4, 0, 0, 0, 46, 31 },
  { 2172, 4, 0, 0, 0, 46, 31 },
  { 2176, 4, 0, 0, 0, 46, 31 },
  { 2180, 4, 0, 0, 0, 46, 31 },
  { 2184, 4, 0, 0, 0, 46, 31 },
  { 2188, 4, 0, 0, 0, 46, 31 },
  { 2533, 4, 0, 0, 0, 46, 31 },
  { 2537, 4, 0, 0, 0, 46, 31 },
  { 2541, 4, 0, 0, 0, 46, 31 },
  { 2545, 4, 0, 0, 0, 46, 31 },
  { 2549, 4, 0, 0, 0, 46, 31 },
  { 2553, 4, 0, 0, 0, 46, 31 },
  { 2557, 4, 0, 0, 0, 46, 31 },
  { 2561, 4, 0, 0, 0, 46, 31 },
  { 2565, 4, 0, 0, 0, 46, 31 },
  { 2569, 4, 0, 0, 0, 46, 31 },
  { 2573, 4, 0, 0, 0, 46, 31 },
  { 2918, 4, 0, 0, 0, 46, 31 },
  { 2922, 4, 0, 0, 0, 46, 31 },
  { 2926, 4, 0, 0, 0, 46, 31 },
  { 2930, 4, 0, 0, 0, 46, 31 },
  { 2934, 4, 0, 0, 0, 46, 31 },
  { 2938, 4, 0, 0, 0, 46, 31 },
  { 2942, 4, 0, 0, 0, 46, 31 },
  { 2946, 4, 0, 0, 0, 46, 31 },
  { 2950, 4, 0, 0, 0, 46, 31 },
  { 2954, 4, 0, 0, 0, 46, 31 },
  { 2958, 4, 0, 0, 0, 46, 31 },
  { 3303, 4, 0, 0, 0, 45, 31 },
  { 3307, 4, 0, 0, 0, 45, 31 },
  { 3311, 4, 0, 0, 0, 45, 31 },
  { 3315, 4, 0, 0, 0, 45, 31 },
  { 3319, 4, 0, 0, 0, 45, 31 },
  { 3323, 4, 0, 0, 0, 45, 31 },
  { 3327, 4, 0, 0, 0, 45, 31 },
  { 3331, 4, 0, 0, 0, 45, 31 },
  { 3335, 4, 0, 0, 0, 45, 31 },
  { 3339, 4, 0, 0, 0, 45, 31 },
  { 3343, 4, 0, 0, 0, 45, 31 },
  // 1366: vload_half, 
  { 3512, 3, 1, 0, 0, 46, 31 },
  { 3578, 3, 1, 0, 0, 46, 31 },
  { 3644, 3, 1, 0, 0, 46, 31 },
  { 3710, 3, 1, 0, 0, 45, 31 },
  { 3776, 3, 1, 0, 0, 43, 31 },
  // 1371: vload_half2, vloada_half2, 
  { 3515, 3, 1, 0, 0, 46, 31 },
  { 3581, 3, 1, 0, 0, 46, 31 },
  { 3647, 3, 1, 0, 0, 46, 31 },
  { 3713, 3, 1, 0, 0, 45, 31 },
  { 3779, 3, 1, 0, 0, 43, 31 },
  // 1376: vstore_half, vstore_half_rte, vstore_half_rtz, vstore_half_rtp, vstore_half_rtn, 
  { 3518, 4, 0, 0, 0, 46, 31 },
  { 3522, 4, 0, 0, 0, 46, 31 },
  { 3596, 4, 0, 0, 0, 46, 31 },
  { 3600, 4, 0, 0, 0, 46, 31 },
  { 3662, 4, 0, 0, 0, 46, 31 },
  { 3666, 4, 0, 0, 0, 46, 31 },
  { 3728, 4, 0, 0, 0, 45, 31 },
  { 3732, 4, 0, 0, 0, 45, 31 },
  // 1384: vstore_half2, vstorea_half2, vstore_half2_rte, vstorea_half2_rte, vstore_half2_rtz, vstorea_half2_rtz, vstore_half2_rtp, vstorea_half2_rtp, vstore_half2_rtn, vstorea_half2_rtn, 
  { 3526, 4, 0, 0, 0, 46, 31 },
  { 3530, 4, 0, 0, 0, 46, 31 },
  { 3604, 4, 0, 0, 0, 46, 31 },
  { 3608, 4, 0, 0, 0, 46, 31 },
  { 3670, 4, 0, 0, 0, 46, 31 },
  { 3674, 4, 0, 0, 0, 46, 31 },
  { 3736, 4, 0, 0, 0, 45, 31 },
  { 3740, 4, 0, 0, 0, 45, 31 },
  // 1392: vload_half3, vloada_half3, 
  { 3534, 3, 1, 0, 0, 46, 31 },
  { 3584, 3, 1, 0, 0, 46, 31 },
  { 3650, 3, 1, 0, 0, 46, 31 },
  { 3716, 3, 1, 0, 0, 45, 31 },
  { 3782, 3, 1, 0, 0, 43, 31 },
  // 1397: vload_half4, vloada_half4, 
  { 3537, 3, 1, 0, 0, 46, 31 },
  { 3587, 3, 1, 0, 0, 46, 31 },
  { 3653, 3, 1, 0, 0, 46, 31 },
  { 3719, 3, 1, 0, 0, 45, 31 },
  { 3785, 3, 1, 0, 0, 43, 31 },
  // 1402: vload_half8, vloada_half8, 
  { 3540, 3, 1, 0, 0, 46, 31 },
  { 3590, 3, 1, 0, 0, 46, 31 },
  { 3656, 3, 1, 0, 0, 46, 31 },
  { 3722, 3, 1, 0, 0, 45, 31 },
  { 3788, 3, 1, 0, 0, 43, 31 },
  // 1407: vload_half16, vloada_half16, 
  { 3543, 3, 1, 0, 0, 46, 31 },
  { 3593, 3, 1, 0, 0, 46, 31 },
  { 3659, 3, 1, 0, 0, 46, 31 },
  { 3725, 3, 1, 0, 0, 45, 31 },
  { 3791, 3, 1, 0, 0, 43, 31 },
  // 1412: vstore_half3, vstorea_half3, vstore_half3_rte, vstorea_half3_rte, vstore_half3_rtz, vstorea_half3_rtz, vstore_half3_rtp, vstorea_half3_rtp, vstore_half3_rtn, vstorea_half3_rtn, 
  { 3546, 4, 0, 0, 0, 46, 31 },
  { 3550, 4, 0, 0, 0, 46, 31 },
  { 3612, 4, 0, 0, 0, 46, 31 },
  { 3616, 4, 0, 0, 0, 46, 31 },
  { 3678, 4, 0, 0, 0, 46, 31 },
  { 3682, 4, 0, 0, 0, 46, 31 },
  { 3744, 4, 0, 0, 0, 45, 31 },
  { 3748, 4, 0, 0, 0, 45, 31 },
  // 1420: vstore_half4, vstorea_half4, vstore_half4_rte, vstorea_half4_rte, vstore_half4_rtz, vstorea_half4_rtz, vstore_half4_rtp, vstorea_half4_rtp, vstore_half4_rtn, vstorea_half4_rtn, 
  { 3554, 4, 0, 0, 0, 46, 31 },
  { 3558, 4, 0, 0, 0, 46, 31 },
  { 3620, 4, 0, 0, 0, 46, 31 },
  { 3624, 4, 0, 0, 0, 46, 31 },
  { 3686, 4, 0, 0, 0, 46, 31 },
  { 3690, 4, 0, 0, 0, 46, 31 },
  { 3752, 4, 0, 0, 0, 45, 31 },
  { 3756, 4, 0, 0, 0, 45, 31 },
  // 1428: vstore_half8, vstorea_half8, vstore_half8_rte, vstorea_half8_rte, vstore_half8_rtz, vstorea_half8_rtz, vstore_half8_rtp, vstorea_half8_rtp, vstore_half8_rtn, vstorea_half8_rtn, 
  { 3562, 4, 0, 0, 0, 46, 31 },
  { 3566, 4, 0, 0, 0, 46, 31 },
  { 3628, 4, 0, 0, 0, 46, 31 },
  { 3632, 4, 0, 0, 0, 46, 31 },
  { 3694, 4, 0, 0, 0, 46, 31 },
  { 3698, 4, 0, 0, 0, 46, 31 },
  { 3760, 4, 0, 0, 0, 45, 31 },
  { 3764, 4, 0, 0, 0, 45, 31 },
  // 1436: vstore_half16, vstorea_half16, vstore_half16_rte, vstorea_half16_rte, vstore_half16_rtz, vstorea_half16_rtz, vstore_half16_rtp, vstorea_half16_rtp, vstore_half16_rtn, vstorea_half16_rtn, 
  { 3570, 4, 0, 0, 0, 46, 31 },
  { 3574, 4, 0, 0, 0, 46, 31 },
  { 3636, 4, 0, 0, 0, 46, 31 },
  { 3640, 4, 0, 0, 0, 46, 31 },
  { 3702, 4, 0, 0, 0, 46, 31 },
  { 3706, 4, 0, 0, 0, 46, 31 },
  { 3768, 4, 0, 0, 0, 45, 31 },
  { 3772, 4, 0, 0, 0, 45, 31 },
  // 1444: barrier, 
  { 3794, 2, 0, 0, 1, 43, 31 },
  // 1445: work_group_barrier, 
  { 3794, 2, 0, 0, 1, 43, 24 },
  { 3796, 3, 0, 0, 1, 43, 24 },
  // 1447: mem_fence, read_mem_fence, write_mem_fence, 
  { 3794, 2, 0, 0, 0, 43, 31 },
  // 1448: get_fence, 
  { 3799, 2, 0, 0, 0, 45, 31 },
  { 3801, 2, 0, 0, 0, 45, 31 },
  // 1450: async_work_group_copy, 
  { 3803, 5, 0, 0, 0, 43, 31 },
  { 3808, 5, 0, 0, 0, 43, 31 },
  // 1452: async_work_group_strided_copy, 
  { 3813, 6, 0, 0, 0, 43, 31 },
  { 3819, 6, 0, 0, 0, 43, 31 },
  // 1454: wait_group_events, 
  { 3825, 3, 0, 0, 0, 43, 31 },
  // 1455: prefetch, 
  { 3828, 3, 0, 0, 0, 43, 31 },
  // 1456: atom_add, atom_sub, atom_xchg, 
  { 3831, 3, 0, 0, 0, 27, 31 },
  { 3840, 3, 0, 0, 0, 27, 31 },
  { 3849, 3, 0, 0, 0, 31, 31 },
  { 3858, 3, 0, 0, 0, 31, 31 },
  { 3867, 3, 0, 0, 0, 29, 31 },
  { 3876, 3, 0, 0, 0, 29, 31 },
  { 3885, 3, 0, 0, 0, 29, 31 },
  { 3894, 3, 0, 0, 0, 29, 31 },
  // 1464: atom_inc, atom_dec, 
  { 3834, 2, 0, 0, 0, 27, 31 },
  { 3843, 2, 0, 0, 0, 27, 31 },
  { 3852, 2, 0, 0, 0, 31, 31 },
  { 3861, 2, 0, 0, 0, 31, 31 },
  { 3870, 2, 0, 0, 0, 29, 31 },
  { 3879, 2, 0, 0, 0, 29, 31 },
  { 3888, 2, 0, 0, 0, 29, 31 },
  { 3897, 2, 0, 0, 0, 29, 31 },
  // 1472: atom_cmpxchg, 
  { 3836, 4, 0, 0, 0, 27, 31 },
  { 3845, 4, 0, 0, 0, 27, 31 },
  { 3854, 4, 0, 0, 0, 31, 31 },
  { 3863, 4, 0, 0, 0, 31, 31 },
  { 3872, 4, 0, 0, 0, 29, 31 },
  { 3881, 4, 0, 0, 0, 29, 31 },
  { 3890, 4, 0, 0, 0, 29, 31 },
  { 3899, 4, 0, 0, 0, 29, 31 },
  // 1480: atom_min, atom_max, atom_and, atom_or, atom_xor, 
  { 3831, 3, 0, 0, 0, 28, 31 },
  { 3840, 3, 0, 0, 0, 28, 31 },
  { 3849, 3, 0, 0, 0, 32, 31 },
  { 3858, 3, 0, 0, 0, 32, 31 },
  { 3867, 3, 0, 0, 0, 30, 31 },
  { 3876, 3, 0, 0, 0, 30, 31 },
  { 3885, 3, 0, 0, 0, 30, 31 },
  { 3894, 3, 0, 0, 0, 30, 31 },
  // 1488: atomic_xchg, 
  { 3903, 3, 0, 0, 0, 43, 31 },
  { 3831, 3, 0, 0, 0, 43, 31 },
  { 3840, 3, 0, 0, 0, 43, 31 },
  { 3906, 3, 0, 0, 0, 43, 31 },
  { 3849, 3, 0, 0, 0, 43, 31 },
  { 3858, 3, 0, 0, 0, 43, 31 },
  { 3909, 3, 0, 0, 0, 50, 31 },
  { 3918, 3, 0, 0, 0, 50, 31 },
  // 1496: atomic_add, atomic_sub, atomic_min, atomic_max, atomic_and, atomic_or, atomic_xor, 
  { 3831, 3, 0, 0, 0, 43, 31 },
  { 3840, 3, 0, 0, 0, 43, 31 },
  { 3849, 3, 0, 0, 0, 43, 31 },
  { 3858, 3, 0, 0, 0, 43, 31 },
  { 3909, 3, 0, 0, 0, 50, 31 },
  { 3918, 3, 0, 0, 0, 50, 31 },
  // 1502: atomic_inc, atomic_dec, 
  { 3834, 2, 0, 0, 0, 43, 31 },
  { 3843, 2, 0, 0, 0, 43, 31 },
  { 3852, 2, 0, 0, 0, 43, 31 },
  { 3861, 2, 0, 0, 0, 43, 31 },
  { 3912, 2, 0, 0, 0, 50, 31 },
  { 3921, 2, 0, 0, 0, 50, 31 },
  // 1508: atomic_cmpxchg, 
  { 3836, 4, 0, 0, 0, 43, 31 },
  { 3845, 4, 0, 0, 0, 43, 31 },
  { 3854, 4, 0, 0, 0, 43, 31 },
  { 3863, 4, 0, 0, 0, 43, 31 },
  { 3914, 4, 0, 0, 0, 50, 31 },
  { 3923, 4, 0, 0, 0, 50, 31 },
  // 1514: atomic_store, 
  { 3927, 3, 0, 0, 0, 51, 24 },
  { 3981, 3, 0, 0, 0, 51, 24 },
  { 4031, 3, 0, 0, 0, 51, 24 },
  { 4081, 3, 0, 0, 0, 51, 24 },
  { 4131, 3, 0, 0, 0, 51, 24 },
  { 4181, 3, 0, 0, 0, 51, 24 },
  { 4261, 3, 0, 0, 0, 53, 24 },
  { 4345, 3, 0, 0, 0, 53, 24 },
  { 4429, 3, 0, 0, 0, 53, 24 },
  { 4513, 3, 0, 0, 0, 53, 24 },
  { 4597, 3, 0, 0, 0, 53, 24 },
  { 4681, 3, 0, 0, 0, 53, 24 },
  { 4795, 3, 0, 0, 0, 53, 24 },
  { 4879, 3, 0, 0, 0, 53, 24 },
  { 4963, 3, 0, 0, 0, 53, 24 },
  { 5047, 3, 0, 0, 0, 53, 24 },
  { 5131, 3, 0, 0, 0, 53, 24 },
  { 5215, 3, 0, 0, 0, 53, 24 },
  { 5329, 3, 0, 0, 0, 55, 24 },
  { 5362, 3, 0, 0, 0, 69, 24 },
  { 5395, 3, 0, 0, 0, 83, 24 },
  // 1535: atomic_store_explicit, 
  { 3930, 4, 0, 0, 0, 52, 24 },
  { 3934, 5, 0, 0, 0, 45, 24 },
  { 3984, 4, 0, 0, 0, 52, 24 },
  { 3988, 5, 0, 0, 0, 45, 24 },
  { 4034, 4, 0, 0, 0, 52, 24 },
  { 4038, 5, 0, 0, 0, 45, 24 },
  { 4084, 4, 0, 0, 0, 52, 24 },
  { 4088, 5, 0, 0, 0, 45, 24 },
  { 4134, 4, 0, 0, 0, 52, 24 },
  { 4138, 5, 0, 0, 0, 45, 24 },
  { 4184, 4, 0, 0, 0, 52, 24 },
  { 4188, 5, 0, 0, 0, 45, 24 },
  { 4264, 4, 0, 0, 0, 54, 24 },
  { 4268, 5, 0, 0, 0, 46, 24 },
  { 4348, 4, 0, 0, 0, 54, 24 },
  { 4352, 5, 0, 0, 0, 46, 24 },
  { 4432, 4, 0, 0, 0, 54, 24 },
  { 4436, 5, 0, 0, 0, 46, 24 },
  { 4516, 4, 0, 0, 0, 54, 24 },
  { 4520, 5, 0, 0, 0, 46, 24 },
  { 4600, 4, 0, 0, 0, 54, 24 },
  { 4604, 5, 0, 0, 0, 46, 24 },
  { 4684, 4, 0, 0, 0, 54, 24 },
  { 4688, 5, 0, 0, 0, 46, 24 },
  { 4798, 4, 0, 0, 0, 54, 24 },
  { 4802, 5, 0, 0, 0, 46, 24 },
  { 4882, 4, 0, 0, 0, 54, 24 },
  { 4886, 5, 0, 0, 0, 46, 24 },
  { 4966, 4, 0, 0, 0, 54, 24 },
  { 4970, 5, 0, 0, 0, 46, 24 },
  { 5050, 4, 0, 0, 0, 54, 24 },
  { 5054, 5, 0, 0, 0, 46, 24 },
  { 5134, 4, 0, 0, 0, 54, 24 },
  { 5138, 5, 0, 0, 0, 46, 24 },
  { 5218, 4, 0, 0, 0, 54, 24 },
  { 5222, 5, 0, 0, 0, 46, 24 },
  { 5332, 4, 0, 0, 0, 56, 24 },
  { 5336, 5, 0, 0, 0, 8, 24 },
  { 5365, 4, 0, 0, 0, 70, 24 },
  { 5369, 5, 0, 0, 0, 11, 24 },
  { 5398, 4, 0, 0, 0, 84, 24 },
  { 5402, 5, 0, 0, 0, 5, 24 },
  // 1577: atomic_init, 
  { 3927, 3, 0, 0, 0, 45, 24 },
  { 3981, 3, 0, 0, 0, 45, 24 },
  { 4031, 3, 0, 0, 0, 45, 24 },
  { 4081, 3, 0, 0, 0, 45, 24 },
  { 4131, 3, 0, 0, 0, 45, 24 },
  { 4181, 3, 0, 0, 0, 45, 24 },
  { 4261, 3, 0, 0, 0, 46, 24 },
  { 4345, 3, 0, 0, 0, 46, 24 },
  { 4429, 3, 0, 0, 0, 46, 24 },
  { 4513, 3, 0, 0, 0, 46, 24 },
  { 4597, 3, 0, 0, 0, 46, 24 },
  { 4681, 3, 0, 0, 0, 46, 24 },
  { 4795, 3, 0, 0, 0, 46, 24 },
  { 4879, 3, 0, 0, 0, 46, 24 },
  { 4963, 3, 0, 0, 0, 46, 24 },
  { 5047, 3, 0, 0, 0, 46, 24 },
  { 5131, 3, 0, 0, 0, 46, 24 },
  { 5215, 3, 0, 0, 0, 46, 24 },
  // 1595: atomic_compare_exchange_weak, atomic_compare_exchange_strong, 
  { 3939, 4, 0, 0, 0, 51, 24 },
  { 4014, 4, 0, 0, 0, 51, 24 },
  { 4064, 4, 0, 0, 0, 51, 24 },
  { 4114, 4, 0, 0, 0, 51, 24 },
  { 4164, 4, 0, 0, 0, 51, 24 },
  { 4214, 4, 0, 0, 0, 51, 24 },
  { 4294, 4, 0, 0, 0, 53, 24 },
  { 4311, 4, 0, 0, 0, 53, 24 },
  { 4328, 4, 0, 0, 0, 53, 24 },
  { 4378, 4, 0, 0, 0, 53, 24 },
  { 4395, 4, 0, 0, 0, 53, 24 },
  { 4412, 4, 0, 0, 0, 53, 24 },
  { 4462, 4, 0, 0, 0, 53, 24 },
  { 4479, 4, 0, 0, 0, 53, 24 },
  { 4496, 4, 0, 0, 0, 53, 24 },
  { 4546, 4, 0, 0, 0, 53, 24 },
  { 4563, 4, 0, 0, 0, 53, 24 },
  { 4580, 4, 0, 0, 0, 53, 24 },
  { 4630, 4, 0, 0, 0, 53, 24 },
  { 4647, 4, 0, 0, 0, 53, 24 },
  { 4664, 4, 0, 0, 0, 53, 24 },
  { 4714, 4, 0, 0, 0, 53, 24 },
  { 4731, 4, 0, 0, 0, 53, 24 },
  { 4748, 4, 0, 0, 0, 53, 24 },
  { 4828, 4, 0, 0, 0, 53, 24 },
  { 4845, 4, 0, 0, 0, 53, 24 },
  { 4862, 4, 0, 0, 0, 53, 24 },
  { 4912, 4, 0, 0, 0, 53, 24 },
  { 4929, 4, 0, 0, 0, 53, 24 },
  { 4946, 4, 0, 0, 0, 53, 24 },
  { 4996, 4, 0, 0, 0, 53, 24 },
  { 5013, 4, 0, 0, 0, 53, 24 },
  { 5030, 4, 0, 0, 0, 53, 24 },
  { 5080, 4, 0, 0, 0, 53, 24 },
  { 5097, 4, 0, 0, 0, 53, 24 },
  { 5114, 4, 0, 0, 0, 53, 24 },
  { 5164, 4, 0, 0, 0, 53, 24 },
  { 5181, 4, 0, 0, 0, 53, 24 },
  { 5198, 4, 0, 0, 0, 53, 24 },
  { 5248, 4, 0, 0, 0, 53, 24 },
  { 5265, 4, 0, 0, 0, 53, 24 },
  { 5282, 4, 0, 0, 0, 53, 24 },
  // 1637: atomic_compare_exchange_weak_explicit, atomic_compare_exchange_strong_explicit, 
  { 3943, 6, 0, 0, 0, 52, 24 },
  { 3949, 7, 0, 0, 0, 45, 24 },
  { 4018, 6, 0, 0, 0, 52, 24 },
  { 4024, 7, 0, 0, 0, 45, 24 },
  { 4068, 6, 0, 0, 0, 52, 24 },
  { 4074, 7, 0, 0, 0, 45, 24 },
  { 4118, 6, 0, 0, 0, 52, 24 },
  { 4124, 7, 0, 0, 0, 45, 24 },
  { 4168, 6, 0, 0, 0, 52, 24 },
  { 4174, 7, 0, 0, 0, 45, 24 },
  { 4218, 6, 0, 0, 0, 52, 24 },
  { 4224, 7, 0, 0, 0, 45, 24 },
  { 4298, 6, 0, 0, 0, 54, 24 },
  { 4304, 7, 0, 0, 0, 46, 24 },
  { 4315, 6, 0, 0, 0, 54, 24 },
  { 4321, 7, 0, 0, 0, 46, 24 },
  { 4332, 6, 0, 0, 0, 54, 24 },
  { 4338, 7, 0, 0, 0, 46, 24 },
  { 4382, 6, 0, 0, 0, 54, 24 },
  { 4388, 7, 0, 0, 0, 46, 24 },
  { 4399, 6, 0, 0, 0, 54, 24 },
  { 4405, 7, 0, 0, 0, 46, 24 },
  { 4416, 6, 0, 0, 0, 54, 24 },
  { 4422, 7, 0, 0, 0, 46, 24 },
  { 4466, 6, 0, 0, 0, 54, 24 },
  { 4472, 7, 0, 0, 0, 46, 24 },
  { 4483, 6, 0, 0, 0, 54, 24 },
  { 4489, 7, 0, 0, 0, 46, 24 },
  { 4500, 6, 0, 0, 0, 54, 24 },
  { 4506, 7, 0, 0, 0, 46, 24 },
  { 4550, 6, 0, 0, 0, 54, 24 },
  { 4556, 7, 0, 0, 0, 46, 24 },
  { 4567, 6, 0, 0, 0, 54, 24 },
  { 4573, 7, 0, 0, 0, 46, 24 },
  { 4584, 6, 0, 0, 0, 54, 24 },
  { 4590, 7, 0, 0, 0, 46, 24 },
  { 4634, 6, 0, 0, 0, 54, 24 },
  { 4640, 7, 0, 0, 0, 46, 24 },
  { 4651, 6, 0, 0, 0, 54, 24 },
  { 4657, 7, 0, 0, 0, 46, 24 },
  { 4668, 6, 0, 0, 0, 54, 24 },
  { 4674, 7, 0, 0, 0, 46, 24 },
  { 4718, 6, 0, 0, 0, 54, 24 },
  { 4724, 7, 0, 0, 0, 46, 24 },
  { 4735, 6, 0, 0, 0, 54, 24 },
  { 4741, 7, 0, 0, 0, 46, 24 },
  { 4752, 6, 0, 0, 0, 54, 24 },
  { 4758, 7, 0, 0, 0, 46, 24 },
  { 4832, 6, 0, 0, 0, 54, 24 },
  { 4838, 7, 0, 0, 0, 46, 24 },
  { 4849, 6, 0, 0, 0, 54, 24 },
  { 4855, 7, 0, 0, 0, 46, 24 },
  { 4866, 6, 0, 0, 0, 54, 24 },
  { 4872, 7, 0, 0, 0, 46, 24 },
  { 4916, 6, 0, 0, 0, 54, 24 },
  { 4922, 7, 0, 0, 0, 46, 24 },
  { 4933, 6, 0, 0, 0, 54, 24 },
  { 4939, 7, 0, 0, 0, 46, 24 },
  { 4950, 6, 0, 0, 0, 54, 24 },
  { 4956, 7, 0, 0, 0, 46, 24 },
  { 5000, 6, 0, 0, 0, 54, 24 },
  { 5006, 7, 0, 0, 0, 46, 24 },
  { 5017, 6, 0, 0, 0, 54, 24 },
  { 5023, 7, 0, 0, 0, 46, 24 },
  { 5034, 6, 0, 0, 0, 54, 24 },
  { 5040, 7, 0, 0, 0, 46, 24 },
  { 5084, 6, 0, 0, 0, 54, 24 },
  { 5090, 7, 0, 0, 0, 46, 24 },
  { 5101, 6, 0, 0, 0, 54, 24 },
  { 5107, 7, 0, 0, 0, 46, 24 },
  { 5118, 6, 0, 0, 0, 54, 24 },
  { 5124, 7, 0, 0, 0, 46, 24 },
  { 5168, 6, 0, 0, 0, 54, 24 },
  { 5174, 7, 0, 0, 0, 46, 24 },
  { 5185, 6, 0, 0, 0, 54, 24 },
  { 5191, 7, 0, 0, 0, 46, 24 },
  { 5202, 6, 0, 0, 0, 54, 24 },
  { 5208, 7, 0, 0, 0, 46, 24 },
  { 5252, 6, 0, 0, 0, 54, 24 },
  { 5258, 7, 0, 0, 0, 46, 24 },
  { 5269, 6, 0, 0, 0, 54, 24 },
  { 5275, 7, 0, 0, 0, 46, 24 },
  { 5286, 6, 0, 0, 0, 54, 24 },
  { 5292, 7, 0, 0, 0, 46, 24 },
  // 1721: atomic_work_item_fence, 
  { 3956, 4, 0, 0, 0, 43, 24 },
  // 1722: atomic_load, 
  { 3960, 2, 0, 0, 0, 51, 24 },
  { 3993, 2, 0, 0, 0, 51, 24 },
  { 4043, 2, 0, 0, 0, 51, 24 },
  { 4093, 2, 0, 0, 0, 51, 24 },
  { 4143, 2, 0, 0, 0, 51, 24 },
  { 4193, 2, 0, 0, 0, 51, 24 },
  { 4273, 2, 0, 0, 0, 53, 24 },
  { 4357, 2, 0, 0, 0, 53, 24 },
  { 4441, 2, 0, 0, 0, 53, 24 },
  { 4525, 2, 0, 0, 0, 53, 24 },
  { 4609, 2, 0, 0, 0, 53, 24 },
  { 4693, 2, 0, 0, 0, 53, 24 },
  { 4807, 2, 0, 0, 0, 53, 24 },
  { 4891, 2, 0, 0, 0, 53, 24 },
  { 4975, 2, 0, 0, 0, 53, 24 },
  { 5059, 2, 0, 0, 0, 53, 24 },
  { 5143, 2, 0, 0, 0, 53, 24 },
  { 5227, 2, 0, 0, 0, 53, 24 },
  { 5341, 2, 0, 0, 0, 55, 24 },
  { 5374, 2, 0, 0, 0, 69, 24 },
  { 5407, 2, 0, 0, 0, 83, 24 },
  // 1743: atomic_load_explicit, 
  { 3962, 3, 0, 0, 0, 52, 24 },
  { 3965, 4, 0, 0, 0, 45, 24 },
  { 3995, 3, 0, 0, 0, 52, 24 },
  { 3998, 4, 0, 0, 0, 45, 24 },
  { 4045, 3, 0, 0, 0, 52, 24 },
  { 4048, 4, 0, 0, 0, 45, 24 },
  { 4095, 3, 0, 0, 0, 52, 24 },
  { 4098, 4, 0, 0, 0, 45, 24 },
  { 4145, 3, 0, 0, 0, 52, 24 },
  { 4148, 4, 0, 0, 0, 45, 24 },
  { 4195, 3, 0, 0, 0, 52, 24 },
  { 4198, 4, 0, 0, 0, 45, 24 },
  { 4275, 3, 0, 0, 0, 54, 24 },
  { 4278, 4, 0, 0, 0, 46, 24 },
  { 4359, 3, 0, 0, 0, 54, 24 },
  { 4362, 4, 0, 0, 0, 46, 24 },
  { 4443, 3, 0, 0, 0, 54, 24 },
  { 4446, 4, 0, 0, 0, 46, 24 },
  { 4527, 3, 0, 0, 0, 54, 24 },
  { 4530, 4, 0, 0, 0, 46, 24 },
  { 4611, 3, 0, 0, 0, 54, 24 },
  { 4614, 4, 0, 0, 0, 46, 24 },
  { 4695, 3, 0, 0, 0, 54, 24 },
  { 4698, 4, 0, 0, 0, 46, 24 },
  { 4809, 3, 0, 0, 0, 54, 24 },
  { 4812, 4, 0, 0, 0, 46, 24 },
  { 4893, 3, 0, 0, 0, 54, 24 },
  { 4896, 4, 0, 0, 0, 46, 24 },
  { 4977, 3, 0, 0, 0, 54, 24 },
  { 4980, 4, 0, 0, 0, 46, 24 },
  { 5061, 3, 0, 0, 0, 54, 24 },
  { 5064, 4, 0, 0, 0, 46, 24 },
  { 5145, 3, 0, 0, 0, 54, 24 },
  { 5148, 4, 0, 0, 0, 46, 24 },
  { 5229, 3, 0, 0, 0, 54, 24 },
  { 5232, 4, 0, 0, 0, 46, 24 },
  { 5343, 3, 0, 0, 0, 56, 24 },
  { 5346, 4, 0, 0, 0, 8, 24 },
  { 5376, 3, 0, 0, 0, 70, 24 },
  { 5379, 4, 0, 0, 0, 11, 24 },
  { 5409, 3, 0, 0, 0, 84, 24 },
  { 5412, 4, 0, 0, 0, 5, 24 },
  // 1785: atomic_exchange, atomic_fetch_min, atomic_fetch_max, 
  { 3969, 3, 0, 0, 0, 51, 24 },
  { 4002, 3, 0, 0, 0, 51, 24 },
  { 4052, 3, 0, 0, 0, 51, 24 },
  { 4102, 3, 0, 0, 0, 51, 24 },
  { 4152, 3, 0, 0, 0, 51, 24 },
  { 4202, 3, 0, 0, 0, 51, 24 },
  { 4282, 3, 0, 0, 0, 53, 24 },
  { 4366, 3, 0, 0, 0, 53, 24 },
  { 4450, 3, 0, 0, 0, 53, 24 },
  { 4534, 3, 0, 0, 0, 53, 24 },
  { 4618, 3, 0, 0, 0, 53, 24 },
  { 4702, 3, 0, 0, 0, 53, 24 },
  { 4816, 3, 0, 0, 0, 53, 24 },
  { 4900, 3, 0, 0, 0, 53, 24 },
  { 4984, 3, 0, 0, 0, 53, 24 },
  { 5068, 3, 0, 0, 0, 53, 24 },
  { 5152, 3, 0, 0, 0, 53, 24 },
  { 5236, 3, 0, 0, 0, 53, 24 },
  { 5350, 3, 0, 0, 0, 55, 24 },
  { 5383, 3, 0, 0, 0, 69, 24 },
  { 5416, 3, 0, 0, 0, 83, 24 },
  // 1806: atomic_exchange_explicit, atomic_fetch_min_explicit, atomic_fetch_max_explicit, 
  { 3972, 4, 0, 0, 0, 52, 24 },
  { 3976, 5, 0, 0, 0, 45, 24 },
  { 4005, 4, 0, 0, 0, 52, 24 },
  { 4009, 5, 0, 0, 0, 45, 24 },
  { 4055, 4, 0, 0, 0, 52, 24 },
  { 4059, 5, 0, 0, 0, 45, 24 },
  { 4105, 4, 0, 0, 0, 52, 24 },
  { 4109, 5, 0, 0, 0, 45, 24 },
  { 4155, 4, 0, 0, 0, 52, 24 },
  { 4159, 5, 0, 0, 0, 45, 24 },
  { 4205, 4, 0, 0, 0, 52, 24 },
  { 4209, 5, 0, 0, 0, 45, 24 },
  { 4285, 4, 0, 0, 0, 54, 24 },
  { 4289, 5, 0, 0, 0, 46, 24 },
  { 4369, 4, 0, 0, 0, 54, 24 },
  { 4373, 5, 0, 0, 0, 46, 24 },
  { 4453, 4, 0, 0, 0, 54, 24 },
  { 4457, 5, 0, 0, 0, 46, 24 },
  { 4537, 4, 0, 0, 0, 54, 24 },
  { 4541, 5, 0, 0, 0, 46, 24 },
  { 4621, 4, 0, 0, 0, 54, 24 },
  { 4625, 5, 0, 0, 0, 46, 24 },
  { 4705, 4, 0, 0, 0, 54, 24 },
  { 4709, 5, 0, 0, 0, 46, 24 },
  { 4819, 4, 0, 0, 0, 54, 24 },
  { 4823, 5, 0, 0, 0, 46, 24 },
  { 4903, 4, 0, 0, 0, 54, 24 },
  { 4907, 5, 0, 0, 0, 46, 24 },
  { 4987, 4, 0, 0, 0, 54, 24 },
  { 4991, 5, 0, 0, 0, 46, 24 },
  { 5071, 4, 0, 0, 0, 54, 24 },
  { 5075, 5, 0, 0, 0, 46, 24 },
  { 5155, 4, 0, 0, 0, 54, 24 },
  { 5159, 5, 0, 0, 0, 46, 24 },
  { 5239, 4, 0, 0, 0, 54, 24 },
  { 5243, 5, 0, 0, 0, 46, 24 },
  { 5353, 4, 0, 0, 0, 56, 24 },
  { 5357, 5, 0, 0, 0, 8, 24 },
  { 5386, 4, 0, 0, 0, 70, 24 },
  { 5390, 5, 0, 0, 0, 11, 24 },
  { 5419, 4, 0, 0, 0, 84, 24 },
  { 5423, 5, 0, 0, 0, 5, 24 },
  // 1848: atomic_fetch_add, atomic_fetch_sub, 
  { 3969, 3, 0, 0, 0, 51, 24 },
  { 4002, 3, 0, 0, 0, 51, 24 },
  { 4052, 3, 0, 0, 0, 51, 24 },
  { 4102, 3, 0, 0, 0, 51, 24 },
  { 4231, 3, 0, 0, 0, 51, 24 },
  { 4282, 3, 0, 0, 0, 53, 24 },
  { 4366, 3, 0, 0, 0, 53, 24 },
  { 4450, 3, 0, 0, 0, 53, 24 },
  { 4534, 3, 0, 0, 0, 53, 24 },
  { 4765, 3, 0, 0, 0, 53, 24 },
  { 4816, 3, 0, 0, 0, 53, 24 },
  { 4900, 3, 0, 0, 0, 53, 24 },
  { 4984, 3, 0, 0, 0, 53, 24 },
  { 5068, 3, 0, 0, 0, 53, 24 },
  { 5299, 3, 0, 0, 0, 53, 24 },
  { 5350, 3, 0, 0, 0, 57, 24 },
  { 4618, 3, 0, 0, 0, 59, 24 },
  { 4702, 3, 0, 0, 0, 61, 24 },
  { 5383, 3, 0, 0, 0, 71, 24 },
  { 5152, 3, 0, 0, 0, 73, 24 },
  { 5236, 3, 0, 0, 0, 75, 24 },
  { 5416, 3, 0, 0, 0, 85, 24 },
  { 4152, 3, 0, 0, 0, 87, 24 },
  { 4202, 3, 0, 0, 0, 89, 24 },
  // 1872: atomic_fetch_add_explicit, atomic_fetch_sub_explicit, 
  { 3972, 4, 0, 0, 0, 52, 24 },
  { 3976, 5, 0, 0, 0, 45, 24 },
  { 4005, 4, 0, 0, 0, 52, 24 },
  { 4009, 5, 0, 0, 0, 45, 24 },
  { 4055, 4, 0, 0, 0, 52, 24 },
  { 4059, 5, 0, 0, 0, 45, 24 },
  { 4105, 4, 0, 0, 0, 52, 24 },
  { 4109, 5, 0, 0, 0, 45, 24 },
  { 4234, 4, 0, 0, 0, 52, 24 },
  { 4238, 5, 0, 0, 0, 45, 24 },
  { 4285, 4, 0, 0, 0, 54, 24 },
  { 4289, 5, 0, 0, 0, 46, 24 },
  { 4369, 4, 0, 0, 0, 54, 24 },
  { 4373, 5, 0, 0, 0, 46, 24 },
  { 4453, 4, 0, 0, 0, 54, 24 },
  { 4457, 5, 0, 0, 0, 46, 24 },
  { 4537, 4, 0, 0, 0, 54, 24 },
  { 4541, 5, 0, 0, 0, 46, 24 },
  { 4768, 4, 0, 0, 0, 54, 24 },
  { 4772, 5, 0, 0, 0, 46, 24 },
  { 4819, 4, 0, 0, 0, 54, 24 },
  { 4823, 5, 0, 0, 0, 46, 24 },
  { 4903, 4, 0, 0, 0, 54, 24 },
  { 4907, 5, 0, 0, 0, 46, 24 },
  { 4987, 4, 0, 0, 0, 54, 24 },
  { 4991, 5, 0, 0, 0, 46, 24 },
  { 5071, 4, 0, 0, 0, 54, 24 },
  { 5075, 5, 0, 0, 0, 46, 24 },
  { 5302, 4, 0, 0, 0, 54, 24 },
  { 5306, 5, 0, 0, 0, 46, 24 },
  { 5353, 4, 0, 0, 0, 58, 24 },
  { 5357, 5, 0, 0, 0, 7, 24 },
  { 4621, 4, 0, 0, 0, 60, 24 },
  { 4625, 5, 0, 0, 0, 15, 24 },
  { 4705, 4, 0, 0, 0, 62, 24 },
  { 4709, 5, 0, 0, 0, 21, 24 },
  { 5386, 4, 0, 0, 0, 72, 24 },
  { 5390, 5, 0, 0, 0, 10, 24 },
  { 5155, 4, 0, 0, 0, 74, 24 },
  { 5159, 5, 0, 0, 0, 17, 24 },
  { 5239, 4, 0, 0, 0, 76, 24 },
  { 5243, 5, 0, 0, 0, 23, 24 },
  { 5419, 4, 0, 0, 0, 86, 24 },
  { 5423, 5, 0, 0, 0, 4, 24 },
  { 4155, 4, 0, 0, 0, 88, 24 },
  { 4159, 5, 0, 0, 0, 13, 24 },
  { 4205, 4, 0, 0, 0, 90, 24 },
  { 4209, 5, 0, 0, 0, 19, 24 },
  // 1920: atomic_fetch_or, atomic_fetch_xor, atomic_fetch_and, 
  { 3969, 3, 0, 0, 0, 51, 24 },
  { 4002, 3, 0, 0, 0, 51, 24 },
  { 4052, 3, 0, 0, 0, 51, 24 },
  { 4102, 3, 0, 0, 0, 51, 24 },
  { 4282, 3, 0, 0, 0, 53, 24 },
  { 4366, 3, 0, 0, 0, 53, 24 },
  { 4450, 3, 0, 0, 0, 53, 24 },
  { 4534, 3, 0, 0, 0, 53, 24 },
  { 4816, 3, 0, 0, 0, 53, 24 },
  { 4900, 3, 0, 0, 0, 53, 24 },
  { 4984, 3, 0, 0, 0, 53, 24 },
  { 5068, 3, 0, 0, 0, 53, 24 },
  // 1932: atomic_fetch_or_explicit, atomic_fetch_xor_explicit, atomic_fetch_and_explicit, 
  { 3972, 4, 0, 0, 0, 52, 24 },
  { 3976, 5, 0, 0, 0, 45, 24 },
  { 4005, 4, 0, 0, 0, 52, 24 },
  { 4009, 5, 0, 0, 0, 45, 24 },
  { 4055, 4, 0, 0, 0, 52, 24 },
  { 4059, 5, 0, 0, 0, 45, 24 },
  { 4105, 4, 0, 0, 0, 52, 24 },
  { 4109, 5, 0, 0, 0, 45, 24 },
  { 4285, 4, 0, 0, 0, 54, 24 },
  { 4289, 5, 0, 0, 0, 46, 24 },
  { 4369, 4, 0, 0, 0, 54, 24 },
  { 4373, 5, 0, 0, 0, 46, 24 },
  { 4453, 4, 0, 0, 0, 54, 24 },
  { 4457, 5, 0, 0, 0, 46, 24 },
  { 4537, 4, 0, 0, 0, 54, 24 },
  { 4541, 5, 0, 0, 0, 46, 24 },
  { 4819, 4, 0, 0, 0, 54, 24 },
  { 4823, 5, 0, 0, 0, 46, 24 },
  { 4903, 4, 0, 0, 0, 54, 24 },
  { 4907, 5, 0, 0, 0, 46, 24 },
  { 4987, 4, 0, 0, 0, 54, 24 },
  { 4991, 5, 0, 0, 0, 46, 24 },
  { 5071, 4, 0, 0, 0, 54, 24 },
  { 5075, 5, 0, 0, 0, 46, 24 },
  // 1956: atomic_flag_clear, 
  { 4243, 2, 0, 0, 0, 51, 24 },
  { 4777, 2, 0, 0, 0, 53, 24 },
  { 5311, 2, 0, 0, 0, 53, 24 },
  // 1959: atomic_flag_clear_explicit, 
  { 4245, 3, 0, 0, 0, 52, 24 },
  { 4248, 4, 0, 0, 0, 45, 24 },
  { 4779, 3, 0, 0, 0, 54, 24 },
  { 4782, 4, 0, 0, 0, 46, 24 },
  { 5313, 3, 0, 0, 0, 54, 24 },
  { 5316, 4, 0, 0, 0, 46, 24 },
  // 1965: atomic_flag_test_and_set, 
  { 4252, 2, 0, 0, 0, 51, 24 },
  { 4786, 2, 0, 0, 0, 53, 24 },
  { 5320, 2, 0, 0, 0, 53, 24 },
  // 1968: atomic_flag_test_and_set_explicit, 
  { 4254, 3, 0, 0, 0, 52, 24 },
  { 4257, 4, 0, 0, 0, 45, 24 },
  { 4788, 3, 0, 0, 0, 54, 24 },
  { 4791, 4, 0, 0, 0, 46, 24 },
  { 5322, 3, 0, 0, 0, 54, 24 },
  { 5325, 4, 0, 0, 0, 46, 24 },
  // 1974: shuffle, 
  { 5428, 3, 0, 1, 0, 43, 31 },
  { 5431, 3, 0, 1, 0, 43, 31 },
  { 5434, 3, 0, 1, 0, 43, 31 },
  { 5437, 3, 0, 1, 0, 43, 31 },
  { 5440, 3, 0, 1, 0, 43, 31 },
  { 5443, 3, 0, 1, 0, 43, 31 },
  { 5446, 3, 0, 1, 0, 43, 31 },
  { 5449, 3, 0, 1, 0, 43, 31 },
  { 5452, 3, 0, 1, 0, 43, 31 },
  { 5455, 3, 0, 1, 0, 43, 31 },
  { 5458, 3, 0, 1, 0, 43, 31 },
  { 5461, 3, 0, 1, 0, 43, 31 },
  { 5464, 3, 0, 1, 0, 43, 31 },
  { 5467, 3, 0, 1, 0, 43, 31 },
  { 5470, 3, 0, 1, 0, 43, 31 },
  { 5473, 3, 0, 1, 0, 43, 31 },
  { 5476, 3, 0, 1, 0, 43, 31 },
  { 5479, 3, 0, 1, 0, 43, 31 },
  { 5482, 3, 0, 1, 0, 43, 31 },
  { 5485, 3, 0, 1, 0, 43, 31 },
  { 5488, 3, 0, 1, 0, 43, 31 },
  { 5491, 3, 0, 1, 0, 43, 31 },
  { 5494, 3, 0, 1, 0, 43, 31 },
  { 5497, 3, 0, 1, 0, 43, 31 },
  { 5500, 3, 0, 1, 0, 43, 31 },
  { 5503, 3, 0, 1, 0, 43, 31 },
  { 5506, 3, 0, 1, 0, 43, 31 },
  { 5509, 3, 0, 1, 0, 43, 31 },
  { 5512, 3, 0, 1, 0, 43, 31 },
  { 5515, 3, 0, 1, 0, 43, 31 },
  { 5518, 3, 0, 1, 0, 43, 31 },
  { 5521, 3, 0, 1, 0, 43, 31 },
  { 5524, 3, 0, 1, 0, 43, 31 },
  { 5527, 3, 0, 1, 0, 43, 31 },
  { 5530, 3, 0, 1, 0, 43, 31 },
  { 5533, 3, 0, 1, 0, 43, 31 },
  { 5536, 3, 0, 1, 0, 43, 31 },
  { 5539, 3, 0, 1, 0, 43, 31 },
  { 5542, 3, 0, 1, 0, 43, 31 },
  { 5545, 3, 0, 1, 0, 43, 31 },
  { 5548, 3, 0, 1, 0, 43, 31 },
  { 5551, 3, 0, 1, 0, 43, 31 },
  { 5554, 3, 0, 1, 0, 43, 31 },
  { 5557, 3, 0, 1, 0, 43, 31 },
  { 5560, 3, 0, 1, 0, 43, 31 },
  { 5563, 3, 0, 1, 0, 43, 31 },
  { 5566, 3, 0, 1, 0, 43, 31 },
  { 5569, 3, 0, 1, 0, 43, 31 },
  { 5572, 3, 0, 1, 0, 43, 31 },
  { 5575, 3, 0, 1, 0, 43, 31 },
  { 5578, 3, 0, 1, 0, 43, 31 },
  { 5581, 3, 0, 1, 0, 43, 31 },
  { 5584, 3, 0, 1, 0, 43, 31 },
  { 5587, 3, 0, 1, 0, 43, 31 },
  { 5590, 3, 0, 1, 0, 43, 31 },
  { 5593, 3, 0, 1, 0, 43, 31 },
  { 5596, 3, 0, 1, 0, 43, 31 },
  { 5599, 3, 0, 1, 0, 43, 31 },
  { 5602, 3, 0, 1, 0, 43, 31 },
  { 5605, 3, 0, 1, 0, 43, 31 },
  { 5608, 3, 0, 1, 0, 43, 31 },
  { 5611, 3, 0, 1, 0, 43, 31 },
  { 5614, 3, 0, 1, 0, 43, 31 },
  { 5617, 3, 0, 1, 0, 43, 31 },
  { 5620, 3, 0, 1, 0, 43, 31 },
  { 5623, 3, 0, 1, 0, 43, 31 },
  { 5626, 3, 0, 1, 0, 43, 31 },
  { 5629, 3, 0, 1, 0, 43, 31 },
  { 5632, 3, 0, 1, 0, 43, 31 },
  { 5635, 3, 0, 1, 0, 43, 31 },
  { 5638, 3, 0, 1, 0, 43, 31 },
  { 5641, 3, 0, 1, 0, 43, 31 },
  { 5644, 3, 0, 1, 0, 43, 31 },
  { 5647, 3, 0, 1, 0, 43, 31 },
  { 5650, 3, 0, 1, 0, 43, 31 },
  { 5653, 3, 0, 1, 0, 43, 31 },
  { 5656, 3, 0, 1, 0, 43, 31 },
  { 5659, 3, 0, 1, 0, 43, 31 },
  { 5662, 3, 0, 1, 0, 43, 31 },
  { 5665, 3, 0, 1, 0, 43, 31 },
  { 5668, 3, 0, 1, 0, 43, 31 },
  { 5671, 3, 0, 1, 0, 43, 31 },
  { 5674, 3, 0, 1, 0, 43, 31 },
  { 5677, 3, 0, 1, 0, 43, 31 },
  { 5680, 3, 0, 1, 0, 43, 31 },
  { 5683, 3, 0, 1, 0, 43, 31 },
  { 5686, 3, 0, 1, 0, 43, 31 },
  { 5689, 3, 0, 1, 0, 43, 31 },
  { 5692, 3, 0, 1, 0, 43, 31 },
  { 5695, 3, 0, 1, 0, 43, 31 },
  { 5698, 3, 0, 1, 0, 43, 31 },
  { 5701, 3, 0, 1, 0, 43, 31 },
  { 5704, 3, 0, 1, 0, 43, 31 },
  { 5707, 3, 0, 1, 0, 43, 31 },
  { 5710, 3, 0, 1, 0, 43, 31 },
  { 5713, 3, 0, 1, 0, 43, 31 },
  { 5716, 3, 0, 1, 0, 43, 31 },
  { 5719, 3, 0, 1, 0, 43, 31 },
  { 5722, 3, 0, 1, 0, 43, 31 },
  { 5725, 3, 0, 1, 0, 43, 31 },
  { 5728, 3, 0, 1, 0, 43, 31 },
  { 5731, 3, 0, 1, 0, 43, 31 },
  { 5734, 3, 0, 1, 0, 43, 31 },
  { 5737, 3, 0, 1, 0, 43, 31 },
  { 5740, 3, 0, 1, 0, 43, 31 },
  { 5743, 3, 0, 1, 0, 43, 31 },
  { 5746, 3, 0, 1, 0, 43, 31 },
  { 5749, 3, 0, 1, 0, 43, 31 },
  { 5752, 3, 0, 1, 0, 43, 31 },
  { 5755, 3, 0, 1, 0, 43, 31 },
  { 5758, 3, 0, 1, 0, 43, 31 },
  { 5761, 3, 0, 1, 0, 43, 31 },
  { 5764, 3, 0, 1, 0, 43, 31 },
  { 5767, 3, 0, 1, 0, 43, 31 },
  { 5770, 3, 0, 1, 0, 43, 31 },
  { 5773, 3, 0, 1, 0, 43, 31 },
  { 5776, 3, 0, 1, 0, 43, 31 },
  { 5779, 3, 0, 1, 0, 43, 31 },
  { 5782, 3, 0, 1, 0, 43, 31 },
  { 5785, 3, 0, 1, 0, 43, 31 },
  { 5788, 3, 0, 1, 0, 43, 31 },
  { 5791, 3, 0, 1, 0, 43, 31 },
  { 5794, 3, 0, 1, 0, 43, 31 },
  { 5797, 3, 0, 1, 0, 43, 31 },
  { 5800, 3, 0, 1, 0, 43, 31 },
  { 5803, 3, 0, 1, 0, 43, 31 },
  { 5806, 3, 0, 1, 0, 43, 31 },
  { 5809, 3, 0, 1, 0, 43, 31 },
  { 5812, 3, 0, 1, 0, 43, 31 },
  { 5815, 3, 0, 1, 0, 43, 31 },
  { 5818, 3, 0, 1, 0, 43, 31 },
  { 5821, 3, 0, 1, 0, 43, 31 },
  { 5824, 3, 0, 1, 0, 43, 31 },
  { 5827, 3, 0, 1, 0, 43, 31 },
  { 5830, 3, 0, 1, 0, 43, 31 },
  { 5833, 3, 0, 1, 0, 43, 31 },
  { 5836, 3, 0, 1, 0, 43, 31 },
  { 5839, 3, 0, 1, 0, 43, 31 },
  { 5842, 3, 0, 1, 0, 43, 31 },
  { 5845, 3, 0, 1, 0, 43, 31 },
  { 5848, 3, 0, 1, 0, 43, 31 },
  { 5851, 3, 0, 1, 0, 43, 31 },
  { 5854, 3, 0, 1, 0, 43, 31 },
  { 5857, 3, 0, 1, 0, 43, 31 },
  { 5860, 3, 0, 1, 0, 43, 31 },
  { 5863, 3, 0, 1, 0, 43, 31 },
  { 5866, 3, 0, 1, 0, 43, 31 },
  { 5869, 3, 0, 1, 0, 43, 31 },
  { 5872, 3, 0, 1, 0, 43, 31 },
  { 5875, 3, 0, 1, 0, 43, 31 },
  { 5878, 3, 0, 1, 0, 43, 31 },
  { 5881, 3, 0, 1, 0, 43, 31 },
  { 5884, 3, 0, 1, 0, 43, 31 },
  { 5887, 3, 0, 1, 0, 43, 31 },
  { 5890, 3, 0, 1, 0, 43, 31 },
  { 5893, 3, 0, 1, 0, 43, 31 },
  { 5896, 3, 0, 1, 0, 43, 31 },
  { 5899, 3, 0, 1, 0, 43, 31 },
  { 5902, 3, 0, 1, 0, 43, 31 },
  { 5905, 3, 0, 1, 0, 43, 31 },
  { 5908, 3, 0, 1, 0, 43, 31 },
  { 5911, 3, 0, 1, 0, 43, 31 },
  { 5914, 3, 0, 1, 0, 43, 31 },
  { 5917, 3, 0, 1, 0, 43, 31 },
  { 5920, 3, 0, 1, 0, 43, 31 },
  { 5923, 3, 0, 1, 0, 43, 31 },
  { 5926, 3, 0, 1, 0, 43, 31 },
  { 5929, 3, 0, 1, 0, 43, 31 },
  { 5932, 3, 0, 1, 0, 43, 31 },
  { 5935, 3, 0, 1, 0, 43, 31 },
  { 5938, 3, 0, 1, 0, 43, 31 },
  { 5941, 3, 0, 1, 0, 43, 31 },
  { 5944, 3, 0, 1, 0, 43, 31 },
  { 5947, 3, 0, 1, 0, 43, 31 },
  { 5950, 3, 0, 1, 0, 43, 31 },
  { 5953, 3, 0, 1, 0, 43, 31 },
  // 2150: shuffle2, 
  { 5956, 4, 0, 1, 0, 43, 31 },
  { 5960, 4, 0, 1, 0, 43, 31 },
  { 5964, 4, 0, 1, 0, 43, 31 },
  { 5968, 4, 0, 1, 0, 43, 31 },
  { 5972, 4, 0, 1, 0, 43, 31 },
  { 5976, 4, 0, 1, 0, 43, 31 },
  { 5980, 4, 0, 1, 0, 43, 31 },
  { 5984, 4, 0, 1, 0, 43, 31 },
  { 5988, 4, 0, 1, 0, 43, 31 },
  { 5992, 4, 0, 1, 0, 43, 31 },
  { 5996, 4, 0, 1, 0, 43, 31 },
  { 6000, 4, 0, 1, 0, 43, 31 },
  { 6004, 4, 0, 1, 0, 43, 31 },
  { 6008, 4, 0, 1, 0, 43, 31 },
  { 6012, 4, 0, 1, 0, 43, 31 },
  { 6016, 4, 0, 1, 0, 43, 31 },
  { 6020, 4, 0, 1, 0, 43, 31 },
  { 6024, 4, 0, 1, 0, 43, 31 },
  { 6028, 4, 0, 1, 0, 43, 31 },
  { 6032, 4, 0, 1, 0, 43, 31 },
  { 6036, 4, 0, 1, 0, 43, 31 },
  { 6040, 4, 0, 1, 0, 43, 31 },
  { 6044, 4, 0, 1, 0, 43, 31 },
  { 6048, 4, 0, 1, 0, 43, 31 },
  { 6052, 4, 0, 1, 0, 43, 31 },
  { 6056, 4, 0, 1, 0, 43, 31 },
  { 6060, 4, 0, 1, 0, 43, 31 },
  { 6064, 4, 0, 1, 0, 43, 31 },
  { 6068, 4, 0, 1, 0, 43, 31 },
  { 6072, 4, 0, 1, 0, 43, 31 },
  { 6076, 4, 0, 1, 0, 43, 31 },
  { 6080, 4, 0, 1, 0, 43, 31 },
  { 6084, 4, 0, 1, 0, 43, 31 },
  { 6088, 4, 0, 1, 0, 43, 31 },
  { 6092, 4, 0, 1, 0, 43, 31 },
  { 6096, 4, 0, 1, 0, 43, 31 },
  { 6100, 4, 0, 1, 0, 43, 31 },
  { 6104, 4, 0, 1, 0, 43, 31 },
  { 6108, 4, 0, 1, 0, 43, 31 },
  { 6112, 4, 0, 1, 0, 43, 31 },
  { 6116, 4, 0, 1, 0, 43, 31 },
  { 6120, 4, 0, 1, 0, 43, 31 },
  { 6124, 4, 0, 1, 0, 43, 31 },
  { 6128, 4, 0, 1, 0, 43, 31 },
  { 6132, 4, 0, 1, 0, 43, 31 },
  { 6136, 4, 0, 1, 0, 43, 31 },
  { 6140, 4, 0, 1, 0, 43, 31 },
  { 6144, 4, 0, 1, 0, 43, 31 },
  { 6148, 4, 0, 1, 0, 43, 31 },
  { 6152, 4, 0, 1, 0, 43, 31 },
  { 6156, 4, 0, 1, 0, 43, 31 },
  { 6160, 4, 0, 1, 0, 43, 31 },
  { 6164, 4, 0, 1, 0, 43, 31 },
  { 6168, 4, 0, 1, 0, 43, 31 },
  { 6172, 4, 0, 1, 0, 43, 31 },
  { 6176, 4, 0, 1, 0, 43, 31 },
  { 6180, 4, 0, 1, 0, 43, 31 },
  { 6184, 4, 0, 1, 0, 43, 31 },
  { 6188, 4, 0, 1, 0, 43, 31 },
  { 6192, 4, 0, 1, 0, 43, 31 },
  { 6196, 4, 0, 1, 0, 43, 31 },
  { 6200, 4, 0, 1, 0, 43, 31 },
  { 6204, 4, 0, 1, 0, 43, 31 },
  { 6208, 4, 0, 1, 0, 43, 31 },
  { 6212, 4, 0, 1, 0, 43, 31 },
  { 6216, 4, 0, 1, 0, 43, 31 },
  { 6220, 4, 0, 1, 0, 43, 31 },
  { 6224, 4, 0, 1, 0, 43, 31 },
  { 6228, 4, 0, 1, 0, 43, 31 },
  { 6232, 4, 0, 1, 0, 43, 31 },
  { 6236, 4, 0, 1, 0, 43, 31 },
  { 6240, 4, 0, 1, 0, 43, 31 },
  { 6244, 4, 0, 1, 0, 43, 31 },
  { 6248, 4, 0, 1, 0, 43, 31 },
  { 6252, 4, 0, 1, 0, 43, 31 },
  { 6256, 4, 0, 1, 0, 43, 31 },
  { 6260, 4, 0, 1, 0, 43, 31 },
  { 6264, 4, 0, 1, 0, 43, 31 },
  { 6268, 4, 0, 1, 0, 43, 31 },
  { 6272, 4, 0, 1, 0, 43, 31 },
  { 6276, 4, 0, 1, 0, 43, 31 },
  { 6280, 4, 0, 1, 0, 43, 31 },
  { 6284, 4, 0, 1, 0, 43, 31 },
  { 6288, 4, 0, 1, 0, 43, 31 },
  { 6292, 4, 0, 1, 0, 43, 31 },
  { 6296, 4, 0, 1, 0, 43, 31 },
  { 6300, 4, 0, 1, 0, 43, 31 },
  { 6304, 4, 0, 1, 0, 43, 31 },
  { 6308, 4, 0, 1, 0, 43, 31 },
  { 6312, 4, 0, 1, 0, 43, 31 },
  { 6316, 4, 0, 1, 0, 43, 31 },
  { 6320, 4, 0, 1, 0, 43, 31 },
  { 6324, 4, 0, 1, 0, 43, 31 },
  { 6328, 4, 0, 1, 0, 43, 31 },
  { 6332, 4, 0, 1, 0, 43, 31 },
  { 6336, 4, 0, 1, 0, 43, 31 },
  { 6340, 4, 0, 1, 0, 43, 31 },
  { 6344, 4, 0, 1, 0, 43, 31 },
  { 6348, 4, 0, 1, 0, 43, 31 },
  { 6352, 4, 0, 1, 0, 43, 31 },
  { 6356, 4, 0, 1, 0, 43, 31 },
  { 6360, 4, 0, 1, 0, 43, 31 },
  { 6364, 4, 0, 1, 0, 43, 31 },
  { 6368, 4, 0, 1, 0, 43, 31 },
  { 6372, 4, 0, 1, 0, 43, 31 },
  { 6376, 4, 0, 1, 0, 43, 31 },
  { 6380, 4, 0, 1, 0, 43, 31 },
  { 6384, 4, 0, 1, 0, 43, 31 },
  { 6388, 4, 0, 1, 0, 43, 31 },
  { 6392, 4, 0, 1, 0, 43, 31 },
  { 6396, 4, 0, 1, 0, 43, 31 },
  { 6400, 4, 0, 1, 0, 43, 31 },
  { 6404, 4, 0, 1, 0, 43, 31 },
  { 6408, 4, 0, 1, 0, 43, 31 },
  { 6412, 4, 0, 1, 0, 43, 31 },
  { 6416, 4, 0, 1, 0, 43, 31 },
  { 6420, 4, 0, 1, 0, 43, 31 },
  { 6424, 4, 0, 1, 0, 43, 31 },
  { 6428, 4, 0, 1, 0, 43, 31 },
  { 6432, 4, 0, 1, 0, 43, 31 },
  { 6436, 4, 0, 1, 0, 43, 31 },
  { 6440, 4, 0, 1, 0, 43, 31 },
  { 6444, 4, 0, 1, 0, 43, 31 },
  { 6448, 4, 0, 1, 0, 43, 31 },
  { 6452, 4, 0, 1, 0, 43, 31 },
  { 6456, 4, 0, 1, 0, 43, 31 },
  { 6460, 4, 0, 1, 0, 43, 31 },
  { 6464, 4, 0, 1, 0, 43, 31 },
  { 6468, 4, 0, 1, 0, 43, 31 },
  { 6472, 4, 0, 1, 0, 43, 31 },
  { 6476, 4, 0, 1, 0, 43, 31 },
  { 6480, 4, 0, 1, 0, 43, 31 },
  { 6484, 4, 0, 1, 0, 43, 31 },
  { 6488, 4, 0, 1, 0, 43, 31 },
  { 6492, 4, 0, 1, 0, 43, 31 },
  { 6496, 4, 0, 1, 0, 43, 31 },
  { 6500, 4, 0, 1, 0, 43, 31 },
  { 6504, 4, 0, 1, 0, 43, 31 },
  { 6508, 4, 0, 1, 0, 43, 31 },
  { 6512, 4, 0, 1, 0, 43, 31 },
  { 6516, 4, 0, 1, 0, 43, 31 },
  { 6520, 4, 0, 1, 0, 43, 31 },
  { 6524, 4, 0, 1, 0, 43, 31 },
  { 6528, 4, 0, 1, 0, 43, 31 },
  { 6532, 4, 0, 1, 0, 43, 31 },
  { 6536, 4, 0, 1, 0, 43, 31 },
  { 6540, 4, 0, 1, 0, 43, 31 },
  { 6544, 4, 0, 1, 0, 43, 31 },
  { 6548, 4, 0, 1, 0, 43, 31 },
  { 6552, 4, 0, 1, 0, 43, 31 },
  { 6556, 4, 0, 1, 0, 43, 31 },
  { 6560, 4, 0, 1, 0, 43, 31 },
  { 6564, 4, 0, 1, 0, 43, 31 },
  { 6568, 4, 0, 1, 0, 43, 31 },
  { 6572, 4, 0, 1, 0, 43, 31 },
  { 6576, 4, 0, 1, 0, 43, 31 },
  { 6580, 4, 0, 1, 0, 43, 31 },
  { 6584, 4, 0, 1, 0, 43, 31 },
  { 6588, 4, 0, 1, 0, 43, 31 },
  { 6592, 4, 0, 1, 0, 43, 31 },
  { 6596, 4, 0, 1, 0, 43, 31 },
  { 6600, 4, 0, 1, 0, 43, 31 },
  { 6604, 4, 0, 1, 0, 43, 31 },
  { 6608, 4, 0, 1, 0, 43, 31 },
  { 6612, 4, 0, 1, 0, 43, 31 },
  { 6616, 4, 0, 1, 0, 43, 31 },
  { 6620, 4, 0, 1, 0, 43, 31 },
  { 6624, 4, 0, 1, 0, 43, 31 },
  { 6628, 4, 0, 1, 0, 43, 31 },
  { 6632, 4, 0, 1, 0, 43, 31 },
  { 6636, 4, 0, 1, 0, 43, 31 },
  { 6640, 4, 0, 1, 0, 43, 31 },
  { 6644, 4, 0, 1, 0, 43, 31 },
  { 6648, 4, 0, 1, 0, 43, 31 },
  { 6652, 4, 0, 1, 0, 43, 31 },
  { 6656, 4, 0, 1, 0, 43, 31 },
  // 2326: read_imagef, 
  { 6660, 4, 1, 0, 0, 43, 31 },
  { 6672, 4, 1, 0, 0, 43, 31 },
  { 6684, 4, 1, 0, 0, 43, 31 },
  { 6696, 4, 1, 0, 0, 43, 31 },
  { 6708, 4, 1, 0, 0, 43, 31 },
  { 6720, 4, 1, 0, 0, 43, 31 },
  { 6732, 4, 1, 0, 0, 43, 31 },
  { 6744, 4, 1, 0, 0, 43, 31 },
  { 6756, 4, 1, 0, 0, 43, 31 },
  { 6768, 4, 1, 0, 0, 43, 31 },
  { 6780, 4, 1, 0, 0, 43, 31 },
  { 6784, 4, 1, 0, 0, 43, 31 },
  { 6788, 4, 1, 0, 0, 43, 31 },
  { 6792, 4, 1, 0, 0, 43, 31 },
  { 6796, 3, 1, 0, 0, 43, 28 },
  { 6805, 3, 1, 0, 0, 43, 28 },
  { 6814, 3, 1, 0, 0, 43, 28 },
  { 6823, 3, 1, 0, 0, 43, 28 },
  { 6826, 3, 1, 0, 0, 43, 28 },
  { 6829, 3, 1, 0, 0, 43, 28 },
  { 6838, 3, 1, 0, 0, 43, 28 },
  { 6847, 3, 1, 0, 0, 43, 28 },
  { 6856, 3, 1, 0, 0, 48, 28 },
  { 6865, 3, 1, 0, 0, 48, 28 },
  { 6874, 3, 1, 0, 0, 48, 28 },
  { 6883, 3, 1, 0, 0, 48, 28 },
  { 6892, 3, 1, 0, 0, 48, 28 },
  { 6901, 3, 1, 0, 0, 48, 28 },
  { 6910, 3, 1, 0, 0, 48, 28 },
  { 6913, 3, 1, 0, 0, 48, 28 },
  { 7348, 5, 1, 0, 0, 33, 31 },
  { 7353, 6, 1, 0, 0, 33, 31 },
  { 7381, 5, 1, 0, 0, 33, 31 },
  { 7386, 6, 1, 0, 0, 33, 31 },
  { 7392, 5, 1, 0, 0, 33, 31 },
  { 7397, 6, 1, 0, 0, 33, 31 },
  { 7425, 6, 1, 0, 0, 33, 31 },
  { 7431, 5, 1, 0, 0, 33, 31 },
  { 7458, 5, 1, 0, 0, 33, 31 },
  { 7463, 6, 1, 0, 0, 33, 31 },
  { 7491, 5, 1, 0, 0, 33, 31 },
  { 7496, 6, 1, 0, 0, 33, 31 },
  { 7524, 5, 1, 0, 0, 33, 31 },
  { 7529, 6, 1, 0, 0, 33, 31 },
  { 7620, 4, 1, 0, 0, 26, 31 },
  { 7632, 4, 1, 0, 0, 26, 31 },
  { 7644, 4, 1, 0, 0, 26, 31 },
  { 7648, 4, 1, 0, 0, 26, 31 },
  { 7692, 4, 1, 0, 0, 26, 31 },
  { 7704, 4, 1, 0, 0, 26, 31 },
  { 7716, 4, 1, 0, 0, 26, 31 },
  { 7720, 4, 1, 0, 0, 26, 31 },
  // 2378: read_imagei, 
  { 6664, 4, 1, 0, 0, 43, 31 },
  { 6676, 4, 1, 0, 0, 43, 31 },
  { 6688, 4, 1, 0, 0, 43, 31 },
  { 6700, 4, 1, 0, 0, 43, 31 },
  { 6712, 4, 1, 0, 0, 43, 31 },
  { 6724, 4, 1, 0, 0, 43, 31 },
  { 6736, 4, 1, 0, 0, 43, 31 },
  { 6748, 4, 1, 0, 0, 43, 31 },
  { 6760, 4, 1, 0, 0, 43, 31 },
  { 6772, 4, 1, 0, 0, 43, 31 },
  { 6799, 3, 1, 0, 0, 43, 28 },
  { 6808, 3, 1, 0, 0, 43, 28 },
  { 6817, 3, 1, 0, 0, 43, 28 },
  { 6832, 3, 1, 0, 0, 43, 28 },
  { 6841, 3, 1, 0, 0, 43, 28 },
  { 6850, 3, 1, 0, 0, 43, 28 },
  { 6859, 3, 1, 0, 0, 48, 28 },
  { 6868, 3, 1, 0, 0, 48, 28 },
  { 6877, 3, 1, 0, 0, 48, 28 },
  { 6886, 3, 1, 0, 0, 48, 28 },
  { 6895, 3, 1, 0, 0, 48, 28 },
  { 6904, 3, 1, 0, 0, 48, 28 },
  { 7359, 5, 1, 0, 0, 33, 31 },
  { 7364, 6, 1, 0, 0, 33, 31 },
  { 7403, 5, 1, 0, 0, 33, 31 },
  { 7408, 6, 1, 0, 0, 33, 31 },
  { 7436, 6, 1, 0, 0, 33, 31 },
  { 7442, 5, 1, 0, 0, 33, 31 },
  { 7469, 5, 1, 0, 0, 33, 31 },
  { 7474, 6, 1, 0, 0, 33, 31 },
  { 7502, 5, 1, 0, 0, 33, 31 },
  { 7507, 6, 1, 0, 0, 33, 31 },
  { 7624, 4, 1, 0, 0, 26, 31 },
  { 7636, 4, 1, 0, 0, 26, 31 },
  { 7696, 4, 1, 0, 0, 26, 31 },
  { 7708, 4, 1, 0, 0, 26, 31 },
  // 2414: read_imageui, 
  { 6668, 4, 1, 0, 0, 43, 31 },
  { 6680, 4, 1, 0, 0, 43, 31 },
  { 6692, 4, 1, 0, 0, 43, 31 },
  { 6704, 4, 1, 0, 0, 43, 31 },
  { 6716, 4, 1, 0, 0, 43, 31 },
  { 6728, 4, 1, 0, 0, 43, 31 },
  { 6740, 4, 1, 0, 0, 43, 31 },
  { 6752, 4, 1, 0, 0, 43, 31 },
  { 6764, 4, 1, 0, 0, 43, 31 },
  { 6776, 4, 1, 0, 0, 43, 31 },
  { 6802, 3, 1, 0, 0, 43, 28 },
  { 6811, 3, 1, 0, 0, 43, 28 },
  { 6820, 3, 1, 0, 0, 43, 28 },
  { 6835, 3, 1, 0, 0, 43, 28 },
  { 6844, 3, 1, 0, 0, 43, 28 },
  { 6853, 3, 1, 0, 0, 43, 28 },
  { 6862, 3, 1, 0, 0, 48, 28 },
  { 6871, 3, 1, 0, 0, 48, 28 },
  { 6880, 3, 1, 0, 0, 48, 28 },
  { 6889, 3, 1, 0, 0, 48, 28 },
  { 6898, 3, 1, 0, 0, 48, 28 },
  { 6907, 3, 1, 0, 0, 48, 28 },
  { 7370, 5, 1, 0, 0, 33, 31 },
  { 7375, 6, 1, 0, 0, 33, 31 },
  { 7414, 5, 1, 0, 0, 33, 31 },
  { 7419, 6, 1, 0, 0, 33, 31 },
  { 7447, 6, 1, 0, 0, 33, 31 },
  { 7453, 5, 1, 0, 0, 33, 31 },
  { 7480, 5, 1, 0, 0, 33, 31 },
  { 7485, 6, 1, 0, 0, 33, 31 },
  { 7513, 5, 1, 0, 0, 33, 31 },
  { 7518, 6, 1, 0, 0, 33, 31 },
  { 7628, 4, 1, 0, 0, 26, 31 },
  { 7640, 4, 1, 0, 0, 26, 31 },
  { 7700, 4, 1, 0, 0, 26, 31 },
  { 7712, 4, 1, 0, 0, 26, 31 },
  // 2450: write_imagef, 
  { 6916, 4, 0, 0, 0, 43, 31 },
  { 6928, 4, 0, 0, 0, 43, 31 },
  { 6940, 4, 0, 0, 0, 43, 31 },
  { 6952, 4, 0, 0, 0, 43, 31 },
  { 6964, 4, 0, 0, 0, 43, 31 },
  { 6976, 4, 0, 0, 0, 43, 31 },
  { 6980, 4, 0, 0, 0, 43, 31 },
  { 6984, 4, 0, 0, 0, 43, 31 },
  { 6996, 4, 0, 0, 0, 48, 31 },
  { 7008, 4, 0, 0, 0, 48, 31 },
  { 7020, 4, 0, 0, 0, 48, 31 },
  { 7032, 4, 0, 0, 0, 48, 31 },
  { 7044, 4, 0, 0, 0, 48, 31 },
  { 7056, 4, 0, 0, 0, 48, 31 },
  { 7068, 4, 0, 0, 0, 48, 31 },
  { 7072, 4, 0, 0, 0, 48, 31 },
  { 7535, 5, 0, 0, 0, 34, 31 },
  { 7550, 5, 0, 0, 0, 34, 31 },
  { 7555, 5, 0, 0, 0, 34, 31 },
  { 7570, 5, 0, 0, 0, 34, 31 },
  { 7585, 5, 0, 0, 0, 34, 31 },
  { 7600, 5, 0, 0, 0, 34, 31 },
  { 7605, 5, 0, 0, 0, 34, 31 },
  // 2473: write_imagei, 
  { 6920, 4, 0, 0, 0, 43, 31 },
  { 6932, 4, 0, 0, 0, 43, 31 },
  { 6944, 4, 0, 0, 0, 43, 31 },
  { 6956, 4, 0, 0, 0, 43, 31 },
  { 6968, 4, 0, 0, 0, 43, 31 },
  { 6988, 4, 0, 0, 0, 43, 31 },
  { 7000, 4, 0, 0, 0, 48, 31 },
  { 7012, 4, 0, 0, 0, 48, 31 },
  { 7024, 4, 0, 0, 0, 48, 31 },
  { 7036, 4, 0, 0, 0, 48, 31 },
  { 7048, 4, 0, 0, 0, 48, 31 },
  { 7060, 4, 0, 0, 0, 48, 31 },
  { 7540, 5, 0, 0, 0, 34, 31 },
  { 7560, 5, 0, 0, 0, 34, 31 },
  { 7575, 5, 0, 0, 0, 34, 31 },
  { 7590, 5, 0, 0, 0, 34, 31 },
  { 7610, 5, 0, 0, 0, 34, 31 },
  // 2490: write_imageui, 
  { 6924, 4, 0, 0, 0, 43, 31 },
  { 6936, 4, 0, 0, 0, 43, 31 },
  { 6948, 4, 0, 0, 0, 43, 31 },
  { 6960, 4, 0, 0, 0, 43, 31 },
  { 6972, 4, 0, 0, 0, 43, 31 },
  { 6992, 4, 0, 0, 0, 43, 31 },
  { 7004, 4, 0, 0, 0, 48, 31 },
  { 7016, 4, 0, 0, 0, 48, 31 },
  { 7028, 4, 0, 0, 0, 48, 31 },
  { 7040, 4, 0, 0, 0, 48, 31 },
  { 7052, 4, 0, 0, 0, 48, 31 },
  { 7064, 4, 0, 0, 0, 48, 31 },
  { 7545, 5, 0, 0, 0, 34, 31 },
  { 7565, 5, 0, 0, 0, 34, 31 },
  { 7580, 5, 0, 0, 0, 34, 31 },
  { 7595, 5, 0, 0, 0, 34, 31 },
  { 7615, 5, 0, 0, 0, 34, 31 },
  // 2507: get_image_width, get_image_channel_data_type, get_image_channel_order, 
  { 7076, 2, 0, 1, 0, 43, 31 },
  { 7088, 2, 0, 1, 0, 43, 31 },
  { 7078, 2, 0, 1, 0, 43, 31 },
  { 7080, 2, 0, 1, 0, 43, 31 },
  { 7090, 2, 0, 1, 0, 43, 31 },
  { 7092, 2, 0, 1, 0, 43, 31 },
  { 7094, 2, 0, 1, 0, 43, 31 },
  { 7096, 2, 0, 1, 0, 43, 31 },
  { 7108, 2, 0, 1, 0, 43, 31 },
  { 7110, 2, 0, 1, 0, 43, 31 },
  { 7112, 2, 0, 1, 0, 43, 31 },
  { 7114, 2, 0, 1, 0, 43, 31 },
  { 7116, 2, 0, 1, 0, 43, 31 },
  { 7118, 2, 0, 1, 0, 43, 31 },
  { 7120, 2, 0, 1, 0, 43, 31 },
  { 7122, 2, 0, 1, 0, 43, 31 },
  { 7140, 2, 0, 1, 0, 48, 31 },
  { 7142, 2, 0, 1, 0, 48, 31 },
  { 7144, 2, 0, 1, 0, 48, 31 },
  { 7146, 2, 0, 1, 0, 48, 31 },
  { 7148, 2, 0, 1, 0, 48, 31 },
  { 7150, 2, 0, 1, 0, 48, 31 },
  { 7152, 2, 0, 1, 0, 48, 31 },
  { 7154, 2, 0, 1, 0, 48, 31 },
  { 7652, 2, 0, 1, 0, 26, 31 },
  { 7658, 2, 0, 1, 0, 26, 31 },
  { 7662, 2, 0, 1, 0, 26, 31 },
  { 7666, 2, 0, 1, 0, 26, 31 },
  { 7672, 2, 0, 1, 0, 26, 31 },
  { 7676, 2, 0, 1, 0, 26, 31 },
  { 7680, 2, 0, 1, 0, 26, 31 },
  { 7684, 2, 0, 1, 0, 26, 31 },
  { 7724, 2, 0, 1, 0, 26, 31 },
  { 7728, 2, 0, 1, 0, 26, 31 },
  { 7732, 2, 0, 1, 0, 26, 31 },
  { 7736, 2, 0, 1, 0, 26, 31 },
  // 2543: get_image_height, 
  { 7078, 2, 0, 1, 0, 43, 31 },
  { 7080, 2, 0, 1, 0, 43, 31 },
  { 7092, 2, 0, 1, 0, 43, 31 },
  { 7094, 2, 0, 1, 0, 43, 31 },
  { 7096, 2, 0, 1, 0, 43, 31 },
  { 7112, 2, 0, 1, 0, 43, 31 },
  { 7114, 2, 0, 1, 0, 43, 31 },
  { 7118, 2, 0, 1, 0, 43, 31 },
  { 7120, 2, 0, 1, 0, 43, 31 },
  { 7122, 2, 0, 1, 0, 43, 31 },
  { 7144, 2, 0, 1, 0, 48, 31 },
  { 7146, 2, 0, 1, 0, 48, 31 },
  { 7150, 2, 0, 1, 0, 48, 31 },
  { 7152, 2, 0, 1, 0, 48, 31 },
  { 7154, 2, 0, 1, 0, 48, 31 },
  { 7652, 2, 0, 1, 0, 26, 31 },
  { 7658, 2, 0, 1, 0, 26, 31 },
  { 7662, 2, 0, 1, 0, 26, 31 },
  { 7666, 2, 0, 1, 0, 26, 31 },
  { 7672, 2, 0, 1, 0, 26, 31 },
  { 7676, 2, 0, 1, 0, 26, 31 },
  { 7680, 2, 0, 1, 0, 26, 31 },
  { 7684, 2, 0, 1, 0, 26, 31 },
  { 7724, 2, 0, 1, 0, 26, 31 },
  { 7728, 2, 0, 1, 0, 26, 31 },
  { 7732, 2, 0, 1, 0, 26, 31 },
  { 7736, 2, 0, 1, 0, 26, 31 },
  // 2570: get_image_depth, 
  { 7080, 2, 0, 1, 0, 43, 31 },
  { 7114, 2, 0, 1, 0, 43, 31 },
  { 7146, 2, 0, 1, 0, 48, 31 },
  // 2573: get_image_dim, 
  { 7082, 2, 0, 1, 0, 43, 31 },
  { 7084, 2, 0, 1, 0, 43, 31 },
  { 7098, 2, 0, 1, 0, 43, 31 },
  { 7100, 2, 0, 1, 0, 43, 31 },
  { 7102, 2, 0, 1, 0, 43, 31 },
  { 7124, 2, 0, 1, 0, 43, 31 },
  { 7126, 2, 0, 1, 0, 43, 31 },
  { 7128, 2, 0, 1, 0, 43, 31 },
  { 7130, 2, 0, 1, 0, 43, 31 },
  { 7132, 2, 0, 1, 0, 43, 31 },
  { 7156, 2, 0, 1, 0, 48, 31 },
  { 7158, 2, 0, 1, 0, 48, 31 },
  { 7160, 2, 0, 1, 0, 48, 31 },
  { 7162, 2, 0, 1, 0, 48, 31 },
  { 7164, 2, 0, 1, 0, 48, 31 },
  { 7654, 2, 0, 1, 0, 26, 31 },
  { 7660, 2, 0, 1, 0, 26, 31 },
  { 7664, 2, 0, 1, 0, 26, 31 },
  { 7668, 2, 0, 1, 0, 26, 31 },
  { 7674, 2, 0, 1, 0, 26, 31 },
  { 7678, 2, 0, 1, 0, 26, 31 },
  { 7682, 2, 0, 1, 0, 26, 31 },
  { 7686, 2, 0, 1, 0, 26, 31 },
  { 7726, 2, 0, 1, 0, 26, 31 },
  { 7730, 2, 0, 1, 0, 26, 31 },
  { 7734, 2, 0, 1, 0, 26, 31 },
  { 7738, 2, 0, 1, 0, 26, 31 },
  // 2600: get_image_array_size, 
  { 7086, 2, 0, 1, 0, 43, 31 },
  { 7104, 2, 0, 1, 0, 43, 31 },
  { 7106, 2, 0, 1, 0, 43, 31 },
  { 7134, 2, 0, 1, 0, 43, 31 },
  { 7136, 2, 0, 1, 0, 43, 31 },
  { 7138, 2, 0, 1, 0, 43, 31 },
  { 7166, 2, 0, 1, 0, 48, 31 },
  { 7168, 2, 0, 1, 0, 48, 31 },
  { 7170, 2, 0, 1, 0, 48, 31 },
  { 7656, 2, 0, 1, 0, 26, 31 },
  { 7670, 2, 0, 1, 0, 26, 31 },
  { 7688, 2, 0, 1, 0, 26, 31 },
  { 7690, 2, 0, 1, 0, 26, 31 },
  { 7740, 2, 0, 1, 0, 26, 31 },
  { 7742, 2, 0, 1, 0, 26, 31 },
  // 2615: read_imageh, 
  { 7172, 4, 1, 0, 0, 43, 31 },
  { 7176, 4, 1, 0, 0, 43, 31 },
  { 7180, 4, 1, 0, 0, 43, 31 },
  { 7184, 4, 1, 0, 0, 43, 31 },
  { 7188, 4, 1, 0, 0, 43, 31 },
  { 7192, 4, 1, 0, 0, 43, 31 },
  { 7196, 4, 1, 0, 0, 43, 31 },
  { 7200, 4, 1, 0, 0, 43, 31 },
  { 7204, 4, 1, 0, 0, 43, 31 },
  { 7208, 4, 1, 0, 0, 43, 31 },
  { 7212, 3, 1, 0, 0, 43, 28 },
  { 7215, 3, 1, 0, 0, 43, 28 },
  { 7218, 3, 1, 0, 0, 43, 28 },
  { 7221, 3, 1, 0, 0, 43, 28 },
  { 7224, 3, 1, 0, 0, 43, 28 },
  { 7227, 3, 1, 0, 0, 43, 28 },
  { 7230, 3, 1, 0, 0, 48, 28 },
  { 7233, 3, 1, 0, 0, 48, 28 },
  { 7236, 3, 1, 0, 0, 48, 28 },
  { 7239, 3, 1, 0, 0, 48, 28 },
  { 7242, 3, 1, 0, 0, 48, 28 },
  { 7245, 3, 1, 0, 0, 48, 28 },
  // 2637: write_imageh, 
  { 7248, 4, 0, 0, 0, 43, 31 },
  { 7252, 4, 0, 0, 0, 43, 31 },
  { 7256, 4, 0, 0, 0, 43, 31 },
  { 7260, 4, 0, 0, 0, 43, 31 },
  { 7264, 4, 0, 0, 0, 43, 31 },
  { 7268, 4, 0, 0, 0, 43, 31 },
  { 7272, 4, 0, 0, 0, 48, 31 },
  { 7276, 4, 0, 0, 0, 48, 31 },
  { 7280, 4, 0, 0, 0, 48, 31 },
  { 7284, 4, 0, 0, 0, 48, 31 },
  { 7288, 4, 0, 0, 0, 48, 31 },
  { 7292, 4, 0, 0, 0, 48, 31 },
  // 2649: work_group_all, work_group_any, 
  { 1008, 2, 0, 0, 1, 49, 31 },
  // 2650: work_group_broadcast, 
  { 7296, 3, 0, 0, 1, 49, 31 },
  { 7299, 4, 0, 0, 1, 49, 31 },
  { 7303, 5, 0, 0, 1, 49, 31 },
  // 2653: work_group_reduce_add, work_group_scan_exclusive_add, work_group_scan_inclusive_add, work_group_reduce_min, work_group_scan_exclusive_min, work_group_scan_inclusive_min, work_group_reduce_max, work_group_scan_exclusive_max, work_group_scan_inclusive_max, 
  { 7308, 2, 0, 0, 1, 49, 31 },
  // 2654: is_valid_reserve_id, 
  { 7310, 2, 0, 0, 0, 47, 31 },
  // 2655: enqueue_marker, 
  { 7312, 5, 0, 0, 0, 44, 31 },
  // 2656: retain_event, release_event, 
  { 7317, 2, 0, 0, 0, 44, 31 },
  // 2657: create_user_event, 
  { 7319, 1, 0, 0, 0, 44, 31 },
  // 2658: is_valid_event, 
  { 7320, 2, 0, 0, 0, 44, 31 },
  // 2659: set_user_event_status, 
  { 7322, 3, 0, 0, 0, 44, 31 },
  // 2660: capture_event_profiling_info, 
  { 7325, 4, 0, 0, 0, 44, 31 },
  // 2661: get_default_queue, 
  { 7329, 1, 0, 0, 0, 44, 31 },
  // 2662: ndrange_1D, 
  { 7330, 2, 0, 0, 0, 44, 31 },
  { 7332, 3, 0, 0, 0, 44, 31 },
  { 7335, 4, 0, 0, 0, 44, 31 },
  // 2665: ndrange_2D, ndrange_3D, 
  { 7339, 2, 0, 0, 0, 44, 31 },
  { 7341, 3, 0, 0, 0, 44, 31 },
  { 7344, 4, 0, 0, 0, 44, 31 },
  // 2668: get_image_num_mip_levels, 
  { 7076, 2, 0, 0, 0, 33, 31 },
  { 7078, 2, 0, 0, 0, 33, 31 },
  { 7080, 2, 0, 0, 0, 33, 31 },
  { 7090, 2, 0, 0, 0, 33, 31 },
  { 7092, 2, 0, 0, 0, 33, 31 },
  { 7094, 2, 0, 0, 0, 33, 31 },
  { 7096, 2, 0, 0, 0, 33, 31 },
  { 7108, 2, 0, 0, 0, 33, 31 },
  { 7112, 2, 0, 0, 0, 33, 31 },
  { 7114, 2, 0, 0, 0, 33, 31 },
  { 7116, 2, 0, 0, 0, 33, 31 },
  { 7118, 2, 0, 0, 0, 33, 31 },
  { 7120, 2, 0, 0, 0, 33, 31 },
  { 7122, 2, 0, 0, 0, 33, 31 },
  { 7140, 2, 0, 0, 0, 33, 31 },
  { 7144, 2, 0, 0, 0, 33, 31 },
  { 7146, 2, 0, 0, 0, 33, 31 },
  { 7148, 2, 0, 0, 0, 33, 31 },
  { 7150, 2, 0, 0, 0, 33, 31 },
  { 7152, 2, 0, 0, 0, 33, 31 },
  { 7154, 2, 0, 0, 0, 33, 31 },
  // 2689: get_image_num_samples, 
  { 7652, 2, 0, 1, 0, 26, 31 },
  { 7658, 2, 0, 1, 0, 26, 31 },
  { 7662, 2, 0, 1, 0, 26, 31 },
  { 7666, 2, 0, 1, 0, 26, 31 },
  { 7672, 2, 0, 1, 0, 26, 31 },
  { 7676, 2, 0, 1, 0, 26, 31 },
  { 7680, 2, 0, 1, 0, 26, 31 },
  { 7684, 2, 0, 1, 0, 26, 31 },
  { 7724, 2, 0, 1, 0, 26, 31 },
  { 7728, 2, 0, 1, 0, 26, 31 },
  { 7732, 2, 0, 1, 0, 26, 31 },
  { 7736, 2, 0, 1, 0, 26, 31 },
  // 2701: get_sub_group_size, get_max_sub_group_size, get_num_sub_groups, get_sub_group_id, get_sub_group_local_id, 
  { 1452, 1, 0, 0, 0, 42, 31 },
  // 2702: get_enqueued_num_sub_groups, 
  { 1452, 1, 0, 0, 0, 42, 24 },
  // 2703: sub_group_barrier, 
  { 3794, 2, 0, 0, 1, 42, 31 },
  { 3796, 3, 0, 0, 1, 42, 24 },
  // 2705: sub_group_all, sub_group_any, 
  { 1008, 2, 0, 0, 1, 42, 31 },
  // 2706: sub_group_broadcast, 
  { 7744, 3, 0, 0, 1, 42, 31 },
  { 7747, 3, 0, 0, 1, 37, 31 },
  { 7750, 3, 0, 0, 1, 37, 31 },
  // 2709: sub_group_reduce_add, sub_group_reduce_min, sub_group_reduce_max, sub_group_scan_exclusive_add, sub_group_scan_exclusive_min, sub_group_scan_exclusive_max, sub_group_scan_inclusive_add, sub_group_scan_inclusive_min, sub_group_scan_inclusive_max, 
  { 7308, 2, 0, 0, 1, 42, 31 },
  { 7753, 2, 0, 0, 1, 37, 31 },
  // 2711: sub_group_elect, 
  { 7755, 1, 0, 0, 0, 39, 31 },
  // 2712: sub_group_non_uniform_all, sub_group_non_uniform_any, 
  { 1008, 2, 0, 0, 0, 39, 31 },
  // 2713: sub_group_non_uniform_all_equal, 
  { 7756, 2, 0, 0, 0, 39, 31 },
  // 2714: sub_group_non_uniform_broadcast, 
  { 7758, 3, 0, 0, 0, 35, 31 },
  // 2715: sub_group_broadcast_first, 
  { 7761, 2, 0, 0, 0, 35, 31 },
  // 2716: sub_group_ballot, 
  { 7763, 2, 0, 0, 0, 35, 31 },
  // 2717: sub_group_inverse_ballot, 
  { 7765, 2, 0, 1, 0, 35, 31 },
  // 2718: sub_group_ballot_bit_extract, 
  { 7767, 3, 0, 1, 0, 35, 31 },
  // 2719: sub_group_ballot_bit_count, 
  { 7770, 2, 0, 1, 0, 35, 31 },
  // 2720: sub_group_ballot_inclusive_scan, sub_group_ballot_exclusive_scan, sub_group_ballot_find_lsb, sub_group_ballot_find_msb, 
  { 7770, 2, 0, 0, 0, 35, 31 },
  // 2721: get_sub_group_eq_mask, get_sub_group_ge_mask, get_sub_group_gt_mask, get_sub_group_le_mask, get_sub_group_lt_mask, 
  { 7772, 1, 0, 1, 0, 35, 31 },
  // 2722: sub_group_non_uniform_reduce_add, sub_group_non_uniform_reduce_min, sub_group_non_uniform_reduce_max, sub_group_non_uniform_reduce_mul, sub_group_non_uniform_scan_exclusive_add, sub_group_non_uniform_scan_exclusive_min, sub_group_non_uniform_scan_exclusive_max, sub_group_non_uniform_scan_exclusive_mul, sub_group_non_uniform_scan_inclusive_add, sub_group_non_uniform_scan_inclusive_min, sub_group_non_uniform_scan_inclusive_max, sub_group_non_uniform_scan_inclusive_mul, 
  { 7761, 2, 0, 0, 0, 38, 31 },
  // 2723: sub_group_non_uniform_reduce_and, sub_group_non_uniform_reduce_or, sub_group_non_uniform_reduce_xor, sub_group_non_uniform_scan_exclusive_and, sub_group_non_uniform_scan_exclusive_or, sub_group_non_uniform_scan_exclusive_xor, sub_group_non_uniform_scan_inclusive_and, sub_group_non_uniform_scan_inclusive_or, sub_group_non_uniform_scan_inclusive_xor, 
  { 7773, 2, 0, 0, 0, 38, 31 },
  // 2724: sub_group_non_uniform_reduce_logical_and, sub_group_non_uniform_reduce_logical_or, sub_group_non_uniform_reduce_logical_xor, sub_group_non_uniform_scan_exclusive_logical_and, sub_group_non_uniform_scan_exclusive_logical_or, sub_group_non_uniform_scan_exclusive_logical_xor, sub_group_non_uniform_scan_inclusive_logical_and, sub_group_non_uniform_scan_inclusive_logical_or, sub_group_non_uniform_scan_inclusive_logical_xor, 
  { 1008, 2, 0, 0, 0, 38, 31 },
  // 2725: sub_group_shuffle, sub_group_shuffle_xor, 
  { 7775, 3, 0, 0, 0, 40, 31 },
  // 2726: sub_group_shuffle_up, sub_group_shuffle_down, 
  { 7775, 3, 0, 0, 0, 41, 31 },
  // 2727: sub_group_clustered_reduce_add, sub_group_clustered_reduce_min, sub_group_clustered_reduce_max, sub_group_clustered_reduce_mul, 
  { 7775, 3, 0, 0, 0, 36, 31 },
  // 2728: sub_group_clustered_reduce_and, sub_group_clustered_reduce_or, sub_group_clustered_reduce_xor, 
  { 7778, 3, 0, 0, 0, 36, 31 },
  // 2729: sub_group_clustered_reduce_logical_and, sub_group_clustered_reduce_logical_or, sub_group_clustered_reduce_logical_xor, 
  { 7781, 3, 0, 0, 0, 36, 31 },
  // 2730: bitfield_insert, 
  { 7784, 5, 0, 1, 0, 25, 31 },
  // 2731: bitfield_extract_signed, 
  { 7789, 4, 0, 1, 0, 25, 31 },
  { 7793, 4, 0, 1, 0, 25, 31 },
  // 2733: bitfield_extract_unsigned, 
  { 7797, 4, 0, 1, 0, 25, 31 },
  { 7801, 4, 0, 1, 0, 25, 31 },
  // 2735: bit_reverse, 
  { 1607, 2, 0, 1, 0, 25, 31 },
  // 2736: dot_acc_sat, 
  { 7817, 4, 0, 1, 0, 97, 31 },
  { 7821, 4, 0, 1, 0, 97, 31 },
  { 7825, 4, 0, 1, 0, 97, 31 },
  { 7829, 4, 0, 1, 0, 97, 31 },
  // 2740: dot_4x8packed_uu_uint, 
  { 7833, 3, 0, 1, 0, 98, 31 },
  // 2741: dot_4x8packed_ss_int, dot_4x8packed_us_int, dot_4x8packed_su_int, 
  { 7836, 3, 0, 1, 0, 98, 31 },
  // 2742: dot_acc_sat_4x8packed_uu_uint, 
  { 7839, 4, 0, 1, 0, 98, 31 },
  // 2743: dot_acc_sat_4x8packed_ss_int, dot_acc_sat_4x8packed_us_int, dot_acc_sat_4x8packed_su_int, 
  { 7843, 4, 0, 1, 0, 98, 31 },
  // 2744: sub_group_rotate, 
  { 7847, 3, 0, 0, 1, 99, 31 },
  // 2745: sub_group_clustered_rotate, 
  { 7850, 4, 0, 0, 1, 99, 31 },
  // 2746: arm_dot, 
  { 7805, 3, 0, 0, 0, 3, 31 },
  { 7808, 3, 0, 0, 0, 3, 31 },
  // 2748: arm_dot_acc, 
  { 7817, 4, 0, 0, 0, 0, 31 },
  { 7821, 4, 0, 0, 0, 0, 31 },
  { 7854, 4, 0, 0, 0, 1, 31 },
  { 7858, 4, 0, 0, 0, 1, 31 },
  // 2752: arm_dot_acc_sat, 
  { 7817, 4, 0, 0, 0, 2, 31 },
  { 7821, 4, 0, 0, 0, 2, 31 },
};


// Find out whether a string matches an existing OpenCL builtin function name.
// Returns: A pair <0, 0> if no name matches.
//          A pair <Index, Len> indexing the BuiltinTable if the name is
//          matching an OpenCL builtin function.
static std::pair<unsigned, unsigned> isOpenCLBuiltin(llvm::StringRef Name) {

  switch (Name.size()) {
  default: break;
  case 3:	 // 19 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 3 strings to match.
      switch (Name[1]) {
      default: break;
      case 'b':	 // 1 string to match.
        if (Name[2] != 's')
          break;
        return std::make_pair(783, 1);	 // "abs"
      case 'l':	 // 1 string to match.
        if (Name[2] != 'l')
          break;
        return std::make_pair(854, 1);	 // "all"
      case 'n':	 // 1 string to match.
        if (Name[2] != 'y')
          break;
        return std::make_pair(854, 1);	 // "any"
      }
      break;
    case 'c':	 // 3 strings to match.
      switch (Name[1]) {
      default: break;
      case 'l':	 // 1 string to match.
        if (Name[2] != 'z')
          break;
        return std::make_pair(784, 1);	 // "clz"
      case 'o':	 // 1 string to match.
        if (Name[2] != 's')
          break;
        return std::make_pair(731, 1);	 // "cos"
      case 't':	 // 1 string to match.
        if (Name[2] != 'z')
          break;
        return std::make_pair(786, 1);	 // "ctz"
      }
      break;
    case 'd':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ot", 2) != 0)
        break;
      return std::make_pair(838, 7);	 // "dot"
    case 'e':	 // 2 strings to match.
      switch (Name[1]) {
      default: break;
      case 'r':	 // 1 string to match.
        if (Name[2] != 'f')
          break;
        return std::make_pair(731, 1);	 // "erf"
      case 'x':	 // 1 string to match.
        if (Name[2] != 'p')
          break;
        return std::make_pair(731, 1);	 // "exp"
      }
      break;
    case 'f':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ma", 2) != 0)
        break;
      return std::make_pair(752, 1);	 // "fma"
    case 'l':	 // 1 string to match.
      if (memcmp(Name.data()+1, "og", 2) != 0)
        break;
      return std::make_pair(731, 1);	 // "log"
    case 'm':	 // 4 strings to match.
      switch (Name[1]) {
      default: break;
      case 'a':	 // 2 strings to match.
        switch (Name[2]) {
        default: break;
        case 'd':	 // 1 string to match.
          return std::make_pair(752, 1);	 // "mad"
        case 'x':	 // 1 string to match.
          return std::make_pair(789, 6);	 // "max"
        }
        break;
      case 'i':	 // 2 strings to match.
        switch (Name[2]) {
        default: break;
        case 'n':	 // 1 string to match.
          return std::make_pair(789, 6);	 // "min"
        case 'x':	 // 1 string to match.
          return std::make_pair(816, 4);	 // "mix"
        }
        break;
      }
      break;
    case 'n':	 // 1 string to match.
      if (memcmp(Name.data()+1, "an", 2) != 0)
        break;
      return std::make_pair(732, 3);	 // "nan"
    case 'p':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ow", 2) != 0)
        break;
      return std::make_pair(735, 1);	 // "pow"
    case 's':	 // 1 string to match.
      if (memcmp(Name.data()+1, "in", 2) != 0)
        break;
      return std::make_pair(731, 1);	 // "sin"
    case 't':	 // 1 string to match.
      if (memcmp(Name.data()+1, "an", 2) != 0)
        break;
      return std::make_pair(731, 1);	 // "tan"
    }
    break;
  case 4:	 // 25 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 3 strings to match.
      switch (Name[1]) {
      default: break;
      case 'c':	 // 1 string to match.
        if (memcmp(Name.data()+2, "os", 2) != 0)
          break;
        return std::make_pair(731, 1);	 // "acos"
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+2, "in", 2) != 0)
          break;
        return std::make_pair(731, 1);	 // "asin"
      case 't':	 // 1 string to match.
        if (memcmp(Name.data()+2, "an", 2) != 0)
          break;
        return std::make_pair(731, 1);	 // "atan"
      }
      break;
    case 'c':	 // 3 strings to match.
      switch (Name[1]) {
      default: break;
      case 'b':	 // 1 string to match.
        if (memcmp(Name.data()+2, "rt", 2) != 0)
          break;
        return std::make_pair(731, 1);	 // "cbrt"
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+2, "il", 2) != 0)
          break;
        return std::make_pair(731, 1);	 // "ceil"
      case 'o':	 // 1 string to match.
        if (memcmp(Name.data()+2, "sh", 2) != 0)
          break;
        return std::make_pair(731, 1);	 // "cosh"
      }
      break;
    case 'e':	 // 2 strings to match.
      switch (Name[1]) {
      default: break;
      case 'r':	 // 1 string to match.
        if (memcmp(Name.data()+2, "fc", 2) != 0)
          break;
        return std::make_pair(731, 1);	 // "erfc"
      case 'x':	 // 1 string to match.
        if (memcmp(Name.data()+2, "p2", 2) != 0)
          break;
        return std::make_pair(731, 1);	 // "exp2"
      }
      break;
    case 'f':	 // 5 strings to match.
      switch (Name[1]) {
      default: break;
      case 'a':	 // 1 string to match.
        if (memcmp(Name.data()+2, "bs", 2) != 0)
          break;
        return std::make_pair(731, 1);	 // "fabs"
      case 'd':	 // 1 string to match.
        if (memcmp(Name.data()+2, "im", 2) != 0)
          break;
        return std::make_pair(735, 1);	 // "fdim"
      case 'm':	 // 3 strings to match.
        switch (Name[2]) {
        default: break;
        case 'a':	 // 1 string to match.
          if (Name[3] != 'x')
            break;
          return std::make_pair(736, 4);	 // "fmax"
        case 'i':	 // 1 string to match.
          if (Name[3] != 'n')
            break;
          return std::make_pair(736, 4);	 // "fmin"
        case 'o':	 // 1 string to match.
          if (Name[3] != 'd')
            break;
          return std::make_pair(735, 1);	 // "fmod"
        }
        break;
      }
      break;
    case 'h':	 // 1 string to match.
      if (memcmp(Name.data()+1, "add", 3) != 0)
        break;
      return std::make_pair(788, 1);	 // "hadd"
    case 'l':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "og", 2) != 0)
        break;
      switch (Name[3]) {
      default: break;
      case '2':	 // 1 string to match.
        return std::make_pair(731, 1);	 // "log2"
      case 'b':	 // 1 string to match.
        return std::make_pair(731, 1);	 // "logb"
      }
      break;
    case 'm':	 // 1 string to match.
      if (memcmp(Name.data()+1, "odf", 3) != 0)
        break;
      return std::make_pair(753, 4);	 // "modf"
    case 'p':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "ow", 2) != 0)
        break;
      switch (Name[3]) {
      default: break;
      case 'n':	 // 1 string to match.
        return std::make_pair(749, 3);	 // "pown"
      case 'r':	 // 1 string to match.
        return std::make_pair(735, 1);	 // "powr"
      }
      break;
    case 'r':	 // 1 string to match.
      if (memcmp(Name.data()+1, "int", 3) != 0)
        break;
      return std::make_pair(731, 1);	 // "rint"
    case 's':	 // 4 strings to match.
      switch (Name[1]) {
      default: break;
      case 'i':	 // 2 strings to match.
        switch (Name[2]) {
        default: break;
        case 'g':	 // 1 string to match.
          if (Name[3] != 'n')
            break;
          return std::make_pair(731, 1);	 // "sign"
        case 'n':	 // 1 string to match.
          if (Name[3] != 'h')
            break;
          return std::make_pair(731, 1);	 // "sinh"
        }
        break;
      case 'q':	 // 1 string to match.
        if (memcmp(Name.data()+2, "rt", 2) != 0)
          break;
        return std::make_pair(731, 1);	 // "sqrt"
      case 't':	 // 1 string to match.
        if (memcmp(Name.data()+2, "ep", 2) != 0)
          break;
        return std::make_pair(812, 4);	 // "step"
      }
      break;
    case 't':	 // 1 string to match.
      if (memcmp(Name.data()+1, "anh", 3) != 0)
        break;
      return std::make_pair(731, 1);	 // "tanh"
    }
    break;
  case 5:	 // 28 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 4 strings to match.
      switch (Name[1]) {
      default: break;
      case 'c':	 // 1 string to match.
        if (memcmp(Name.data()+2, "osh", 3) != 0)
          break;
        return std::make_pair(731, 1);	 // "acosh"
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+2, "inh", 3) != 0)
          break;
        return std::make_pair(731, 1);	 // "asinh"
      case 't':	 // 2 strings to match.
        if (memcmp(Name.data()+2, "an", 2) != 0)
          break;
        switch (Name[4]) {
        default: break;
        case '2':	 // 1 string to match.
          return std::make_pair(735, 1);	 // "atan2"
        case 'h':	 // 1 string to match.
          return std::make_pair(731, 1);	 // "atanh"
        }
        break;
      }
      break;
    case 'c':	 // 3 strings to match.
      switch (Name[1]) {
      default: break;
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+2, "amp", 3) != 0)
          break;
        return std::make_pair(801, 6);	 // "clamp"
      case 'o':	 // 1 string to match.
        if (memcmp(Name.data()+2, "spi", 3) != 0)
          break;
        return std::make_pair(731, 1);	 // "cospi"
      case 'r':	 // 1 string to match.
        if (memcmp(Name.data()+2, "oss", 3) != 0)
          break;
        return std::make_pair(832, 6);	 // "cross"
      }
      break;
    case 'e':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "xp", 2) != 0)
        break;
      switch (Name[3]) {
      default: break;
      case '1':	 // 1 string to match.
        if (Name[4] != '0')
          break;
        return std::make_pair(731, 1);	 // "exp10"
      case 'm':	 // 1 string to match.
        if (Name[4] != '1')
          break;
        return std::make_pair(731, 1);	 // "expm1"
      }
      break;
    case 'f':	 // 3 strings to match.
      switch (Name[1]) {
      default: break;
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+2, "oor", 3) != 0)
          break;
        return std::make_pair(731, 1);	 // "floor"
      case 'r':	 // 2 strings to match.
        switch (Name[2]) {
        default: break;
        case 'a':	 // 1 string to match.
          if (memcmp(Name.data()+3, "ct", 2) != 0)
            break;
          return std::make_pair(753, 4);	 // "fract"
        case 'e':	 // 1 string to match.
          if (memcmp(Name.data()+3, "xp", 2) != 0)
            break;
          return std::make_pair(757, 12);	 // "frexp"
        }
        break;
      }
      break;
    case 'h':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ypot", 4) != 0)
        break;
      return std::make_pair(735, 1);	 // "hypot"
    case 'i':	 // 3 strings to match.
      switch (Name[1]) {
      default: break;
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+2, "ogb", 3) != 0)
          break;
        return std::make_pair(740, 3);	 // "ilogb"
      case 's':	 // 2 strings to match.
        switch (Name[2]) {
        default: break;
        case 'i':	 // 1 string to match.
          if (memcmp(Name.data()+3, "nf", 2) != 0)
            break;
          return std::make_pair(849, 5);	 // "isinf"
        case 'n':	 // 1 string to match.
          if (memcmp(Name.data()+3, "an", 2) != 0)
            break;
          return std::make_pair(849, 5);	 // "isnan"
        }
        break;
      }
      break;
    case 'l':	 // 3 strings to match.
      switch (Name[1]) {
      default: break;
      case 'd':	 // 1 string to match.
        if (memcmp(Name.data()+2, "exp", 3) != 0)
          break;
        return std::make_pair(743, 6);	 // "ldexp"
      case 'o':	 // 2 strings to match.
        if (memcmp(Name.data()+2, "g1", 2) != 0)
          break;
        switch (Name[4]) {
        default: break;
        case '0':	 // 1 string to match.
          return std::make_pair(731, 1);	 // "log10"
        case 'p':	 // 1 string to match.
          return std::make_pair(731, 1);	 // "log1p"
        }
        break;
      }
      break;
    case 'm':	 // 2 strings to match.
      switch (Name[1]) {
      default: break;
      case 'a':	 // 1 string to match.
        if (memcmp(Name.data()+2, "d24", 3) != 0)
          break;
        return std::make_pair(808, 2);	 // "mad24"
      case 'u':	 // 1 string to match.
        if (memcmp(Name.data()+2, "l24", 3) != 0)
          break;
        return std::make_pair(810, 2);	 // "mul24"
      }
      break;
    case 'r':	 // 4 strings to match.
      switch (Name[1]) {
      default: break;
      case 'h':	 // 1 string to match.
        if (memcmp(Name.data()+2, "add", 3) != 0)
          break;
        return std::make_pair(788, 1);	 // "rhadd"
      case 'o':	 // 2 strings to match.
        switch (Name[2]) {
        default: break;
        case 'o':	 // 1 string to match.
          if (memcmp(Name.data()+3, "tn", 2) != 0)
            break;
          return std::make_pair(749, 3);	 // "rootn"
        case 'u':	 // 1 string to match.
          if (memcmp(Name.data()+3, "nd", 2) != 0)
            break;
          return std::make_pair(731, 1);	 // "round"
        }
        break;
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+2, "qrt", 3) != 0)
          break;
        return std::make_pair(731, 1);	 // "rsqrt"
      }
      break;
    case 's':	 // 1 string to match.
      if (memcmp(Name.data()+1, "inpi", 4) != 0)
        break;
      return std::make_pair(731, 1);	 // "sinpi"
    case 't':	 // 2 strings to match.
      switch (Name[1]) {
      default: break;
      case 'a':	 // 1 string to match.
        if (memcmp(Name.data()+2, "npi", 3) != 0)
          break;
        return std::make_pair(731, 1);	 // "tanpi"
      case 'r':	 // 1 string to match.
        if (memcmp(Name.data()+2, "unc", 3) != 0)
          break;
        return std::make_pair(731, 1);	 // "trunc"
      }
      break;
    }
    break;
  case 6:	 // 19 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 3 strings to match.
      switch (Name[1]) {
      default: break;
      case 'c':	 // 1 string to match.
        if (memcmp(Name.data()+2, "ospi", 4) != 0)
          break;
        return std::make_pair(731, 1);	 // "acospi"
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+2, "inpi", 4) != 0)
          break;
        return std::make_pair(731, 1);	 // "asinpi"
      case 't':	 // 1 string to match.
        if (memcmp(Name.data()+2, "anpi", 4) != 0)
          break;
        return std::make_pair(731, 1);	 // "atanpi"
      }
      break;
    case 'i':	 // 1 string to match.
      if (memcmp(Name.data()+1, "sless", 5) != 0)
        break;
      return std::make_pair(855, 5);	 // "isless"
    case 'l':	 // 2 strings to match.
      switch (Name[1]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+2, "ngth", 4) != 0)
          break;
        return std::make_pair(824, 3);	 // "length"
      case 'g':	 // 1 string to match.
        if (memcmp(Name.data()+2, "amma", 4) != 0)
          break;
        return std::make_pair(731, 1);	 // "lgamma"
      }
      break;
    case 'm':	 // 4 strings to match.
      switch (Name[1]) {
      default: break;
      case 'a':	 // 2 strings to match.
        switch (Name[2]) {
        default: break;
        case 'd':	 // 1 string to match.
          if (memcmp(Name.data()+3, "_hi", 3) != 0)
            break;
          return std::make_pair(807, 1);	 // "mad_hi"
        case 'x':	 // 1 string to match.
          if (memcmp(Name.data()+3, "mag", 3) != 0)
            break;
          return std::make_pair(735, 1);	 // "maxmag"
        }
        break;
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+2, "nmag", 4) != 0)
          break;
        return std::make_pair(735, 1);	 // "minmag"
      case 'u':	 // 1 string to match.
        if (memcmp(Name.data()+2, "l_hi", 4) != 0)
          break;
        return std::make_pair(788, 1);	 // "mul_hi"
      }
      break;
    case 'r':	 // 2 strings to match.
      switch (Name[1]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+2, "mquo", 4) != 0)
          break;
        return std::make_pair(769, 12);	 // "remquo"
      case 'o':	 // 1 string to match.
        if (memcmp(Name.data()+2, "tate", 4) != 0)
          break;
        return std::make_pair(788, 1);	 // "rotate"
      }
      break;
    case 's':	 // 2 strings to match.
      switch (Name[1]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+2, "lect", 4) != 0)
          break;
        return std::make_pair(861, 10);	 // "select"
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+2, "ncos", 4) != 0)
          break;
        return std::make_pair(753, 4);	 // "sincos"
      }
      break;
    case 't':	 // 1 string to match.
      if (memcmp(Name.data()+1, "gamma", 5) != 0)
        break;
      return std::make_pair(731, 1);	 // "tgamma"
    case 'v':	 // 4 strings to match.
      if (memcmp(Name.data()+1, "load", 4) != 0)
        break;
      switch (Name[5]) {
      default: break;
      case '2':	 // 1 string to match.
        return std::make_pair(871, 55);	 // "vload2"
      case '3':	 // 1 string to match.
        return std::make_pair(970, 55);	 // "vload3"
      case '4':	 // 1 string to match.
        return std::make_pair(1069, 55);	 // "vload4"
      case '8':	 // 1 string to match.
        return std::make_pair(1168, 55);	 // "vload8"
      }
      break;
    }
    break;
  case 7:	 // 17 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 4 strings to match.
      switch (Name[1]) {
      default: break;
      case 'd':	 // 1 string to match.
        if (memcmp(Name.data()+2, "d_sat", 5) != 0)
          break;
        return std::make_pair(788, 1);	 // "add_sat"
      case 'r':	 // 1 string to match.
        if (memcmp(Name.data()+2, "m_dot", 5) != 0)
          break;
        return std::make_pair(2746, 2);	 // "arm_dot"
      case 't':	 // 2 strings to match.
        switch (Name[2]) {
        default: break;
        case 'a':	 // 1 string to match.
          if (memcmp(Name.data()+3, "n2pi", 4) != 0)
            break;
          return std::make_pair(735, 1);	 // "atan2pi"
        case 'o':	 // 1 string to match.
          if (memcmp(Name.data()+3, "m_or", 4) != 0)
            break;
          return std::make_pair(1480, 8);	 // "atom_or"
        }
        break;
      }
      break;
    case 'b':	 // 1 string to match.
      if (memcmp(Name.data()+1, "arrier", 6) != 0)
        break;
      return std::make_pair(1444, 1);	 // "barrier"
    case 'd':	 // 1 string to match.
      if (memcmp(Name.data()+1, "egrees", 6) != 0)
        break;
      return std::make_pair(731, 1);	 // "degrees"
    case 'i':	 // 1 string to match.
      if (memcmp(Name.data()+1, "sequal", 6) != 0)
        break;
      return std::make_pair(855, 5);	 // "isequal"
    case 'm':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ad_sat", 6) != 0)
        break;
      return std::make_pair(807, 1);	 // "mad_sat"
    case 'r':	 // 1 string to match.
      if (memcmp(Name.data()+1, "adians", 6) != 0)
        break;
      return std::make_pair(731, 1);	 // "radians"
    case 's':	 // 3 strings to match.
      switch (Name[1]) {
      default: break;
      case 'h':	 // 1 string to match.
        if (memcmp(Name.data()+2, "uffle", 5) != 0)
          break;
        return std::make_pair(1974, 176);	 // "shuffle"
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+2, "gnbit", 5) != 0)
          break;
        return std::make_pair(849, 5);	 // "signbit"
      case 'u':	 // 1 string to match.
        if (memcmp(Name.data()+2, "b_sat", 5) != 0)
          break;
        return std::make_pair(788, 1);	 // "sub_sat"
      }
      break;
    case 'v':	 // 5 strings to match.
      switch (Name[1]) {
      default: break;
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+2, "oad16", 5) != 0)
          break;
        return std::make_pair(1267, 55);	 // "vload16"
      case 's':	 // 4 strings to match.
        if (memcmp(Name.data()+2, "tore", 4) != 0)
          break;
        switch (Name[6]) {
        default: break;
        case '2':	 // 1 string to match.
          return std::make_pair(926, 44);	 // "vstore2"
        case '3':	 // 1 string to match.
          return std::make_pair(1025, 44);	 // "vstore3"
        case '4':	 // 1 string to match.
          return std::make_pair(1124, 44);	 // "vstore4"
        case '8':	 // 1 string to match.
          return std::make_pair(1223, 44);	 // "vstore8"
        }
        break;
      }
      break;
    }
    break;
  case 8:	 // 24 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 9 strings to match.
      switch (Name[1]) {
      default: break;
      case 'b':	 // 1 string to match.
        if (memcmp(Name.data()+2, "s_diff", 6) != 0)
          break;
        return std::make_pair(787, 1);	 // "abs_diff"
      case 't':	 // 8 strings to match.
        if (memcmp(Name.data()+2, "om_", 3) != 0)
          break;
        switch (Name[5]) {
        default: break;
        case 'a':	 // 2 strings to match.
          switch (Name[6]) {
          default: break;
          case 'd':	 // 1 string to match.
            if (Name[7] != 'd')
              break;
            return std::make_pair(1456, 8);	 // "atom_add"
          case 'n':	 // 1 string to match.
            if (Name[7] != 'd')
              break;
            return std::make_pair(1480, 8);	 // "atom_and"
          }
          break;
        case 'd':	 // 1 string to match.
          if (memcmp(Name.data()+6, "ec", 2) != 0)
            break;
          return std::make_pair(1464, 8);	 // "atom_dec"
        case 'i':	 // 1 string to match.
          if (memcmp(Name.data()+6, "nc", 2) != 0)
            break;
          return std::make_pair(1464, 8);	 // "atom_inc"
        case 'm':	 // 2 strings to match.
          switch (Name[6]) {
          default: break;
          case 'a':	 // 1 string to match.
            if (Name[7] != 'x')
              break;
            return std::make_pair(1480, 8);	 // "atom_max"
          case 'i':	 // 1 string to match.
            if (Name[7] != 'n')
              break;
            return std::make_pair(1480, 8);	 // "atom_min"
          }
          break;
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+6, "ub", 2) != 0)
            break;
          return std::make_pair(1456, 8);	 // "atom_sub"
        case 'x':	 // 1 string to match.
          if (memcmp(Name.data()+6, "or", 2) != 0)
            break;
          return std::make_pair(1480, 8);	 // "atom_xor"
        }
        break;
      }
      break;
    case 'c':	 // 1 string to match.
      if (memcmp(Name.data()+1, "opysign", 7) != 0)
        break;
      return std::make_pair(735, 1);	 // "copysign"
    case 'd':	 // 1 string to match.
      if (memcmp(Name.data()+1, "istance", 7) != 0)
        break;
      return std::make_pair(845, 3);	 // "distance"
    case 'h':	 // 5 strings to match.
      if (memcmp(Name.data()+1, "alf_", 4) != 0)
        break;
      switch (Name[5]) {
      default: break;
      case 'c':	 // 1 string to match.
        if (memcmp(Name.data()+6, "os", 2) != 0)
          break;
        return std::make_pair(781, 1);	 // "half_cos"
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+6, "xp", 2) != 0)
          break;
        return std::make_pair(781, 1);	 // "half_exp"
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+6, "og", 2) != 0)
          break;
        return std::make_pair(781, 1);	 // "half_log"
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+6, "in", 2) != 0)
          break;
        return std::make_pair(781, 1);	 // "half_sin"
      case 't':	 // 1 string to match.
        if (memcmp(Name.data()+6, "an", 2) != 0)
          break;
        return std::make_pair(781, 1);	 // "half_tan"
      }
      break;
    case 'i':	 // 2 strings to match.
      if (Name[1] != 's')
        break;
      switch (Name[2]) {
      default: break;
      case 'f':	 // 1 string to match.
        if (memcmp(Name.data()+3, "inite", 5) != 0)
          break;
        return std::make_pair(849, 5);	 // "isfinite"
      case 'n':	 // 1 string to match.
        if (memcmp(Name.data()+3, "ormal", 5) != 0)
          break;
        return std::make_pair(849, 5);	 // "isnormal"
      }
      break;
    case 'l':	 // 1 string to match.
      if (memcmp(Name.data()+1, "gamma_r", 7) != 0)
        break;
      return std::make_pair(757, 12);	 // "lgamma_r"
    case 'p':	 // 2 strings to match.
      switch (Name[1]) {
      default: break;
      case 'o':	 // 1 string to match.
        if (memcmp(Name.data()+2, "pcount", 6) != 0)
          break;
        return std::make_pair(785, 1);	 // "popcount"
      case 'r':	 // 1 string to match.
        if (memcmp(Name.data()+2, "efetch", 6) != 0)
          break;
        return std::make_pair(1455, 1);	 // "prefetch"
      }
      break;
    case 's':	 // 1 string to match.
      if (memcmp(Name.data()+1, "huffle2", 7) != 0)
        break;
      return std::make_pair(2150, 176);	 // "shuffle2"
    case 'u':	 // 1 string to match.
      if (memcmp(Name.data()+1, "psample", 7) != 0)
        break;
      return std::make_pair(795, 6);	 // "upsample"
    case 'v':	 // 1 string to match.
      if (memcmp(Name.data()+1, "store16", 7) != 0)
        break;
      return std::make_pair(1322, 44);	 // "vstore16"
    }
    break;
  case 9:	 // 14 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "tom", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case '_':	 // 1 string to match.
        if (memcmp(Name.data()+5, "xchg", 4) != 0)
          break;
        return std::make_pair(1456, 8);	 // "atom_xchg"
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+5, "c_or", 4) != 0)
          break;
        return std::make_pair(1496, 6);	 // "atomic_or"
      }
      break;
    case 'b':	 // 1 string to match.
      if (memcmp(Name.data()+1, "itselect", 8) != 0)
        break;
      return std::make_pair(860, 1);	 // "bitselect"
    case 'g':	 // 1 string to match.
      if (memcmp(Name.data()+1, "et_fence", 8) != 0)
        break;
      return std::make_pair(1448, 2);	 // "get_fence"
    case 'h':	 // 4 strings to match.
      if (memcmp(Name.data()+1, "alf_", 4) != 0)
        break;
      switch (Name[5]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+6, "xp2", 3) != 0)
          break;
        return std::make_pair(781, 1);	 // "half_exp2"
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+6, "og2", 3) != 0)
          break;
        return std::make_pair(781, 1);	 // "half_log2"
      case 'p':	 // 1 string to match.
        if (memcmp(Name.data()+6, "owr", 3) != 0)
          break;
        return std::make_pair(782, 1);	 // "half_powr"
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+6, "qrt", 3) != 0)
          break;
        return std::make_pair(781, 1);	 // "half_sqrt"
      }
      break;
    case 'i':	 // 2 strings to match.
      if (Name[1] != 's')
        break;
      switch (Name[2]) {
      default: break;
      case 'g':	 // 1 string to match.
        if (memcmp(Name.data()+3, "reater", 6) != 0)
          break;
        return std::make_pair(855, 5);	 // "isgreater"
      case 'o':	 // 1 string to match.
        if (memcmp(Name.data()+3, "rdered", 6) != 0)
          break;
        return std::make_pair(855, 5);	 // "isordered"
      }
      break;
    case 'm':	 // 1 string to match.
      if (memcmp(Name.data()+1, "em_fence", 8) != 0)
        break;
      return std::make_pair(1447, 1);	 // "mem_fence"
    case 'n':	 // 2 strings to match.
      switch (Name[1]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+2, "xtafter", 7) != 0)
          break;
        return std::make_pair(735, 1);	 // "nextafter"
      case 'o':	 // 1 string to match.
        if (memcmp(Name.data()+2, "rmalize", 7) != 0)
          break;
        return std::make_pair(827, 3);	 // "normalize"
      }
      break;
    case 'r':	 // 1 string to match.
      if (memcmp(Name.data()+1, "emainder", 8) != 0)
        break;
      return std::make_pair(735, 1);	 // "remainder"
    }
    break;
  case 10:	 // 23 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 8 strings to match.
      if (memcmp(Name.data()+1, "tomic_", 6) != 0)
        break;
      switch (Name[7]) {
      default: break;
      case 'a':	 // 2 strings to match.
        switch (Name[8]) {
        default: break;
        case 'd':	 // 1 string to match.
          if (Name[9] != 'd')
            break;
          return std::make_pair(1496, 6);	 // "atomic_add"
        case 'n':	 // 1 string to match.
          if (Name[9] != 'd')
            break;
          return std::make_pair(1496, 6);	 // "atomic_and"
        }
        break;
      case 'd':	 // 1 string to match.
        if (memcmp(Name.data()+8, "ec", 2) != 0)
          break;
        return std::make_pair(1502, 6);	 // "atomic_dec"
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+8, "nc", 2) != 0)
          break;
        return std::make_pair(1502, 6);	 // "atomic_inc"
      case 'm':	 // 2 strings to match.
        switch (Name[8]) {
        default: break;
        case 'a':	 // 1 string to match.
          if (Name[9] != 'x')
            break;
          return std::make_pair(1496, 6);	 // "atomic_max"
        case 'i':	 // 1 string to match.
          if (Name[9] != 'n')
            break;
          return std::make_pair(1496, 6);	 // "atomic_min"
        }
        break;
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+8, "ub", 2) != 0)
          break;
        return std::make_pair(1496, 6);	 // "atomic_sub"
      case 'x':	 // 1 string to match.
        if (memcmp(Name.data()+8, "or", 2) != 0)
          break;
        return std::make_pair(1496, 6);	 // "atomic_xor"
      }
      break;
    case 'h':	 // 4 strings to match.
      if (memcmp(Name.data()+1, "alf_", 4) != 0)
        break;
      switch (Name[5]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+6, "xp10", 4) != 0)
          break;
        return std::make_pair(781, 1);	 // "half_exp10"
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+6, "og10", 4) != 0)
          break;
        return std::make_pair(781, 1);	 // "half_log10"
      case 'r':	 // 2 strings to match.
        switch (Name[6]) {
        default: break;
        case 'e':	 // 1 string to match.
          if (memcmp(Name.data()+7, "cip", 3) != 0)
            break;
          return std::make_pair(781, 1);	 // "half_recip"
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+7, "qrt", 3) != 0)
            break;
          return std::make_pair(781, 1);	 // "half_rsqrt"
        }
        break;
      }
      break;
    case 'i':	 // 1 string to match.
      if (memcmp(Name.data()+1, "snotequal", 9) != 0)
        break;
      return std::make_pair(855, 5);	 // "isnotequal"
    case 'n':	 // 8 strings to match.
      switch (Name[1]) {
      default: break;
      case 'a':	 // 5 strings to match.
        if (memcmp(Name.data()+2, "tive_", 5) != 0)
          break;
        switch (Name[7]) {
        default: break;
        case 'c':	 // 1 string to match.
          if (memcmp(Name.data()+8, "os", 2) != 0)
            break;
          return std::make_pair(781, 1);	 // "native_cos"
        case 'e':	 // 1 string to match.
          if (memcmp(Name.data()+8, "xp", 2) != 0)
            break;
          return std::make_pair(781, 1);	 // "native_exp"
        case 'l':	 // 1 string to match.
          if (memcmp(Name.data()+8, "og", 2) != 0)
            break;
          return std::make_pair(781, 1);	 // "native_log"
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+8, "in", 2) != 0)
            break;
          return std::make_pair(781, 1);	 // "native_sin"
        case 't':	 // 1 string to match.
          if (memcmp(Name.data()+8, "an", 2) != 0)
            break;
          return std::make_pair(781, 1);	 // "native_tan"
        }
        break;
      case 'd':	 // 3 strings to match.
        if (memcmp(Name.data()+2, "range_", 6) != 0)
          break;
        switch (Name[8]) {
        default: break;
        case '1':	 // 1 string to match.
          if (Name[9] != 'D')
            break;
          return std::make_pair(2662, 3);	 // "ndrange_1D"
        case '2':	 // 1 string to match.
          if (Name[9] != 'D')
            break;
          return std::make_pair(2665, 3);	 // "ndrange_2D"
        case '3':	 // 1 string to match.
          if (Name[9] != 'D')
            break;
          return std::make_pair(2665, 3);	 // "ndrange_3D"
        }
        break;
      }
      break;
    case 's':	 // 1 string to match.
      if (memcmp(Name.data()+1, "moothstep", 9) != 0)
        break;
      return std::make_pair(820, 4);	 // "smoothstep"
    case 'v':	 // 1 string to match.
      if (memcmp(Name.data()+1, "load_half", 9) != 0)
        break;
      return std::make_pair(1366, 5);	 // "vload_half"
    }
    break;
  case 11:	 // 23 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 4 strings to match.
      switch (Name[1]) {
      default: break;
      case 'r':	 // 1 string to match.
        if (memcmp(Name.data()+2, "m_dot_acc", 9) != 0)
          break;
        return std::make_pair(2748, 4);	 // "arm_dot_acc"
      case 't':	 // 3 strings to match.
        if (memcmp(Name.data()+2, "omic_", 5) != 0)
          break;
        switch (Name[7]) {
        default: break;
        case 'i':	 // 1 string to match.
          if (memcmp(Name.data()+8, "nit", 3) != 0)
            break;
          return std::make_pair(1577, 18);	 // "atomic_init"
        case 'l':	 // 1 string to match.
          if (memcmp(Name.data()+8, "oad", 3) != 0)
            break;
          return std::make_pair(1722, 21);	 // "atomic_load"
        case 'x':	 // 1 string to match.
          if (memcmp(Name.data()+8, "chg", 3) != 0)
            break;
          return std::make_pair(1488, 8);	 // "atomic_xchg"
        }
        break;
      }
      break;
    case 'b':	 // 1 string to match.
      if (memcmp(Name.data()+1, "it_reverse", 10) != 0)
        break;
      return std::make_pair(2735, 1);	 // "bit_reverse"
    case 'c':	 // 1 string to match.
      if (memcmp(Name.data()+1, "onvert_int", 10) != 0)
        break;
      return std::make_pair(463, 11);	 // "convert_int"
    case 'd':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ot_acc_sat", 10) != 0)
        break;
      return std::make_pair(2736, 4);	 // "dot_acc_sat"
    case 'f':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ast_length", 10) != 0)
        break;
      return std::make_pair(830, 1);	 // "fast_length"
    case 'h':	 // 1 string to match.
      if (memcmp(Name.data()+1, "alf_divide", 10) != 0)
        break;
      return std::make_pair(782, 1);	 // "half_divide"
    case 'i':	 // 2 strings to match.
      if (Name[1] != 's')
        break;
      switch (Name[2]) {
      default: break;
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+3, "essequal", 8) != 0)
          break;
        return std::make_pair(855, 5);	 // "islessequal"
      case 'u':	 // 1 string to match.
        if (memcmp(Name.data()+3, "nordered", 8) != 0)
          break;
        return std::make_pair(855, 5);	 // "isunordered"
      }
      break;
    case 'n':	 // 4 strings to match.
      if (memcmp(Name.data()+1, "ative_", 6) != 0)
        break;
      switch (Name[7]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+8, "xp2", 3) != 0)
          break;
        return std::make_pair(781, 1);	 // "native_exp2"
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+8, "og2", 3) != 0)
          break;
        return std::make_pair(781, 1);	 // "native_log2"
      case 'p':	 // 1 string to match.
        if (memcmp(Name.data()+8, "owr", 3) != 0)
          break;
        return std::make_pair(782, 1);	 // "native_powr"
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+8, "qrt", 3) != 0)
          break;
        return std::make_pair(781, 1);	 // "native_sqrt"
      }
      break;
    case 'r':	 // 3 strings to match.
      if (memcmp(Name.data()+1, "ead_image", 9) != 0)
        break;
      switch (Name[10]) {
      default: break;
      case 'f':	 // 1 string to match.
        return std::make_pair(2326, 52);	 // "read_imagef"
      case 'h':	 // 1 string to match.
        return std::make_pair(2615, 22);	 // "read_imageh"
      case 'i':	 // 1 string to match.
        return std::make_pair(2378, 36);	 // "read_imagei"
      }
      break;
    case 'v':	 // 5 strings to match.
      switch (Name[1]) {
      default: break;
      case 'l':	 // 4 strings to match.
        if (memcmp(Name.data()+2, "oad_half", 8) != 0)
          break;
        switch (Name[10]) {
        default: break;
        case '2':	 // 1 string to match.
          return std::make_pair(1371, 5);	 // "vload_half2"
        case '3':	 // 1 string to match.
          return std::make_pair(1392, 5);	 // "vload_half3"
        case '4':	 // 1 string to match.
          return std::make_pair(1397, 5);	 // "vload_half4"
        case '8':	 // 1 string to match.
          return std::make_pair(1402, 5);	 // "vload_half8"
        }
        break;
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+2, "tore_half", 9) != 0)
          break;
        return std::make_pair(1376, 8);	 // "vstore_half"
      }
      break;
    }
    break;
  case 12:	 // 31 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "tom", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case '_':	 // 1 string to match.
        if (memcmp(Name.data()+5, "cmpxchg", 7) != 0)
          break;
        return std::make_pair(1472, 8);	 // "atom_cmpxchg"
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+5, "c_store", 7) != 0)
          break;
        return std::make_pair(1514, 21);	 // "atomic_store"
      }
      break;
    case 'c':	 // 8 strings to match.
      if (memcmp(Name.data()+1, "onvert_", 7) != 0)
        break;
      switch (Name[8]) {
      default: break;
      case 'c':	 // 1 string to match.
        if (memcmp(Name.data()+9, "har", 3) != 0)
          break;
        return std::make_pair(199, 11);	 // "convert_char"
      case 'h':	 // 1 string to match.
        if (memcmp(Name.data()+9, "alf", 3) != 0)
          break;
        return std::make_pair(133, 11);	 // "convert_half"
      case 'i':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "nt", 2) != 0)
          break;
        switch (Name[11]) {
        default: break;
        case '2':	 // 1 string to match.
          return std::make_pair(474, 11);	 // "convert_int2"
        case '3':	 // 1 string to match.
          return std::make_pair(485, 11);	 // "convert_int3"
        case '4':	 // 1 string to match.
          return std::make_pair(496, 11);	 // "convert_int4"
        case '8':	 // 1 string to match.
          return std::make_pair(507, 11);	 // "convert_int8"
        }
        break;
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+9, "ong", 3) != 0)
          break;
        return std::make_pair(595, 11);	 // "convert_long"
      case 'u':	 // 1 string to match.
        if (memcmp(Name.data()+9, "int", 3) != 0)
          break;
        return std::make_pair(529, 11);	 // "convert_uint"
      }
      break;
    case 'g':	 // 3 strings to match.
      if (memcmp(Name.data()+1, "et_", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case 'g':	 // 1 string to match.
        if (memcmp(Name.data()+5, "roup_id", 7) != 0)
          break;
        return std::make_pair(728, 1);	 // "get_group_id"
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+5, "ocal_id", 7) != 0)
          break;
        return std::make_pair(728, 1);	 // "get_local_id"
      case 'w':	 // 1 string to match.
        if (memcmp(Name.data()+5, "ork_dim", 7) != 0)
          break;
        return std::make_pair(727, 1);	 // "get_work_dim"
      }
      break;
    case 'n':	 // 4 strings to match.
      if (memcmp(Name.data()+1, "ative_", 6) != 0)
        break;
      switch (Name[7]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+8, "xp10", 4) != 0)
          break;
        return std::make_pair(781, 1);	 // "native_exp10"
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+8, "og10", 4) != 0)
          break;
        return std::make_pair(781, 1);	 // "native_log10"
      case 'r':	 // 2 strings to match.
        switch (Name[8]) {
        default: break;
        case 'e':	 // 1 string to match.
          if (memcmp(Name.data()+9, "cip", 3) != 0)
            break;
          return std::make_pair(781, 1);	 // "native_recip"
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+9, "qrt", 3) != 0)
            break;
          return std::make_pair(781, 1);	 // "native_rsqrt"
        }
        break;
      }
      break;
    case 'r':	 // 2 strings to match.
      if (Name[1] != 'e')
        break;
      switch (Name[2]) {
      default: break;
      case 'a':	 // 1 string to match.
        if (memcmp(Name.data()+3, "d_imageui", 9) != 0)
          break;
        return std::make_pair(2414, 36);	 // "read_imageui"
      case 't':	 // 1 string to match.
        if (memcmp(Name.data()+3, "ain_event", 9) != 0)
          break;
        return std::make_pair(2656, 1);	 // "retain_event"
      }
      break;
    case 'v':	 // 9 strings to match.
      switch (Name[1]) {
      default: break;
      case 'l':	 // 5 strings to match.
        if (memcmp(Name.data()+2, "oad", 3) != 0)
          break;
        switch (Name[5]) {
        default: break;
        case '_':	 // 1 string to match.
          if (memcmp(Name.data()+6, "half16", 6) != 0)
            break;
          return std::make_pair(1407, 5);	 // "vload_half16"
        case 'a':	 // 4 strings to match.
          if (memcmp(Name.data()+6, "_half", 5) != 0)
            break;
          switch (Name[11]) {
          default: break;
          case '2':	 // 1 string to match.
            return std::make_pair(1371, 5);	 // "vloada_half2"
          case '3':	 // 1 string to match.
            return std::make_pair(1392, 5);	 // "vloada_half3"
          case '4':	 // 1 string to match.
            return std::make_pair(1397, 5);	 // "vloada_half4"
          case '8':	 // 1 string to match.
            return std::make_pair(1402, 5);	 // "vloada_half8"
          }
          break;
        }
        break;
      case 's':	 // 4 strings to match.
        if (memcmp(Name.data()+2, "tore_half", 9) != 0)
          break;
        switch (Name[11]) {
        default: break;
        case '2':	 // 1 string to match.
          return std::make_pair(1384, 8);	 // "vstore_half2"
        case '3':	 // 1 string to match.
          return std::make_pair(1412, 8);	 // "vstore_half3"
        case '4':	 // 1 string to match.
          return std::make_pair(1420, 8);	 // "vstore_half4"
        case '8':	 // 1 string to match.
          return std::make_pair(1428, 8);	 // "vstore_half8"
        }
        break;
      }
      break;
    case 'w':	 // 3 strings to match.
      if (memcmp(Name.data()+1, "rite_image", 10) != 0)
        break;
      switch (Name[11]) {
      default: break;
      case 'f':	 // 1 string to match.
        return std::make_pair(2450, 23);	 // "write_imagef"
      case 'h':	 // 1 string to match.
        return std::make_pair(2637, 12);	 // "write_imageh"
      case 'i':	 // 1 string to match.
        return std::make_pair(2473, 17);	 // "write_imagei"
      }
      break;
    }
    break;
  case 13:	 // 36 strings to match.
    switch (Name[0]) {
    default: break;
    case 'c':	 // 21 strings to match.
      if (memcmp(Name.data()+1, "onvert_", 7) != 0)
        break;
      switch (Name[8]) {
      default: break;
      case 'c':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "har", 3) != 0)
          break;
        switch (Name[12]) {
        default: break;
        case '2':	 // 1 string to match.
          return std::make_pair(210, 11);	 // "convert_char2"
        case '3':	 // 1 string to match.
          return std::make_pair(221, 11);	 // "convert_char3"
        case '4':	 // 1 string to match.
          return std::make_pair(232, 11);	 // "convert_char4"
        case '8':	 // 1 string to match.
          return std::make_pair(243, 11);	 // "convert_char8"
        }
        break;
      case 'f':	 // 1 string to match.
        if (memcmp(Name.data()+9, "loat", 4) != 0)
          break;
        return std::make_pair(1, 11);	 // "convert_float"
      case 'h':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "alf", 3) != 0)
          break;
        switch (Name[12]) {
        default: break;
        case '2':	 // 1 string to match.
          return std::make_pair(144, 11);	 // "convert_half2"
        case '3':	 // 1 string to match.
          return std::make_pair(155, 11);	 // "convert_half3"
        case '4':	 // 1 string to match.
          return std::make_pair(166, 11);	 // "convert_half4"
        case '8':	 // 1 string to match.
          return std::make_pair(177, 11);	 // "convert_half8"
        }
        break;
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+9, "nt16", 4) != 0)
          break;
        return std::make_pair(518, 11);	 // "convert_int16"
      case 'l':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "ong", 3) != 0)
          break;
        switch (Name[12]) {
        default: break;
        case '2':	 // 1 string to match.
          return std::make_pair(606, 11);	 // "convert_long2"
        case '3':	 // 1 string to match.
          return std::make_pair(617, 11);	 // "convert_long3"
        case '4':	 // 1 string to match.
          return std::make_pair(628, 11);	 // "convert_long4"
        case '8':	 // 1 string to match.
          return std::make_pair(639, 11);	 // "convert_long8"
        }
        break;
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+9, "hort", 4) != 0)
          break;
        return std::make_pair(331, 11);	 // "convert_short"
      case 'u':	 // 6 strings to match.
        switch (Name[9]) {
        default: break;
        case 'c':	 // 1 string to match.
          if (memcmp(Name.data()+10, "har", 3) != 0)
            break;
          return std::make_pair(265, 11);	 // "convert_uchar"
        case 'i':	 // 4 strings to match.
          if (memcmp(Name.data()+10, "nt", 2) != 0)
            break;
          switch (Name[12]) {
          default: break;
          case '2':	 // 1 string to match.
            return std::make_pair(540, 11);	 // "convert_uint2"
          case '3':	 // 1 string to match.
            return std::make_pair(551, 11);	 // "convert_uint3"
          case '4':	 // 1 string to match.
            return std::make_pair(562, 11);	 // "convert_uint4"
          case '8':	 // 1 string to match.
            return std::make_pair(573, 11);	 // "convert_uint8"
          }
          break;
        case 'l':	 // 1 string to match.
          if (memcmp(Name.data()+10, "ong", 3) != 0)
            break;
          return std::make_pair(661, 11);	 // "convert_ulong"
        }
        break;
      }
      break;
    case 'f':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ast_distance", 12) != 0)
        break;
      return std::make_pair(848, 1);	 // "fast_distance"
    case 'g':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "et_", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case 'g':	 // 1 string to match.
        if (memcmp(Name.data()+5, "lobal_id", 8) != 0)
          break;
        return std::make_pair(728, 1);	 // "get_global_id"
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+5, "mage_dim", 8) != 0)
          break;
        return std::make_pair(2573, 27);	 // "get_image_dim"
      }
      break;
    case 'i':	 // 1 string to match.
      if (memcmp(Name.data()+1, "slessgreater", 12) != 0)
        break;
      return std::make_pair(855, 5);	 // "islessgreater"
    case 'n':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ative_divide", 12) != 0)
        break;
      return std::make_pair(782, 1);	 // "native_divide"
    case 'r':	 // 1 string to match.
      if (memcmp(Name.data()+1, "elease_event", 12) != 0)
        break;
      return std::make_pair(2656, 1);	 // "release_event"
    case 's':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "ub_group_a", 10) != 0)
        break;
      switch (Name[11]) {
      default: break;
      case 'l':	 // 1 string to match.
        if (Name[12] != 'l')
          break;
        return std::make_pair(2705, 1);	 // "sub_group_all"
      case 'n':	 // 1 string to match.
        if (Name[12] != 'y')
          break;
        return std::make_pair(2705, 1);	 // "sub_group_any"
      }
      break;
    case 'v':	 // 6 strings to match.
      switch (Name[1]) {
      default: break;
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+2, "oada_half16", 11) != 0)
          break;
        return std::make_pair(1407, 5);	 // "vloada_half16"
      case 's':	 // 5 strings to match.
        if (memcmp(Name.data()+2, "tore", 4) != 0)
          break;
        switch (Name[6]) {
        default: break;
        case '_':	 // 1 string to match.
          if (memcmp(Name.data()+7, "half16", 6) != 0)
            break;
          return std::make_pair(1436, 8);	 // "vstore_half16"
        case 'a':	 // 4 strings to match.
          if (memcmp(Name.data()+7, "_half", 5) != 0)
            break;
          switch (Name[12]) {
          default: break;
          case '2':	 // 1 string to match.
            return std::make_pair(1384, 8);	 // "vstorea_half2"
          case '3':	 // 1 string to match.
            return std::make_pair(1412, 8);	 // "vstorea_half3"
          case '4':	 // 1 string to match.
            return std::make_pair(1420, 8);	 // "vstorea_half4"
          case '8':	 // 1 string to match.
            return std::make_pair(1428, 8);	 // "vstorea_half8"
          }
          break;
        }
        break;
      }
      break;
    case 'w':	 // 1 string to match.
      if (memcmp(Name.data()+1, "rite_imageui", 12) != 0)
        break;
      return std::make_pair(2490, 17);	 // "write_imageui"
    }
    break;
  case 14:	 // 33 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 1 string to match.
      if (memcmp(Name.data()+1, "tomic_cmpxchg", 13) != 0)
        break;
      return std::make_pair(1508, 6);	 // "atomic_cmpxchg"
    case 'c':	 // 22 strings to match.
      if (memcmp(Name.data()+1, "onvert_", 7) != 0)
        break;
      switch (Name[8]) {
      default: break;
      case 'c':	 // 1 string to match.
        if (memcmp(Name.data()+9, "har16", 5) != 0)
          break;
        return std::make_pair(254, 11);	 // "convert_char16"
      case 'd':	 // 1 string to match.
        if (memcmp(Name.data()+9, "ouble", 5) != 0)
          break;
        return std::make_pair(67, 11);	 // "convert_double"
      case 'f':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "loat", 4) != 0)
          break;
        switch (Name[13]) {
        default: break;
        case '2':	 // 1 string to match.
          return std::make_pair(12, 11);	 // "convert_float2"
        case '3':	 // 1 string to match.
          return std::make_pair(23, 11);	 // "convert_float3"
        case '4':	 // 1 string to match.
          return std::make_pair(34, 11);	 // "convert_float4"
        case '8':	 // 1 string to match.
          return std::make_pair(45, 11);	 // "convert_float8"
        }
        break;
      case 'h':	 // 1 string to match.
        if (memcmp(Name.data()+9, "alf16", 5) != 0)
          break;
        return std::make_pair(188, 11);	 // "convert_half16"
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+9, "ong16", 5) != 0)
          break;
        return std::make_pair(650, 11);	 // "convert_long16"
      case 's':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "hort", 4) != 0)
          break;
        switch (Name[13]) {
        default: break;
        case '2':	 // 1 string to match.
          return std::make_pair(342, 11);	 // "convert_short2"
        case '3':	 // 1 string to match.
          return std::make_pair(353, 11);	 // "convert_short3"
        case '4':	 // 1 string to match.
          return std::make_pair(364, 11);	 // "convert_short4"
        case '8':	 // 1 string to match.
          return std::make_pair(375, 11);	 // "convert_short8"
        }
        break;
      case 'u':	 // 10 strings to match.
        switch (Name[9]) {
        default: break;
        case 'c':	 // 4 strings to match.
          if (memcmp(Name.data()+10, "har", 3) != 0)
            break;
          switch (Name[13]) {
          default: break;
          case '2':	 // 1 string to match.
            return std::make_pair(276, 11);	 // "convert_uchar2"
          case '3':	 // 1 string to match.
            return std::make_pair(287, 11);	 // "convert_uchar3"
          case '4':	 // 1 string to match.
            return std::make_pair(298, 11);	 // "convert_uchar4"
          case '8':	 // 1 string to match.
            return std::make_pair(309, 11);	 // "convert_uchar8"
          }
          break;
        case 'i':	 // 1 string to match.
          if (memcmp(Name.data()+10, "nt16", 4) != 0)
            break;
          return std::make_pair(584, 11);	 // "convert_uint16"
        case 'l':	 // 4 strings to match.
          if (memcmp(Name.data()+10, "ong", 3) != 0)
            break;
          switch (Name[13]) {
          default: break;
          case '2':	 // 1 string to match.
            return std::make_pair(672, 11);	 // "convert_ulong2"
          case '3':	 // 1 string to match.
            return std::make_pair(683, 11);	 // "convert_ulong3"
          case '4':	 // 1 string to match.
            return std::make_pair(694, 11);	 // "convert_ulong4"
          case '8':	 // 1 string to match.
            return std::make_pair(705, 11);	 // "convert_ulong8"
          }
          break;
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+10, "hort", 4) != 0)
            break;
          return std::make_pair(397, 11);	 // "convert_ushort"
        }
        break;
      }
      break;
    case 'e':	 // 1 string to match.
      if (memcmp(Name.data()+1, "nqueue_marker", 13) != 0)
        break;
      return std::make_pair(2655, 1);	 // "enqueue_marker"
    case 'f':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ast_normalize", 13) != 0)
        break;
      return std::make_pair(831, 1);	 // "fast_normalize"
    case 'g':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "et_", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case 'l':	 // 1 string to match.
        if (memcmp(Name.data()+5, "ocal_size", 9) != 0)
          break;
        return std::make_pair(728, 1);	 // "get_local_size"
      case 'n':	 // 1 string to match.
        if (memcmp(Name.data()+5, "um_groups", 9) != 0)
          break;
        return std::make_pair(728, 1);	 // "get_num_groups"
      }
      break;
    case 'i':	 // 2 strings to match.
      if (Name[1] != 's')
        break;
      switch (Name[2]) {
      default: break;
      case '_':	 // 1 string to match.
        if (memcmp(Name.data()+3, "valid_event", 11) != 0)
          break;
        return std::make_pair(2658, 1);	 // "is_valid_event"
      case 'g':	 // 1 string to match.
        if (memcmp(Name.data()+3, "reaterequal", 11) != 0)
          break;
        return std::make_pair(855, 5);	 // "isgreaterequal"
      }
      break;
    case 'r':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ead_mem_fence", 13) != 0)
        break;
      return std::make_pair(1447, 1);	 // "read_mem_fence"
    case 'v':	 // 1 string to match.
      if (memcmp(Name.data()+1, "storea_half16", 13) != 0)
        break;
      return std::make_pair(1436, 8);	 // "vstorea_half16"
    case 'w':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "ork_group_a", 11) != 0)
        break;
      switch (Name[12]) {
      default: break;
      case 'l':	 // 1 string to match.
        if (Name[13] != 'l')
          break;
        return std::make_pair(2649, 1);	 // "work_group_all"
      case 'n':	 // 1 string to match.
        if (Name[13] != 'y')
          break;
        return std::make_pair(2649, 1);	 // "work_group_any"
      }
      break;
    }
    break;
  case 15:	 // 30 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 3 strings to match.
      switch (Name[1]) {
      default: break;
      case 'r':	 // 1 string to match.
        if (memcmp(Name.data()+2, "m_dot_acc_sat", 13) != 0)
          break;
        return std::make_pair(2752, 2);	 // "arm_dot_acc_sat"
      case 't':	 // 2 strings to match.
        if (memcmp(Name.data()+2, "omic_", 5) != 0)
          break;
        switch (Name[7]) {
        default: break;
        case 'e':	 // 1 string to match.
          if (memcmp(Name.data()+8, "xchange", 7) != 0)
            break;
          return std::make_pair(1785, 21);	 // "atomic_exchange"
        case 'f':	 // 1 string to match.
          if (memcmp(Name.data()+8, "etch_or", 7) != 0)
            break;
          return std::make_pair(1920, 12);	 // "atomic_fetch_or"
        }
        break;
      }
      break;
    case 'b':	 // 1 string to match.
      if (memcmp(Name.data()+1, "itfield_insert", 14) != 0)
        break;
      return std::make_pair(2730, 1);	 // "bitfield_insert"
    case 'c':	 // 17 strings to match.
      if (memcmp(Name.data()+1, "onvert_", 7) != 0)
        break;
      switch (Name[8]) {
      default: break;
      case 'd':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "ouble", 5) != 0)
          break;
        switch (Name[14]) {
        default: break;
        case '2':	 // 1 string to match.
          return std::make_pair(78, 11);	 // "convert_double2"
        case '3':	 // 1 string to match.
          return std::make_pair(89, 11);	 // "convert_double3"
        case '4':	 // 1 string to match.
          return std::make_pair(100, 11);	 // "convert_double4"
        case '8':	 // 1 string to match.
          return std::make_pair(111, 11);	 // "convert_double8"
        }
        break;
      case 'f':	 // 1 string to match.
        if (memcmp(Name.data()+9, "loat16", 6) != 0)
          break;
        return std::make_pair(56, 11);	 // "convert_float16"
      case 'i':	 // 5 strings to match.
        if (memcmp(Name.data()+9, "nt_", 3) != 0)
          break;
        switch (Name[12]) {
        default: break;
        case 'r':	 // 4 strings to match.
          if (Name[13] != 't')
            break;
          switch (Name[14]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(463, 11);	 // "convert_int_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(463, 11);	 // "convert_int_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(463, 11);	 // "convert_int_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(463, 11);	 // "convert_int_rtz"
          }
          break;
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+13, "at", 2) != 0)
            break;
          return std::make_pair(463, 11);	 // "convert_int_sat"
        }
        break;
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+9, "hort16", 6) != 0)
          break;
        return std::make_pair(386, 11);	 // "convert_short16"
      case 'u':	 // 6 strings to match.
        switch (Name[9]) {
        default: break;
        case 'c':	 // 1 string to match.
          if (memcmp(Name.data()+10, "har16", 5) != 0)
            break;
          return std::make_pair(320, 11);	 // "convert_uchar16"
        case 'l':	 // 1 string to match.
          if (memcmp(Name.data()+10, "ong16", 5) != 0)
            break;
          return std::make_pair(716, 11);	 // "convert_ulong16"
        case 's':	 // 4 strings to match.
          if (memcmp(Name.data()+10, "hort", 4) != 0)
            break;
          switch (Name[14]) {
          default: break;
          case '2':	 // 1 string to match.
            return std::make_pair(408, 11);	 // "convert_ushort2"
          case '3':	 // 1 string to match.
            return std::make_pair(419, 11);	 // "convert_ushort3"
          case '4':	 // 1 string to match.
            return std::make_pair(430, 11);	 // "convert_ushort4"
          case '8':	 // 1 string to match.
            return std::make_pair(441, 11);	 // "convert_ushort8"
          }
          break;
        }
        break;
      }
      break;
    case 'g':	 // 3 strings to match.
      if (memcmp(Name.data()+1, "et_", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case 'g':	 // 1 string to match.
        if (memcmp(Name.data()+5, "lobal_size", 10) != 0)
          break;
        return std::make_pair(728, 1);	 // "get_global_size"
      case 'i':	 // 2 strings to match.
        if (memcmp(Name.data()+5, "mage_", 5) != 0)
          break;
        switch (Name[10]) {
        default: break;
        case 'd':	 // 1 string to match.
          if (memcmp(Name.data()+11, "epth", 4) != 0)
            break;
          return std::make_pair(2570, 3);	 // "get_image_depth"
        case 'w':	 // 1 string to match.
          if (memcmp(Name.data()+11, "idth", 4) != 0)
            break;
          return std::make_pair(2507, 36);	 // "get_image_width"
        }
        break;
      }
      break;
    case 's':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ub_group_elect", 14) != 0)
        break;
      return std::make_pair(2711, 1);	 // "sub_group_elect"
    case 'v':	 // 4 strings to match.
      if (memcmp(Name.data()+1, "store_half_rt", 13) != 0)
        break;
      switch (Name[14]) {
      default: break;
      case 'e':	 // 1 string to match.
        return std::make_pair(1376, 8);	 // "vstore_half_rte"
      case 'n':	 // 1 string to match.
        return std::make_pair(1376, 8);	 // "vstore_half_rtn"
      case 'p':	 // 1 string to match.
        return std::make_pair(1376, 8);	 // "vstore_half_rtp"
      case 'z':	 // 1 string to match.
        return std::make_pair(1376, 8);	 // "vstore_half_rtz"
      }
      break;
    case 'w':	 // 1 string to match.
      if (memcmp(Name.data()+1, "rite_mem_fence", 14) != 0)
        break;
      return std::make_pair(1447, 1);	 // "write_mem_fence"
    }
    break;
  case 16:	 // 67 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 6 strings to match.
      if (memcmp(Name.data()+1, "tomic_fetch_", 12) != 0)
        break;
      switch (Name[13]) {
      default: break;
      case 'a':	 // 2 strings to match.
        switch (Name[14]) {
        default: break;
        case 'd':	 // 1 string to match.
          if (Name[15] != 'd')
            break;
          return std::make_pair(1848, 24);	 // "atomic_fetch_add"
        case 'n':	 // 1 string to match.
          if (Name[15] != 'd')
            break;
          return std::make_pair(1920, 12);	 // "atomic_fetch_and"
        }
        break;
      case 'm':	 // 2 strings to match.
        switch (Name[14]) {
        default: break;
        case 'a':	 // 1 string to match.
          if (Name[15] != 'x')
            break;
          return std::make_pair(1785, 21);	 // "atomic_fetch_max"
        case 'i':	 // 1 string to match.
          if (Name[15] != 'n')
            break;
          return std::make_pair(1785, 21);	 // "atomic_fetch_min"
        }
        break;
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+14, "ub", 2) != 0)
          break;
        return std::make_pair(1848, 24);	 // "atomic_fetch_sub"
      case 'x':	 // 1 string to match.
        if (memcmp(Name.data()+14, "or", 2) != 0)
          break;
        return std::make_pair(1920, 12);	 // "atomic_fetch_xor"
      }
      break;
    case 'c':	 // 41 strings to match.
      if (memcmp(Name.data()+1, "onvert_", 7) != 0)
        break;
      switch (Name[8]) {
      default: break;
      case 'c':	 // 5 strings to match.
        if (memcmp(Name.data()+9, "har_", 4) != 0)
          break;
        switch (Name[13]) {
        default: break;
        case 'r':	 // 4 strings to match.
          if (Name[14] != 't')
            break;
          switch (Name[15]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(199, 11);	 // "convert_char_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(199, 11);	 // "convert_char_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(199, 11);	 // "convert_char_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(199, 11);	 // "convert_char_rtz"
          }
          break;
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+14, "at", 2) != 0)
            break;
          return std::make_pair(199, 11);	 // "convert_char_sat"
        }
        break;
      case 'd':	 // 1 string to match.
        if (memcmp(Name.data()+9, "ouble16", 7) != 0)
          break;
        return std::make_pair(122, 11);	 // "convert_double16"
      case 'h':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "alf_rt", 6) != 0)
          break;
        switch (Name[15]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(133, 11);	 // "convert_half_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(133, 11);	 // "convert_half_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(133, 11);	 // "convert_half_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(133, 11);	 // "convert_half_rtz"
        }
        break;
      case 'i':	 // 20 strings to match.
        if (memcmp(Name.data()+9, "nt", 2) != 0)
          break;
        switch (Name[11]) {
        default: break;
        case '2':	 // 5 strings to match.
          if (Name[12] != '_')
            break;
          switch (Name[13]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[14] != 't')
              break;
            switch (Name[15]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(474, 11);	 // "convert_int2_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(474, 11);	 // "convert_int2_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(474, 11);	 // "convert_int2_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(474, 11);	 // "convert_int2_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+14, "at", 2) != 0)
              break;
            return std::make_pair(474, 11);	 // "convert_int2_sat"
          }
          break;
        case '3':	 // 5 strings to match.
          if (Name[12] != '_')
            break;
          switch (Name[13]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[14] != 't')
              break;
            switch (Name[15]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(485, 11);	 // "convert_int3_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(485, 11);	 // "convert_int3_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(485, 11);	 // "convert_int3_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(485, 11);	 // "convert_int3_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+14, "at", 2) != 0)
              break;
            return std::make_pair(485, 11);	 // "convert_int3_sat"
          }
          break;
        case '4':	 // 5 strings to match.
          if (Name[12] != '_')
            break;
          switch (Name[13]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[14] != 't')
              break;
            switch (Name[15]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(496, 11);	 // "convert_int4_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(496, 11);	 // "convert_int4_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(496, 11);	 // "convert_int4_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(496, 11);	 // "convert_int4_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+14, "at", 2) != 0)
              break;
            return std::make_pair(496, 11);	 // "convert_int4_sat"
          }
          break;
        case '8':	 // 5 strings to match.
          if (Name[12] != '_')
            break;
          switch (Name[13]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[14] != 't')
              break;
            switch (Name[15]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(507, 11);	 // "convert_int8_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(507, 11);	 // "convert_int8_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(507, 11);	 // "convert_int8_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(507, 11);	 // "convert_int8_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+14, "at", 2) != 0)
              break;
            return std::make_pair(507, 11);	 // "convert_int8_sat"
          }
          break;
        }
        break;
      case 'l':	 // 5 strings to match.
        if (memcmp(Name.data()+9, "ong_", 4) != 0)
          break;
        switch (Name[13]) {
        default: break;
        case 'r':	 // 4 strings to match.
          if (Name[14] != 't')
            break;
          switch (Name[15]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(595, 11);	 // "convert_long_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(595, 11);	 // "convert_long_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(595, 11);	 // "convert_long_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(595, 11);	 // "convert_long_rtz"
          }
          break;
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+14, "at", 2) != 0)
            break;
          return std::make_pair(595, 11);	 // "convert_long_sat"
        }
        break;
      case 'u':	 // 6 strings to match.
        switch (Name[9]) {
        default: break;
        case 'i':	 // 5 strings to match.
          if (memcmp(Name.data()+10, "nt_", 3) != 0)
            break;
          switch (Name[13]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[14] != 't')
              break;
            switch (Name[15]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(529, 11);	 // "convert_uint_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(529, 11);	 // "convert_uint_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(529, 11);	 // "convert_uint_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(529, 11);	 // "convert_uint_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+14, "at", 2) != 0)
              break;
            return std::make_pair(529, 11);	 // "convert_uint_sat"
          }
          break;
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+10, "hort16", 6) != 0)
            break;
          return std::make_pair(452, 11);	 // "convert_ushort16"
        }
        break;
      }
      break;
    case 'g':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "et_", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+5, "mage_height", 11) != 0)
          break;
        return std::make_pair(2543, 27);	 // "get_image_height"
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+5, "ub_group_id", 11) != 0)
          break;
        return std::make_pair(2701, 1);	 // "get_sub_group_id"
      }
      break;
    case 's':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "ub_group_", 9) != 0)
        break;
      switch (Name[10]) {
      default: break;
      case 'b':	 // 1 string to match.
        if (memcmp(Name.data()+11, "allot", 5) != 0)
          break;
        return std::make_pair(2716, 1);	 // "sub_group_ballot"
      case 'r':	 // 1 string to match.
        if (memcmp(Name.data()+11, "otate", 5) != 0)
          break;
        return std::make_pair(2744, 1);	 // "sub_group_rotate"
      }
      break;
    case 'v':	 // 16 strings to match.
      if (memcmp(Name.data()+1, "store_half", 10) != 0)
        break;
      switch (Name[11]) {
      default: break;
      case '2':	 // 4 strings to match.
        if (memcmp(Name.data()+12, "_rt", 3) != 0)
          break;
        switch (Name[15]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(1384, 8);	 // "vstore_half2_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(1384, 8);	 // "vstore_half2_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(1384, 8);	 // "vstore_half2_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(1384, 8);	 // "vstore_half2_rtz"
        }
        break;
      case '3':	 // 4 strings to match.
        if (memcmp(Name.data()+12, "_rt", 3) != 0)
          break;
        switch (Name[15]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(1412, 8);	 // "vstore_half3_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(1412, 8);	 // "vstore_half3_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(1412, 8);	 // "vstore_half3_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(1412, 8);	 // "vstore_half3_rtz"
        }
        break;
      case '4':	 // 4 strings to match.
        if (memcmp(Name.data()+12, "_rt", 3) != 0)
          break;
        switch (Name[15]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(1420, 8);	 // "vstore_half4_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(1420, 8);	 // "vstore_half4_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(1420, 8);	 // "vstore_half4_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(1420, 8);	 // "vstore_half4_rtz"
        }
        break;
      case '8':	 // 4 strings to match.
        if (memcmp(Name.data()+12, "_rt", 3) != 0)
          break;
        switch (Name[15]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(1428, 8);	 // "vstore_half8_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(1428, 8);	 // "vstore_half8_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(1428, 8);	 // "vstore_half8_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(1428, 8);	 // "vstore_half8_rtz"
        }
        break;
      }
      break;
    }
    break;
  case 17:	 // 127 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 1 string to match.
      if (memcmp(Name.data()+1, "tomic_flag_clear", 16) != 0)
        break;
      return std::make_pair(1956, 3);	 // "atomic_flag_clear"
    case 'c':	 // 101 strings to match.
      switch (Name[1]) {
      default: break;
      case 'o':	 // 100 strings to match.
        if (memcmp(Name.data()+2, "nvert_", 6) != 0)
          break;
        switch (Name[8]) {
        default: break;
        case 'c':	 // 20 strings to match.
          if (memcmp(Name.data()+9, "har", 3) != 0)
            break;
          switch (Name[12]) {
          default: break;
          case '2':	 // 5 strings to match.
            if (Name[13] != '_')
              break;
            switch (Name[14]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[15] != 't')
                break;
              switch (Name[16]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(210, 11);	 // "convert_char2_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(210, 11);	 // "convert_char2_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(210, 11);	 // "convert_char2_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(210, 11);	 // "convert_char2_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+15, "at", 2) != 0)
                break;
              return std::make_pair(210, 11);	 // "convert_char2_sat"
            }
            break;
          case '3':	 // 5 strings to match.
            if (Name[13] != '_')
              break;
            switch (Name[14]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[15] != 't')
                break;
              switch (Name[16]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(221, 11);	 // "convert_char3_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(221, 11);	 // "convert_char3_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(221, 11);	 // "convert_char3_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(221, 11);	 // "convert_char3_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+15, "at", 2) != 0)
                break;
              return std::make_pair(221, 11);	 // "convert_char3_sat"
            }
            break;
          case '4':	 // 5 strings to match.
            if (Name[13] != '_')
              break;
            switch (Name[14]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[15] != 't')
                break;
              switch (Name[16]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(232, 11);	 // "convert_char4_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(232, 11);	 // "convert_char4_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(232, 11);	 // "convert_char4_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(232, 11);	 // "convert_char4_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+15, "at", 2) != 0)
                break;
              return std::make_pair(232, 11);	 // "convert_char4_sat"
            }
            break;
          case '8':	 // 5 strings to match.
            if (Name[13] != '_')
              break;
            switch (Name[14]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[15] != 't')
                break;
              switch (Name[16]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(243, 11);	 // "convert_char8_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(243, 11);	 // "convert_char8_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(243, 11);	 // "convert_char8_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(243, 11);	 // "convert_char8_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+15, "at", 2) != 0)
                break;
              return std::make_pair(243, 11);	 // "convert_char8_sat"
            }
            break;
          }
          break;
        case 'f':	 // 4 strings to match.
          if (memcmp(Name.data()+9, "loat_rt", 7) != 0)
            break;
          switch (Name[16]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(1, 11);	 // "convert_float_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(1, 11);	 // "convert_float_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(1, 11);	 // "convert_float_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(1, 11);	 // "convert_float_rtz"
          }
          break;
        case 'h':	 // 16 strings to match.
          if (memcmp(Name.data()+9, "alf", 3) != 0)
            break;
          switch (Name[12]) {
          default: break;
          case '2':	 // 4 strings to match.
            if (memcmp(Name.data()+13, "_rt", 3) != 0)
              break;
            switch (Name[16]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(144, 11);	 // "convert_half2_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(144, 11);	 // "convert_half2_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(144, 11);	 // "convert_half2_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(144, 11);	 // "convert_half2_rtz"
            }
            break;
          case '3':	 // 4 strings to match.
            if (memcmp(Name.data()+13, "_rt", 3) != 0)
              break;
            switch (Name[16]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(155, 11);	 // "convert_half3_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(155, 11);	 // "convert_half3_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(155, 11);	 // "convert_half3_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(155, 11);	 // "convert_half3_rtz"
            }
            break;
          case '4':	 // 4 strings to match.
            if (memcmp(Name.data()+13, "_rt", 3) != 0)
              break;
            switch (Name[16]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(166, 11);	 // "convert_half4_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(166, 11);	 // "convert_half4_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(166, 11);	 // "convert_half4_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(166, 11);	 // "convert_half4_rtz"
            }
            break;
          case '8':	 // 4 strings to match.
            if (memcmp(Name.data()+13, "_rt", 3) != 0)
              break;
            switch (Name[16]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(177, 11);	 // "convert_half8_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(177, 11);	 // "convert_half8_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(177, 11);	 // "convert_half8_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(177, 11);	 // "convert_half8_rtz"
            }
            break;
          }
          break;
        case 'i':	 // 5 strings to match.
          if (memcmp(Name.data()+9, "nt16_", 5) != 0)
            break;
          switch (Name[14]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[15] != 't')
              break;
            switch (Name[16]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(518, 11);	 // "convert_int16_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(518, 11);	 // "convert_int16_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(518, 11);	 // "convert_int16_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(518, 11);	 // "convert_int16_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+15, "at", 2) != 0)
              break;
            return std::make_pair(518, 11);	 // "convert_int16_sat"
          }
          break;
        case 'l':	 // 20 strings to match.
          if (memcmp(Name.data()+9, "ong", 3) != 0)
            break;
          switch (Name[12]) {
          default: break;
          case '2':	 // 5 strings to match.
            if (Name[13] != '_')
              break;
            switch (Name[14]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[15] != 't')
                break;
              switch (Name[16]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(606, 11);	 // "convert_long2_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(606, 11);	 // "convert_long2_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(606, 11);	 // "convert_long2_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(606, 11);	 // "convert_long2_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+15, "at", 2) != 0)
                break;
              return std::make_pair(606, 11);	 // "convert_long2_sat"
            }
            break;
          case '3':	 // 5 strings to match.
            if (Name[13] != '_')
              break;
            switch (Name[14]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[15] != 't')
                break;
              switch (Name[16]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(617, 11);	 // "convert_long3_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(617, 11);	 // "convert_long3_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(617, 11);	 // "convert_long3_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(617, 11);	 // "convert_long3_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+15, "at", 2) != 0)
                break;
              return std::make_pair(617, 11);	 // "convert_long3_sat"
            }
            break;
          case '4':	 // 5 strings to match.
            if (Name[13] != '_')
              break;
            switch (Name[14]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[15] != 't')
                break;
              switch (Name[16]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(628, 11);	 // "convert_long4_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(628, 11);	 // "convert_long4_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(628, 11);	 // "convert_long4_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(628, 11);	 // "convert_long4_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+15, "at", 2) != 0)
                break;
              return std::make_pair(628, 11);	 // "convert_long4_sat"
            }
            break;
          case '8':	 // 5 strings to match.
            if (Name[13] != '_')
              break;
            switch (Name[14]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[15] != 't')
                break;
              switch (Name[16]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(639, 11);	 // "convert_long8_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(639, 11);	 // "convert_long8_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(639, 11);	 // "convert_long8_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(639, 11);	 // "convert_long8_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+15, "at", 2) != 0)
                break;
              return std::make_pair(639, 11);	 // "convert_long8_sat"
            }
            break;
          }
          break;
        case 's':	 // 5 strings to match.
          if (memcmp(Name.data()+9, "hort_", 5) != 0)
            break;
          switch (Name[14]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[15] != 't')
              break;
            switch (Name[16]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(331, 11);	 // "convert_short_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(331, 11);	 // "convert_short_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(331, 11);	 // "convert_short_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(331, 11);	 // "convert_short_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+15, "at", 2) != 0)
              break;
            return std::make_pair(331, 11);	 // "convert_short_sat"
          }
          break;
        case 'u':	 // 30 strings to match.
          switch (Name[9]) {
          default: break;
          case 'c':	 // 5 strings to match.
            if (memcmp(Name.data()+10, "har_", 4) != 0)
              break;
            switch (Name[14]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[15] != 't')
                break;
              switch (Name[16]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(265, 11);	 // "convert_uchar_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(265, 11);	 // "convert_uchar_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(265, 11);	 // "convert_uchar_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(265, 11);	 // "convert_uchar_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+15, "at", 2) != 0)
                break;
              return std::make_pair(265, 11);	 // "convert_uchar_sat"
            }
            break;
          case 'i':	 // 20 strings to match.
            if (memcmp(Name.data()+10, "nt", 2) != 0)
              break;
            switch (Name[12]) {
            default: break;
            case '2':	 // 5 strings to match.
              if (Name[13] != '_')
                break;
              switch (Name[14]) {
              default: break;
              case 'r':	 // 4 strings to match.
                if (Name[15] != 't')
                  break;
                switch (Name[16]) {
                default: break;
                case 'e':	 // 1 string to match.
                  return std::make_pair(540, 11);	 // "convert_uint2_rte"
                case 'n':	 // 1 string to match.
                  return std::make_pair(540, 11);	 // "convert_uint2_rtn"
                case 'p':	 // 1 string to match.
                  return std::make_pair(540, 11);	 // "convert_uint2_rtp"
                case 'z':	 // 1 string to match.
                  return std::make_pair(540, 11);	 // "convert_uint2_rtz"
                }
                break;
              case 's':	 // 1 string to match.
                if (memcmp(Name.data()+15, "at", 2) != 0)
                  break;
                return std::make_pair(540, 11);	 // "convert_uint2_sat"
              }
              break;
            case '3':	 // 5 strings to match.
              if (Name[13] != '_')
                break;
              switch (Name[14]) {
              default: break;
              case 'r':	 // 4 strings to match.
                if (Name[15] != 't')
                  break;
                switch (Name[16]) {
                default: break;
                case 'e':	 // 1 string to match.
                  return std::make_pair(551, 11);	 // "convert_uint3_rte"
                case 'n':	 // 1 string to match.
                  return std::make_pair(551, 11);	 // "convert_uint3_rtn"
                case 'p':	 // 1 string to match.
                  return std::make_pair(551, 11);	 // "convert_uint3_rtp"
                case 'z':	 // 1 string to match.
                  return std::make_pair(551, 11);	 // "convert_uint3_rtz"
                }
                break;
              case 's':	 // 1 string to match.
                if (memcmp(Name.data()+15, "at", 2) != 0)
                  break;
                return std::make_pair(551, 11);	 // "convert_uint3_sat"
              }
              break;
            case '4':	 // 5 strings to match.
              if (Name[13] != '_')
                break;
              switch (Name[14]) {
              default: break;
              case 'r':	 // 4 strings to match.
                if (Name[15] != 't')
                  break;
                switch (Name[16]) {
                default: break;
                case 'e':	 // 1 string to match.
                  return std::make_pair(562, 11);	 // "convert_uint4_rte"
                case 'n':	 // 1 string to match.
                  return std::make_pair(562, 11);	 // "convert_uint4_rtn"
                case 'p':	 // 1 string to match.
                  return std::make_pair(562, 11);	 // "convert_uint4_rtp"
                case 'z':	 // 1 string to match.
                  return std::make_pair(562, 11);	 // "convert_uint4_rtz"
                }
                break;
              case 's':	 // 1 string to match.
                if (memcmp(Name.data()+15, "at", 2) != 0)
                  break;
                return std::make_pair(562, 11);	 // "convert_uint4_sat"
              }
              break;
            case '8':	 // 5 strings to match.
              if (Name[13] != '_')
                break;
              switch (Name[14]) {
              default: break;
              case 'r':	 // 4 strings to match.
                if (Name[15] != 't')
                  break;
                switch (Name[16]) {
                default: break;
                case 'e':	 // 1 string to match.
                  return std::make_pair(573, 11);	 // "convert_uint8_rte"
                case 'n':	 // 1 string to match.
                  return std::make_pair(573, 11);	 // "convert_uint8_rtn"
                case 'p':	 // 1 string to match.
                  return std::make_pair(573, 11);	 // "convert_uint8_rtp"
                case 'z':	 // 1 string to match.
                  return std::make_pair(573, 11);	 // "convert_uint8_rtz"
                }
                break;
              case 's':	 // 1 string to match.
                if (memcmp(Name.data()+15, "at", 2) != 0)
                  break;
                return std::make_pair(573, 11);	 // "convert_uint8_sat"
              }
              break;
            }
            break;
          case 'l':	 // 5 strings to match.
            if (memcmp(Name.data()+10, "ong_", 4) != 0)
              break;
            switch (Name[14]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[15] != 't')
                break;
              switch (Name[16]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(661, 11);	 // "convert_ulong_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(661, 11);	 // "convert_ulong_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(661, 11);	 // "convert_ulong_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(661, 11);	 // "convert_ulong_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+15, "at", 2) != 0)
                break;
              return std::make_pair(661, 11);	 // "convert_ulong_sat"
            }
            break;
          }
          break;
        }
        break;
      case 'r':	 // 1 string to match.
        if (memcmp(Name.data()+2, "eate_user_event", 15) != 0)
          break;
        return std::make_pair(2657, 1);	 // "create_user_event"
      }
      break;
    case 'g':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "et_", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case 'd':	 // 1 string to match.
        if (memcmp(Name.data()+5, "efault_queue", 12) != 0)
          break;
        return std::make_pair(2661, 1);	 // "get_default_queue"
      case 'g':	 // 1 string to match.
        if (memcmp(Name.data()+5, "lobal_offset", 12) != 0)
          break;
        return std::make_pair(728, 1);	 // "get_global_offset"
      }
      break;
    case 's':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "ub_group_", 9) != 0)
        break;
      switch (Name[10]) {
      default: break;
      case 'b':	 // 1 string to match.
        if (memcmp(Name.data()+11, "arrier", 6) != 0)
          break;
        return std::make_pair(2703, 2);	 // "sub_group_barrier"
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+11, "huffle", 6) != 0)
          break;
        return std::make_pair(2725, 1);	 // "sub_group_shuffle"
      }
      break;
    case 'v':	 // 20 strings to match.
      if (memcmp(Name.data()+1, "store", 5) != 0)
        break;
      switch (Name[6]) {
      default: break;
      case '_':	 // 4 strings to match.
        if (memcmp(Name.data()+7, "half16_rt", 9) != 0)
          break;
        switch (Name[16]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(1436, 8);	 // "vstore_half16_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(1436, 8);	 // "vstore_half16_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(1436, 8);	 // "vstore_half16_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(1436, 8);	 // "vstore_half16_rtz"
        }
        break;
      case 'a':	 // 16 strings to match.
        if (memcmp(Name.data()+7, "_half", 5) != 0)
          break;
        switch (Name[12]) {
        default: break;
        case '2':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_rt", 3) != 0)
            break;
          switch (Name[16]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(1384, 8);	 // "vstorea_half2_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(1384, 8);	 // "vstorea_half2_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(1384, 8);	 // "vstorea_half2_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(1384, 8);	 // "vstorea_half2_rtz"
          }
          break;
        case '3':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_rt", 3) != 0)
            break;
          switch (Name[16]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(1412, 8);	 // "vstorea_half3_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(1412, 8);	 // "vstorea_half3_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(1412, 8);	 // "vstorea_half3_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(1412, 8);	 // "vstorea_half3_rtz"
          }
          break;
        case '4':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_rt", 3) != 0)
            break;
          switch (Name[16]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(1420, 8);	 // "vstorea_half4_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(1420, 8);	 // "vstorea_half4_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(1420, 8);	 // "vstorea_half4_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(1420, 8);	 // "vstorea_half4_rtz"
          }
          break;
        case '8':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_rt", 3) != 0)
            break;
          switch (Name[16]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(1428, 8);	 // "vstorea_half8_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(1428, 8);	 // "vstorea_half8_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(1428, 8);	 // "vstorea_half8_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(1428, 8);	 // "vstorea_half8_rtz"
          }
          break;
        }
        break;
      }
      break;
    case 'w':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ait_group_events", 16) != 0)
        break;
      return std::make_pair(1454, 1);	 // "wait_group_events"
    }
    break;
  case 18:	 // 111 strings to match.
    switch (Name[0]) {
    default: break;
    case 'c':	 // 104 strings to match.
      if (memcmp(Name.data()+1, "onvert_", 7) != 0)
        break;
      switch (Name[8]) {
      default: break;
      case 'c':	 // 5 strings to match.
        if (memcmp(Name.data()+9, "har16_", 6) != 0)
          break;
        switch (Name[15]) {
        default: break;
        case 'r':	 // 4 strings to match.
          if (Name[16] != 't')
            break;
          switch (Name[17]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(254, 11);	 // "convert_char16_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(254, 11);	 // "convert_char16_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(254, 11);	 // "convert_char16_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(254, 11);	 // "convert_char16_rtz"
          }
          break;
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+16, "at", 2) != 0)
            break;
          return std::make_pair(254, 11);	 // "convert_char16_sat"
        }
        break;
      case 'd':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "ouble_rt", 8) != 0)
          break;
        switch (Name[17]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(67, 11);	 // "convert_double_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(67, 11);	 // "convert_double_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(67, 11);	 // "convert_double_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(67, 11);	 // "convert_double_rtz"
        }
        break;
      case 'f':	 // 16 strings to match.
        if (memcmp(Name.data()+9, "loat", 4) != 0)
          break;
        switch (Name[13]) {
        default: break;
        case '2':	 // 4 strings to match.
          if (memcmp(Name.data()+14, "_rt", 3) != 0)
            break;
          switch (Name[17]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(12, 11);	 // "convert_float2_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(12, 11);	 // "convert_float2_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(12, 11);	 // "convert_float2_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(12, 11);	 // "convert_float2_rtz"
          }
          break;
        case '3':	 // 4 strings to match.
          if (memcmp(Name.data()+14, "_rt", 3) != 0)
            break;
          switch (Name[17]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(23, 11);	 // "convert_float3_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(23, 11);	 // "convert_float3_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(23, 11);	 // "convert_float3_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(23, 11);	 // "convert_float3_rtz"
          }
          break;
        case '4':	 // 4 strings to match.
          if (memcmp(Name.data()+14, "_rt", 3) != 0)
            break;
          switch (Name[17]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(34, 11);	 // "convert_float4_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(34, 11);	 // "convert_float4_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(34, 11);	 // "convert_float4_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(34, 11);	 // "convert_float4_rtz"
          }
          break;
        case '8':	 // 4 strings to match.
          if (memcmp(Name.data()+14, "_rt", 3) != 0)
            break;
          switch (Name[17]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(45, 11);	 // "convert_float8_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(45, 11);	 // "convert_float8_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(45, 11);	 // "convert_float8_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(45, 11);	 // "convert_float8_rtz"
          }
          break;
        }
        break;
      case 'h':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "alf16_rt", 8) != 0)
          break;
        switch (Name[17]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(188, 11);	 // "convert_half16_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(188, 11);	 // "convert_half16_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(188, 11);	 // "convert_half16_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(188, 11);	 // "convert_half16_rtz"
        }
        break;
      case 'l':	 // 5 strings to match.
        if (memcmp(Name.data()+9, "ong16_", 6) != 0)
          break;
        switch (Name[15]) {
        default: break;
        case 'r':	 // 4 strings to match.
          if (Name[16] != 't')
            break;
          switch (Name[17]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(650, 11);	 // "convert_long16_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(650, 11);	 // "convert_long16_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(650, 11);	 // "convert_long16_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(650, 11);	 // "convert_long16_rtz"
          }
          break;
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+16, "at", 2) != 0)
            break;
          return std::make_pair(650, 11);	 // "convert_long16_sat"
        }
        break;
      case 's':	 // 20 strings to match.
        if (memcmp(Name.data()+9, "hort", 4) != 0)
          break;
        switch (Name[13]) {
        default: break;
        case '2':	 // 5 strings to match.
          if (Name[14] != '_')
            break;
          switch (Name[15]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[16] != 't')
              break;
            switch (Name[17]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(342, 11);	 // "convert_short2_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(342, 11);	 // "convert_short2_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(342, 11);	 // "convert_short2_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(342, 11);	 // "convert_short2_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+16, "at", 2) != 0)
              break;
            return std::make_pair(342, 11);	 // "convert_short2_sat"
          }
          break;
        case '3':	 // 5 strings to match.
          if (Name[14] != '_')
            break;
          switch (Name[15]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[16] != 't')
              break;
            switch (Name[17]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(353, 11);	 // "convert_short3_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(353, 11);	 // "convert_short3_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(353, 11);	 // "convert_short3_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(353, 11);	 // "convert_short3_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+16, "at", 2) != 0)
              break;
            return std::make_pair(353, 11);	 // "convert_short3_sat"
          }
          break;
        case '4':	 // 5 strings to match.
          if (Name[14] != '_')
            break;
          switch (Name[15]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[16] != 't')
              break;
            switch (Name[17]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(364, 11);	 // "convert_short4_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(364, 11);	 // "convert_short4_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(364, 11);	 // "convert_short4_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(364, 11);	 // "convert_short4_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+16, "at", 2) != 0)
              break;
            return std::make_pair(364, 11);	 // "convert_short4_sat"
          }
          break;
        case '8':	 // 5 strings to match.
          if (Name[14] != '_')
            break;
          switch (Name[15]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[16] != 't')
              break;
            switch (Name[17]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(375, 11);	 // "convert_short8_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(375, 11);	 // "convert_short8_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(375, 11);	 // "convert_short8_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(375, 11);	 // "convert_short8_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+16, "at", 2) != 0)
              break;
            return std::make_pair(375, 11);	 // "convert_short8_sat"
          }
          break;
        }
        break;
      case 'u':	 // 50 strings to match.
        switch (Name[9]) {
        default: break;
        case 'c':	 // 20 strings to match.
          if (memcmp(Name.data()+10, "har", 3) != 0)
            break;
          switch (Name[13]) {
          default: break;
          case '2':	 // 5 strings to match.
            if (Name[14] != '_')
              break;
            switch (Name[15]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[16] != 't')
                break;
              switch (Name[17]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(276, 11);	 // "convert_uchar2_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(276, 11);	 // "convert_uchar2_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(276, 11);	 // "convert_uchar2_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(276, 11);	 // "convert_uchar2_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+16, "at", 2) != 0)
                break;
              return std::make_pair(276, 11);	 // "convert_uchar2_sat"
            }
            break;
          case '3':	 // 5 strings to match.
            if (Name[14] != '_')
              break;
            switch (Name[15]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[16] != 't')
                break;
              switch (Name[17]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(287, 11);	 // "convert_uchar3_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(287, 11);	 // "convert_uchar3_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(287, 11);	 // "convert_uchar3_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(287, 11);	 // "convert_uchar3_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+16, "at", 2) != 0)
                break;
              return std::make_pair(287, 11);	 // "convert_uchar3_sat"
            }
            break;
          case '4':	 // 5 strings to match.
            if (Name[14] != '_')
              break;
            switch (Name[15]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[16] != 't')
                break;
              switch (Name[17]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(298, 11);	 // "convert_uchar4_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(298, 11);	 // "convert_uchar4_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(298, 11);	 // "convert_uchar4_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(298, 11);	 // "convert_uchar4_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+16, "at", 2) != 0)
                break;
              return std::make_pair(298, 11);	 // "convert_uchar4_sat"
            }
            break;
          case '8':	 // 5 strings to match.
            if (Name[14] != '_')
              break;
            switch (Name[15]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[16] != 't')
                break;
              switch (Name[17]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(309, 11);	 // "convert_uchar8_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(309, 11);	 // "convert_uchar8_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(309, 11);	 // "convert_uchar8_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(309, 11);	 // "convert_uchar8_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+16, "at", 2) != 0)
                break;
              return std::make_pair(309, 11);	 // "convert_uchar8_sat"
            }
            break;
          }
          break;
        case 'i':	 // 5 strings to match.
          if (memcmp(Name.data()+10, "nt16_", 5) != 0)
            break;
          switch (Name[15]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[16] != 't')
              break;
            switch (Name[17]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(584, 11);	 // "convert_uint16_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(584, 11);	 // "convert_uint16_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(584, 11);	 // "convert_uint16_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(584, 11);	 // "convert_uint16_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+16, "at", 2) != 0)
              break;
            return std::make_pair(584, 11);	 // "convert_uint16_sat"
          }
          break;
        case 'l':	 // 20 strings to match.
          if (memcmp(Name.data()+10, "ong", 3) != 0)
            break;
          switch (Name[13]) {
          default: break;
          case '2':	 // 5 strings to match.
            if (Name[14] != '_')
              break;
            switch (Name[15]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[16] != 't')
                break;
              switch (Name[17]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(672, 11);	 // "convert_ulong2_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(672, 11);	 // "convert_ulong2_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(672, 11);	 // "convert_ulong2_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(672, 11);	 // "convert_ulong2_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+16, "at", 2) != 0)
                break;
              return std::make_pair(672, 11);	 // "convert_ulong2_sat"
            }
            break;
          case '3':	 // 5 strings to match.
            if (Name[14] != '_')
              break;
            switch (Name[15]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[16] != 't')
                break;
              switch (Name[17]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(683, 11);	 // "convert_ulong3_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(683, 11);	 // "convert_ulong3_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(683, 11);	 // "convert_ulong3_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(683, 11);	 // "convert_ulong3_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+16, "at", 2) != 0)
                break;
              return std::make_pair(683, 11);	 // "convert_ulong3_sat"
            }
            break;
          case '4':	 // 5 strings to match.
            if (Name[14] != '_')
              break;
            switch (Name[15]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[16] != 't')
                break;
              switch (Name[17]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(694, 11);	 // "convert_ulong4_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(694, 11);	 // "convert_ulong4_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(694, 11);	 // "convert_ulong4_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(694, 11);	 // "convert_ulong4_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+16, "at", 2) != 0)
                break;
              return std::make_pair(694, 11);	 // "convert_ulong4_sat"
            }
            break;
          case '8':	 // 5 strings to match.
            if (Name[14] != '_')
              break;
            switch (Name[15]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[16] != 't')
                break;
              switch (Name[17]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(705, 11);	 // "convert_ulong8_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(705, 11);	 // "convert_ulong8_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(705, 11);	 // "convert_ulong8_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(705, 11);	 // "convert_ulong8_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+16, "at", 2) != 0)
                break;
              return std::make_pair(705, 11);	 // "convert_ulong8_sat"
            }
            break;
          }
          break;
        case 's':	 // 5 strings to match.
          if (memcmp(Name.data()+10, "hort_", 5) != 0)
            break;
          switch (Name[15]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[16] != 't')
              break;
            switch (Name[17]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(397, 11);	 // "convert_ushort_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(397, 11);	 // "convert_ushort_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(397, 11);	 // "convert_ushort_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(397, 11);	 // "convert_ushort_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+16, "at", 2) != 0)
              break;
            return std::make_pair(397, 11);	 // "convert_ushort_sat"
          }
          break;
        }
        break;
      }
      break;
    case 'g':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "et_", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case 'n':	 // 1 string to match.
        if (memcmp(Name.data()+5, "um_sub_groups", 13) != 0)
          break;
        return std::make_pair(2701, 1);	 // "get_num_sub_groups"
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+5, "ub_group_size", 13) != 0)
          break;
        return std::make_pair(2701, 1);	 // "get_sub_group_size"
      }
      break;
    case 'v':	 // 4 strings to match.
      if (memcmp(Name.data()+1, "storea_half16_rt", 16) != 0)
        break;
      switch (Name[17]) {
      default: break;
      case 'e':	 // 1 string to match.
        return std::make_pair(1436, 8);	 // "vstorea_half16_rte"
      case 'n':	 // 1 string to match.
        return std::make_pair(1436, 8);	 // "vstorea_half16_rtn"
      case 'p':	 // 1 string to match.
        return std::make_pair(1436, 8);	 // "vstorea_half16_rtp"
      case 'z':	 // 1 string to match.
        return std::make_pair(1436, 8);	 // "vstorea_half16_rtz"
      }
      break;
    case 'w':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ork_group_barrier", 17) != 0)
        break;
      return std::make_pair(1445, 2);	 // "work_group_barrier"
    }
    break;
  case 19:	 // 62 strings to match.
    switch (Name[0]) {
    default: break;
    case 'c':	 // 59 strings to match.
      if (memcmp(Name.data()+1, "onvert_", 7) != 0)
        break;
      switch (Name[8]) {
      default: break;
      case 'd':	 // 16 strings to match.
        if (memcmp(Name.data()+9, "ouble", 5) != 0)
          break;
        switch (Name[14]) {
        default: break;
        case '2':	 // 4 strings to match.
          if (memcmp(Name.data()+15, "_rt", 3) != 0)
            break;
          switch (Name[18]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(78, 11);	 // "convert_double2_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(78, 11);	 // "convert_double2_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(78, 11);	 // "convert_double2_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(78, 11);	 // "convert_double2_rtz"
          }
          break;
        case '3':	 // 4 strings to match.
          if (memcmp(Name.data()+15, "_rt", 3) != 0)
            break;
          switch (Name[18]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(89, 11);	 // "convert_double3_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(89, 11);	 // "convert_double3_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(89, 11);	 // "convert_double3_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(89, 11);	 // "convert_double3_rtz"
          }
          break;
        case '4':	 // 4 strings to match.
          if (memcmp(Name.data()+15, "_rt", 3) != 0)
            break;
          switch (Name[18]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(100, 11);	 // "convert_double4_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(100, 11);	 // "convert_double4_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(100, 11);	 // "convert_double4_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(100, 11);	 // "convert_double4_rtz"
          }
          break;
        case '8':	 // 4 strings to match.
          if (memcmp(Name.data()+15, "_rt", 3) != 0)
            break;
          switch (Name[18]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(111, 11);	 // "convert_double8_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(111, 11);	 // "convert_double8_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(111, 11);	 // "convert_double8_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(111, 11);	 // "convert_double8_rtz"
          }
          break;
        }
        break;
      case 'f':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "loat16_rt", 9) != 0)
          break;
        switch (Name[18]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(56, 11);	 // "convert_float16_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(56, 11);	 // "convert_float16_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(56, 11);	 // "convert_float16_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(56, 11);	 // "convert_float16_rtz"
        }
        break;
      case 'i':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "nt_sat_rt", 9) != 0)
          break;
        switch (Name[18]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(463, 11);	 // "convert_int_sat_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(463, 11);	 // "convert_int_sat_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(463, 11);	 // "convert_int_sat_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(463, 11);	 // "convert_int_sat_rtz"
        }
        break;
      case 's':	 // 5 strings to match.
        if (memcmp(Name.data()+9, "hort16_", 7) != 0)
          break;
        switch (Name[16]) {
        default: break;
        case 'r':	 // 4 strings to match.
          if (Name[17] != 't')
            break;
          switch (Name[18]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(386, 11);	 // "convert_short16_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(386, 11);	 // "convert_short16_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(386, 11);	 // "convert_short16_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(386, 11);	 // "convert_short16_rtz"
          }
          break;
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+17, "at", 2) != 0)
            break;
          return std::make_pair(386, 11);	 // "convert_short16_sat"
        }
        break;
      case 'u':	 // 30 strings to match.
        switch (Name[9]) {
        default: break;
        case 'c':	 // 5 strings to match.
          if (memcmp(Name.data()+10, "har16_", 6) != 0)
            break;
          switch (Name[16]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[17] != 't')
              break;
            switch (Name[18]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(320, 11);	 // "convert_uchar16_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(320, 11);	 // "convert_uchar16_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(320, 11);	 // "convert_uchar16_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(320, 11);	 // "convert_uchar16_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+17, "at", 2) != 0)
              break;
            return std::make_pair(320, 11);	 // "convert_uchar16_sat"
          }
          break;
        case 'l':	 // 5 strings to match.
          if (memcmp(Name.data()+10, "ong16_", 6) != 0)
            break;
          switch (Name[16]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[17] != 't')
              break;
            switch (Name[18]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(716, 11);	 // "convert_ulong16_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(716, 11);	 // "convert_ulong16_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(716, 11);	 // "convert_ulong16_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(716, 11);	 // "convert_ulong16_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+17, "at", 2) != 0)
              break;
            return std::make_pair(716, 11);	 // "convert_ulong16_sat"
          }
          break;
        case 's':	 // 20 strings to match.
          if (memcmp(Name.data()+10, "hort", 4) != 0)
            break;
          switch (Name[14]) {
          default: break;
          case '2':	 // 5 strings to match.
            if (Name[15] != '_')
              break;
            switch (Name[16]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[17] != 't')
                break;
              switch (Name[18]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(408, 11);	 // "convert_ushort2_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(408, 11);	 // "convert_ushort2_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(408, 11);	 // "convert_ushort2_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(408, 11);	 // "convert_ushort2_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+17, "at", 2) != 0)
                break;
              return std::make_pair(408, 11);	 // "convert_ushort2_sat"
            }
            break;
          case '3':	 // 5 strings to match.
            if (Name[15] != '_')
              break;
            switch (Name[16]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[17] != 't')
                break;
              switch (Name[18]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(419, 11);	 // "convert_ushort3_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(419, 11);	 // "convert_ushort3_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(419, 11);	 // "convert_ushort3_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(419, 11);	 // "convert_ushort3_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+17, "at", 2) != 0)
                break;
              return std::make_pair(419, 11);	 // "convert_ushort3_sat"
            }
            break;
          case '4':	 // 5 strings to match.
            if (Name[15] != '_')
              break;
            switch (Name[16]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[17] != 't')
                break;
              switch (Name[18]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(430, 11);	 // "convert_ushort4_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(430, 11);	 // "convert_ushort4_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(430, 11);	 // "convert_ushort4_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(430, 11);	 // "convert_ushort4_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+17, "at", 2) != 0)
                break;
              return std::make_pair(430, 11);	 // "convert_ushort4_sat"
            }
            break;
          case '8':	 // 5 strings to match.
            if (Name[15] != '_')
              break;
            switch (Name[16]) {
            default: break;
            case 'r':	 // 4 strings to match.
              if (Name[17] != 't')
                break;
              switch (Name[18]) {
              default: break;
              case 'e':	 // 1 string to match.
                return std::make_pair(441, 11);	 // "convert_ushort8_rte"
              case 'n':	 // 1 string to match.
                return std::make_pair(441, 11);	 // "convert_ushort8_rtn"
              case 'p':	 // 1 string to match.
                return std::make_pair(441, 11);	 // "convert_ushort8_rtp"
              case 'z':	 // 1 string to match.
                return std::make_pair(441, 11);	 // "convert_ushort8_rtz"
              }
              break;
            case 's':	 // 1 string to match.
              if (memcmp(Name.data()+17, "at", 2) != 0)
                break;
              return std::make_pair(441, 11);	 // "convert_ushort8_sat"
            }
            break;
          }
          break;
        }
        break;
      }
      break;
    case 'g':	 // 1 string to match.
      if (memcmp(Name.data()+1, "et_local_linear_id", 18) != 0)
        break;
      return std::make_pair(730, 1);	 // "get_local_linear_id"
    case 'i':	 // 1 string to match.
      if (memcmp(Name.data()+1, "s_valid_reserve_id", 18) != 0)
        break;
      return std::make_pair(2654, 1);	 // "is_valid_reserve_id"
    case 's':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ub_group_broadcast", 18) != 0)
        break;
      return std::make_pair(2706, 3);	 // "sub_group_broadcast"
    }
    break;
  case 20:	 // 48 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 1 string to match.
      if (memcmp(Name.data()+1, "tomic_load_explicit", 19) != 0)
        break;
      return std::make_pair(1743, 42);	 // "atomic_load_explicit"
    case 'c':	 // 37 strings to match.
      if (memcmp(Name.data()+1, "onvert_", 7) != 0)
        break;
      switch (Name[8]) {
      default: break;
      case 'c':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "har_sat_rt", 10) != 0)
          break;
        switch (Name[19]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(199, 11);	 // "convert_char_sat_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(199, 11);	 // "convert_char_sat_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(199, 11);	 // "convert_char_sat_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(199, 11);	 // "convert_char_sat_rtz"
        }
        break;
      case 'd':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "ouble16_rt", 10) != 0)
          break;
        switch (Name[19]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(122, 11);	 // "convert_double16_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(122, 11);	 // "convert_double16_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(122, 11);	 // "convert_double16_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(122, 11);	 // "convert_double16_rtz"
        }
        break;
      case 'i':	 // 16 strings to match.
        if (memcmp(Name.data()+9, "nt", 2) != 0)
          break;
        switch (Name[11]) {
        default: break;
        case '2':	 // 4 strings to match.
          if (memcmp(Name.data()+12, "_sat_rt", 7) != 0)
            break;
          switch (Name[19]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(474, 11);	 // "convert_int2_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(474, 11);	 // "convert_int2_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(474, 11);	 // "convert_int2_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(474, 11);	 // "convert_int2_sat_rtz"
          }
          break;
        case '3':	 // 4 strings to match.
          if (memcmp(Name.data()+12, "_sat_rt", 7) != 0)
            break;
          switch (Name[19]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(485, 11);	 // "convert_int3_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(485, 11);	 // "convert_int3_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(485, 11);	 // "convert_int3_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(485, 11);	 // "convert_int3_sat_rtz"
          }
          break;
        case '4':	 // 4 strings to match.
          if (memcmp(Name.data()+12, "_sat_rt", 7) != 0)
            break;
          switch (Name[19]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(496, 11);	 // "convert_int4_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(496, 11);	 // "convert_int4_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(496, 11);	 // "convert_int4_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(496, 11);	 // "convert_int4_sat_rtz"
          }
          break;
        case '8':	 // 4 strings to match.
          if (memcmp(Name.data()+12, "_sat_rt", 7) != 0)
            break;
          switch (Name[19]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(507, 11);	 // "convert_int8_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(507, 11);	 // "convert_int8_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(507, 11);	 // "convert_int8_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(507, 11);	 // "convert_int8_sat_rtz"
          }
          break;
        }
        break;
      case 'l':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "ong_sat_rt", 10) != 0)
          break;
        switch (Name[19]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(595, 11);	 // "convert_long_sat_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(595, 11);	 // "convert_long_sat_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(595, 11);	 // "convert_long_sat_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(595, 11);	 // "convert_long_sat_rtz"
        }
        break;
      case 'u':	 // 9 strings to match.
        switch (Name[9]) {
        default: break;
        case 'i':	 // 4 strings to match.
          if (memcmp(Name.data()+10, "nt_sat_rt", 9) != 0)
            break;
          switch (Name[19]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(529, 11);	 // "convert_uint_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(529, 11);	 // "convert_uint_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(529, 11);	 // "convert_uint_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(529, 11);	 // "convert_uint_sat_rtz"
          }
          break;
        case 's':	 // 5 strings to match.
          if (memcmp(Name.data()+10, "hort16_", 7) != 0)
            break;
          switch (Name[17]) {
          default: break;
          case 'r':	 // 4 strings to match.
            if (Name[18] != 't')
              break;
            switch (Name[19]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(452, 11);	 // "convert_ushort16_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(452, 11);	 // "convert_ushort16_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(452, 11);	 // "convert_ushort16_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(452, 11);	 // "convert_ushort16_rtz"
            }
            break;
          case 's':	 // 1 string to match.
            if (memcmp(Name.data()+18, "at", 2) != 0)
              break;
            return std::make_pair(452, 11);	 // "convert_ushort16_sat"
          }
          break;
        }
        break;
      }
      break;
    case 'd':	 // 3 strings to match.
      if (memcmp(Name.data()+1, "ot_4x8packed_", 13) != 0)
        break;
      switch (Name[14]) {
      default: break;
      case 's':	 // 2 strings to match.
        switch (Name[15]) {
        default: break;
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+16, "_int", 4) != 0)
            break;
          return std::make_pair(2741, 1);	 // "dot_4x8packed_ss_int"
        case 'u':	 // 1 string to match.
          if (memcmp(Name.data()+16, "_int", 4) != 0)
            break;
          return std::make_pair(2741, 1);	 // "dot_4x8packed_su_int"
        }
        break;
      case 'u':	 // 1 string to match.
        if (memcmp(Name.data()+15, "s_int", 5) != 0)
          break;
        return std::make_pair(2741, 1);	 // "dot_4x8packed_us_int"
      }
      break;
    case 'g':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "et_", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case 'g':	 // 1 string to match.
        if (memcmp(Name.data()+5, "lobal_linear_id", 15) != 0)
          break;
        return std::make_pair(730, 1);	 // "get_global_linear_id"
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+5, "mage_array_size", 15) != 0)
          break;
        return std::make_pair(2600, 15);	 // "get_image_array_size"
      }
      break;
    case 's':	 // 4 strings to match.
      if (memcmp(Name.data()+1, "ub_group_", 9) != 0)
        break;
      switch (Name[10]) {
      default: break;
      case 'r':	 // 3 strings to match.
        if (memcmp(Name.data()+11, "educe_", 6) != 0)
          break;
        switch (Name[17]) {
        default: break;
        case 'a':	 // 1 string to match.
          if (memcmp(Name.data()+18, "dd", 2) != 0)
            break;
          return std::make_pair(2709, 2);	 // "sub_group_reduce_add"
        case 'm':	 // 2 strings to match.
          switch (Name[18]) {
          default: break;
          case 'a':	 // 1 string to match.
            if (Name[19] != 'x')
              break;
            return std::make_pair(2709, 2);	 // "sub_group_reduce_max"
          case 'i':	 // 1 string to match.
            if (Name[19] != 'n')
              break;
            return std::make_pair(2709, 2);	 // "sub_group_reduce_min"
          }
          break;
        }
        break;
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+11, "huffle_up", 9) != 0)
          break;
        return std::make_pair(2726, 1);	 // "sub_group_shuffle_up"
      }
      break;
    case 'w':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ork_group_broadcast", 19) != 0)
        break;
      return std::make_pair(2650, 3);	 // "work_group_broadcast"
    }
    break;
  case 21:	 // 78 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 2 strings to match.
      switch (Name[1]) {
      default: break;
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+2, "ync_work_group_copy", 19) != 0)
          break;
        return std::make_pair(1450, 2);	 // "async_work_group_copy"
      case 't':	 // 1 string to match.
        if (memcmp(Name.data()+2, "omic_store_explicit", 19) != 0)
          break;
        return std::make_pair(1535, 42);	 // "atomic_store_explicit"
      }
      break;
    case 'c':	 // 64 strings to match.
      if (memcmp(Name.data()+1, "onvert_", 7) != 0)
        break;
      switch (Name[8]) {
      default: break;
      case 'c':	 // 16 strings to match.
        if (memcmp(Name.data()+9, "har", 3) != 0)
          break;
        switch (Name[12]) {
        default: break;
        case '2':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
            break;
          switch (Name[20]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(210, 11);	 // "convert_char2_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(210, 11);	 // "convert_char2_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(210, 11);	 // "convert_char2_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(210, 11);	 // "convert_char2_sat_rtz"
          }
          break;
        case '3':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
            break;
          switch (Name[20]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(221, 11);	 // "convert_char3_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(221, 11);	 // "convert_char3_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(221, 11);	 // "convert_char3_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(221, 11);	 // "convert_char3_sat_rtz"
          }
          break;
        case '4':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
            break;
          switch (Name[20]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(232, 11);	 // "convert_char4_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(232, 11);	 // "convert_char4_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(232, 11);	 // "convert_char4_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(232, 11);	 // "convert_char4_sat_rtz"
          }
          break;
        case '8':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
            break;
          switch (Name[20]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(243, 11);	 // "convert_char8_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(243, 11);	 // "convert_char8_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(243, 11);	 // "convert_char8_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(243, 11);	 // "convert_char8_sat_rtz"
          }
          break;
        }
        break;
      case 'i':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "nt16_sat_rt", 11) != 0)
          break;
        switch (Name[20]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(518, 11);	 // "convert_int16_sat_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(518, 11);	 // "convert_int16_sat_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(518, 11);	 // "convert_int16_sat_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(518, 11);	 // "convert_int16_sat_rtz"
        }
        break;
      case 'l':	 // 16 strings to match.
        if (memcmp(Name.data()+9, "ong", 3) != 0)
          break;
        switch (Name[12]) {
        default: break;
        case '2':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
            break;
          switch (Name[20]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(606, 11);	 // "convert_long2_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(606, 11);	 // "convert_long2_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(606, 11);	 // "convert_long2_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(606, 11);	 // "convert_long2_sat_rtz"
          }
          break;
        case '3':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
            break;
          switch (Name[20]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(617, 11);	 // "convert_long3_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(617, 11);	 // "convert_long3_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(617, 11);	 // "convert_long3_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(617, 11);	 // "convert_long3_sat_rtz"
          }
          break;
        case '4':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
            break;
          switch (Name[20]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(628, 11);	 // "convert_long4_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(628, 11);	 // "convert_long4_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(628, 11);	 // "convert_long4_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(628, 11);	 // "convert_long4_sat_rtz"
          }
          break;
        case '8':	 // 4 strings to match.
          if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
            break;
          switch (Name[20]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(639, 11);	 // "convert_long8_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(639, 11);	 // "convert_long8_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(639, 11);	 // "convert_long8_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(639, 11);	 // "convert_long8_sat_rtz"
          }
          break;
        }
        break;
      case 's':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "hort_sat_rt", 11) != 0)
          break;
        switch (Name[20]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(331, 11);	 // "convert_short_sat_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(331, 11);	 // "convert_short_sat_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(331, 11);	 // "convert_short_sat_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(331, 11);	 // "convert_short_sat_rtz"
        }
        break;
      case 'u':	 // 24 strings to match.
        switch (Name[9]) {
        default: break;
        case 'c':	 // 4 strings to match.
          if (memcmp(Name.data()+10, "har_sat_rt", 10) != 0)
            break;
          switch (Name[20]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(265, 11);	 // "convert_uchar_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(265, 11);	 // "convert_uchar_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(265, 11);	 // "convert_uchar_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(265, 11);	 // "convert_uchar_sat_rtz"
          }
          break;
        case 'i':	 // 16 strings to match.
          if (memcmp(Name.data()+10, "nt", 2) != 0)
            break;
          switch (Name[12]) {
          default: break;
          case '2':	 // 4 strings to match.
            if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
              break;
            switch (Name[20]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(540, 11);	 // "convert_uint2_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(540, 11);	 // "convert_uint2_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(540, 11);	 // "convert_uint2_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(540, 11);	 // "convert_uint2_sat_rtz"
            }
            break;
          case '3':	 // 4 strings to match.
            if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
              break;
            switch (Name[20]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(551, 11);	 // "convert_uint3_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(551, 11);	 // "convert_uint3_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(551, 11);	 // "convert_uint3_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(551, 11);	 // "convert_uint3_sat_rtz"
            }
            break;
          case '4':	 // 4 strings to match.
            if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
              break;
            switch (Name[20]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(562, 11);	 // "convert_uint4_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(562, 11);	 // "convert_uint4_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(562, 11);	 // "convert_uint4_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(562, 11);	 // "convert_uint4_sat_rtz"
            }
            break;
          case '8':	 // 4 strings to match.
            if (memcmp(Name.data()+13, "_sat_rt", 7) != 0)
              break;
            switch (Name[20]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(573, 11);	 // "convert_uint8_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(573, 11);	 // "convert_uint8_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(573, 11);	 // "convert_uint8_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(573, 11);	 // "convert_uint8_sat_rtz"
            }
            break;
          }
          break;
        case 'l':	 // 4 strings to match.
          if (memcmp(Name.data()+10, "ong_sat_rt", 10) != 0)
            break;
          switch (Name[20]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(661, 11);	 // "convert_ulong_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(661, 11);	 // "convert_ulong_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(661, 11);	 // "convert_ulong_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(661, 11);	 // "convert_ulong_sat_rtz"
          }
          break;
        }
        break;
      }
      break;
    case 'd':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ot_4x8packed_uu_uint", 20) != 0)
        break;
      return std::make_pair(2740, 1);	 // "dot_4x8packed_uu_uint"
    case 'g':	 // 6 strings to match.
      if (memcmp(Name.data()+1, "et_", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+5, "mage_num_samples", 16) != 0)
          break;
        return std::make_pair(2689, 12);	 // "get_image_num_samples"
      case 's':	 // 5 strings to match.
        if (memcmp(Name.data()+5, "ub_group_", 9) != 0)
          break;
        switch (Name[14]) {
        default: break;
        case 'e':	 // 1 string to match.
          if (memcmp(Name.data()+15, "q_mask", 6) != 0)
            break;
          return std::make_pair(2721, 1);	 // "get_sub_group_eq_mask"
        case 'g':	 // 2 strings to match.
          switch (Name[15]) {
          default: break;
          case 'e':	 // 1 string to match.
            if (memcmp(Name.data()+16, "_mask", 5) != 0)
              break;
            return std::make_pair(2721, 1);	 // "get_sub_group_ge_mask"
          case 't':	 // 1 string to match.
            if (memcmp(Name.data()+16, "_mask", 5) != 0)
              break;
            return std::make_pair(2721, 1);	 // "get_sub_group_gt_mask"
          }
          break;
        case 'l':	 // 2 strings to match.
          switch (Name[15]) {
          default: break;
          case 'e':	 // 1 string to match.
            if (memcmp(Name.data()+16, "_mask", 5) != 0)
              break;
            return std::make_pair(2721, 1);	 // "get_sub_group_le_mask"
          case 't':	 // 1 string to match.
            if (memcmp(Name.data()+16, "_mask", 5) != 0)
              break;
            return std::make_pair(2721, 1);	 // "get_sub_group_lt_mask"
          }
          break;
        }
        break;
      }
      break;
    case 's':	 // 2 strings to match.
      switch (Name[1]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+2, "t_user_event_status", 19) != 0)
          break;
        return std::make_pair(2659, 1);	 // "set_user_event_status"
      case 'u':	 // 1 string to match.
        if (memcmp(Name.data()+2, "b_group_shuffle_xor", 19) != 0)
          break;
        return std::make_pair(2725, 1);	 // "sub_group_shuffle_xor"
      }
      break;
    case 'w':	 // 3 strings to match.
      if (memcmp(Name.data()+1, "ork_group_reduce_", 17) != 0)
        break;
      switch (Name[18]) {
      default: break;
      case 'a':	 // 1 string to match.
        if (memcmp(Name.data()+19, "dd", 2) != 0)
          break;
        return std::make_pair(2653, 1);	 // "work_group_reduce_add"
      case 'm':	 // 2 strings to match.
        switch (Name[19]) {
        default: break;
        case 'a':	 // 1 string to match.
          if (Name[20] != 'x')
            break;
          return std::make_pair(2653, 1);	 // "work_group_reduce_max"
        case 'i':	 // 1 string to match.
          if (Name[20] != 'n')
            break;
          return std::make_pair(2653, 1);	 // "work_group_reduce_min"
        }
        break;
      }
      break;
    }
    break;
  case 22:	 // 68 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 1 string to match.
      if (memcmp(Name.data()+1, "tomic_work_item_fence", 21) != 0)
        break;
      return std::make_pair(1721, 1);	 // "atomic_work_item_fence"
    case 'c':	 // 64 strings to match.
      if (memcmp(Name.data()+1, "onvert_", 7) != 0)
        break;
      switch (Name[8]) {
      default: break;
      case 'c':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "har16_sat_rt", 12) != 0)
          break;
        switch (Name[21]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(254, 11);	 // "convert_char16_sat_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(254, 11);	 // "convert_char16_sat_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(254, 11);	 // "convert_char16_sat_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(254, 11);	 // "convert_char16_sat_rtz"
        }
        break;
      case 'l':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "ong16_sat_rt", 12) != 0)
          break;
        switch (Name[21]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(650, 11);	 // "convert_long16_sat_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(650, 11);	 // "convert_long16_sat_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(650, 11);	 // "convert_long16_sat_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(650, 11);	 // "convert_long16_sat_rtz"
        }
        break;
      case 's':	 // 16 strings to match.
        if (memcmp(Name.data()+9, "hort", 4) != 0)
          break;
        switch (Name[13]) {
        default: break;
        case '2':	 // 4 strings to match.
          if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
            break;
          switch (Name[21]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(342, 11);	 // "convert_short2_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(342, 11);	 // "convert_short2_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(342, 11);	 // "convert_short2_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(342, 11);	 // "convert_short2_sat_rtz"
          }
          break;
        case '3':	 // 4 strings to match.
          if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
            break;
          switch (Name[21]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(353, 11);	 // "convert_short3_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(353, 11);	 // "convert_short3_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(353, 11);	 // "convert_short3_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(353, 11);	 // "convert_short3_sat_rtz"
          }
          break;
        case '4':	 // 4 strings to match.
          if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
            break;
          switch (Name[21]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(364, 11);	 // "convert_short4_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(364, 11);	 // "convert_short4_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(364, 11);	 // "convert_short4_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(364, 11);	 // "convert_short4_sat_rtz"
          }
          break;
        case '8':	 // 4 strings to match.
          if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
            break;
          switch (Name[21]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(375, 11);	 // "convert_short8_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(375, 11);	 // "convert_short8_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(375, 11);	 // "convert_short8_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(375, 11);	 // "convert_short8_sat_rtz"
          }
          break;
        }
        break;
      case 'u':	 // 40 strings to match.
        switch (Name[9]) {
        default: break;
        case 'c':	 // 16 strings to match.
          if (memcmp(Name.data()+10, "har", 3) != 0)
            break;
          switch (Name[13]) {
          default: break;
          case '2':	 // 4 strings to match.
            if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
              break;
            switch (Name[21]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(276, 11);	 // "convert_uchar2_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(276, 11);	 // "convert_uchar2_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(276, 11);	 // "convert_uchar2_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(276, 11);	 // "convert_uchar2_sat_rtz"
            }
            break;
          case '3':	 // 4 strings to match.
            if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
              break;
            switch (Name[21]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(287, 11);	 // "convert_uchar3_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(287, 11);	 // "convert_uchar3_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(287, 11);	 // "convert_uchar3_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(287, 11);	 // "convert_uchar3_sat_rtz"
            }
            break;
          case '4':	 // 4 strings to match.
            if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
              break;
            switch (Name[21]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(298, 11);	 // "convert_uchar4_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(298, 11);	 // "convert_uchar4_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(298, 11);	 // "convert_uchar4_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(298, 11);	 // "convert_uchar4_sat_rtz"
            }
            break;
          case '8':	 // 4 strings to match.
            if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
              break;
            switch (Name[21]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(309, 11);	 // "convert_uchar8_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(309, 11);	 // "convert_uchar8_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(309, 11);	 // "convert_uchar8_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(309, 11);	 // "convert_uchar8_sat_rtz"
            }
            break;
          }
          break;
        case 'i':	 // 4 strings to match.
          if (memcmp(Name.data()+10, "nt16_sat_rt", 11) != 0)
            break;
          switch (Name[21]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(584, 11);	 // "convert_uint16_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(584, 11);	 // "convert_uint16_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(584, 11);	 // "convert_uint16_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(584, 11);	 // "convert_uint16_sat_rtz"
          }
          break;
        case 'l':	 // 16 strings to match.
          if (memcmp(Name.data()+10, "ong", 3) != 0)
            break;
          switch (Name[13]) {
          default: break;
          case '2':	 // 4 strings to match.
            if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
              break;
            switch (Name[21]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(672, 11);	 // "convert_ulong2_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(672, 11);	 // "convert_ulong2_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(672, 11);	 // "convert_ulong2_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(672, 11);	 // "convert_ulong2_sat_rtz"
            }
            break;
          case '3':	 // 4 strings to match.
            if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
              break;
            switch (Name[21]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(683, 11);	 // "convert_ulong3_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(683, 11);	 // "convert_ulong3_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(683, 11);	 // "convert_ulong3_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(683, 11);	 // "convert_ulong3_sat_rtz"
            }
            break;
          case '4':	 // 4 strings to match.
            if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
              break;
            switch (Name[21]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(694, 11);	 // "convert_ulong4_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(694, 11);	 // "convert_ulong4_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(694, 11);	 // "convert_ulong4_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(694, 11);	 // "convert_ulong4_sat_rtz"
            }
            break;
          case '8':	 // 4 strings to match.
            if (memcmp(Name.data()+14, "_sat_rt", 7) != 0)
              break;
            switch (Name[21]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(705, 11);	 // "convert_ulong8_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(705, 11);	 // "convert_ulong8_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(705, 11);	 // "convert_ulong8_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(705, 11);	 // "convert_ulong8_sat_rtz"
            }
            break;
          }
          break;
        case 's':	 // 4 strings to match.
          if (memcmp(Name.data()+10, "hort_sat_rt", 11) != 0)
            break;
          switch (Name[21]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(397, 11);	 // "convert_ushort_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(397, 11);	 // "convert_ushort_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(397, 11);	 // "convert_ushort_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(397, 11);	 // "convert_ushort_sat_rtz"
          }
          break;
        }
        break;
      }
      break;
    case 'g':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "et_", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case 'm':	 // 1 string to match.
        if (memcmp(Name.data()+5, "ax_sub_group_size", 17) != 0)
          break;
        return std::make_pair(2701, 1);	 // "get_max_sub_group_size"
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+5, "ub_group_local_id", 17) != 0)
          break;
        return std::make_pair(2701, 1);	 // "get_sub_group_local_id"
      }
      break;
    case 's':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ub_group_shuffle_down", 21) != 0)
        break;
      return std::make_pair(2726, 1);	 // "sub_group_shuffle_down"
    }
    break;
  case 23:	 // 31 strings to match.
    switch (Name[0]) {
    default: break;
    case 'b':	 // 1 string to match.
      if (memcmp(Name.data()+1, "itfield_extract_signed", 22) != 0)
        break;
      return std::make_pair(2731, 2);	 // "bitfield_extract_signed"
    case 'c':	 // 28 strings to match.
      if (memcmp(Name.data()+1, "onvert_", 7) != 0)
        break;
      switch (Name[8]) {
      default: break;
      case 's':	 // 4 strings to match.
        if (memcmp(Name.data()+9, "hort16_sat_rt", 13) != 0)
          break;
        switch (Name[22]) {
        default: break;
        case 'e':	 // 1 string to match.
          return std::make_pair(386, 11);	 // "convert_short16_sat_rte"
        case 'n':	 // 1 string to match.
          return std::make_pair(386, 11);	 // "convert_short16_sat_rtn"
        case 'p':	 // 1 string to match.
          return std::make_pair(386, 11);	 // "convert_short16_sat_rtp"
        case 'z':	 // 1 string to match.
          return std::make_pair(386, 11);	 // "convert_short16_sat_rtz"
        }
        break;
      case 'u':	 // 24 strings to match.
        switch (Name[9]) {
        default: break;
        case 'c':	 // 4 strings to match.
          if (memcmp(Name.data()+10, "har16_sat_rt", 12) != 0)
            break;
          switch (Name[22]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(320, 11);	 // "convert_uchar16_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(320, 11);	 // "convert_uchar16_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(320, 11);	 // "convert_uchar16_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(320, 11);	 // "convert_uchar16_sat_rtz"
          }
          break;
        case 'l':	 // 4 strings to match.
          if (memcmp(Name.data()+10, "ong16_sat_rt", 12) != 0)
            break;
          switch (Name[22]) {
          default: break;
          case 'e':	 // 1 string to match.
            return std::make_pair(716, 11);	 // "convert_ulong16_sat_rte"
          case 'n':	 // 1 string to match.
            return std::make_pair(716, 11);	 // "convert_ulong16_sat_rtn"
          case 'p':	 // 1 string to match.
            return std::make_pair(716, 11);	 // "convert_ulong16_sat_rtp"
          case 'z':	 // 1 string to match.
            return std::make_pair(716, 11);	 // "convert_ulong16_sat_rtz"
          }
          break;
        case 's':	 // 16 strings to match.
          if (memcmp(Name.data()+10, "hort", 4) != 0)
            break;
          switch (Name[14]) {
          default: break;
          case '2':	 // 4 strings to match.
            if (memcmp(Name.data()+15, "_sat_rt", 7) != 0)
              break;
            switch (Name[22]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(408, 11);	 // "convert_ushort2_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(408, 11);	 // "convert_ushort2_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(408, 11);	 // "convert_ushort2_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(408, 11);	 // "convert_ushort2_sat_rtz"
            }
            break;
          case '3':	 // 4 strings to match.
            if (memcmp(Name.data()+15, "_sat_rt", 7) != 0)
              break;
            switch (Name[22]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(419, 11);	 // "convert_ushort3_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(419, 11);	 // "convert_ushort3_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(419, 11);	 // "convert_ushort3_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(419, 11);	 // "convert_ushort3_sat_rtz"
            }
            break;
          case '4':	 // 4 strings to match.
            if (memcmp(Name.data()+15, "_sat_rt", 7) != 0)
              break;
            switch (Name[22]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(430, 11);	 // "convert_ushort4_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(430, 11);	 // "convert_ushort4_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(430, 11);	 // "convert_ushort4_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(430, 11);	 // "convert_ushort4_sat_rtz"
            }
            break;
          case '8':	 // 4 strings to match.
            if (memcmp(Name.data()+15, "_sat_rt", 7) != 0)
              break;
            switch (Name[22]) {
            default: break;
            case 'e':	 // 1 string to match.
              return std::make_pair(441, 11);	 // "convert_ushort8_sat_rte"
            case 'n':	 // 1 string to match.
              return std::make_pair(441, 11);	 // "convert_ushort8_sat_rtn"
            case 'p':	 // 1 string to match.
              return std::make_pair(441, 11);	 // "convert_ushort8_sat_rtp"
            case 'z':	 // 1 string to match.
              return std::make_pair(441, 11);	 // "convert_ushort8_sat_rtz"
            }
            break;
          }
          break;
        }
        break;
      }
      break;
    case 'g':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "et_", 3) != 0)
        break;
      switch (Name[4]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+5, "nqueued_local_size", 18) != 0)
          break;
        return std::make_pair(729, 1);	 // "get_enqueued_local_size"
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+5, "mage_channel_order", 18) != 0)
          break;
        return std::make_pair(2507, 36);	 // "get_image_channel_order"
      }
      break;
    }
    break;
  case 24:	 // 9 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 3 strings to match.
      if (memcmp(Name.data()+1, "tomic_", 6) != 0)
        break;
      switch (Name[7]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+8, "xchange_explicit", 16) != 0)
          break;
        return std::make_pair(1806, 42);	 // "atomic_exchange_explicit"
      case 'f':	 // 2 strings to match.
        switch (Name[8]) {
        default: break;
        case 'e':	 // 1 string to match.
          if (memcmp(Name.data()+9, "tch_or_explicit", 15) != 0)
            break;
          return std::make_pair(1932, 24);	 // "atomic_fetch_or_explicit"
        case 'l':	 // 1 string to match.
          if (memcmp(Name.data()+9, "ag_test_and_set", 15) != 0)
            break;
          return std::make_pair(1965, 3);	 // "atomic_flag_test_and_set"
        }
        break;
      }
      break;
    case 'c':	 // 4 strings to match.
      if (memcmp(Name.data()+1, "onvert_ushort16_sat_rt", 22) != 0)
        break;
      switch (Name[23]) {
      default: break;
      case 'e':	 // 1 string to match.
        return std::make_pair(452, 11);	 // "convert_ushort16_sat_rte"
      case 'n':	 // 1 string to match.
        return std::make_pair(452, 11);	 // "convert_ushort16_sat_rtn"
      case 'p':	 // 1 string to match.
        return std::make_pair(452, 11);	 // "convert_ushort16_sat_rtp"
      case 'z':	 // 1 string to match.
        return std::make_pair(452, 11);	 // "convert_ushort16_sat_rtz"
      }
      break;
    case 'g':	 // 1 string to match.
      if (memcmp(Name.data()+1, "et_image_num_mip_levels", 23) != 0)
        break;
      return std::make_pair(2668, 21);	 // "get_image_num_mip_levels"
    case 's':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ub_group_inverse_ballot", 23) != 0)
        break;
      return std::make_pair(2717, 1);	 // "sub_group_inverse_ballot"
    }
    break;
  case 25:	 // 12 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 6 strings to match.
      if (memcmp(Name.data()+1, "tomic_fetch_", 12) != 0)
        break;
      switch (Name[13]) {
      default: break;
      case 'a':	 // 2 strings to match.
        switch (Name[14]) {
        default: break;
        case 'd':	 // 1 string to match.
          if (memcmp(Name.data()+15, "d_explicit", 10) != 0)
            break;
          return std::make_pair(1872, 48);	 // "atomic_fetch_add_explicit"
        case 'n':	 // 1 string to match.
          if (memcmp(Name.data()+15, "d_explicit", 10) != 0)
            break;
          return std::make_pair(1932, 24);	 // "atomic_fetch_and_explicit"
        }
        break;
      case 'm':	 // 2 strings to match.
        switch (Name[14]) {
        default: break;
        case 'a':	 // 1 string to match.
          if (memcmp(Name.data()+15, "x_explicit", 10) != 0)
            break;
          return std::make_pair(1806, 42);	 // "atomic_fetch_max_explicit"
        case 'i':	 // 1 string to match.
          if (memcmp(Name.data()+15, "n_explicit", 10) != 0)
            break;
          return std::make_pair(1806, 42);	 // "atomic_fetch_min_explicit"
        }
        break;
      case 's':	 // 1 string to match.
        if (memcmp(Name.data()+14, "ub_explicit", 11) != 0)
          break;
        return std::make_pair(1872, 48);	 // "atomic_fetch_sub_explicit"
      case 'x':	 // 1 string to match.
        if (memcmp(Name.data()+14, "or_explicit", 11) != 0)
          break;
        return std::make_pair(1932, 24);	 // "atomic_fetch_xor_explicit"
      }
      break;
    case 'b':	 // 1 string to match.
      if (memcmp(Name.data()+1, "itfield_extract_unsigned", 24) != 0)
        break;
      return std::make_pair(2733, 2);	 // "bitfield_extract_unsigned"
    case 's':	 // 5 strings to match.
      if (memcmp(Name.data()+1, "ub_group_", 9) != 0)
        break;
      switch (Name[10]) {
      default: break;
      case 'b':	 // 3 strings to match.
        switch (Name[11]) {
        default: break;
        case 'a':	 // 2 strings to match.
          if (memcmp(Name.data()+12, "llot_find_", 10) != 0)
            break;
          switch (Name[22]) {
          default: break;
          case 'l':	 // 1 string to match.
            if (memcmp(Name.data()+23, "sb", 2) != 0)
              break;
            return std::make_pair(2720, 1);	 // "sub_group_ballot_find_lsb"
          case 'm':	 // 1 string to match.
            if (memcmp(Name.data()+23, "sb", 2) != 0)
              break;
            return std::make_pair(2720, 1);	 // "sub_group_ballot_find_msb"
          }
          break;
        case 'r':	 // 1 string to match.
          if (memcmp(Name.data()+12, "oadcast_first", 13) != 0)
            break;
          return std::make_pair(2715, 1);	 // "sub_group_broadcast_first"
        }
        break;
      case 'n':	 // 2 strings to match.
        if (memcmp(Name.data()+11, "on_uniform_a", 12) != 0)
          break;
        switch (Name[23]) {
        default: break;
        case 'l':	 // 1 string to match.
          if (Name[24] != 'l')
            break;
          return std::make_pair(2712, 1);	 // "sub_group_non_uniform_all"
        case 'n':	 // 1 string to match.
          if (Name[24] != 'y')
            break;
          return std::make_pair(2712, 1);	 // "sub_group_non_uniform_any"
        }
        break;
      }
      break;
    }
    break;
  case 26:	 // 3 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 1 string to match.
      if (memcmp(Name.data()+1, "tomic_flag_clear_explicit", 25) != 0)
        break;
      return std::make_pair(1959, 6);	 // "atomic_flag_clear_explicit"
    case 's':	 // 2 strings to match.
      if (memcmp(Name.data()+1, "ub_group_", 9) != 0)
        break;
      switch (Name[10]) {
      default: break;
      case 'b':	 // 1 string to match.
        if (memcmp(Name.data()+11, "allot_bit_count", 15) != 0)
          break;
        return std::make_pair(2719, 1);	 // "sub_group_ballot_bit_count"
      case 'c':	 // 1 string to match.
        if (memcmp(Name.data()+11, "lustered_rotate", 15) != 0)
          break;
        return std::make_pair(2745, 1);	 // "sub_group_clustered_rotate"
      }
      break;
    }
    break;
  case 27:	 // 2 strings to match.
    if (memcmp(Name.data()+0, "get_", 4) != 0)
      break;
    switch (Name[4]) {
    default: break;
    case 'e':	 // 1 string to match.
      if (memcmp(Name.data()+5, "nqueued_num_sub_groups", 22) != 0)
        break;
      return std::make_pair(2702, 1);	 // "get_enqueued_num_sub_groups"
    case 'i':	 // 1 string to match.
      if (memcmp(Name.data()+5, "mage_channel_data_type", 22) != 0)
        break;
      return std::make_pair(2507, 36);	 // "get_image_channel_data_type"
    }
    break;
  case 28:	 // 12 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 1 string to match.
      if (memcmp(Name.data()+1, "tomic_compare_exchange_weak", 27) != 0)
        break;
      return std::make_pair(1595, 42);	 // "atomic_compare_exchange_weak"
    case 'c':	 // 1 string to match.
      if (memcmp(Name.data()+1, "apture_event_profiling_info", 27) != 0)
        break;
      return std::make_pair(2660, 1);	 // "capture_event_profiling_info"
    case 'd':	 // 3 strings to match.
      if (memcmp(Name.data()+1, "ot_acc_sat_4x8packed_", 21) != 0)
        break;
      switch (Name[22]) {
      default: break;
      case 's':	 // 2 strings to match.
        switch (Name[23]) {
        default: break;
        case 's':	 // 1 string to match.
          if (memcmp(Name.data()+24, "_int", 4) != 0)
            break;
          return std::make_pair(2743, 1);	 // "dot_acc_sat_4x8packed_ss_int"
        case 'u':	 // 1 string to match.
          if (memcmp(Name.data()+24, "_int", 4) != 0)
            break;
          return std::make_pair(2743, 1);	 // "dot_acc_sat_4x8packed_su_int"
        }
        break;
      case 'u':	 // 1 string to match.
        if (memcmp(Name.data()+23, "s_int", 5) != 0)
          break;
        return std::make_pair(2743, 1);	 // "dot_acc_sat_4x8packed_us_int"
      }
      break;
    case 's':	 // 7 strings to match.
      if (memcmp(Name.data()+1, "ub_group_", 9) != 0)
        break;
      switch (Name[10]) {
      default: break;
      case 'b':	 // 1 string to match.
        if (memcmp(Name.data()+11, "allot_bit_extract", 17) != 0)
          break;
        return std::make_pair(2718, 1);	 // "sub_group_ballot_bit_extract"
      case 's':	 // 6 strings to match.
        if (memcmp(Name.data()+11, "can_", 4) != 0)
          break;
        switch (Name[15]) {
        default: break;
        case 'e':	 // 3 strings to match.
          if (memcmp(Name.data()+16, "xclusive_", 9) != 0)
            break;
          switch (Name[25]) {
          default: break;
          case 'a':	 // 1 string to match.
            if (memcmp(Name.data()+26, "dd", 2) != 0)
              break;
            return std::make_pair(2709, 2);	 // "sub_group_scan_exclusive_add"
          case 'm':	 // 2 strings to match.
            switch (Name[26]) {
            default: break;
            case 'a':	 // 1 string to match.
              if (Name[27] != 'x')
                break;
              return std::make_pair(2709, 2);	 // "sub_group_scan_exclusive_max"
            case 'i':	 // 1 string to match.
              if (Name[27] != 'n')
                break;
              return std::make_pair(2709, 2);	 // "sub_group_scan_exclusive_min"
            }
            break;
          }
          break;
        case 'i':	 // 3 strings to match.
          if (memcmp(Name.data()+16, "nclusive_", 9) != 0)
            break;
          switch (Name[25]) {
          default: break;
          case 'a':	 // 1 string to match.
            if (memcmp(Name.data()+26, "dd", 2) != 0)
              break;
            return std::make_pair(2709, 2);	 // "sub_group_scan_inclusive_add"
          case 'm':	 // 2 strings to match.
            switch (Name[26]) {
            default: break;
            case 'a':	 // 1 string to match.
              if (Name[27] != 'x')
                break;
              return std::make_pair(2709, 2);	 // "sub_group_scan_inclusive_max"
            case 'i':	 // 1 string to match.
              if (Name[27] != 'n')
                break;
              return std::make_pair(2709, 2);	 // "sub_group_scan_inclusive_min"
            }
            break;
          }
          break;
        }
        break;
      }
      break;
    }
    break;
  case 29:	 // 9 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 1 string to match.
      if (memcmp(Name.data()+1, "sync_work_group_strided_copy", 28) != 0)
        break;
      return std::make_pair(1452, 2);	 // "async_work_group_strided_copy"
    case 'd':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ot_acc_sat_4x8packed_uu_uint", 28) != 0)
        break;
      return std::make_pair(2742, 1);	 // "dot_acc_sat_4x8packed_uu_uint"
    case 's':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ub_group_clustered_reduce_or", 28) != 0)
        break;
      return std::make_pair(2728, 1);	 // "sub_group_clustered_reduce_or"
    case 'w':	 // 6 strings to match.
      if (memcmp(Name.data()+1, "ork_group_scan_", 15) != 0)
        break;
      switch (Name[16]) {
      default: break;
      case 'e':	 // 3 strings to match.
        if (memcmp(Name.data()+17, "xclusive_", 9) != 0)
          break;
        switch (Name[26]) {
        default: break;
        case 'a':	 // 1 string to match.
          if (memcmp(Name.data()+27, "dd", 2) != 0)
            break;
          return std::make_pair(2653, 1);	 // "work_group_scan_exclusive_add"
        case 'm':	 // 2 strings to match.
          switch (Name[27]) {
          default: break;
          case 'a':	 // 1 string to match.
            if (Name[28] != 'x')
              break;
            return std::make_pair(2653, 1);	 // "work_group_scan_exclusive_max"
          case 'i':	 // 1 string to match.
            if (Name[28] != 'n')
              break;
            return std::make_pair(2653, 1);	 // "work_group_scan_exclusive_min"
          }
          break;
        }
        break;
      case 'i':	 // 3 strings to match.
        if (memcmp(Name.data()+17, "nclusive_", 9) != 0)
          break;
        switch (Name[26]) {
        default: break;
        case 'a':	 // 1 string to match.
          if (memcmp(Name.data()+27, "dd", 2) != 0)
            break;
          return std::make_pair(2653, 1);	 // "work_group_scan_inclusive_add"
        case 'm':	 // 2 strings to match.
          switch (Name[27]) {
          default: break;
          case 'a':	 // 1 string to match.
            if (Name[28] != 'x')
              break;
            return std::make_pair(2653, 1);	 // "work_group_scan_inclusive_max"
          case 'i':	 // 1 string to match.
            if (Name[28] != 'n')
              break;
            return std::make_pair(2653, 1);	 // "work_group_scan_inclusive_min"
          }
          break;
        }
        break;
      }
      break;
    }
    break;
  case 30:	 // 7 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 1 string to match.
      if (memcmp(Name.data()+1, "tomic_compare_exchange_strong", 29) != 0)
        break;
      return std::make_pair(1595, 42);	 // "atomic_compare_exchange_strong"
    case 's':	 // 6 strings to match.
      if (memcmp(Name.data()+1, "ub_group_clustered_reduce_", 26) != 0)
        break;
      switch (Name[27]) {
      default: break;
      case 'a':	 // 2 strings to match.
        switch (Name[28]) {
        default: break;
        case 'd':	 // 1 string to match.
          if (Name[29] != 'd')
            break;
          return std::make_pair(2727, 1);	 // "sub_group_clustered_reduce_add"
        case 'n':	 // 1 string to match.
          if (Name[29] != 'd')
            break;
          return std::make_pair(2728, 1);	 // "sub_group_clustered_reduce_and"
        }
        break;
      case 'm':	 // 3 strings to match.
        switch (Name[28]) {
        default: break;
        case 'a':	 // 1 string to match.
          if (Name[29] != 'x')
            break;
          return std::make_pair(2727, 1);	 // "sub_group_clustered_reduce_max"
        case 'i':	 // 1 string to match.
          if (Name[29] != 'n')
            break;
          return std::make_pair(2727, 1);	 // "sub_group_clustered_reduce_min"
        case 'u':	 // 1 string to match.
          if (Name[29] != 'l')
            break;
          return std::make_pair(2727, 1);	 // "sub_group_clustered_reduce_mul"
        }
        break;
      case 'x':	 // 1 string to match.
        if (memcmp(Name.data()+28, "or", 2) != 0)
          break;
        return std::make_pair(2728, 1);	 // "sub_group_clustered_reduce_xor"
      }
      break;
    }
    break;
  case 31:	 // 5 strings to match.
    if (memcmp(Name.data()+0, "sub_group_", 10) != 0)
      break;
    switch (Name[10]) {
    default: break;
    case 'b':	 // 2 strings to match.
      if (memcmp(Name.data()+11, "allot_", 6) != 0)
        break;
      switch (Name[17]) {
      default: break;
      case 'e':	 // 1 string to match.
        if (memcmp(Name.data()+18, "xclusive_scan", 13) != 0)
          break;
        return std::make_pair(2720, 1);	 // "sub_group_ballot_exclusive_scan"
      case 'i':	 // 1 string to match.
        if (memcmp(Name.data()+18, "nclusive_scan", 13) != 0)
          break;
        return std::make_pair(2720, 1);	 // "sub_group_ballot_inclusive_scan"
      }
      break;
    case 'n':	 // 3 strings to match.
      if (memcmp(Name.data()+11, "on_uniform_", 11) != 0)
        break;
      switch (Name[22]) {
      default: break;
      case 'a':	 // 1 string to match.
        if (memcmp(Name.data()+23, "ll_equal", 8) != 0)
          break;
        return std::make_pair(2713, 1);	 // "sub_group_non_uniform_all_equal"
      case 'b':	 // 1 string to match.
        if (memcmp(Name.data()+23, "roadcast", 8) != 0)
          break;
        return std::make_pair(2714, 1);	 // "sub_group_non_uniform_broadcast"
      case 'r':	 // 1 string to match.
        if (memcmp(Name.data()+23, "educe_or", 8) != 0)
          break;
        return std::make_pair(2723, 1);	 // "sub_group_non_uniform_reduce_or"
      }
      break;
    }
    break;
  case 32:	 // 6 strings to match.
    if (memcmp(Name.data()+0, "sub_group_non_uniform_reduce_", 29) != 0)
      break;
    switch (Name[29]) {
    default: break;
    case 'a':	 // 2 strings to match.
      switch (Name[30]) {
      default: break;
      case 'd':	 // 1 string to match.
        if (Name[31] != 'd')
          break;
        return std::make_pair(2722, 1);	 // "sub_group_non_uniform_reduce_add"
      case 'n':	 // 1 string to match.
        if (Name[31] != 'd')
          break;
        return std::make_pair(2723, 1);	 // "sub_group_non_uniform_reduce_and"
      }
      break;
    case 'm':	 // 3 strings to match.
      switch (Name[30]) {
      default: break;
      case 'a':	 // 1 string to match.
        if (Name[31] != 'x')
          break;
        return std::make_pair(2722, 1);	 // "sub_group_non_uniform_reduce_max"
      case 'i':	 // 1 string to match.
        if (Name[31] != 'n')
          break;
        return std::make_pair(2722, 1);	 // "sub_group_non_uniform_reduce_min"
      case 'u':	 // 1 string to match.
        if (Name[31] != 'l')
          break;
        return std::make_pair(2722, 1);	 // "sub_group_non_uniform_reduce_mul"
      }
      break;
    case 'x':	 // 1 string to match.
      if (memcmp(Name.data()+30, "or", 2) != 0)
        break;
      return std::make_pair(2723, 1);	 // "sub_group_non_uniform_reduce_xor"
    }
    break;
  case 33:	 // 1 string to match.
    if (memcmp(Name.data()+0, "atomic_flag_test_and_set_explicit", 33) != 0)
      break;
    return std::make_pair(1968, 6);	 // "atomic_flag_test_and_set_explicit"
  case 37:	 // 2 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 1 string to match.
      if (memcmp(Name.data()+1, "tomic_compare_exchange_weak_explicit", 36) != 0)
        break;
      return std::make_pair(1637, 84);	 // "atomic_compare_exchange_weak_explicit"
    case 's':	 // 1 string to match.
      if (memcmp(Name.data()+1, "ub_group_clustered_reduce_logical_or", 36) != 0)
        break;
      return std::make_pair(2729, 1);	 // "sub_group_clustered_reduce_logical_or"
    }
    break;
  case 38:	 // 2 strings to match.
    if (memcmp(Name.data()+0, "sub_group_clustered_reduce_logical_", 35) != 0)
      break;
    switch (Name[35]) {
    default: break;
    case 'a':	 // 1 string to match.
      if (memcmp(Name.data()+36, "nd", 2) != 0)
        break;
      return std::make_pair(2729, 1);	 // "sub_group_clustered_reduce_logical_and"
    case 'x':	 // 1 string to match.
      if (memcmp(Name.data()+36, "or", 2) != 0)
        break;
      return std::make_pair(2729, 1);	 // "sub_group_clustered_reduce_logical_xor"
    }
    break;
  case 39:	 // 4 strings to match.
    switch (Name[0]) {
    default: break;
    case 'a':	 // 1 string to match.
      if (memcmp(Name.data()+1, "tomic_compare_exchange_strong_explicit", 38) != 0)
        break;
      return std::make_pair(1637, 84);	 // "atomic_compare_exchange_strong_explicit"
    case 's':	 // 3 strings to match.
      if (memcmp(Name.data()+1, "ub_group_non_uniform_", 21) != 0)
        break;
      switch (Name[22]) {
      default: break;
      case 'r':	 // 1 string to match.
        if (memcmp(Name.data()+23, "educe_logical_or", 16) != 0)
          break;
        return std::make_pair(2724, 1);	 // "sub_group_non_uniform_reduce_logical_or"
      case 's':	 // 2 strings to match.
        if (memcmp(Name.data()+23, "can_", 4) != 0)
          break;
        switch (Name[27]) {
        default: break;
        case 'e':	 // 1 string to match.
          if (memcmp(Name.data()+28, "xclusive_or", 11) != 0)
            break;
          return std::make_pair(2723, 1);	 // "sub_group_non_uniform_scan_exclusive_or"
        case 'i':	 // 1 string to match.
          if (memcmp(Name.data()+28, "nclusive_or", 11) != 0)
            break;
          return std::make_pair(2723, 1);	 // "sub_group_non_uniform_scan_inclusive_or"
        }
        break;
      }
      break;
    }
    break;
  case 40:	 // 14 strings to match.
    if (memcmp(Name.data()+0, "sub_group_non_uniform_", 22) != 0)
      break;
    switch (Name[22]) {
    default: break;
    case 'r':	 // 2 strings to match.
      if (memcmp(Name.data()+23, "educe_logical_", 14) != 0)
        break;
      switch (Name[37]) {
      default: break;
      case 'a':	 // 1 string to match.
        if (memcmp(Name.data()+38, "nd", 2) != 0)
          break;
        return std::make_pair(2724, 1);	 // "sub_group_non_uniform_reduce_logical_and"
      case 'x':	 // 1 string to match.
        if (memcmp(Name.data()+38, "or", 2) != 0)
          break;
        return std::make_pair(2724, 1);	 // "sub_group_non_uniform_reduce_logical_xor"
      }
      break;
    case 's':	 // 12 strings to match.
      if (memcmp(Name.data()+23, "can_", 4) != 0)
        break;
      switch (Name[27]) {
      default: break;
      case 'e':	 // 6 strings to match.
        if (memcmp(Name.data()+28, "xclusive_", 9) != 0)
          break;
        switch (Name[37]) {
        default: break;
        case 'a':	 // 2 strings to match.
          switch (Name[38]) {
          default: break;
          case 'd':	 // 1 string to match.
            if (Name[39] != 'd')
              break;
            return std::make_pair(2722, 1);	 // "sub_group_non_uniform_scan_exclusive_add"
          case 'n':	 // 1 string to match.
            if (Name[39] != 'd')
              break;
            return std::make_pair(2723, 1);	 // "sub_group_non_uniform_scan_exclusive_and"
          }
          break;
        case 'm':	 // 3 strings to match.
          switch (Name[38]) {
          default: break;
          case 'a':	 // 1 string to match.
            if (Name[39] != 'x')
              break;
            return std::make_pair(2722, 1);	 // "sub_group_non_uniform_scan_exclusive_max"
          case 'i':	 // 1 string to match.
            if (Name[39] != 'n')
              break;
            return std::make_pair(2722, 1);	 // "sub_group_non_uniform_scan_exclusive_min"
          case 'u':	 // 1 string to match.
            if (Name[39] != 'l')
              break;
            return std::make_pair(2722, 1);	 // "sub_group_non_uniform_scan_exclusive_mul"
          }
          break;
        case 'x':	 // 1 string to match.
          if (memcmp(Name.data()+38, "or", 2) != 0)
            break;
          return std::make_pair(2723, 1);	 // "sub_group_non_uniform_scan_exclusive_xor"
        }
        break;
      case 'i':	 // 6 strings to match.
        if (memcmp(Name.data()+28, "nclusive_", 9) != 0)
          break;
        switch (Name[37]) {
        default: break;
        case 'a':	 // 2 strings to match.
          switch (Name[38]) {
          default: break;
          case 'd':	 // 1 string to match.
            if (Name[39] != 'd')
              break;
            return std::make_pair(2722, 1);	 // "sub_group_non_uniform_scan_inclusive_add"
          case 'n':	 // 1 string to match.
            if (Name[39] != 'd')
              break;
            return std::make_pair(2723, 1);	 // "sub_group_non_uniform_scan_inclusive_and"
          }
          break;
        case 'm':	 // 3 strings to match.
          switch (Name[38]) {
          default: break;
          case 'a':	 // 1 string to match.
            if (Name[39] != 'x')
              break;
            return std::make_pair(2722, 1);	 // "sub_group_non_uniform_scan_inclusive_max"
          case 'i':	 // 1 string to match.
            if (Name[39] != 'n')
              break;
            return std::make_pair(2722, 1);	 // "sub_group_non_uniform_scan_inclusive_min"
          case 'u':	 // 1 string to match.
            if (Name[39] != 'l')
              break;
            return std::make_pair(2722, 1);	 // "sub_group_non_uniform_scan_inclusive_mul"
          }
          break;
        case 'x':	 // 1 string to match.
          if (memcmp(Name.data()+38, "or", 2) != 0)
            break;
          return std::make_pair(2723, 1);	 // "sub_group_non_uniform_scan_inclusive_xor"
        }
        break;
      }
      break;
    }
    break;
  case 47:	 // 2 strings to match.
    if (memcmp(Name.data()+0, "sub_group_non_uniform_scan_", 27) != 0)
      break;
    switch (Name[27]) {
    default: break;
    case 'e':	 // 1 string to match.
      if (memcmp(Name.data()+28, "xclusive_logical_or", 19) != 0)
        break;
      return std::make_pair(2724, 1);	 // "sub_group_non_uniform_scan_exclusive_logical_or"
    case 'i':	 // 1 string to match.
      if (memcmp(Name.data()+28, "nclusive_logical_or", 19) != 0)
        break;
      return std::make_pair(2724, 1);	 // "sub_group_non_uniform_scan_inclusive_logical_or"
    }
    break;
  case 48:	 // 4 strings to match.
    if (memcmp(Name.data()+0, "sub_group_non_uniform_scan_", 27) != 0)
      break;
    switch (Name[27]) {
    default: break;
    case 'e':	 // 2 strings to match.
      if (memcmp(Name.data()+28, "xclusive_logical_", 17) != 0)
        break;
      switch (Name[45]) {
      default: break;
      case 'a':	 // 1 string to match.
        if (memcmp(Name.data()+46, "nd", 2) != 0)
          break;
        return std::make_pair(2724, 1);	 // "sub_group_non_uniform_scan_exclusive_logical_and"
      case 'x':	 // 1 string to match.
        if (memcmp(Name.data()+46, "or", 2) != 0)
          break;
        return std::make_pair(2724, 1);	 // "sub_group_non_uniform_scan_exclusive_logical_xor"
      }
      break;
    case 'i':	 // 2 strings to match.
      if (memcmp(Name.data()+28, "nclusive_logical_", 17) != 0)
        break;
      switch (Name[45]) {
      default: break;
      case 'a':	 // 1 string to match.
        if (memcmp(Name.data()+46, "nd", 2) != 0)
          break;
        return std::make_pair(2724, 1);	 // "sub_group_non_uniform_scan_inclusive_logical_and"
      case 'x':	 // 1 string to match.
        if (memcmp(Name.data()+46, "or", 2) != 0)
          break;
        return std::make_pair(2724, 1);	 // "sub_group_non_uniform_scan_inclusive_logical_xor"
      }
      break;
    }
    break;
  }
  return std::make_pair(0, 0);
} // isOpenCLBuiltin


static QualType getOpenCLEnumType(Sema &S, llvm::StringRef Name);
static QualType getOpenCLTypedefType(Sema &S, llvm::StringRef Name);

// Convert an OpenCLTypeStruct type to a list of QualTypes.
// Generic types represent multiple types and vector sizes, thus a vector
// is returned. The conversion is done in two steps:
// Step 1: A switch statement fills a vector with scalar base types for the
//         Cartesian product of (vector sizes) x (types) for generic types,
//         or a single scalar type for non generic types.
// Step 2: Qualifiers and other type properties such as vector size are
//         applied.
static void OCL2Qual(Sema &S, const OpenCLTypeStruct &Ty,
                     llvm::SmallVectorImpl<QualType> &QT) {
  ASTContext &Context = S.Context;
  // Number of scalar types in the GenType.
  unsigned GenTypeNumTypes;
  // Pointer to the list of vector sizes for the GenType.
  llvm::ArrayRef<unsigned> GenVectorSizes;
  constexpr unsigned ListVec1[] = {1, };
  constexpr unsigned ListVec1234[] = {1, 2, 3, 4, };
  constexpr unsigned ListVecAndScalar[] = {1, 2, 3, 4, 8, 16, };
  constexpr unsigned ListVecNoScalar[] = {2, 3, 4, 8, 16, };

  switch (Ty.ID) {
    case OCLT_image2d_array_msaa_depth_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          QT.push_back(Context.OCLImage2dArrayMSAADepthROTy);
          break;
        case OCLAQ_WriteOnly:
          QT.push_back(Context.OCLImage2dArrayMSAADepthWOTy);
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("__opencl_c_read_write_images")) {
            QT.push_back(Context.OCLImage2dArrayMSAADepthRWTy);
          }
          break;
      }
      break;
    case OCLT_image1d_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          QT.push_back(Context.OCLImage1dROTy);
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("__opencl_c_read_write_images")) {
            QT.push_back(Context.OCLImage1dRWTy);
          }
          break;
        case OCLAQ_WriteOnly:
          QT.push_back(Context.OCLImage1dWOTy);
          break;
      }
      break;
    case OCLT_image2d_msaa_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          QT.push_back(Context.OCLImage2dMSAAROTy);
          break;
        case OCLAQ_WriteOnly:
          QT.push_back(Context.OCLImage2dMSAAWOTy);
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("__opencl_c_read_write_images")) {
            QT.push_back(Context.OCLImage2dMSAARWTy);
          }
          break;
      }
      break;
    case OCLT_image2d_array_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          QT.push_back(Context.OCLImage2dArrayROTy);
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("__opencl_c_read_write_images")) {
            QT.push_back(Context.OCLImage2dArrayRWTy);
          }
          break;
        case OCLAQ_WriteOnly:
          QT.push_back(Context.OCLImage2dArrayWOTy);
          break;
      }
      break;
    case OCLT_image2d_array_depth_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          if (S.getPreprocessor().isMacroDefined("cl_khr_depth_images")) {
            QT.push_back(Context.OCLImage2dArrayDepthROTy);
          }
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("cl_khr_depth_images")) {
            QT.push_back(Context.OCLImage2dArrayDepthRWTy);
          }
          break;
        case OCLAQ_WriteOnly:
          if (S.getPreprocessor().isMacroDefined("cl_khr_depth_images")) {
            QT.push_back(Context.OCLImage2dArrayDepthWOTy);
          }
          break;
      }
      break;
    case OCLT_image2d_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          QT.push_back(Context.OCLImage2dROTy);
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("__opencl_c_read_write_images")) {
            QT.push_back(Context.OCLImage2dRWTy);
          }
          break;
        case OCLAQ_WriteOnly:
          QT.push_back(Context.OCLImage2dWOTy);
          break;
      }
      break;
    case OCLT_image3d_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          QT.push_back(Context.OCLImage3dROTy);
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("cl_khr_3d_image_writes") && S.getPreprocessor().isMacroDefined("__opencl_c_read_write_images")) {
            QT.push_back(Context.OCLImage3dRWTy);
          }
          break;
        case OCLAQ_WriteOnly:
          if (S.getPreprocessor().isMacroDefined("cl_khr_3d_image_writes")) {
            QT.push_back(Context.OCLImage3dWOTy);
          }
          break;
      }
      break;
    case OCLT_image1d_array_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          QT.push_back(Context.OCLImage1dArrayROTy);
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("__opencl_c_read_write_images")) {
            QT.push_back(Context.OCLImage1dArrayRWTy);
          }
          break;
        case OCLAQ_WriteOnly:
          QT.push_back(Context.OCLImage1dArrayWOTy);
          break;
      }
      break;
    case OCLT_image1d_buffer_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          QT.push_back(Context.OCLImage1dBufferROTy);
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("__opencl_c_read_write_images")) {
            QT.push_back(Context.OCLImage1dBufferRWTy);
          }
          break;
        case OCLAQ_WriteOnly:
          QT.push_back(Context.OCLImage1dBufferWOTy);
          break;
      }
      break;
    case OCLT_image2d_depth_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          if (S.getPreprocessor().isMacroDefined("cl_khr_depth_images")) {
            QT.push_back(Context.OCLImage2dDepthROTy);
          }
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("cl_khr_depth_images")) {
            QT.push_back(Context.OCLImage2dDepthRWTy);
          }
          break;
        case OCLAQ_WriteOnly:
          if (S.getPreprocessor().isMacroDefined("cl_khr_depth_images")) {
            QT.push_back(Context.OCLImage2dDepthWOTy);
          }
          break;
      }
      break;
    case OCLT_image2d_msaa_depth_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          QT.push_back(Context.OCLImage2dMSAADepthROTy);
          break;
        case OCLAQ_WriteOnly:
          QT.push_back(Context.OCLImage2dMSAADepthWOTy);
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("__opencl_c_read_write_images")) {
            QT.push_back(Context.OCLImage2dMSAADepthRWTy);
          }
          break;
      }
      break;
    case OCLT_image2d_array_msaa_t:
      switch (Ty.AccessQualifier) {
        case OCLAQ_None:
          llvm_unreachable("Image without access qualifier");
        case OCLAQ_ReadOnly:
          QT.push_back(Context.OCLImage2dArrayMSAAROTy);
          break;
        case OCLAQ_WriteOnly:
          QT.push_back(Context.OCLImage2dArrayMSAAWOTy);
          break;
        case OCLAQ_ReadWrite:
          if (S.getPreprocessor().isMacroDefined("__opencl_c_read_write_images")) {
            QT.push_back(Context.OCLImage2dArrayMSAARWTy);
          }
          break;
      }
      break;
    case OCLT_AGenType1: {
      SmallVector<QualType, 11> TypeList;
      TypeList.push_back(Context.CharTy);
      TypeList.push_back(Context.UnsignedCharTy);
      TypeList.push_back(Context.ShortTy);
      TypeList.push_back(Context.UnsignedShortTy);
      TypeList.push_back(Context.IntTy);
      TypeList.push_back(Context.UnsignedIntTy);
      TypeList.push_back(Context.LongTy);
      TypeList.push_back(Context.UnsignedLongTy);
      TypeList.push_back(Context.FloatTy);
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp64")) {
        TypeList.push_back(Context.DoubleTy);
      }
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp16")) {
        TypeList.push_back(Context.HalfTy);
      }
      GenTypeNumTypes = TypeList.size();
      QT.reserve(11);
      for (unsigned I = 0; I < 1; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVec1;
      break;
    }
    case OCLT_AGenTypeN: {
      SmallVector<QualType, 11> TypeList;
      TypeList.push_back(Context.CharTy);
      TypeList.push_back(Context.UnsignedCharTy);
      TypeList.push_back(Context.ShortTy);
      TypeList.push_back(Context.UnsignedShortTy);
      TypeList.push_back(Context.IntTy);
      TypeList.push_back(Context.UnsignedIntTy);
      TypeList.push_back(Context.LongTy);
      TypeList.push_back(Context.UnsignedLongTy);
      TypeList.push_back(Context.FloatTy);
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp64")) {
        TypeList.push_back(Context.DoubleTy);
      }
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp16")) {
        TypeList.push_back(Context.HalfTy);
      }
      GenTypeNumTypes = TypeList.size();
      QT.reserve(66);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_AGenTypeNNoScalar: {
      SmallVector<QualType, 11> TypeList;
      TypeList.push_back(Context.CharTy);
      TypeList.push_back(Context.UnsignedCharTy);
      TypeList.push_back(Context.ShortTy);
      TypeList.push_back(Context.UnsignedShortTy);
      TypeList.push_back(Context.IntTy);
      TypeList.push_back(Context.UnsignedIntTy);
      TypeList.push_back(Context.LongTy);
      TypeList.push_back(Context.UnsignedLongTy);
      TypeList.push_back(Context.FloatTy);
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp64")) {
        TypeList.push_back(Context.DoubleTy);
      }
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp16")) {
        TypeList.push_back(Context.HalfTy);
      }
      GenTypeNumTypes = TypeList.size();
      QT.reserve(55);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_AI2UGenTypeN: {
      SmallVector<QualType, 8> TypeList;
      TypeList.push_back(Context.UnsignedCharTy);
      TypeList.push_back(Context.UnsignedCharTy);
      TypeList.push_back(Context.UnsignedShortTy);
      TypeList.push_back(Context.UnsignedShortTy);
      TypeList.push_back(Context.UnsignedIntTy);
      TypeList.push_back(Context.UnsignedIntTy);
      TypeList.push_back(Context.UnsignedLongTy);
      TypeList.push_back(Context.UnsignedLongTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(48);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_AIGenType1: {
      SmallVector<QualType, 8> TypeList;
      TypeList.push_back(Context.CharTy);
      TypeList.push_back(Context.UnsignedCharTy);
      TypeList.push_back(Context.ShortTy);
      TypeList.push_back(Context.UnsignedShortTy);
      TypeList.push_back(Context.IntTy);
      TypeList.push_back(Context.UnsignedIntTy);
      TypeList.push_back(Context.LongTy);
      TypeList.push_back(Context.UnsignedLongTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(8);
      for (unsigned I = 0; I < 1; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVec1;
      break;
    }
    case OCLT_AIGenTypeN: {
      SmallVector<QualType, 8> TypeList;
      TypeList.push_back(Context.CharTy);
      TypeList.push_back(Context.UnsignedCharTy);
      TypeList.push_back(Context.ShortTy);
      TypeList.push_back(Context.UnsignedShortTy);
      TypeList.push_back(Context.IntTy);
      TypeList.push_back(Context.UnsignedIntTy);
      TypeList.push_back(Context.LongTy);
      TypeList.push_back(Context.UnsignedLongTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(48);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_AIGenTypeNNoScalar: {
      SmallVector<QualType, 8> TypeList;
      TypeList.push_back(Context.CharTy);
      TypeList.push_back(Context.UnsignedCharTy);
      TypeList.push_back(Context.ShortTy);
      TypeList.push_back(Context.UnsignedShortTy);
      TypeList.push_back(Context.IntTy);
      TypeList.push_back(Context.UnsignedIntTy);
      TypeList.push_back(Context.LongTy);
      TypeList.push_back(Context.UnsignedLongTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(40);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_CharShortGenType1: {
      SmallVector<QualType, 4> TypeList;
      TypeList.push_back(Context.CharTy);
      TypeList.push_back(Context.UnsignedCharTy);
      TypeList.push_back(Context.ShortTy);
      TypeList.push_back(Context.UnsignedShortTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(4);
      for (unsigned I = 0; I < 1; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVec1;
      break;
    }
    case OCLT_FGenTypeN: {
      SmallVector<QualType, 3> TypeList;
      TypeList.push_back(Context.FloatTy);
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp64")) {
        TypeList.push_back(Context.DoubleTy);
      }
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp16")) {
        TypeList.push_back(Context.HalfTy);
      }
      GenTypeNumTypes = TypeList.size();
      QT.reserve(18);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeCharVecAndScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.CharTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(6);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeCharVecNoScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.CharTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(5);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_GenTypeDoubleVec1234: {
      SmallVector<QualType, 1> TypeList;
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp64")) {
        TypeList.push_back(Context.DoubleTy);
      }
      GenTypeNumTypes = TypeList.size();
      QT.reserve(4);
      for (unsigned I = 0; I < 4; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVec1234;
      break;
    }
    case OCLT_GenTypeDoubleVecAndScalar: {
      SmallVector<QualType, 1> TypeList;
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp64")) {
        TypeList.push_back(Context.DoubleTy);
      }
      GenTypeNumTypes = TypeList.size();
      QT.reserve(6);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeDoubleVecNoScalar: {
      SmallVector<QualType, 1> TypeList;
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp64")) {
        TypeList.push_back(Context.DoubleTy);
      }
      GenTypeNumTypes = TypeList.size();
      QT.reserve(5);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_GenTypeFloatVec1234: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.FloatTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(4);
      for (unsigned I = 0; I < 4; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVec1234;
      break;
    }
    case OCLT_GenTypeFloatVecAndScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.FloatTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(6);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeFloatVecNoScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.FloatTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(5);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_GenTypeHalfVec1234: {
      SmallVector<QualType, 1> TypeList;
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp16")) {
        TypeList.push_back(Context.HalfTy);
      }
      GenTypeNumTypes = TypeList.size();
      QT.reserve(4);
      for (unsigned I = 0; I < 4; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVec1234;
      break;
    }
    case OCLT_GenTypeHalfVecAndScalar: {
      SmallVector<QualType, 1> TypeList;
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp16")) {
        TypeList.push_back(Context.HalfTy);
      }
      GenTypeNumTypes = TypeList.size();
      QT.reserve(6);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeHalfVecNoScalar: {
      SmallVector<QualType, 1> TypeList;
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp16")) {
        TypeList.push_back(Context.HalfTy);
      }
      GenTypeNumTypes = TypeList.size();
      QT.reserve(5);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_GenTypeIntVecAndScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.IntTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(6);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeIntVecNoScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.IntTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(5);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_GenTypeLongVecAndScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.LongTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(6);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeLongVecNoScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.LongTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(5);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_GenTypeShortVecAndScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.ShortTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(6);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeShortVecNoScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.ShortTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(5);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_GenTypeUCharVecAndScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.UnsignedCharTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(6);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeUCharVecNoScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.UnsignedCharTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(5);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_GenTypeUIntVecAndScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.UnsignedIntTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(6);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeUIntVecNoScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.UnsignedIntTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(5);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_GenTypeULongVecAndScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.UnsignedLongTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(6);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeULongVecNoScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.UnsignedLongTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(5);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_GenTypeUShortVecAndScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.UnsignedShortTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(6);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_GenTypeUShortVecNoScalar: {
      SmallVector<QualType, 1> TypeList;
      TypeList.push_back(Context.UnsignedShortTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(5);
      for (unsigned I = 0; I < 5; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecNoScalar;
      break;
    }
    case OCLT_IntLongFloatGenType1: {
      SmallVector<QualType, 7> TypeList;
      TypeList.push_back(Context.IntTy);
      TypeList.push_back(Context.UnsignedIntTy);
      TypeList.push_back(Context.LongTy);
      TypeList.push_back(Context.UnsignedLongTy);
      TypeList.push_back(Context.FloatTy);
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp64")) {
        TypeList.push_back(Context.DoubleTy);
      }
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp16")) {
        TypeList.push_back(Context.HalfTy);
      }
      GenTypeNumTypes = TypeList.size();
      QT.reserve(7);
      for (unsigned I = 0; I < 1; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVec1;
      break;
    }
    case OCLT_SGenTypeN: {
      SmallVector<QualType, 4> TypeList;
      TypeList.push_back(Context.CharTy);
      TypeList.push_back(Context.ShortTy);
      TypeList.push_back(Context.IntTy);
      TypeList.push_back(Context.LongTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(24);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_UGenTypeN: {
      SmallVector<QualType, 4> TypeList;
      TypeList.push_back(Context.UnsignedCharTy);
      TypeList.push_back(Context.UnsignedShortTy);
      TypeList.push_back(Context.UnsignedIntTy);
      TypeList.push_back(Context.UnsignedLongTy);
      GenTypeNumTypes = TypeList.size();
      QT.reserve(24);
      for (unsigned I = 0; I < 6; I++) {
        QT.append(TypeList);
      }
      GenVectorSizes = ListVecAndScalar;
      break;
    }
    case OCLT_atomic_double:
      if (S.getPreprocessor().isMacroDefined("cl_khr_int64_base_atomics") && S.getPreprocessor().isMacroDefined("cl_khr_int64_extended_atomics") && S.getPreprocessor().isMacroDefined("cl_khr_fp64")) {
        QT.push_back(Context.getAtomicType(Context.DoubleTy));
      }
      break;
    case OCLT_atomic_flag:
      QT.push_back(getOpenCLTypedefType(S, "atomic_flag"));
      break;
    case OCLT_atomic_float:
      QT.push_back(Context.getAtomicType(Context.FloatTy));
      break;
    case OCLT_atomic_half:
      QT.push_back(Context.getAtomicType(Context.HalfTy));
      break;
    case OCLT_atomic_int:
      QT.push_back(Context.getAtomicType(Context.IntTy));
      break;
    case OCLT_atomic_intptr_t:
      QT.push_back(Context.getAtomicType(Context.getIntPtrType()));
      break;
    case OCLT_atomic_long:
      if (S.getPreprocessor().isMacroDefined("cl_khr_int64_base_atomics") && S.getPreprocessor().isMacroDefined("cl_khr_int64_extended_atomics")) {
        QT.push_back(Context.getAtomicType(Context.LongTy));
      }
      break;
    case OCLT_atomic_ptrdiff_t:
      QT.push_back(Context.getAtomicType(Context.getPointerDiffType()));
      break;
    case OCLT_atomic_size_t:
      QT.push_back(Context.getAtomicType(Context.getSizeType()));
      break;
    case OCLT_atomic_uint:
      QT.push_back(Context.getAtomicType(Context.UnsignedIntTy));
      break;
    case OCLT_atomic_uintptr_t:
      QT.push_back(Context.getAtomicType(Context.getUIntPtrType()));
      break;
    case OCLT_atomic_ulong:
      if (S.getPreprocessor().isMacroDefined("cl_khr_int64_base_atomics") && S.getPreprocessor().isMacroDefined("cl_khr_int64_extended_atomics")) {
        QT.push_back(Context.getAtomicType(Context.UnsignedLongTy));
      }
      break;
    case OCLT_bool:
      QT.push_back(Context.BoolTy);
      break;
    case OCLT_char:
      QT.push_back(Context.CharTy);
      break;
    case OCLT_clk_event_t:
      QT.push_back(Context.OCLClkEventTy);
      break;
    case OCLT_clk_profiling_info:
      QT.push_back(getOpenCLTypedefType(S, "clk_profiling_info"));
      break;
    case OCLT_double:
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp64")) {
        QT.push_back(Context.DoubleTy);
      }
      break;
    case OCLT_event_t:
      QT.push_back(Context.OCLEventTy);
      break;
    case OCLT_float:
      QT.push_back(Context.FloatTy);
      break;
    case OCLT_half:
      if (S.getPreprocessor().isMacroDefined("cl_khr_fp16")) {
        QT.push_back(Context.HalfTy);
      }
      break;
    case OCLT___half:
      QT.push_back(Context.HalfTy);
      break;
    case OCLT_int:
      QT.push_back(Context.IntTy);
      break;
    case OCLT_intptr_t:
      QT.push_back(Context.getIntPtrType());
      break;
    case OCLT_long:
      QT.push_back(Context.LongTy);
      break;
    case OCLT_cl_mem_fence_flags:
      QT.push_back(getOpenCLTypedefType(S, "cl_mem_fence_flags"));
      break;
    case OCLT_memory_order:
      QT.push_back(getOpenCLEnumType(S, "memory_order"));
      break;
    case OCLT_memory_scope:
      QT.push_back(getOpenCLEnumType(S, "memory_scope"));
      break;
    case OCLT_ndrange_t:
      QT.push_back(getOpenCLTypedefType(S, "ndrange_t"));
      break;
    case OCLT_ptrdiff_t:
      QT.push_back(Context.getPointerDiffType());
      break;
    case OCLT_queue_t:
      QT.push_back(Context.OCLQueueTy);
      break;
    case OCLT_reserve_id_t:
      QT.push_back(Context.OCLReserveIDTy);
      break;
    case OCLT_sampler_t:
      QT.push_back(Context.OCLSamplerTy);
      break;
    case OCLT_short:
      QT.push_back(Context.ShortTy);
      break;
    case OCLT_size_t:
      QT.push_back(Context.getSizeType());
      break;
    case OCLT_uchar:
      QT.push_back(Context.UnsignedCharTy);
      break;
    case OCLT_uint:
      QT.push_back(Context.UnsignedIntTy);
      break;
    case OCLT_uintptr_t:
      QT.push_back(Context.getUIntPtrType());
      break;
    case OCLT_ulong:
      QT.push_back(Context.UnsignedLongTy);
      break;
    case OCLT_ushort:
      QT.push_back(Context.UnsignedShortTy);
      break;
    case OCLT_void:
      QT.push_back(Context.VoidTy);
      break;
  } // end of switch (Ty.ID)

  // Construct the different vector types for each generic type.
  if (Ty.ID >= 52) {
    for (unsigned I = 0; I < QT.size(); I++) {
      // For scalars, size is 1.
      if (GenVectorSizes[I / GenTypeNumTypes] != 1) {
        QT[I] = Context.getExtVectorType(QT[I],
                          GenVectorSizes[I / GenTypeNumTypes]);
      }
    }
  }

  // Set vector size for non-generic vector types.
  if (Ty.VectorWidth > 1) {
    for (unsigned Index = 0; Index < QT.size(); Index++) {
      QT[Index] = Context.getExtVectorType(QT[Index], Ty.VectorWidth);
    }
  }

  if (Ty.IsVolatile != 0) {
    for (unsigned Index = 0; Index < QT.size(); Index++) {
      QT[Index] = Context.getVolatileType(QT[Index]);
    }
  }

  if (Ty.IsConst != 0) {
    for (unsigned Index = 0; Index < QT.size(); Index++) {
      QT[Index] = Context.getConstType(QT[Index]);
    }
  }

  // Transform the type to a pointer as the last step, if necessary.
  // Builtin functions only have pointers on [const|volatile], no
  // [const|volatile] pointers, so this is ok to do it as a last step.
  if (Ty.IsPointer != 0) {
    for (unsigned Index = 0; Index < QT.size(); Index++) {
      QT[Index] = Context.getAddrSpaceQualType(QT[Index], Ty.AS);
      QT[Index] = Context.getPointerType(QT[Index]);
    }
  }

} // OCL2Qual
