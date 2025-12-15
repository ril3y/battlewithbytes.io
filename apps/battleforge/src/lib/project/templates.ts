import type { ProjectTemplate } from "./types";

/**
 * STM32 Blink Template
 * LED blink example for STM32F103C8T6 (Blue Pill)
 */
const stm32BlinkTemplate: ProjectTemplate = {
  id: "stm32-blink",
  name: "STM32 LED Blink",
  description: "Blink the onboard LED on STM32F103C8T6 (Blue Pill)",
  icon: "💡",
  framework: "native",
  platformPreset: {
    platformId: "stm32",
    familyId: "f1",
    deviceId: "stm32f103c8",
    frameworkId: "native",
  },
  files: [
    {
      path: "/src/main.c",
      editable: true,
      content: `/**
 * STM32F103C8T6 (Blue Pill) LED Blink Example
 * Uses CMSIS headers for proper register definitions.
 * The onboard LED is connected to PC13 (active low).
 *
 * Select STM32 > F1 > STM32F103C8T6 from the platform selector.
 */

#include "stm32f1xx.h"
#include <stdint.h>
#include "utils.h"  /* Include user library header */

/*===========================================================================
 * Linker symbols (defined in linker script)
 *===========================================================================*/
extern uint32_t _sidata;    /* Start of .data in FLASH */
extern uint32_t _sdata;     /* Start of .data in RAM */
extern uint32_t _edata;     /* End of .data in RAM */
extern uint32_t _sbss;      /* Start of .bss */
extern uint32_t _ebss;      /* End of .bss */
extern uint32_t _estack;    /* Top of stack */

/*===========================================================================
 * Function prototypes
 *===========================================================================*/
void Reset_Handler(void);
void Default_Handler(void);
void NMI_Handler(void) __attribute__((weak, alias("Default_Handler")));
void HardFault_Handler(void) __attribute__((weak, alias("Default_Handler")));
void MemManage_Handler(void) __attribute__((weak, alias("Default_Handler")));
void BusFault_Handler(void) __attribute__((weak, alias("Default_Handler")));
void UsageFault_Handler(void) __attribute__((weak, alias("Default_Handler")));
void SVC_Handler(void) __attribute__((weak, alias("Default_Handler")));
void DebugMon_Handler(void) __attribute__((weak, alias("Default_Handler")));
void PendSV_Handler(void) __attribute__((weak, alias("Default_Handler")));
void SysTick_Handler(void) __attribute__((weak, alias("Default_Handler")));

extern int main(void);

/*===========================================================================
 * Vector Table - placed at start of FLASH (0x08000000)
 *===========================================================================*/
__attribute__((section(".isr_vector")))
const uint32_t vector_table[] = {
    (uint32_t)&_estack,           /* Initial stack pointer */
    (uint32_t)Reset_Handler,      /* Reset handler */
    (uint32_t)NMI_Handler,        /* NMI handler */
    (uint32_t)HardFault_Handler,  /* Hard fault handler */
    (uint32_t)MemManage_Handler,  /* MPU fault handler */
    (uint32_t)BusFault_Handler,   /* Bus fault handler */
    (uint32_t)UsageFault_Handler, /* Usage fault handler */
    0, 0, 0, 0,                   /* Reserved */
    (uint32_t)SVC_Handler,        /* SVCall handler */
    (uint32_t)DebugMon_Handler,   /* Debug monitor handler */
    0,                            /* Reserved */
    (uint32_t)PendSV_Handler,     /* PendSV handler */
    (uint32_t)SysTick_Handler,    /* SysTick handler */
    /* External interrupts would follow here... */
};

/*===========================================================================
 * Reset Handler - Entry point after reset
 *===========================================================================*/
void Reset_Handler(void) {
    uint32_t *src, *dst;

    /* Copy .data section from FLASH to RAM */
    src = &_sidata;
    dst = &_sdata;
    while (dst < &_edata) {
        *dst++ = *src++;
    }

    /* Zero-fill .bss section */
    dst = &_sbss;
    while (dst < &_ebss) {
        *dst++ = 0;
    }

    /* Call main() */
    main();

    /* Hang if main returns */
    while (1) {}
}

/*===========================================================================
 * Default Handler - Catches unhandled interrupts
 *===========================================================================*/
void Default_Handler(void) {
    while (1) {}
}

/*===========================================================================
 * Main Application
 *===========================================================================*/
int main(void) {
    /* Enable GPIOC clock (bit 4 of RCC_APB2ENR) */
    RCC->APB2ENR |= RCC_APB2ENR_IOPCEN;

    /* Configure PC13 as output push-pull, max speed 2MHz
     * PC13 is configured in CRH (high register, pins 8-15)
     * Each pin uses 4 bits: CNF[1:0] MODE[1:0]
     * MODE = 0b10 (2MHz output)
     * CNF  = 0b00 (push-pull)
     * PC13 is at bits 20-23 of CRH
     */
    GPIOC->CRH &= ~(0xF << 20);  /* Clear PC13 config bits */
    GPIOC->CRH |= (0x2 << 20);   /* Set MODE=0b10, CNF=0b00 */

    /* Main loop - blink LED */
    while (1) {
        /* Toggle PC13 using ODR (Output Data Register) */
        GPIOC->ODR ^= GPIO_ODR_ODR13;

        /* Delay using library function - adjust count for different blink rates */
        utils_delay(100000);
    }

    return 0;
}
`,
    },
    {
      path: "/libs/utils.h",
      editable: true,
      content: `/**
 * Utility Library Header
 *
 * Common utility functions for STM32 projects.
 * This demonstrates user header inclusion from a libs folder.
 */

#ifndef UTILS_H
#define UTILS_H

#include <stdint.h>

/**
 * Simple busy-wait delay
 * @param count Number of loop iterations (approximate delay)
 */
void utils_delay(volatile unsigned int count);

/**
 * Square a number
 * @param x Input value
 * @return x squared
 */
uint32_t utils_square(uint32_t x);

/**
 * Clamp a value between min and max
 * @param value Input value
 * @param min Minimum bound
 * @param max Maximum bound
 * @return Clamped value
 */
uint32_t utils_clamp(uint32_t value, uint32_t min, uint32_t max);

#endif /* UTILS_H */
`,
    },
    {
      path: "/libs/utils.c",
      editable: true,
      content: `/**
 * Utility Library Implementation
 *
 * Common utility functions for STM32 projects.
 */

#include "utils.h"

void utils_delay(volatile unsigned int count) {
    while (count--) {
        __asm__("nop");
    }
}

uint32_t utils_square(uint32_t x) {
    return x * x;
}

uint32_t utils_clamp(uint32_t value, uint32_t min, uint32_t max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}
`,
    },
  ],
};

