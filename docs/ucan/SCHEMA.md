# CAN Definition File Schema

This document describes the JSON schema for creating custom CAN message definitions, widgets, and dashboard layouts.

## Overview

A CAN definition file contains three main sections:

1. **Messages** - Define CAN message structures and field extraction
2. **Widgets** - Define visual components bound to decoded fields
3. **Layouts** - Define spatial arrangements of widgets

## File Structure

```json
{
  "version": "1.0",
  "name": "My Vehicle CAN",
  "description": "Custom definitions for my vehicle",
  "author": "Your Name",
  "created": "2025-01-15",

  "messages": [
    /* ... */
  ],
  "widgets": [
    /* ... */
  ],
  "layouts": [
    /* ... */
  ]
}
```

## Message Definitions

Messages define the structure of CAN data and how to extract fields.

### Example

```json
{
  "id": "0x100",
  "name": "Body Control Module",
  "description": "Brake, blinkers, and lights",
  "dlc": 1,
  "cycleTime": 100,
  "fields": [
    {
      "name": "brake_pressed",
      "description": "Brake pedal state",
      "byteOffset": 0,
      "bitOffset": 0,
      "bitLength": 1,
      "type": "boolean"
    },
    {
      "name": "left_blinker",
      "byteOffset": 0,
      "bitOffset": 1,
      "bitLength": 1,
      "type": "boolean"
    },
    {
      "name": "right_blinker",
      "byteOffset": 0,
      "bitOffset": 2,
      "bitLength": 1,
      "type": "boolean"
    }
  ]
}
```

### Field Types

| Type      | Description             | Example Use                   |
| --------- | ----------------------- | ----------------------------- |
| `boolean` | Single bit flag         | Brake pressed, door open      |
| `uint`    | Unsigned integer        | Speed, temperature sensor ADC |
| `int`     | Signed integer          | Delta values, offset readings |
| `float`   | IEEE 754 float (32-bit) | Precise sensor data           |
| `enum`    | Enumerated values       | Gear position, state machine  |
| `raw`     | Raw bytes               | Binary data, checksums        |

### Field Properties

- **byteOffset** (0-7): Starting byte position
- **bitOffset** (0-7): Starting bit within the byte
- **bitLength** (1-64): Number of bits to extract
- **type**: Data interpretation type
- **byteOrder** (`little` | `big`): Default is `little` (matches uCAN protocol)
- **scale**: Multiply raw value (e.g., `0.1` for 0.1V resolution)
- **offset**: Add to scaled value (e.g., `-40` for temperature offset)
- **unit**: Display unit string (e.g., `"V"`, `"°C"`, `"RPM"`)
- **min/max**: Validation range

### Example: Multi-byte Field

```json
{
  "name": "vehicle_speed",
  "byteOffset": 2,
  "bitOffset": 0,
  "bitLength": 16,
  "type": "uint",
  "byteOrder": "little",
  "scale": 0.01,
  "unit": "km/h",
  "min": 0,
  "max": 250
}
```

This extracts bytes 2-3 as a 16-bit little-endian unsigned integer, multiplies by 0.01, and displays in km/h.

### Example: Enum Field

```json
{
  "name": "gear_position",
  "byteOffset": 1,
  "bitOffset": 0,
  "bitLength": 3,
  "type": "enum",
  "enumValues": [
    { "value": 0, "label": "P", "description": "Park" },
    { "value": 1, "label": "R", "description": "Reverse" },
    { "value": 2, "label": "N", "description": "Neutral" },
    { "value": 3, "label": "D", "description": "Drive" },
    { "value": 4, "label": "L", "description": "Low" }
  ]
}
```

## Widget Definitions

Widgets are visual components bound to decoded CAN fields.

### Widget Types

#### LED

Boolean indicator with colored circle.

```json
{
  "id": "brake_led",
  "config": {
    "type": "led",
    "label": "Brake",
    "colorOn": "#ff0000",
    "colorOff": "#333333",
    "size": "medium"
  },
  "messageId": "0x100",
  "fieldName": "brake_pressed"
}
```

#### Switch

Boolean toggle display.

```json
{
  "id": "headlight_switch",
  "config": {
    "type": "switch",
    "label": "Headlights",
    "labelOn": "ON",
    "labelOff": "OFF"
  },
  "messageId": "0x101",
  "fieldName": "headlights"
}
```

#### Gauge

Circular gauge (speedometer style).

```json
{
  "id": "speed_gauge",
  "config": {
    "type": "gauge",
    "label": "Speed",
    "min": 0,
    "max": 120,
    "unit": "km/h",
    "warningZone": [80, 100],
    "dangerZone": [100, 120],
    "segments": 12
  },
  "messageId": "0x200",
  "fieldName": "vehicle_speed"
}
```

#### Bar

Linear bar graph.

```json
{
  "id": "battery_bar",
  "config": {
    "type": "bar",
    "label": "Battery",
    "min": 0,
    "max": 100,
    "unit": "%",
    "orientation": "horizontal",
    "colorScale": "gradient"
  },
  "messageId": "0x300",
  "fieldName": "battery_soc"
}
```

