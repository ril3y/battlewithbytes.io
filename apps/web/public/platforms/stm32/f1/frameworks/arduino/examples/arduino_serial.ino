/*
 * Arduino Serial Hello World for STM32F103 Blue Pill
 *
 * Prints "Hello from STM32!" to the serial monitor repeatedly.
 *
 * Hardware:
 * - Blue Pill STM32F103C8T6
 * - USB-to-Serial adapter connected to PA9 (TX) and PA10 (RX)
 *   or USB CDC serial (if USB support is enabled)
 *
 * Serial Monitor Settings:
 * - Baud rate: 115200
 * - Line ending: Newline
 */

unsigned long counter = 0;

void setup() {
  // Initialize serial communication at 115200 baud
  Serial.begin(115200);

  // Wait for serial port to connect (useful for USB CDC)
  while (!Serial) {
    ; // Wait for serial port connection
  }

  // Print startup message
  Serial.println("===================================");
  Serial.println("STM32F103 Arduino Serial Test");
  Serial.println("===================================");
  Serial.println();
}

void loop() {
  // Print counter value
  Serial.print("Message #");
  Serial.print(counter);
  Serial.print(": Hello from STM32! Uptime: ");
  Serial.print(millis() / 1000);
  Serial.println(" seconds");

  // Increment counter
  counter++;

  // Wait 1 second
  delay(1000);
}
