/* CMSIS GCC Compiler Specific */
#ifndef CMSIS_GCC_H
#define CMSIS_GCC_H
#define __INLINE inline
#define __STATIC_INLINE static inline
#define __WEAK __attribute__((weak))
#define __PACKED __attribute__((packed))
#define __ALIGNED(x) __attribute__((aligned(x)))
#endif
