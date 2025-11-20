/* Linker script for STM32F103C8Tx (64KB Flash, 20KB RAM) */
MEMORY
{
  FLASH (rx) : ORIGIN = 0x08000000, LENGTH = 64K
  RAM (rwx)  : ORIGIN = 0x20000000, LENGTH = 20K
}

ENTRY(Reset_Handler)

SECTIONS
{
  .text : {
    *(.vectors)
    *(.text*)
    *(.rodata*)
  } > FLASH

  .data : {
    *(.data*)
  } > RAM AT> FLASH

  .bss : {
    *(.bss*)
    *(COMMON)
  } > RAM
}