#### Number

Numeric display with unit.

```json
{
  "id": "rpm_display",
  "config": {
    "type": "number",
    "label": "RPM",
    "precision": 0,
    "unit": "RPM",
    "fontSize": 24
  },
  "messageId": "0x201",
  "fieldName": "engine_rpm"
}
```

#### Graph

Time-series line graph.

```json
{
  "id": "voltage_graph",
  "config": {
    "type": "graph",
    "label": "Battery Voltage",
    "historyLength": 100,
    "min": 10,
    "max": 15,
    "lineColor": "#00ff00"
  },
  "messageId": "0x300",
  "fieldName": "battery_voltage"
}
```

#### Analog

Analog position display (wheel, pedal, etc.).

```json
{
  "id": "throttle_position",
  "config": {
    "type": "analog",
    "label": "Throttle",
    "min": 0,
    "max": 100,
    "icon": "pedal",
    "unit": "%"
  },
  "messageId": "0x202",
  "fieldName": "throttle_percent"
}
```

#### Voltage

Specialized voltage display with thresholds.

```json
{
  "id": "battery_voltage",
  "config": {
    "type": "voltage",
    "label": "Battery",
    "precision": 2,
    "lowThreshold": 11.5,
    "highThreshold": 14.8
  },
  "messageId": "0x300",
  "fieldName": "battery_voltage"
}
```

#### Temperature

Temperature display with color coding.

```json
{
  "id": "coolant_temp",
  "config": {
    "type": "temperature",
    "label": "Coolant",
    "precision": 1,
    "unit": "°C",
    "coldThreshold": 60,
    "normalRange": [80, 95],
    "hotThreshold": 105
  },
  "messageId": "0x400",
  "fieldName": "coolant_temperature"
}
```

#### Bitfield

Visual representation of individual bits.

```json
{
  "id": "fault_flags",
  "config": {
    "type": "bitfield",
    "label": "Faults",
    "bitLabels": ["OVT", "UVT", "OVC", "UVC", "Short", "Open", "Comm", "Sys"],
    "orientation": "horizontal"
  },
  "messageId": "0x500",
  "fieldName": "fault_register"
}
```

## Layout Definitions

Layouts define how widgets are arranged in dashboard views.

```json
{
  "id": "main_dashboard",
  "name": "Main Dashboard",
  "description": "Primary driving display",
  "gridColumns": 12,
  "gridRows": 8,
  "backgroundColor": "#1a1a1a",
  "widgets": [
    {
      "widgetId": "speed_gauge",
      "position": { "x": 0, "y": 0, "width": 4, "height": 4 }
    },
    {
      "widgetId": "rpm_display",
      "position": { "x": 4, "y": 0, "width": 2, "height": 2 }
    },
    {
      "widgetId": "brake_led",
      "position": { "x": 0, "y": 4, "width": 1, "height": 1 }
    }
  ]
}
```

### Position Properties

- **x**: Grid column start position (0-based)
- **y**: Grid row start position (0-based)
- **width**: Widget width in grid units (optional, uses widget default)
- **height**: Widget height in grid units (optional, uses widget default)

## Complete Example: Golf Cart

See `definitions/golf-cart.json` for a complete working example.

## Bit Extraction Examples

### Example 1: Single Bit (Boolean)

```
Byte 0: 0b10101010
Extract bit 1: bitOffset=1, bitLength=1
Result: 1 (true)
```

### Example 2: Multi-bit Field

```
Byte 0: 0b10101010
Extract bits 2-4: bitOffset=2, bitLength=3
Result: 0b010 = 2
```

### Example 3: Cross-byte Field

```
Byte 0: 0b11110000
Byte 1: 0b00001111
Extract 12 bits starting at byte 0, bit 4: byteOffset=0, bitOffset=4, bitLength=12
Result: 0b111100001111 = 3855
```

### Example 4: Little-Endian 16-bit

```
Byte 0: 0x34 (LSB)
Byte 1: 0x12 (MSB)
Extract 16-bit little-endian: byteOffset=0, bitLength=16, byteOrder="little"
Result: 0x1234 = 4660
```

## Validation

The system validates:

- CAN IDs are valid (0x000-0x7FF or 0x00000000-0x1FFFFFFF for extended)
- Byte offsets are within CAN data length (0-7)
- Bit offsets are valid (0-7)
- Field extraction doesn't exceed 8 bytes
- Widget references exist in message definitions
- Layout widget IDs reference defined widgets

## Tips

1. **Start Simple**: Begin with boolean fields and LED widgets before complex gauges
2. **Test Incrementally**: Add one message at a time and verify decoding
3. **Use Inline View**: Check decoded hex view to verify field extraction
4. **Document Well**: Add descriptions to messages and fields for maintainability
5. **Group Related Data**: Put related fields in the same message when possible
6. **Watch Byte Order**: Most automotive CAN uses big-endian, but verify your protocol
