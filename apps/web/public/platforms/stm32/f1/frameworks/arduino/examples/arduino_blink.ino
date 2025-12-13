/*
 * Arduino Blink Example for STM32F103 Blue Pill
 *
 * This classic Arduino sketch blinks the onboard LED on PC13.
 * On the Blue Pill, the LED is active LOW (on when pin is LOW).
 *
 * Hardware:
 * - Blue Pill STM32F103C8T6
 * - Onboard LED connected to PC13
 *
 * No external components required.
 */

void setup() {
  // Initialize the LED pin as an output
  pinMode(LED_BUILTIN, OUTPUT);  // LED_BUILTIN is defined as PC13
}

void loop() {
  digitalWrite(LED_BUILTIN, LOW);   // Turn LED on (active LOW)
  delay(1000);                      // Wait 1 second

  digitalWrite(LED_BUILTIN, HIGH);  // Turn LED off
  delay(1000);                      // Wait 1 second
}