/**
 * STM32 UART Echo Template
 * Simple UART echo example for STM32F103C8T6
 */
const stm32UartEchoTemplate: ProjectTemplate = {
  id: "stm32-uart-echo",
  name: "STM32 UART Echo",
  description: "Echo characters received on USART1 (PA9/PA10)",
  icon: "📡",
  framework: "native",
  platformPreset: {
    platformId: "stm32",
    familyId: "f1",
    deviceId: "stm32f103c8",
    frameworkId: "native",
  },
  files: [
    {
      path: "/src/main.c",
      editable: true,
      content: `/**
 * STM32F103C8T6 UART Echo Example
 * Echoes characters received on USART1 (PA9=TX, PA10=RX)
 * Baud rate: 115200
 * System clock: 8MHz (HSI)
 */

#include "stm32f1xx.h"
#include <stdint.h>

/*===========================================================================
 * Linker symbols
 *===========================================================================*/
extern uint32_t _sidata;
extern uint32_t _sdata;
extern uint32_t _edata;
extern uint32_t _sbss;
extern uint32_t _ebss;
extern uint32_t _estack;

/*===========================================================================
 * Function prototypes
 *===========================================================================*/
void Reset_Handler(void);
void Default_Handler(void);
void NMI_Handler(void) __attribute__((weak, alias("Default_Handler")));
void HardFault_Handler(void) __attribute__((weak, alias("Default_Handler")));
void MemManage_Handler(void) __attribute__((weak, alias("Default_Handler")));
void BusFault_Handler(void) __attribute__((weak, alias("Default_Handler")));
void UsageFault_Handler(void) __attribute__((weak, alias("Default_Handler")));
void SVC_Handler(void) __attribute__((weak, alias("Default_Handler")));
void DebugMon_Handler(void) __attribute__((weak, alias("Default_Handler")));
void PendSV_Handler(void) __attribute__((weak, alias("Default_Handler")));
void SysTick_Handler(void) __attribute__((weak, alias("Default_Handler")));

extern int main(void);

/*===========================================================================
 * Vector Table
 *===========================================================================*/
__attribute__((section(".isr_vector")))
const uint32_t vector_table[] = {
    (uint32_t)&_estack,
    (uint32_t)Reset_Handler,
    (uint32_t)NMI_Handler,
    (uint32_t)HardFault_Handler,
    (uint32_t)MemManage_Handler,
    (uint32_t)BusFault_Handler,
    (uint32_t)UsageFault_Handler,
    0, 0, 0, 0,
    (uint32_t)SVC_Handler,
    (uint32_t)DebugMon_Handler,
    0,
    (uint32_t)PendSV_Handler,
    (uint32_t)SysTick_Handler,
};

/*===========================================================================
 * Reset Handler
 *===========================================================================*/
void Reset_Handler(void) {
    uint32_t *src = &_sidata;
    uint32_t *dst = &_sdata;

    while (dst < &_edata) {
        *dst++ = *src++;
    }

    dst = &_sbss;
    while (dst < &_ebss) {
        *dst++ = 0;
    }

    main();
    while (1) {}
}

/*===========================================================================
 * Default Handler
 *===========================================================================*/
void Default_Handler(void) {
    while (1) {}
}

/*===========================================================================
 * UART Functions
 *===========================================================================*/
void uart_init(void) {
    /* Enable GPIOA and USART1 clocks */
    RCC->APB2ENR |= RCC_APB2ENR_IOPAEN | RCC_APB2ENR_USART1EN;

    /* Configure PA9 (TX) as alternate function push-pull */
    GPIOA->CRH &= ~(0xF << 4);   /* Clear PA9 config */
    GPIOA->CRH |= (0xB << 4);    /* MODE=11 (50MHz), CNF=10 (AF push-pull) */

    /* Configure PA10 (RX) as input floating */
    GPIOA->CRH &= ~(0xF << 8);   /* Clear PA10 config */
    GPIOA->CRH |= (0x4 << 8);    /* MODE=00 (input), CNF=01 (floating) */

    /* Configure USART1: 115200 baud, 8N1 */
    /* Assuming 8MHz clock: BRR = 8000000 / 115200 = 69.44 ≈ 69 (0x45) */
    USART1->BRR = 0x45;
    USART1->CR1 = USART_CR1_TE | USART_CR1_RE | USART_CR1_UE;
}

void uart_send_char(char c) {
    while (!(USART1->SR & USART_SR_TXE));
    USART1->DR = c;
}

char uart_recv_char(void) {
    while (!(USART1->SR & USART_SR_RXNE));
    return USART1->DR;
}

void uart_send_string(const char *str) {
    while (*str) {
        uart_send_char(*str++);
    }
}

/*===========================================================================
 * Main Application
 *===========================================================================*/
int main(void) {
    uart_init();

    uart_send_string("STM32F103C8T6 UART Echo Ready\\r\\n");
    uart_send_string("Type characters to echo them back...\\r\\n\\n");

    while (1) {
        char c = uart_recv_char();
        uart_send_char(c);  /* Echo back */

        /* Send newline on carriage return */
        if (c == '\\r') {
            uart_send_char('\\n');
        }
    }

    return 0;
}
`,
    },
  ],
};

