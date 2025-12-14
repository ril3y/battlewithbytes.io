/**
 * uCAN Action Manager
 *
 * Manages CAN-triggered action rules
 * Actions are hardware operations (GPIO, PWM, NeoPixel) triggered by CAN messages
 */

import { ActionRule, BoardCapabilities } from "../types";

/**
 * Action command builder
 * Formats commands to send to the uCAN device
 */
export class ActionManager {
  private sendCommand: (command: string) => Promise<void>;
  private capabilities: BoardCapabilities | null = null;
  private supportedActions: string[] = [];

  constructor(sendCommand: (command: string) => Promise<void>) {
    this.sendCommand = sendCommand;
  }

  /**
   * Set board capabilities for validation
   */
  setCapabilities(capabilities: BoardCapabilities): void {
    this.capabilities = capabilities;
  }

  /**
   * Set supported actions for validation
   */
  setSupportedActions(actions: string[]): void {
    this.supportedActions = actions;
  }

  /**
   * Add an action rule
   * Format: action:add:ID:CAN_ID:CAN_MASK:DATA:DATA_MASK:DATA_LEN:ACTION_TYPE:PARAMS
   */
  async addAction(rule: ActionRule): Promise<void> {
    // Validate action is supported
    if (!this.supportedActions.includes(rule.actionType)) {
      throw new Error(
        `Action type ${rule.actionType} not supported by this board`,
      );
    }

    // Validate based on action type
    this.validateAction(rule);

    // Format parameters based on action type
    const paramsStr = rule.params?.join(",") || "";
    const formattedParams = this.formatParameters(rule.actionType, paramsStr);

    // Get parameter source (Protocol v2.0 REQUIRED field)
    const paramSource = rule.paramSource || "fixed"; // Default to 'fixed' for safety

    // Build command with correct format (Protocol v2.0)
    // Format: action:add:ID:CAN_ID:CAN_MASK:DATA:DATA_MASK:DATA_LEN:ACTION_TYPE:PARAM_SOURCE:PARAMS
    const canMask = "0xFFFFFFFF"; // Exact CAN ID match
    const dataPattern = ""; // Empty = match any data
    const dataMask = ""; // Empty = match any data
    const dataLen = "0"; // 0 = any data length

    // Build command - insert paramSource between actionType and parameters
    const command =
      paramSource === "candata"
        ? `action:add:${rule.id}:${rule.canId}:${canMask}:${dataPattern}:${dataMask}:${dataLen}:${rule.actionType}:${paramSource}`
        : `action:add:${rule.id}:${rule.canId}:${canMask}:${dataPattern}:${dataMask}:${dataLen}:${rule.actionType}:${paramSource}:${formattedParams}`;

    console.log("🔧 Sending action command (Protocol v2.0):", command);
    console.log("   Rule details:", {
      ruleId: rule.id,
      canId: rule.canId,
      actionType: rule.actionType,
      paramSource,
      parameters: paramsStr,
    });
    await this.sendCommand(command);
  }

  /**
   * Remove an action rule
   */
  async removeAction(ruleId: number): Promise<void> {
    const command = `action:remove:${ruleId}`;
    await this.sendCommand(command);
  }

  /**
   * Enable an action rule
   */
  async enableAction(ruleId: number): Promise<void> {
    const command = `action:enable:${ruleId}`;
    await this.sendCommand(command);
  }

  /**
   * Disable an action rule
   */
  async disableAction(ruleId: number): Promise<void> {
    const command = `action:disable:${ruleId}`;
    await this.sendCommand(command);
  }

  /**
   * List all action rules
   */
  async listActions(): Promise<void> {
    const command = "action:list";
    await this.sendCommand(command);
  }

  /**
   * Clear all action rules
   */
  async clearAllActions(): Promise<void> {
    const command = "action:clear";
    await this.sendCommand(command);
  }

  /**
   * Query board capabilities
   */
  async queryCapabilities(): Promise<void> {
    await this.sendCommand("get:capabilities");
  }

  /**
   * Query supported actions
   */
  async querySupportedActions(): Promise<void> {
    await this.sendCommand("get:actions");
  }

  /**
   * Query pin information
   */
  async queryPins(): Promise<void> {
    await this.sendCommand("get:pins");
  }

  /**
   * Query action definitions (Protocol v2.0)
   */
  async queryActionDefinitions(): Promise<void> {
    console.log("📋 Querying action definitions (Protocol v2.0)...");
    await this.sendCommand("get:actiondefs");
  }

