# Install script for directory: /build/llvm-project/clang/lib/Headers

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "/usr/local")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "Release")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Install shared libraries without execute permission?
if(NOT DEFINED CMAKE_INSTALL_SO_NO_EXE)
  set(CMAKE_INSTALL_SO_NO_EXE "1")
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

# Set default install directory permissions.
if(NOT DEFINED CMAKE_OBJDUMP)
  set(CMAKE_OBJDUMP "/usr/bin/objdump")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xclang-resource-headersx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/builtins.h"
    "/build/llvm-project/clang/lib/Headers/float.h"
    "/build/llvm-project/clang/lib/Headers/inttypes.h"
    "/build/llvm-project/clang/lib/Headers/iso646.h"
    "/build/llvm-project/clang/lib/Headers/limits.h"
    "/build/llvm-project/clang/lib/Headers/module.modulemap"
    "/build/llvm-project/clang/lib/Headers/stdalign.h"
    "/build/llvm-project/clang/lib/Headers/stdarg.h"
    "/build/llvm-project/clang/lib/Headers/__stdarg___gnuc_va_list.h"
    "/build/llvm-project/clang/lib/Headers/__stdarg___va_copy.h"
    "/build/llvm-project/clang/lib/Headers/__stdarg_va_arg.h"
    "/build/llvm-project/clang/lib/Headers/__stdarg_va_copy.h"
    "/build/llvm-project/clang/lib/Headers/__stdarg_va_list.h"
    "/build/llvm-project/clang/lib/Headers/stdatomic.h"
    "/build/llvm-project/clang/lib/Headers/stdbool.h"
    "/build/llvm-project/clang/lib/Headers/stdckdint.h"
    "/build/llvm-project/clang/lib/Headers/stddef.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_max_align_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_null.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_nullptr_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_offsetof.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_ptrdiff_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_rsize_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_size_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_unreachable.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_wchar_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_wint_t.h"
    "/build/llvm-project/clang/lib/Headers/stdint.h"
    "/build/llvm-project/clang/lib/Headers/stdnoreturn.h"
    "/build/llvm-project/clang/lib/Headers/tgmath.h"
    "/build/llvm-project/clang/lib/Headers/unwind.h"
    "/build/llvm-project/clang/lib/Headers/varargs.h"
    "/build/llvm-project/clang/lib/Headers/arm_acle.h"
    "/build/llvm-project/clang/lib/Headers/arm_cmse.h"
    "/build/llvm-project/clang/lib/Headers/armintr.h"
    "/build/llvm-project/clang/lib/Headers/arm64intr.h"
    "/build/llvm-project/clang/lib/Headers/arm_neon_sve_bridge.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_builtin_vars.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_math.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_cmath.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_complex_builtins.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_device_functions.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_intrinsics.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_texture_intrinsics.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_libdevice_declares.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_math_forward_declares.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_runtime_wrapper.h"
    "/build/llvm-project/clang/lib/Headers/hexagon_circ_brev_intrinsics.h"
    "/build/llvm-project/clang/lib/Headers/hexagon_protos.h"
    "/build/llvm-project/clang/lib/Headers/hexagon_types.h"
    "/build/llvm-project/clang/lib/Headers/hvx_hexagon_protos.h"
    "/build/llvm-project/clang/lib/Headers/__clang_hip_libdevice_declares.h"
    "/build/llvm-project/clang/lib/Headers/__clang_hip_cmath.h"
    "/build/llvm-project/clang/lib/Headers/__clang_hip_math.h"
    "/build/llvm-project/clang/lib/Headers/__clang_hip_stdlib.h"
    "/build/llvm-project/clang/lib/Headers/__clang_hip_runtime_wrapper.h"
    "/build/llvm-project/clang/lib/Headers/larchintrin.h"
    "/build/llvm-project/clang/lib/Headers/lasxintrin.h"
    "/build/llvm-project/clang/lib/Headers/lsxintrin.h"
    "/build/llvm-project/clang/lib/Headers/msa.h"
    "/build/llvm-project/clang/lib/Headers/opencl-c.h"
    "/build/llvm-project/clang/lib/Headers/opencl-c-base.h"
    "/build/llvm-project/clang/lib/Headers/altivec.h"
    "/build/llvm-project/clang/lib/Headers/htmintrin.h"
    "/build/llvm-project/clang/lib/Headers/htmxlintrin.h"
    "/build/llvm-project/clang/lib/Headers/riscv_bitmanip.h"
    "/build/llvm-project/clang/lib/Headers/riscv_crypto.h"
    "/build/llvm-project/clang/lib/Headers/riscv_ntlh.h"
    "/build/llvm-project/clang/lib/Headers/sifive_vector.h"
    "/build/llvm-project/clang/lib/Headers/s390intrin.h"
    "/build/llvm-project/clang/lib/Headers/vecintrin.h"
    "/build/llvm-project/clang/lib/Headers/velintrin.h"
    "/build/llvm-project/clang/lib/Headers/velintrin_gen.h"
    "/build/llvm-project/clang/lib/Headers/velintrin_approx.h"
    "/build/llvm-project/clang/lib/Headers/adcintrin.h"
    "/build/llvm-project/clang/lib/Headers/adxintrin.h"
    "/build/llvm-project/clang/lib/Headers/ammintrin.h"
    "/build/llvm-project/clang/lib/Headers/amxcomplexintrin.h"
    "/build/llvm-project/clang/lib/Headers/amxfp16intrin.h"
    "/build/llvm-project/clang/lib/Headers/amxintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx2intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512bf16intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512bitalgintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512bwintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512cdintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512dqintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512erintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512fintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512fp16intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512ifmaintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512ifmavlintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512pfintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vbmi2intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vbmiintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vbmivlintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlbf16intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlbitalgintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlbwintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlcdintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vldqintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlfp16intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlvbmi2intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlvnniintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlvp2intersectintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vnniintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vp2intersectintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vpopcntdqintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vpopcntdqvlintrin.h"
    "/build/llvm-project/clang/lib/Headers/avxifmaintrin.h"
    "/build/llvm-project/clang/lib/Headers/avxintrin.h"
    "/build/llvm-project/clang/lib/Headers/avxneconvertintrin.h"
    "/build/llvm-project/clang/lib/Headers/avxvnniint16intrin.h"
    "/build/llvm-project/clang/lib/Headers/avxvnniint8intrin.h"
    "/build/llvm-project/clang/lib/Headers/avxvnniintrin.h"
    "/build/llvm-project/clang/lib/Headers/bmi2intrin.h"
    "/build/llvm-project/clang/lib/Headers/bmiintrin.h"
    "/build/llvm-project/clang/lib/Headers/cetintrin.h"
    "/build/llvm-project/clang/lib/Headers/cldemoteintrin.h"
    "/build/llvm-project/clang/lib/Headers/clflushoptintrin.h"
    "/build/llvm-project/clang/lib/Headers/clwbintrin.h"
    "/build/llvm-project/clang/lib/Headers/clzerointrin.h"
    "/build/llvm-project/clang/lib/Headers/cmpccxaddintrin.h"
    "/build/llvm-project/clang/lib/Headers/crc32intrin.h"
    "/build/llvm-project/clang/lib/Headers/emmintrin.h"
    "/build/llvm-project/clang/lib/Headers/enqcmdintrin.h"
    "/build/llvm-project/clang/lib/Headers/f16cintrin.h"
    "/build/llvm-project/clang/lib/Headers/fma4intrin.h"
    "/build/llvm-project/clang/lib/Headers/fmaintrin.h"
    "/build/llvm-project/clang/lib/Headers/fxsrintrin.h"
    "/build/llvm-project/clang/lib/Headers/gfniintrin.h"
    "/build/llvm-project/clang/lib/Headers/hresetintrin.h"
    "/build/llvm-project/clang/lib/Headers/ia32intrin.h"
    "/build/llvm-project/clang/lib/Headers/immintrin.h"
    "/build/llvm-project/clang/lib/Headers/invpcidintrin.h"
    "/build/llvm-project/clang/lib/Headers/keylockerintrin.h"
    "/build/llvm-project/clang/lib/Headers/lwpintrin.h"
    "/build/llvm-project/clang/lib/Headers/lzcntintrin.h"
    "/build/llvm-project/clang/lib/Headers/mm3dnow.h"
    "/build/llvm-project/clang/lib/Headers/mmintrin.h"
    "/build/llvm-project/clang/lib/Headers/movdirintrin.h"
    "/build/llvm-project/clang/lib/Headers/mwaitxintrin.h"
    "/build/llvm-project/clang/lib/Headers/nmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/pconfigintrin.h"
    "/build/llvm-project/clang/lib/Headers/pkuintrin.h"
    "/build/llvm-project/clang/lib/Headers/pmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/popcntintrin.h"
    "/build/llvm-project/clang/lib/Headers/prfchiintrin.h"
    "/build/llvm-project/clang/lib/Headers/prfchwintrin.h"
    "/build/llvm-project/clang/lib/Headers/ptwriteintrin.h"
    "/build/llvm-project/clang/lib/Headers/raointintrin.h"
    "/build/llvm-project/clang/lib/Headers/rdpruintrin.h"
    "/build/llvm-project/clang/lib/Headers/rdseedintrin.h"
    "/build/llvm-project/clang/lib/Headers/rtmintrin.h"
    "/build/llvm-project/clang/lib/Headers/serializeintrin.h"
    "/build/llvm-project/clang/lib/Headers/sgxintrin.h"
    "/build/llvm-project/clang/lib/Headers/sha512intrin.h"
    "/build/llvm-project/clang/lib/Headers/shaintrin.h"
    "/build/llvm-project/clang/lib/Headers/sm3intrin.h"
    "/build/llvm-project/clang/lib/Headers/sm4intrin.h"
    "/build/llvm-project/clang/lib/Headers/smmintrin.h"
    "/build/llvm-project/clang/lib/Headers/tbmintrin.h"
    "/build/llvm-project/clang/lib/Headers/tmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/tsxldtrkintrin.h"
    "/build/llvm-project/clang/lib/Headers/uintrintrin.h"
    "/build/llvm-project/clang/lib/Headers/usermsrintrin.h"
    "/build/llvm-project/clang/lib/Headers/vaesintrin.h"
    "/build/llvm-project/clang/lib/Headers/vpclmulqdqintrin.h"
    "/build/llvm-project/clang/lib/Headers/waitpkgintrin.h"
    "/build/llvm-project/clang/lib/Headers/wbnoinvdintrin.h"
    "/build/llvm-project/clang/lib/Headers/__wmmintrin_aes.h"
    "/build/llvm-project/clang/lib/Headers/wmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/__wmmintrin_pclmul.h"
    "/build/llvm-project/clang/lib/Headers/x86gprintrin.h"
    "/build/llvm-project/clang/lib/Headers/x86intrin.h"
    "/build/llvm-project/clang/lib/Headers/xmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/xopintrin.h"
    "/build/llvm-project/clang/lib/Headers/xsavecintrin.h"
    "/build/llvm-project/clang/lib/Headers/xsaveintrin.h"
    "/build/llvm-project/clang/lib/Headers/xsaveoptintrin.h"
    "/build/llvm-project/clang/lib/Headers/xsavesintrin.h"
    "/build/llvm-project/clang/lib/Headers/xtestintrin.h"
    "/build/llvm-project/clang/lib/Headers/cet.h"
    "/build/llvm-project/clang/lib/Headers/cpuid.h"
    "/build/llvm-project/clang/lib/Headers/wasm_simd128.h"
    "/build/llvm-project/clang/lib/Headers/intrin.h"
    "/build/llvm-project/clang/lib/Headers/vadefs.h"
    "/build/llvm-project/clang/lib/Headers/mm_malloc.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_neon.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_fp16.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_sve.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_sme.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_bf16.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_mve.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_cde.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_vector_types.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xclang-resource-headersx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include/cuda_wrappers" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/algorithm"
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/cmath"
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/complex"
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/new"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xclang-resource-headersx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include/cuda_wrappers/bits" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/bits/shared_ptr_base.h"
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/bits/basic_string.h"
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/bits/basic_string.tcc"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xclang-resource-headersx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include/ppc_wrappers" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/mmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/xmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/mm_malloc.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/emmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/pmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/tmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/smmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/nmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/bmiintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/bmi2intrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/immintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/x86intrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/x86gprintrin.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xclang-resource-headersx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include/llvm_libc_wrappers" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/llvm_libc_wrappers/assert.h"
    "/build/llvm-project/clang/lib/Headers/llvm_libc_wrappers/stdio.h"
    "/build/llvm-project/clang/lib/Headers/llvm_libc_wrappers/stdlib.h"
    "/build/llvm-project/clang/lib/Headers/llvm_libc_wrappers/string.h"
    "/build/llvm-project/clang/lib/Headers/llvm_libc_wrappers/ctype.h"
    "/build/llvm-project/clang/lib/Headers/llvm_libc_wrappers/inttypes.h"
    "/build/llvm-project/clang/lib/Headers/llvm_libc_wrappers/time.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xclang-resource-headersx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include/openmp_wrappers" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/math.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/cmath"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/complex.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/complex"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/__clang_openmp_device_functions.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/complex_cmath.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/new"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xcore-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/builtins.h"
    "/build/llvm-project/clang/lib/Headers/float.h"
    "/build/llvm-project/clang/lib/Headers/inttypes.h"
    "/build/llvm-project/clang/lib/Headers/iso646.h"
    "/build/llvm-project/clang/lib/Headers/limits.h"
    "/build/llvm-project/clang/lib/Headers/module.modulemap"
    "/build/llvm-project/clang/lib/Headers/stdalign.h"
    "/build/llvm-project/clang/lib/Headers/stdarg.h"
    "/build/llvm-project/clang/lib/Headers/__stdarg___gnuc_va_list.h"
    "/build/llvm-project/clang/lib/Headers/__stdarg___va_copy.h"
    "/build/llvm-project/clang/lib/Headers/__stdarg_va_arg.h"
    "/build/llvm-project/clang/lib/Headers/__stdarg_va_copy.h"
    "/build/llvm-project/clang/lib/Headers/__stdarg_va_list.h"
    "/build/llvm-project/clang/lib/Headers/stdatomic.h"
    "/build/llvm-project/clang/lib/Headers/stdbool.h"
    "/build/llvm-project/clang/lib/Headers/stdckdint.h"
    "/build/llvm-project/clang/lib/Headers/stddef.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_max_align_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_null.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_nullptr_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_offsetof.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_ptrdiff_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_rsize_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_size_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_unreachable.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_wchar_t.h"
    "/build/llvm-project/clang/lib/Headers/__stddef_wint_t.h"
    "/build/llvm-project/clang/lib/Headers/stdint.h"
    "/build/llvm-project/clang/lib/Headers/stdnoreturn.h"
    "/build/llvm-project/clang/lib/Headers/tgmath.h"
    "/build/llvm-project/clang/lib/Headers/unwind.h"
    "/build/llvm-project/clang/lib/Headers/varargs.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xarm-common-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/arm_acle.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_neon.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_fp16.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xarm-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/arm_cmse.h"
    "/build/llvm-project/clang/lib/Headers/armintr.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_mve.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_cde.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xaarch64-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/arm64intr.h"
    "/build/llvm-project/clang/lib/Headers/arm_neon_sve_bridge.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_sve.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_sme.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_bf16.h"
    "/build/build-wasm/NATIVE/tools/clang/lib/Headers/arm_vector_types.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xcuda-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include/cuda_wrappers" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/algorithm"
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/cmath"
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/complex"
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/new"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xcuda-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include/cuda_wrappers/bits" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/bits/shared_ptr_base.h"
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/bits/basic_string.h"
    "/build/llvm-project/clang/lib/Headers/cuda_wrappers/bits/basic_string.tcc"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xcuda-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_builtin_vars.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_math.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_cmath.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_complex_builtins.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_device_functions.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_intrinsics.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_texture_intrinsics.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_libdevice_declares.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_math_forward_declares.h"
    "/build/llvm-project/clang/lib/Headers/__clang_cuda_runtime_wrapper.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xhexagon-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/hexagon_circ_brev_intrinsics.h"
    "/build/llvm-project/clang/lib/Headers/hexagon_protos.h"
    "/build/llvm-project/clang/lib/Headers/hexagon_types.h"
    "/build/llvm-project/clang/lib/Headers/hvx_hexagon_protos.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xhip-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/__clang_hip_libdevice_declares.h"
    "/build/llvm-project/clang/lib/Headers/__clang_hip_cmath.h"
    "/build/llvm-project/clang/lib/Headers/__clang_hip_math.h"
    "/build/llvm-project/clang/lib/Headers/__clang_hip_stdlib.h"
    "/build/llvm-project/clang/lib/Headers/__clang_hip_runtime_wrapper.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xloongarch-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/larchintrin.h"
    "/build/llvm-project/clang/lib/Headers/lasxintrin.h"
    "/build/llvm-project/clang/lib/Headers/lsxintrin.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xmips-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES "/build/llvm-project/clang/lib/Headers/msa.h")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xppc-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include/ppc_wrappers" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/mmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/xmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/mm_malloc.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/emmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/pmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/tmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/smmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/nmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/bmiintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/bmi2intrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/immintrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/x86intrin.h"
    "/build/llvm-project/clang/lib/Headers/ppc_wrappers/x86gprintrin.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xppc-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES "/build/llvm-project/clang/lib/Headers/altivec.h")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xppc-htm-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/htmintrin.h"
    "/build/llvm-project/clang/lib/Headers/htmxlintrin.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xriscv-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/riscv_bitmanip.h"
    "/build/llvm-project/clang/lib/Headers/riscv_crypto.h"
    "/build/llvm-project/clang/lib/Headers/riscv_ntlh.h"
    "/build/llvm-project/clang/lib/Headers/sifive_vector.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xsystemz-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/s390intrin.h"
    "/build/llvm-project/clang/lib/Headers/vecintrin.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xve-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/velintrin.h"
    "/build/llvm-project/clang/lib/Headers/velintrin_gen.h"
    "/build/llvm-project/clang/lib/Headers/velintrin_approx.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xwebassembly-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES "/build/llvm-project/clang/lib/Headers/wasm_simd128.h")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xx86-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/adcintrin.h"
    "/build/llvm-project/clang/lib/Headers/adxintrin.h"
    "/build/llvm-project/clang/lib/Headers/ammintrin.h"
    "/build/llvm-project/clang/lib/Headers/amxcomplexintrin.h"
    "/build/llvm-project/clang/lib/Headers/amxfp16intrin.h"
    "/build/llvm-project/clang/lib/Headers/amxintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx2intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512bf16intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512bitalgintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512bwintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512cdintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512dqintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512erintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512fintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512fp16intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512ifmaintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512ifmavlintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512pfintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vbmi2intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vbmiintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vbmivlintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlbf16intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlbitalgintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlbwintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlcdintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vldqintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlfp16intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlvbmi2intrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlvnniintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vlvp2intersectintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vnniintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vp2intersectintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vpopcntdqintrin.h"
    "/build/llvm-project/clang/lib/Headers/avx512vpopcntdqvlintrin.h"
    "/build/llvm-project/clang/lib/Headers/avxifmaintrin.h"
    "/build/llvm-project/clang/lib/Headers/avxintrin.h"
    "/build/llvm-project/clang/lib/Headers/avxneconvertintrin.h"
    "/build/llvm-project/clang/lib/Headers/avxvnniint16intrin.h"
    "/build/llvm-project/clang/lib/Headers/avxvnniint8intrin.h"
    "/build/llvm-project/clang/lib/Headers/avxvnniintrin.h"
    "/build/llvm-project/clang/lib/Headers/bmi2intrin.h"
    "/build/llvm-project/clang/lib/Headers/bmiintrin.h"
    "/build/llvm-project/clang/lib/Headers/cetintrin.h"
    "/build/llvm-project/clang/lib/Headers/cldemoteintrin.h"
    "/build/llvm-project/clang/lib/Headers/clflushoptintrin.h"
    "/build/llvm-project/clang/lib/Headers/clwbintrin.h"
    "/build/llvm-project/clang/lib/Headers/clzerointrin.h"
    "/build/llvm-project/clang/lib/Headers/cmpccxaddintrin.h"
    "/build/llvm-project/clang/lib/Headers/crc32intrin.h"
    "/build/llvm-project/clang/lib/Headers/emmintrin.h"
    "/build/llvm-project/clang/lib/Headers/enqcmdintrin.h"
    "/build/llvm-project/clang/lib/Headers/f16cintrin.h"
    "/build/llvm-project/clang/lib/Headers/fma4intrin.h"
    "/build/llvm-project/clang/lib/Headers/fmaintrin.h"
    "/build/llvm-project/clang/lib/Headers/fxsrintrin.h"
    "/build/llvm-project/clang/lib/Headers/gfniintrin.h"
    "/build/llvm-project/clang/lib/Headers/hresetintrin.h"
    "/build/llvm-project/clang/lib/Headers/ia32intrin.h"
    "/build/llvm-project/clang/lib/Headers/immintrin.h"
    "/build/llvm-project/clang/lib/Headers/invpcidintrin.h"
    "/build/llvm-project/clang/lib/Headers/keylockerintrin.h"
    "/build/llvm-project/clang/lib/Headers/lwpintrin.h"
    "/build/llvm-project/clang/lib/Headers/lzcntintrin.h"
    "/build/llvm-project/clang/lib/Headers/mm3dnow.h"
    "/build/llvm-project/clang/lib/Headers/mmintrin.h"
    "/build/llvm-project/clang/lib/Headers/movdirintrin.h"
    "/build/llvm-project/clang/lib/Headers/mwaitxintrin.h"
    "/build/llvm-project/clang/lib/Headers/nmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/pconfigintrin.h"
    "/build/llvm-project/clang/lib/Headers/pkuintrin.h"
    "/build/llvm-project/clang/lib/Headers/pmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/popcntintrin.h"
    "/build/llvm-project/clang/lib/Headers/prfchiintrin.h"
    "/build/llvm-project/clang/lib/Headers/prfchwintrin.h"
    "/build/llvm-project/clang/lib/Headers/ptwriteintrin.h"
    "/build/llvm-project/clang/lib/Headers/raointintrin.h"
    "/build/llvm-project/clang/lib/Headers/rdpruintrin.h"
    "/build/llvm-project/clang/lib/Headers/rdseedintrin.h"
    "/build/llvm-project/clang/lib/Headers/rtmintrin.h"
    "/build/llvm-project/clang/lib/Headers/serializeintrin.h"
    "/build/llvm-project/clang/lib/Headers/sgxintrin.h"
    "/build/llvm-project/clang/lib/Headers/sha512intrin.h"
    "/build/llvm-project/clang/lib/Headers/shaintrin.h"
    "/build/llvm-project/clang/lib/Headers/sm3intrin.h"
    "/build/llvm-project/clang/lib/Headers/sm4intrin.h"
    "/build/llvm-project/clang/lib/Headers/smmintrin.h"
    "/build/llvm-project/clang/lib/Headers/tbmintrin.h"
    "/build/llvm-project/clang/lib/Headers/tmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/tsxldtrkintrin.h"
    "/build/llvm-project/clang/lib/Headers/uintrintrin.h"
    "/build/llvm-project/clang/lib/Headers/usermsrintrin.h"
    "/build/llvm-project/clang/lib/Headers/vaesintrin.h"
    "/build/llvm-project/clang/lib/Headers/vpclmulqdqintrin.h"
    "/build/llvm-project/clang/lib/Headers/waitpkgintrin.h"
    "/build/llvm-project/clang/lib/Headers/wbnoinvdintrin.h"
    "/build/llvm-project/clang/lib/Headers/__wmmintrin_aes.h"
    "/build/llvm-project/clang/lib/Headers/wmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/__wmmintrin_pclmul.h"
    "/build/llvm-project/clang/lib/Headers/x86gprintrin.h"
    "/build/llvm-project/clang/lib/Headers/x86intrin.h"
    "/build/llvm-project/clang/lib/Headers/xmmintrin.h"
    "/build/llvm-project/clang/lib/Headers/xopintrin.h"
    "/build/llvm-project/clang/lib/Headers/xsavecintrin.h"
    "/build/llvm-project/clang/lib/Headers/xsaveintrin.h"
    "/build/llvm-project/clang/lib/Headers/xsaveoptintrin.h"
    "/build/llvm-project/clang/lib/Headers/xsavesintrin.h"
    "/build/llvm-project/clang/lib/Headers/xtestintrin.h"
    "/build/llvm-project/clang/lib/Headers/cet.h"
    "/build/llvm-project/clang/lib/Headers/cpuid.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xhlsl-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES "/build/llvm-project/clang/lib/Headers/hlsl.h")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xhlsl-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include/hlsl" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/hlsl/hlsl_basic_types.h"
    "/build/llvm-project/clang/lib/Headers/hlsl/hlsl_intrinsics.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xopencl-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/opencl-c.h"
    "/build/llvm-project/clang/lib/Headers/opencl-c-base.h"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xopenmp-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include/openmp_wrappers" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/math.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/cmath"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/complex.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/complex"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/__clang_openmp_device_functions.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/complex_cmath.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/new"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xopenmp-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include/openmp_wrappers" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/math.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/cmath"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/complex.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/complex"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/__clang_openmp_device_functions.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/complex_cmath.h"
    "/build/llvm-project/clang/lib/Headers/openmp_wrappers/new"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xutility-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES "/build/llvm-project/clang/lib/Headers/mm_malloc.h")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xwindows-resource-headersx")
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/clang/18/include" TYPE FILE FILES
    "/build/llvm-project/clang/lib/Headers/intrin.h"
    "/build/llvm-project/clang/lib/Headers/vadefs.h"
    )
endif()

