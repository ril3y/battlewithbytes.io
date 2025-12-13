/*
 * Arduino Analog Input Example for STM32F103 Blue Pill
 *
 * Reads analog voltage from PA0 and displays the value via serial.
 * The STM32F103 has a 12-bit ADC (0-4095) vs Arduino Uno's 10-bit (0-1023).
 *
 * Hardware:
 * - Blue Pill STM32F103C8T6
 * - Potentiometer or sensor connected to PA0
 *   - One end to GND
 *   - Other end to 3.3V (NOT 5V!)
 *   - Wiper to PA0
 * - Serial connection for monitoring
 *
 * IMPORTANT: STM32 pins are 3.3V tolerant only. Do NOT exceed 3.3V!
 */

const int analogPin = PA0;  // Analog input pin
const int ledPin = LED_BUILTIN;

void setup() {
  // Initialize serial communication
  Serial.begin(115200);

  // Configure LED pin
  pinMode(ledPin, OUTPUT);

  // Analog pins don't need pinMode() on STM32
  // They're automatically configured as analog inputs

  Serial.println("STM32 Analog Read Test");
  Serial.println("Reading from pin PA0 (12-bit ADC)");
  Serial.println();
}

void loop() {
  // Read the analog value (0-4095 for 12-bit ADC)
  int sensorValue = analogRead(analogPin);

  // Convert to voltage (0-3.3V)
  float voltage = sensorValue * (3.3 / 4095.0);

  // Convert to percentage
  float percentage = (sensorValue / 4095.0) * 100.0;

  // Print the values
  Serial.print("ADC Value: ");
  Serial.print(sensorValue);
  Serial.print("\tVoltage: ");
  Serial.print(voltage, 2);
  Serial.print("V\tPercentage: ");
  Serial.print(percentage, 1);
  Serial.println("%");

  // Blink LED based on reading
  // Higher values = faster blinking
  int delayTime = map(sensorValue, 0, 4095, 1000, 100);

  digitalWrite(ledPin, LOW);   // LED on
  delay(delayTime / 2);
  digitalWrite(ledPin, HIGH);  // LED off
  delay(delayTime / 2);
}
