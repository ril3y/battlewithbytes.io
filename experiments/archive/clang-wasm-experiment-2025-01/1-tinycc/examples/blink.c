// STM32F103C8T6 Blink Example
// Toggles PC13 (onboard LED on Blue Pill)

// Memory-mapped register addresses
#define RCC_APB2ENR  (*(volatile unsigned int*)0x40021018)
#define GPIOC_CRH    (*(volatile unsigned int*)0x40011004)
#define GPIOC_ODR    (*(volatile unsigned int*)0x4001100C)

// Simple delay function
void delay(int count) {
    for(int i = 0; i < count; i++) {
        __asm__("nop");
    }
}

void main(void) {
    // Enable GPIOC clock
    RCC_APB2ENR |= (1 << 4);

    // Configure PC13 as output (50MHz, push-pull)
    GPIOC_CRH &= ~(0xF << 20);
    GPIOC_CRH |= (0x3 << 20);

    // Blink loop
    while(1) {
        GPIOC_ODR ^= (1 << 13);  // Toggle PC13
        delay(100000);
    }
}
