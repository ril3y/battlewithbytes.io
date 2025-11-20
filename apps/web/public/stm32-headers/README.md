# Official STM32F1 CMSIS Headers

## What's Included

### Device-Specific Headers (STMicroelectronics)
```
✅ stm32f103xb.h       (824 KB) - STM32F103C8T6 complete device header
✅ stm32f1xx.h         (10 KB)  - STM32F1 family generic header
✅ system_stm32f1xx.h  (2 KB)   - System clock configuration
```

### ARM Cortex-M3 Core Headers (ARM CMSIS)
```
✅ core_cm3.h          (109 KB) - Cortex-M3 core peripherals
✅ cmsis_gcc.h         (63 KB)  - GCC/Clang compiler intrinsics
✅ cmsis_compiler.h    (11 KB)  - Compiler abstraction layer
✅ cmsis_version.h     (2 KB)   - CMSIS version definitions
```

### Build Files
```
✅ STM32F103C8Tx_FLASH.ld - Official linker script
   - 64KB Flash (0x08000000)
   - 20KB RAM   (0x20000000)
   - 512B Heap
   - 1KB  Stack
```

## Usage in C Code

### Minimal Blink Example
```c
#include "stm32f1xx.h"

int main(void) {
    // Enable GPIOC clock
    RCC->APB2ENR |= RCC_APB2ENR_IOPCEN;

    // Configure PC13 as output (2MHz push-pull)
    GPIOC->CRH &= ~(GPIO_CRH_MODE13 | GPIO_CRH_CNF13);
    GPIOC->CRH |= GPIO_CRH_MODE13_1;

    while(1) {
        GPIOC->ODR ^= GPIO_ODR_ODR13;  // Toggle LED
        for(volatile int i = 0; i < 100000; i++); // Delay
    }
}
```

### Full System Clock Configuration
```c
#include "stm32f1xx.h"

void SystemClock_Config(void) {
    // Enable HSE (8 MHz external crystal)
    RCC->CR |= RCC_CR_HSEON;
    while(!(RCC->CR & RCC_CR_HSERDY));

    // Configure Flash latency (2 wait states for 72MHz)
    FLASH->ACR |= FLASH_ACR_LATENCY_2;

    // Configure PLL: HSE × 9 = 72 MHz
    RCC->CFGR |= RCC_CFGR_PLLSRC | RCC_CFGR_PLLMULL9;

    // Enable PLL
    RCC->CR |= RCC_CR_PLLON;
    while(!(RCC->CR & RCC_CR_PLLRDY));

    // Select PLL as system clock
    RCC->CFGR |= RCC_CFGR_SW_PLL;
    while((RCC->CFGR & RCC_CFGR_SWS) != RCC_CFGR_SWS_PLL);

    // Update SystemCoreClock variable
    SystemCoreClock = 72000000;
}

int main(void) {
    SystemClock_Config();
    // Your code here @ 72 MHz
}
```

### UART Example
```c
#include "stm32f1xx.h"

void UART1_Init(void) {
    // Enable clocks
    RCC->APB2ENR |= RCC_APB2ENR_USART1EN | RCC_APB2ENR_IOPAEN;

    // Configure PA9 (TX) as AF push-pull
    GPIOA->CRH &= ~(GPIO_CRH_MODE9 | GPIO_CRH_CNF9);
    GPIOA->CRH |= GPIO_CRH_MODE9_1 | GPIO_CRH_CNF9_1;

    // Configure UART: 115200 baud @ 72 MHz
    USART1->BRR = 0x271;  // 72000000 / 115200
    USART1->CR1 = USART_CR1_TE | USART_CR1_UE;
}

void UART_SendChar(char c) {
    while(!(USART1->SR & USART_SR_TXE));
    USART1->DR = c;
}

void UART_SendString(const char *str) {
    while(*str) {
        UART_SendChar(*str++);
    }
}

int main(void) {
    SystemClock_Config();
    UART1_Init();

    UART_SendString("Hello from STM32!\r\n");

    while(1);
}
```

## Compilation

### With Clang (ARM Target)
```bash
clang \
  -target thumbv7m-none-eabi \
  -mcpu=cortex-m3 \
  -mthumb \
  -O2 \
  -nostdlib \
  -I/stm32-headers \
  -DSTM32F103xB \
  -T/stm32-headers/STM32F103C8Tx_FLASH.ld \
  main.c \
  -o firmware.elf
```

### With GCC ARM
```bash
arm-none-eabi-gcc \
  -mcpu=cortex-m3 \
  -mthumb \
  -O2 \
  -I./stm32-headers \
  -DSTM32F103xB \
  -T./stm32-headers/STM32F103C8Tx_FLASH.ld \
  main.c \
  -o firmware.elf
```

## Available Peripheral Definitions

All STM32F103C8T6 peripherals are defined:

- **GPIO**: GPIOA, GPIOB, GPIOC, GPIOD
- **RCC**: Clock control
- **USART**: USART1, USART2, USART3
- **SPI**: SPI1, SPI2
- **I2C**: I2C1, I2C2
- **Timers**: TIM1, TIM2, TIM3, TIM4
- **ADC**: ADC1, ADC2
- **DMA**: DMA1 (7 channels)
- **USB**: USB Device
- **CAN**: CAN1
- **Flash**: Flash memory interface
- **NVIC**: Nested Vectored Interrupt Controller
- **SysTick**: System tick timer

## Memory Map

| Region | Start      | Size   | Usage |
|--------|------------|--------|-------|
| Flash  | 0x08000000 | 64 KB  | Program code & constants |
| RAM    | 0x20000000 | 20 KB  | Variables & stack |
| Peripherals | 0x40000000 | - | Memory-mapped I/O |

## Register Access Examples

```c
// Direct register access
RCC->APB2ENR |= (1 << 4);  // Enable GPIOC clock

// Using CMSIS macros (preferred)
RCC->APB2ENR |= RCC_APB2ENR_IOPCEN;

// Using bit-band (if needed)
*((volatile uint32_t *)(0x42000000 + (0x18 * 32) + (4 * 4))) = 1;
```

## Source

Headers sourced from official STMicroelectronics and ARM repositories:
- https://github.com/STMicroelectronics/cmsis-device-f1
- https://github.com/ARM-software/CMSIS_5

**These are the official, unmodified CMSIS headers - NOT custom implementations!**