  /**
   * Helper: Add GPIO action
   */
  async addGPIOAction(
    ruleId: number,
    canId: number,
    pin: number,
    mode: "SET" | "CLEAR" | "TOGGLE",
  ): Promise<void> {
    // Validate pin
    const gpioCount = this.capabilities?.gpio?.total ?? 0;
    if (this.capabilities && gpioCount > 0 && pin >= gpioCount) {
      throw new Error(`Invalid GPIO pin ${pin} (max: ${gpioCount - 1})`);
    }

    const actionType = `GPIO_${mode}`;
    await this.addAction({
      id: ruleId,
      name: `GPIO ${mode} Pin ${pin}`,
      canId,
      canMask: 0xffffffff,
      dataLength: 0,
      actionType,
      paramSource: "fixed",
      params: [pin.toString()],
      enabled: true,
    });
  }

  /**
   * Helper: Add PWM action
   */
  async addPWMAction(
    ruleId: number,
    canId: number,
    pin: number,
    dutyCycle: number,
  ): Promise<void> {
    // Validate PWM is supported
    if (!this.capabilities?.features?.includes("PWM")) {
      throw new Error("PWM not supported on this board");
    }

    // Validate pin
    const pwmCount = this.capabilities?.gpio?.pwm ?? 0;
    if (pwmCount > 0 && pin >= pwmCount) {
      throw new Error(`Invalid PWM pin ${pin} (max: ${pwmCount - 1})`);
    }

    // Validate duty cycle (0-255)
    if (dutyCycle < 0 || dutyCycle > 255) {
      throw new Error("PWM duty cycle must be 0-255");
    }

    await this.addAction({
      id: ruleId,
      name: `PWM Pin ${pin} Duty ${dutyCycle}`,
      canId,
      canMask: 0xffffffff,
      dataLength: 0,
      actionType: "PWM_SET",
      paramSource: "fixed",
      params: [pin.toString(), dutyCycle.toString()],
      enabled: true,
    });
  }

  /**
   * Helper: Add NeoPixel color action
   */
  async addNeoPixelAction(
    ruleId: number,
    canId: number,
    r: number,
    g: number,
    b: number,
  ): Promise<void> {
    // Validate NeoPixel is supported
    if (!this.capabilities?.features?.includes("NEOPIXEL")) {
      throw new Error("NeoPixel not supported on this board");
    }

    // Validate RGB values
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new Error("RGB values must be 0-255");
    }

