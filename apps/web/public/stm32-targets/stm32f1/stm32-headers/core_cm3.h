/* Minimal CMSIS Cortex-M3 Core */
#ifndef CORE_CM3_H
#define CORE_CM3_H
#include "cmsis_version.h"
#include "cmsis_compiler.h"
#define __CM3_REV 0x0201U
#define __MPU_PRESENT 1U
#define __NVIC_PRIO_BITS 4U
#define __Vendor_SysTickConfig 0U
typedef struct { volatile unsigned int ISER[8]; } NVIC_Type;
typedef struct { volatile unsigned int CTRL, LOAD, VAL, CALIB; } SysTick_Type;
#define NVIC ((NVIC_Type*)0xE000E100UL)
#define SysTick ((SysTick_Type*)0xE000E010UL)
#endif
