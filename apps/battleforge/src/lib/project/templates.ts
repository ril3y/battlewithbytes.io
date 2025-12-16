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
 * Platform provides: startup.s, system.c (SystemInit)
 */

#include "stm32f1xx.h"
#include <stdint.h>
#include "utils.h"  /* Include user library header */

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
 *
 * Platform provides: startup.s, system.c (SystemInit)
 */

#include "stm32f1xx.h"
#include <stdint.h>

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
 * STM32 Serial Hello World Template
 * Simple "Hello World" on USART1 for STM32F103C8T6
 */
const stm32SerialHelloTemplate: ProjectTemplate = {
  id: "stm32-serial-hello",
  name: "STM32 Serial Hello World",
  description: "Print 'Hello World' on USART1 (PA9/PA10) at 115200 baud",
  icon: "👋",
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
 * STM32F103C8T6 Serial Hello World
 * Prints "Hello World" on USART1 (PA9=TX, PA10=RX)
 * Baud rate: 115200, 8N1
 * System clock: 8MHz (HSI)
 *
 * Connect a USB-Serial adapter:
 *   PA9 (TX) -> RX on adapter
 *   PA10 (RX) -> TX on adapter
 *   GND -> GND
 *
 * Platform provides: startup.s, system.c (SystemInit)
 */

#include "stm32f1xx.h"
#include <stdint.h>

/*===========================================================================
 * UART Functions
 *===========================================================================*/
static void uart_init(void) {
    /* Enable GPIOA and USART1 clocks */
    RCC->APB2ENR |= RCC_APB2ENR_IOPAEN | RCC_APB2ENR_USART1EN;

    /* Configure PA9 (TX) as alternate function push-pull, 50MHz */
    GPIOA->CRH &= ~(0xF << 4);
    GPIOA->CRH |= (0xB << 4);

    /* Configure PA10 (RX) as input floating */
    GPIOA->CRH &= ~(0xF << 8);
    GPIOA->CRH |= (0x4 << 8);

    /* 115200 baud @ 8MHz: BRR = 8000000 / 115200 = 69 */
    USART1->BRR = 69;
    USART1->CR1 = USART_CR1_TE | USART_CR1_RE | USART_CR1_UE;
}

static void uart_putc(char c) {
    while (!(USART1->SR & USART_SR_TXE));
    USART1->DR = c;
}

static void uart_puts(const char *str) {
    while (*str) {
        if (*str == '\\n') uart_putc('\\r');
        uart_putc(*str++);
    }
}

static void delay(volatile uint32_t count) {
    while (count--) __asm__("nop");
}

/*===========================================================================
 * Main Application
 *===========================================================================*/
int main(void) {
    uint32_t counter = 0;

    uart_init();

    uart_puts("\\n==============================\\n");
    uart_puts("  STM32F103 Serial Hello World\\n");
    uart_puts("==============================\\n\\n");

    while (1) {
        uart_puts("Hello World! Count: ");

        /* Print counter (simple decimal conversion) */
        char buf[12];
        int i = 10;
        buf[11] = '\\0';
        uint32_t n = counter++;
        do {
            buf[i--] = '0' + (n % 10);
            n /= 10;
        } while (n > 0 && i >= 0);
        uart_puts(&buf[i + 1]);

        uart_puts("\\n");

        delay(500000);  /* ~1 second delay at 8MHz */
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
 * Platform provides: startup.s, system.c (SystemInit)
 */

#include "stm32f1xx.h"
#include <stdint.h>
#include "FreeRTOS.h"
#include "task.h"

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
  stm32SerialHelloTemplate,
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