/**
 * STM32 FreeRTOS Template
 * FreeRTOS example with two tasks for STM32F103C8T6
 */
const stm32FreeRtosTemplate: ProjectTemplate = {
  id: "stm32-freertos",
  name: "STM32 FreeRTOS",
  description: "FreeRTOS with two LED blink tasks on STM32F103C8T6",
  icon: "⚡",
  framework: "native",
  platformPreset: {
    platformId: "stm32",
    familyId: "f1",
    deviceId: "stm32f103c8",
    frameworkId: "native",
  },
  files: [
    {
      path: "/src/main.c",
      editable: true,
      content: `/**
 * STM32F103C8T6 FreeRTOS Example
 * Two tasks blinking the LED at different rates
 *
 * Note: Install FreeRTOS library from the Libraries panel first!
 */

#include "stm32f1xx.h"
#include <stdint.h>
#include "FreeRTOS.h"
#include "task.h"

/*===========================================================================
 * Linker symbols (defined in linker script)
 *===========================================================================*/
extern uint32_t _sidata;
extern uint32_t _sdata;
extern uint32_t _edata;
extern uint32_t _sbss;
extern uint32_t _ebss;
extern uint32_t _estack;

/*===========================================================================
 * FreeRTOS exception handlers (provided by FreeRTOS port)
 *===========================================================================*/
extern void xPortPendSVHandler(void);
extern void xPortSysTickHandler(void);
extern void vPortSVCHandler(void);

/*===========================================================================
 * Function prototypes
 *===========================================================================*/
void Reset_Handler(void);
void Default_Handler(void);
void NMI_Handler(void) __attribute__((weak, alias("Default_Handler")));
void HardFault_Handler(void) __attribute__((weak, alias("Default_Handler")));
void MemManage_Handler(void) __attribute__((weak, alias("Default_Handler")));
void BusFault_Handler(void) __attribute__((weak, alias("Default_Handler")));
void UsageFault_Handler(void) __attribute__((weak, alias("Default_Handler")));

extern int main(void);

/*===========================================================================
 * Vector Table - placed at start of FLASH (0x08000000)
 * FreeRTOS handlers for SVC, PendSV, and SysTick
 *===========================================================================*/
__attribute__((section(".isr_vector")))
const uint32_t vector_table[] = {
    (uint32_t)&_estack,              /* Initial stack pointer */
    (uint32_t)Reset_Handler,         /* Reset handler */
    (uint32_t)NMI_Handler,           /* NMI handler */
    (uint32_t)HardFault_Handler,     /* Hard fault handler */
    (uint32_t)MemManage_Handler,     /* MPU fault handler */
    (uint32_t)BusFault_Handler,      /* Bus fault handler */
    (uint32_t)UsageFault_Handler,    /* Usage fault handler */
    0, 0, 0, 0,                      /* Reserved */
    (uint32_t)vPortSVCHandler,       /* FreeRTOS SVCall handler */
    0,                               /* Debug monitor handler */
    0,                               /* Reserved */
    (uint32_t)xPortPendSVHandler,    /* FreeRTOS PendSV handler */
    (uint32_t)xPortSysTickHandler,   /* FreeRTOS SysTick handler */
    /* External interrupts would follow here... */
};

/*===========================================================================
 * Reset Handler - Entry point after reset
 *===========================================================================*/
void Reset_Handler(void) {
    uint32_t *src, *dst;

    /* Copy .data section from FLASH to RAM */
    src = &_sidata;
    dst = &_sdata;
    while (dst < &_edata) {
        *dst++ = *src++;
    }

    /* Zero-fill .bss section */
    dst = &_sbss;
    while (dst < &_ebss) {
        *dst++ = 0;
    }

    /* Call main() */
    main();

    /* Hang if main returns */
    while (1) {}
}

/*===========================================================================
 * Default Handler - Catches unhandled interrupts
 *===========================================================================*/
void Default_Handler(void) {
    while (1) {}
}

/*===========================================================================
 * FreeRTOS Tasks
 *===========================================================================*/
void vTask1(void *pvParameters) {
    (void)pvParameters;

    while (1) {
        GPIOC->ODR ^= GPIO_ODR_ODR13;  /* Toggle LED */
        vTaskDelay(pdMS_TO_TICKS(500)); /* 500ms delay */
    }
}

void vTask2(void *pvParameters) {
    (void)pvParameters;

    while (1) {
        /* This task just delays - demonstrates multiple tasks */
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

/*===========================================================================
 * Main Application
 *===========================================================================*/
int main(void) {
    /* Enable GPIOC clock */
    RCC->APB2ENR |= RCC_APB2ENR_IOPCEN;

    /* Configure PC13 as output push-pull */
    GPIOC->CRH &= ~(0xF << 20);
    GPIOC->CRH |= (0x2 << 20);

    /* Create FreeRTOS tasks */
    xTaskCreate(vTask1, "Task1", 128, NULL, 1, NULL);
    xTaskCreate(vTask2, "Task2", 128, NULL, 1, NULL);

    /* Start the scheduler - this never returns */
    vTaskStartScheduler();

    /* Should never reach here */
    while (1) {}

    return 0;
}
`,
    },
  ],
};