    await this.addAction({
      id: ruleId,
      name: `NeoPixel RGB(${r},${g},${b})`,
      canId,
      canMask: 0xffffffff,
      dataLength: 0,
      actionType: "NEOPIXEL_COLOR",
      paramSource: "fixed",
      params: [r.toString(), g.toString(), b.toString()],
      enabled: true,
    });
  }

  /**
   * Helper: Add NeoPixel off action
   */
  async addNeoPixelOffAction(ruleId: number, canId: number): Promise<void> {
    if (!this.capabilities?.features?.includes("NEOPIXEL")) {
      throw new Error("NeoPixel not supported on this board");
    }

    await this.addAction({
      id: ruleId,
      name: "NeoPixel Off",
      canId,
      canMask: 0xffffffff,
      dataLength: 0,
      actionType: "NEOPIXEL_OFF",
      paramSource: "fixed",
      params: ["0"],
      enabled: true,
    });
  }

  /**
   * Helper: Add CAN send action
   */
  async addCANSendAction(
    ruleId: number,
    triggerCanId: number,
    sendCanId: string,
    data: number[],
  ): Promise<void> {
    // Validate data length (0-8 bytes for standard CAN)
    if (data.length > 8) {
      throw new Error("CAN data length must be 0-8 bytes");
    }

    // Format data as hex string
    const dataStr = data
      .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
      .join(",");

    await this.addAction({
      id: ruleId,
      name: `CAN Send ${sendCanId}`,
      canId: triggerCanId,
      canMask: 0xffffffff,
      dataLength: 0,
      actionType: "CAN_SEND",
      paramSource: "fixed",
      params: [sendCanId, ...dataStr.split(",")],
      enabled: true,
    });
  }

  /**
   * Helper: Add ADC read and send action
   */
  async addADCReadSendAction(
    ruleId: number,
    triggerCanId: number,
    adcPin: number,
    sendCanId: string,
  ): Promise<void> {
    // Validate ADC is supported
    if (!this.capabilities?.features?.includes("ADC")) {
      throw new Error("ADC not supported on this board");
    }

    // Validate pin
    const adcCount = this.capabilities?.gpio?.adc ?? 0;
    if (adcCount > 0 && adcPin >= adcCount) {
      throw new Error(`Invalid ADC pin ${adcPin} (max: ${adcCount - 1})`);
    }

    await this.addAction({
      id: ruleId,
      name: `ADC Read Pin ${adcPin}`,
      canId: triggerCanId,
      canMask: 0xffffffff,
      dataLength: 0,
      actionType: "ADC_READ_SEND",
      paramSource: "fixed",
      params: [adcPin.toString(), sendCanId],
      enabled: true,
    });
  }

  /**
   * Format parameters for the firmware command
   * Converts comma-separated to colon-separated and adds default values
   */
  private formatParameters(actionType: string, parameters: string): string {
    switch (actionType) {
      case "NEOPIXEL_COLOR": {
        // Format: R:G:B:Brightness
        // Input is "R,G,B", need to convert to "R:G:B:128" (default brightness)
        const parts = parameters.split(",");
        if (parts.length === 3) {
          return `${parts[0]}:${parts[1]}:${parts[2]}:128`; // Add default brightness of 128
        }
        return parameters.replace(/,/g, ":"); // Fallback: just replace commas
      }

      case "PWM_SET": {
        // Format: pin:duty
        return parameters.replace(/,/g, ":");
      }

      case "CAN_SEND": {
        // Format: canId:data (data is comma-separated hex bytes)
        // Input is "0x200,AA,BB,CC,DD"
        const parts = parameters.split(",");
        if (parts.length > 1) {
          const canId = parts[0];
          const data = parts.slice(1).join(","); // Keep data bytes comma-separated
          return `${canId}:${data}`;
        }
        return parameters;
      }

      case "ADC_READ_SEND": {
        // Format: adcPin:sendCanId
        return parameters.replace(/,/g, ":");
      }

      default:
        // For other actions, keep as-is (GPIO actions just use pin number)
        return parameters;
    }
  }

  /**
   * Validate action rule parameters
   */
  private validateAction(rule: ActionRule): void {
    switch (rule.actionType) {
      case "GPIO_SET":
      case "GPIO_CLEAR":
      case "GPIO_TOGGLE": {
        const pin = rule.params?.[0] ? parseInt(rule.params[0], 10) : NaN;
        if (
          isNaN(pin) ||
          (this.capabilities?.gpio?.total &&
            pin >= this.capabilities.gpio.total)
        ) {
          throw new Error(`Invalid GPIO pin: ${rule.params?.[0]}`);
        }
        break;
      }

      case "PWM_SET": {
        const pin = rule.params?.[0] ? parseInt(rule.params[0], 10) : NaN;
        const duty = rule.params?.[1] ? parseInt(rule.params[1], 10) : NaN;
        if (isNaN(pin) || isNaN(duty)) {
          throw new Error("PWM_SET requires pin,duty parameters");
        }
        if (this.capabilities?.gpio?.pwm && pin >= this.capabilities.gpio.pwm) {
          throw new Error(`Invalid PWM pin: ${pin}`);
        }
        if (duty < 0 || duty > 255) {
          throw new Error("PWM duty cycle must be 0-255");
        }
        break;
      }

      case "NEOPIXEL_COLOR": {
        const r = rule.params?.[0] ? parseInt(rule.params[0], 10) : NaN;
        const g = rule.params?.[1] ? parseInt(rule.params[1], 10) : NaN;
        const b = rule.params?.[2] ? parseInt(rule.params[2], 10) : NaN;
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
          throw new Error("NEOPIXEL_COLOR requires r,g,b parameters");
        }
        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
          throw new Error("RGB values must be 0-255");
        }
        break;
      }

      // Additional validations can be added here
    }
  }

  /**
   * Format CAN ID for command (ensure 0x prefix and proper padding)
   */
  static formatCANId(canId: number, isExtended: boolean = false): string {
    const hex = canId.toString(16).toUpperCase();
    if (isExtended) {
      return `0x${hex.padStart(8, "0")}`; // 29-bit extended ID (8 hex digits)
    }
    return `0x${hex.padStart(3, "0")}`; // 11-bit standard ID (3 hex digits)
  }

  /**
   * Parse CAN ID from string (handles with or without 0x prefix)
   */
  static parseCANId(canIdStr: string): number {
    const cleaned = canIdStr.trim();
    if (cleaned.startsWith("0x") || cleaned.startsWith("0X")) {
      return parseInt(cleaned.substring(2), 16);
    }
    return parseInt(cleaned, 16);
  }
}
