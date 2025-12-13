/*
 * Arduino PWM LED Fade Example for STM32F103 Blue Pill
 *
 * Fades an LED using PWM (Pulse Width Modulation).
 * Demonstrates analogWrite() function for PWM output.
 *
 * Hardware:
 * - Blue Pill STM32F103C8T6
 * - LED with current limiting resistor (220-330 ohms) on PA0
 *   - Anode (long leg) to PA0
 *   - Cathode (short leg) to resistor to GND
 *
 * PWM Notes for STM32:
 * - analogWrite() uses timer peripherals
 * - PWM frequency is configurable (default ~1kHz)
 * - Hardware PWM provides smooth, flicker-free control
 */

const int pwmPin = PA0;  // PWM output pin (must be PWM-capable)

void setup() {
  // PWM pins are automatically configured by analogWrite()
  // No pinMode() needed

  // Optional: Initialize serial for debugging
  Serial.begin(115200);
  Serial.println("STM32 PWM Fade Example");
  Serial.println("Fading LED on pin PA0");
}

void loop() {
  // Fade in from 0 to 255
  for (int brightness = 0; brightness <= 255; brightness++) {
    analogWrite(pwmPin, brightness);
    delay(5);  // Wait 5ms for smooth fade
  }

  // Pause at full brightness
  delay(500);

  // Fade out from 255 to 0
  for (int brightness = 255; brightness >= 0; brightness--) {
    analogWrite(pwmPin, brightness);
    delay(5);  // Wait 5ms for smooth fade
  }

  // Pause at minimum brightness
  delay(500);
}