/**
 * Arduino Blink Template
 * Classic Arduino blink example - works with any ARM Cortex-M platform supporting Arduino
 */
const arduinoBlinkTemplate: ProjectTemplate = {
  id: "arduino-blink",
  name: "Arduino Blink",
  description: "Classic Arduino LED blink using digitalWrite()",
  icon: "🔵",
  framework: "arduino",
  architectureRequirements: [
    "cortex-m0",
    "cortex-m0+",
    "cortex-m3",
    "cortex-m4",
    "cortex-m4f",
    "cortex-m7",
    "cortex-m7f",
  ],
  platformPreset: null, // User selects platform in wizard
  files: [
    {
      path: "/src/Blink.ino",
      editable: true,
      content: `/**
 * Arduino Blink Example for STM32F103C8 (Blue Pill)
 *
 * This sketch blinks the onboard LED connected to PC13.
 * Uses the familiar Arduino API with digitalWrite().
 *
 * The Arduino framework for STM32 provides:
 * - pinMode(), digitalWrite(), digitalRead()
 * - analogRead(), analogWrite()
 * - Serial.begin(), Serial.print()
 * - delay(), millis()
 * - And much more!
 */

// Blue Pill LED is on PC13 (active LOW)
#define LED_PIN PC13

void setup() {
  // Initialize the LED pin as output
  pinMode(LED_PIN, OUTPUT);

  // Optional: Initialize Serial for debugging
  // Serial.begin(115200);
  // Serial.println("Arduino Blink Started!");
}

void loop() {
  // Turn LED ON (PC13 is active LOW, so LOW = ON)
  digitalWrite(LED_PIN, LOW);
  delay(500);  // Wait 500ms

  // Turn LED OFF
  digitalWrite(LED_PIN, HIGH);
  delay(500);  // Wait 500ms
}
`,
    },
  ],
};

