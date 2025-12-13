/**
 * stdarg.h - Variable argument list handling
 *
 * Provides macros for accessing variable argument lists.
 * Uses compiler built-ins for portability with clang/gcc.
 */

#ifndef _STDARG_H
#define _STDARG_H

typedef __builtin_va_list va_list;

#define va_start(ap, param) __builtin_va_start(ap, param)
#define va_end(ap)          __builtin_va_end(ap)
#define va_arg(ap, type)    __builtin_va_arg(ap, type)
#define va_copy(dest, src)  __builtin_va_copy(dest, src)

#endif /* _STDARG_H */
