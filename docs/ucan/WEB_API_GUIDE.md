# uCAN Web API Integration Guide

**Version:** 1.0
**Date:** October 2024
**Target Audience:** Web Developers

---

## Table of Contents

1. [Overview](#overview)
2. [Connection Setup](#connection-setup)
3. [Dynamic Capability Discovery](#dynamic-capability-discovery)
4. [Protocol Reference](#protocol-reference)
5. [Action System](#action-system)
6. [Complete Implementation Example](#complete-implementation-example)
7. [UI/UX Recommendations](#uiux-recommendations)
8. [Error Handling](#error-handling)

---

## Overview

uCAN is a hardware-agnostic USB-to-CAN bridge with **dynamic capability discovery**. Different hardware platforms (RP2040, SAMD51, ESP32) support different features. Your web application **must query each device's capabilities** and adapt the UI accordingly.

### Key Features

- **Platform Detection**: Query board capabilities via JSON
- **Dynamic Actions**: Configure GPIO, PWM, NeoPixel actions triggered by CAN messages
- **Real-time Monitoring**: Live CAN bus message display
- **Persistent Rules**: Action rules that survive power cycles (coming soon)

---

## Connection Setup

### 1. Serial Connection

```javascript
// Web Serial API connection
const port = await navigator.serial.requestPort();
await port.open({ baudRate: 115200 });

const reader = port.readable.getReader();
const writer = port.writable.getWriter();
```

### 2. Initial Handshake

Upon connection, the device sends:

```
STATUS;CONNECTED;<board_name>;<firmware_version>
STATUS;INFO;Action manager initialized
```

**Parse these messages** to confirm connection.

---

## Dynamic Capability Discovery

### ⚠️ CRITICAL: Always Query Capabilities First

**Do NOT assume what a device supports!** Different boards have vastly different features.

### 1. Query Board Capabilities

**Command:**

```
get:capabilities
```

**Response Format:**

```
CAPS;{json_object}
```

**Example Response (Feather M4 CAN):**

```json
{
  "board": "Adafruit Feather M4 CAN",
  "chip": "ATSAME51J19A",
  "manufacturer": "Adafruit Industries",
  "gpio": 21,
  "pwm": 16,
  "adc": 6,
  "dac": 2,
  "max_rules": 64,
  "memory": {
    "flash": 507904,
    "ram": 196608,
    "storage": 2097152
  },
  "can": {
    "hardware": true,
    "controller": "SAME51 CAN"
  },
  "neopixel": {
    "pin": 8,
    "power_pin": 17
  },
  "features": [
    "GPIO",
    "PWM",
    "ADC",
    "DAC",
    "NEOPIXEL",
    "CAN_SEND",
    "FLASH",
    "CRYPTO",
    "RTC",
    "I2S"
  ]
}
```

**Example Response (Raspberry Pi Pico):**

```json
{
  "board": "Raspberry Pi Pico",
  "chip": "RP2040",
  "manufacturer": "Raspberry Pi Foundation",
  "gpio": 26,
  "pwm": 16,
  "adc": 3,
  "dac": 0,
  "max_rules": 16,
  "memory": {
    "flash": 2097152,
    "ram": 264192,
    "storage": 0
  },
  "can": {
    "hardware": false,
    "controller": "ACAN2040 (PIO)"
  },
  "features": ["GPIO", "PWM", "ADC", "CAN_SEND"]
}
```

### 2. Query Available Pins

**Command:**

```
get:pins
```

**Response:**

```
PINS;<total>;<pwm_info>;<adc_info>;<dac_info>[;<special>]
```

**Example:**

```
PINS;21;PWM:16;ADC:6;DAC:2;NEO:8
```

### 3. Query Supported Actions

**Command:**

```
get:actions
```

**Response:**

```
ACTIONS;<action1>,<action2>,<action3>,...
```

**Example (Feather M4 CAN):**

```
ACTIONS;GPIO_SET,GPIO_CLEAR,GPIO_TOGGLE,CAN_SEND,PWM_SET,NEOPIXEL_COLOR,NEOPIXEL_OFF,ADC_READ,ADC_READ_SEND
```

**Example (RP2040):**

```
ACTIONS;GPIO_SET,GPIO_CLEAR,GPIO_TOGGLE,CAN_SEND,PWM_SET,ADC_READ
```

---

## Protocol Reference

### Message Types (Device → Web)

#### CAN_RX - Received CAN Message

```
CAN_RX;<CAN_ID>;<DATA>[;<TIMESTAMP>]
```

**Example:**

```
CAN_RX;0x123;01,02,03,04,05,06,07,08;1635360000100
```

#### CAN_TX - Transmitted CAN Message

```
CAN_TX;<CAN_ID>;<DATA>[;<TIMESTAMP>]
```

#### CAN_ERR - CAN Error

```
CAN_ERR;<ERROR_CODE>;<ERROR_DESCRIPTION>
```

**Error Codes:**

- `0x01`: Bus off
- `0x02`: Error passive
- `0x09`: Other error (most common - no ACK)
- `0x10`: Buffer overflow

#### STATUS - Device Status

```
STATUS;<STATUS_TYPE>;<MESSAGE>[;<DETAILS>]
```

**Types:** `CONNECTED`, `INFO`, `WARNING`, `ERROR`, `CONFIG`

#### STATS - Statistics

```
STATS;<RX_COUNT>;<TX_COUNT>;<ERROR_COUNT>;<BUS_LOAD>[;<TIMESTAMP>]
```

**Example:**

```
STATS;1523;847;12;45;1635360000000
```

---

## Action System

### Action Rules Overview

Action rules trigger hardware actions when specific CAN messages are received. Each rule consists of:

- **CAN ID Pattern**: Which CAN messages to match
- **CAN ID Mask**: For broadcast/targeted matching
- **Data Pattern**: Optional data byte matching
- **Data Mask**: Which data bytes must match
- **Action Type**: What to do (GPIO, PWM, NeoPixel, etc.)
- **Action Parameters**: Pin numbers, colors, etc.

### Action Commands (Web → Device)

#### 1. Add Action Rule

**Simple Format (GPIO):**

```
action:add:<RULE_ID>:<CAN_ID>:<RESERVED>:<RESERVED>:<ACTION_TYPE>:<PARAMS>
```

**Example - Toggle GPIO 13 on CAN ID 0x100:**

```
action:add:1:0x100:::GPIO_TOGGLE:13
```

**Example - Set GPIO 2 HIGH on CAN ID 0x200:**

```
action:add:2:0x200:::GPIO_SET:2
```

**Example - Clear GPIO 5 on CAN ID 0x300:**

```
action:add:3:0x300:::GPIO_CLEAR:5
```

**Platform-Specific Actions (check capabilities first!):**

**PWM - Set PWM duty cycle (0-255):**

```
action:add:10:0x160:::PWM_SET:9,128
# Format: PWM_SET:<pin>,<duty_0-255>
```

**NeoPixel - Set color (R,G,B):**

```
action:add:11:0x150:::NEOPIXEL_COLOR:255,0,0
# Format: NEOPIXEL_COLOR:<r>,<g>,<b>
# Red = 255,0,0  Green = 0,255,0  Blue = 0,0,255
```

**NeoPixel - Turn off:**

```
action:add:12:0x151:::NEOPIXEL_OFF:0
```

**Response:**

```
STATUS;INFO;Action added;Rule <ID> added
```

or

```
STATUS;ERROR;Failed to add action
STATUS;ERROR;Unsupported action type
```

#### 2. Remove Action Rule

**Command:**

```
action:remove:<RULE_ID>
```

**Example:**

```
action:remove:1
```

**Response:**

```
STATUS;INFO;Action removed
```

#### 3. List Action Rules

**Command:**

```
action:list
```

**Response:**

```
STATUS;INFO;Actions;<count> rules active
ACTION;<rule_id>;<can_id>;<action_type>;<enabled_status>
ACTION;<rule_id>;<can_id>;<action_type>;<enabled_status>
...
```

**Example:**

```
STATUS;INFO;Actions;3 rules active
ACTION;1;0x100;GPIO_TOGGLE;EN
ACTION;2;0x200;GPIO_SET;EN
ACTION;3;0x300;NEOPIXEL_COLOR;DIS
```

#### 4. Enable/Disable Rules

**Commands:**

```
action:enable:<RULE_ID>
action:disable:<RULE_ID>
```

**Example:**

```
action:disable:3
```

#### 5. Clear All Rules

**Command:**

```
action:clear
```

**Response:**

```
STATUS;INFO;All actions cleared
```

---

## Complete Implementation Example

### JavaScript Implementation

```javascript
class UCANDevice {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.capabilities = null;
    this.supportedActions = [];
    this.messageCallbacks = [];
  }

  // 1. Connect to device
  async connect() {
    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: 115200 });

    this.reader = this.port.readable.getReader();
    this.writer = this.port.writable.getWriter();

    // Start reading messages
    this.startReading();

    // Wait for initial connection messages
    await this.waitForConnection();

    // Query capabilities
    await this.queryCapabilities();
    await this.queryActions();

    return this.capabilities;
  }

  // 2. Start reading serial data
  startReading() {
    const read = async () => {
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.trim()) {
              this.handleMessage(line.trim());
            }
          }
        }
      } catch (error) {
        console.error("Read error:", error);
      }
    };
    read();
  }

  // 3. Handle incoming messages
  handleMessage(line) {
    const parts = line.split(";");
    const messageType = parts[0];

    // Notify callbacks
    this.messageCallbacks.forEach((cb) => cb(messageType, parts));

    // Parse specific messages
    switch (messageType) {
      case "CAPS":
        this.capabilities = JSON.parse(parts[1]);
        break;

      case "ACTIONS":
        this.supportedActions = parts[1].split(",");
        break;

      case "CAN_RX":
        this.handleCANMessage(parts);
        break;

      case "STATUS":
        console.log(`Status: ${parts[1]} - ${parts[2]}`);
        break;

      case "CAN_ERR":
        console.error(`CAN Error: ${parts[1]} - ${parts[2]}`);
        break;
    }
  }

  // 4. Send command
  async sendCommand(command) {
    const encoder = new TextEncoder();
    const data = encoder.encode(command + "\n");
    await this.writer.write(data);
  }

  // 5. Query capabilities
  async queryCapabilities() {
    return new Promise((resolve) => {
      const handler = (type, parts) => {
        if (type === "CAPS") {
          this.removeMessageCallback(handler);
          resolve(this.capabilities);
        }
      };
      this.addMessageCallback(handler);
      this.sendCommand("get:capabilities");
    });
  }

  // 6. Query supported actions
  async queryActions() {
    return new Promise((resolve) => {
      const handler = (type, parts) => {
        if (type === "ACTIONS") {
          this.removeMessageCallback(handler);
          resolve(this.supportedActions);
        }
      };
      this.addMessageCallback(handler);
      this.sendCommand("get:actions");
    });
  }

  // 7. Check if action is supported
  isActionSupported(actionType) {
    return this.supportedActions.includes(actionType);
  }

  // 8. Add action rule (with validation)
  async addAction(ruleId, canId, actionType, params) {
    // Validate action is supported
    if (!this.isActionSupported(actionType)) {
      throw new Error(`Action ${actionType} not supported by this device`);
    }

    // Build command
    const command = `action:add:${ruleId}:${canId}:::${actionType}:${params}`;
    await this.sendCommand(command);
  }

  // 9. Helper: Add GPIO action
  async addGPIOAction(ruleId, canId, pin, mode) {
    // mode: 'TOGGLE', 'SET', 'CLEAR'
    const actionType = `GPIO_${mode}`;
    await this.addAction(ruleId, canId, actionType, pin);
  }

  // 10. Helper: Add PWM action (if supported)
  async addPWMAction(ruleId, canId, pin, duty) {
    if (!this.capabilities.features.includes("PWM")) {
      throw new Error("PWM not supported on this device");
    }
    await this.addAction(ruleId, canId, "PWM_SET", `${pin},${duty}`);
  }

  // 11. Helper: Add NeoPixel action (if supported)
  async addNeoPixelAction(ruleId, canId, r, g, b) {
    if (!this.capabilities.features.includes("NEOPIXEL")) {
      throw new Error("NeoPixel not supported on this device");
    }
    await this.addAction(ruleId, canId, "NEOPIXEL_COLOR", `${r},${g},${b}`);
  }

  // 12. List all action rules
  async listActions() {
    await this.sendCommand("action:list");
  }

  // 13. Remove action rule
  async removeAction(ruleId) {
    await this.sendCommand(`action:remove:${ruleId}`);
  }

  // 14. Clear all actions
  async clearAllActions() {
    await this.sendCommand("action:clear");
  }

  // Message callback management
  addMessageCallback(callback) {
    this.messageCallbacks.push(callback);
  }

  removeMessageCallback(callback) {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageCallbacks.splice(index, 1);
    }
  }

  // Utility
  async waitForConnection() {
    return new Promise((resolve) => {
      const handler = (type, parts) => {
        if (type === "STATUS" && parts[1] === "CONNECTED") {
          this.removeMessageCallback(handler);
          resolve();
        }
      };
      this.addMessageCallback(handler);
    });
  }
}
```

### Usage Example

```javascript
// 1. Connect to device
const ucan = new UCANDevice();
const capabilities = await ucan.connect();

console.log("Connected to:", capabilities.board);
console.log("Features:", capabilities.features);
console.log("Max rules:", capabilities.max_rules);

// 2. Check what's supported
if (ucan.isActionSupported("NEOPIXEL_COLOR")) {
  console.log("NeoPixel is supported!");
  // Show NeoPixel color picker in UI
}

if (capabilities.features.includes("PWM")) {
  console.log("PWM is supported with", capabilities.pwm, "channels");
  // Show PWM sliders in UI
}

// 3. Add action rules
await ucan.addGPIOAction(1, "0x100", 13, "TOGGLE"); // Toggle LED on heartbeat
await ucan.addGPIOAction(2, "0x200", 2, "SET"); // Set pin 2 HIGH on 0x200

// 4. Platform-specific actions (with checks)
if (ucan.isActionSupported("NEOPIXEL_COLOR")) {
  await ucan.addNeoPixelAction(10, "0x150", 255, 0, 0); // Red on 0x150
}

if (ucan.isActionSupported("PWM_SET")) {
  await ucan.addPWMAction(11, "0x160", 9, 128); // 50% duty on pin 9
}

// 5. List configured actions
await ucan.listActions();

// 6. Remove specific action
await ucan.removeAction(2);

// 7. Clear all actions
await ucan.clearAllActions();
```

---

## UI/UX Recommendations

### 1. Board Info Panel

Always display:

- Board name
- Chip type
- Firmware version
- Supported features (badges)
- Max action rules limit

### 2. Dynamic Action UI

**Show/Hide based on capabilities:**

```javascript
// GPIO (always available)
showGPIOControls(capabilities.gpio); // Number of pins

// PWM (conditional)
if (capabilities.features.includes("PWM")) {
  showPWMControls(capabilities.pwm); // Number of channels
}

// NeoPixel (conditional)
if (capabilities.features.includes("NEOPIXEL")) {
  showNeoPixelColorPicker();
}

// ADC (conditional)
if (capabilities.features.includes("ADC")) {
  showADCMonitor(capabilities.adc); // Number of channels
}
```

### 3. Action Rule Builder

**Visual rule builder with validation:**

1. **CAN ID Input** - Hex input (0x000-0x7FF)
2. **Action Type Dropdown** - Only show supported actions
3. **Parameters** - Dynamic based on action type:
   - GPIO: Pin number dropdown
   - PWM: Pin + Duty cycle slider (0-255)
   - NeoPixel: Color picker (RGB)
4. **Add/Remove buttons**
5. **Rule limit indicator** - Show used/max (e.g., "3/64 rules")

### 4. Live Action List

Display active rules in a table:

| Rule ID | CAN ID | Action      | Parameters   | Status    | Actions         |
| ------- | ------ | ----------- | ------------ | --------- | --------------- |
| 1       | 0x100  | GPIO_TOGGLE | Pin 13       | ✓ Enabled | [Edit] [Delete] |
| 2       | 0x150  | NEOPIXEL    | RGB(255,0,0) | ✓ Enabled | [Edit] [Delete] |

### 5. Platform Comparison

Show feature matrix when comparing devices:

| Feature   | RP2040 Pico   | Feather M4 CAN |
| --------- | ------------- | -------------- |
| GPIO      | ✓ 26 pins     | ✓ 21 pins      |
| PWM       | ✓ 16 channels | ✓ 16 channels  |
| ADC       | ✓ 3 channels  | ✓ 6 channels   |
| DAC       | ✗             | ✓ 2 channels   |
| NeoPixel  | ✗             | ✓ Built-in     |
| Max Rules | 16            | 64             |
| CAN       | Software      | Hardware       |

---

## Error Handling

### Common Errors and Solutions

**1. Action Not Supported**

```
STATUS;ERROR;Unsupported action type
```

→ Check `get:actions` before attempting action

**2. Rule Limit Reached**

```
STATUS;ERROR;Failed to add action
```

→ Check `capabilities.max_rules` and current rule count

**3. Invalid Pin Number**

```
STATUS;ERROR;Failed to add action
```

→ Validate pin is < `capabilities.gpio`

**4. CAN Errors**

```
CAN_ERR;0x09;TX failed
```

→ Usually means no other device on bus (no ACK)

### Validation Checklist

Before sending `action:add`:

- ✓ Action type in `supportedActions` array
- ✓ Pin number < `capabilities.gpio` (for GPIO)
- ✓ Pin number < `capabilities.pwm` (for PWM)
- ✓ Current rules < `capabilities.max_rules`
- ✓ CAN ID in valid range (0x000-0x7FF standard, 0x00000000-0x1FFFFFFF extended)

---

## Testing Checklist

### Phase 1: Connection

- [ ] Connect to RP2040 device
- [ ] Connect to SAMD51 device
- [ ] Parse `STATUS;CONNECTED` message
- [ ] Parse `get:capabilities` JSON response

### Phase 2: Capability Discovery

- [ ] Query and display board info
- [ ] Show/hide features based on capabilities
- [ ] Validate feature detection (GPIO, PWM, NeoPixel, etc.)

### Phase 3: Basic Actions

- [ ] Add GPIO_TOGGLE action
- [ ] Add GPIO_SET action
- [ ] Add GPIO_CLEAR action
- [ ] List actions
- [ ] Remove action

### Phase 4: Platform-Specific

- [ ] Add PWM action (SAMD51 only)
- [ ] Add NeoPixel action (SAMD51 only)
- [ ] Verify actions rejected on unsupported platforms

### Phase 5: Error Handling

- [ ] Handle unsupported action errors
- [ ] Handle rule limit exceeded
- [ ] Handle invalid pin numbers
- [ ] Handle connection loss/reconnect

---

## Quick Reference

### Essential Commands

| Command                               | Purpose                | Response                          |
| ------------------------------------- | ---------------------- | --------------------------------- |
| `get:capabilities`                    | Get board info JSON    | `CAPS;{json}`                     |
| `get:actions`                         | List supported actions | `ACTIONS;type1,type2,...`         |
| `get:pins`                            | Get pin info           | `PINS;total;PWM:...`              |
| `action:add:ID:CANID:::ACTION:PARAMS` | Add rule               | `STATUS;INFO;Action added`        |
| `action:list`                         | List all rules         | `ACTION;...` per rule             |
| `action:remove:ID`                    | Remove rule            | `STATUS;INFO;Action removed`      |
| `action:clear`                        | Clear all rules        | `STATUS;INFO;All actions cleared` |

### Action Types Reference

| Action Type      | Parameters     | Example                  | Platform      |
| ---------------- | -------------- | ------------------------ | ------------- |
| `GPIO_SET`       | `<pin>`        | `GPIO_SET:13`            | All           |
| `GPIO_CLEAR`     | `<pin>`        | `GPIO_CLEAR:2`           | All           |
| `GPIO_TOGGLE`    | `<pin>`        | `GPIO_TOGGLE:13`         | All           |
| `PWM_SET`        | `<pin>,<duty>` | `PWM_SET:9,128`          | SAMD51, ESP32 |
| `NEOPIXEL_COLOR` | `<r>,<g>,<b>`  | `NEOPIXEL_COLOR:255,0,0` | SAMD51        |
| `NEOPIXEL_OFF`   | `0`            | `NEOPIXEL_OFF:0`         | SAMD51        |
| `CAN_SEND`       | `<id>,<data>`  | `CAN_SEND:0x300,AA,BB`   | All           |
| `ADC_READ_SEND`  | `<pin>,<id>`   | `ADC_READ_SEND:A0,0x400` | All with ADC  |

---

## Support

**Questions?** Contact the firmware team or refer to:

- `PROTOCOL.md` - Full protocol specification
- `CLAUDE.md` - Project overview and architecture
- GitHub repository - Code examples and issues

**Version History:**

- 1.0 (Oct 2024) - Initial capability discovery and action system