/**
 * Arduino Serial Template
 * Arduino serial communication example - works with any ARM Cortex-M platform supporting Arduino
 */
const arduinoSerialTemplate: ProjectTemplate = {
  id: "arduino-serial",
  name: "Arduino Serial",
  description: "Serial communication using Arduino Serial API",
  icon: "🔵",
  framework: "arduino",
  architectureRequirements: [
    "cortex-m0",
    "cortex-m0+",
    "cortex-m3",
    "cortex-m4",
    "cortex-m4f",
    "cortex-m7",
    "cortex-m7f",
  ],
  platformPreset: null, // User selects platform in wizard
  files: [
    {
      path: "/src/Serial.ino",
      editable: true,
      content: `/**
 * Arduino Serial Example for STM32F103C8 (Blue Pill)
 *
 * Demonstrates serial communication using the Arduino API.
 * Connect to PA9 (TX) and PA10 (RX) at 115200 baud.
 */

#define LED_PIN PC13

void setup() {
  // Initialize LED
  pinMode(LED_PIN, OUTPUT);

  // Initialize Serial at 115200 baud
  Serial.begin(115200);

  // Wait for serial connection
  while (!Serial) {
    ; // Wait for serial port to connect
  }

  Serial.println("=================================");
  Serial.println("STM32 Arduino Serial Demo");
  Serial.println("=================================");
  Serial.println("Type a message and press Enter...");
  Serial.println();
}

void loop() {
  // Check if data is available
  if (Serial.available() > 0) {
    // Read the incoming string
    String input = Serial.readStringUntil('\\n');
    input.trim();

    if (input.length() > 0) {
      // Echo back with info
      Serial.print("Received (");
      Serial.print(input.length());
      Serial.print(" chars): ");
      Serial.println(input);

      // Toggle LED on each message
      digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    }
  }

  // Optional: periodic status message
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 5000) {
    Serial.print("Uptime: ");
    Serial.print(millis() / 1000);
    Serial.println(" seconds");
    lastPrint = millis();
  }
}
`,
    },
  ],
};

/**
 * Blank Project Template
 * Minimal starting point for any project
 */
const blankProjectTemplate: ProjectTemplate = {
  id: "blank",
  name: "Blank Project",
  description: "Empty project with minimal startup code",
  icon: "📄",
  platformPreset: null,
  files: [
    {
      path: "/src/main.c",
      editable: true,
      content: `/**
 * Blank Project
 *
 * Start building your embedded application here.
 * Select a target platform to enable compilation.
 */

int main(void) {
    // Your code here

    return 0;
}
`,
    },
  ],
};

/**
 * All available project templates
 */
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  stm32BlinkTemplate,
  stm32UartEchoTemplate,
  stm32FreeRtosTemplate,
  arduinoBlinkTemplate,
  arduinoSerialTemplate,
  blankProjectTemplate,
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): ProjectTemplate | null {
  return PROJECT_TEMPLATES.find((t) => t.id === id) || null;
}

/**
 * Get all templates that require a specific framework
 * @param framework - The framework ID to filter by
 * @returns Array of templates requiring the specified framework
 */
export function getTemplatesByFramework(framework: string): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter((t) => t.framework === framework);
}

/**
 * Get all templates compatible with a specific platform
 * Checks architecture requirements against the platform's architecture
 * @param platformId - Platform ID (e.g., 'stm32')
 * @param familyId - Family ID (e.g., 'f1')
 * @param architecture - Platform architecture (e.g., 'cortex-m3')
 * @returns Array of compatible templates
 */
export function getTemplatesForPlatform(
  platformId: string,
  familyId: string,
  architecture: string,
): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter((template) => {
    // Templates without architecture requirements are compatible with all platforms
    if (!template.architectureRequirements) {
      return true;
    }

    // Check if platform's architecture is in the template's requirements
    return template.architectureRequirements.includes(architecture as any);
  });
}

/**
 * Check if a template is compatible with a specific platform
 * @param template - The template to check
 * @param architecture - Platform architecture (e.g., 'cortex-m3')
 * @returns true if compatible, false otherwise
 */
export function isTemplateCompatibleWithPlatform(
  template: ProjectTemplate,
  architecture: string,
): boolean {
  // No architecture requirements means compatible with all
  if (!template.architectureRequirements) {
    return true;
  }

  return template.architectureRequirements.includes(architecture as any);
}
