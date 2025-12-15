/**
 * uCAN Capability Discovery Manager
 *
 * Manages board capability discovery and action system integration
 * Each uCAN board (RP2040, SAMD51, ESP32) has different hardware capabilities
 * that must be queried dynamically
 */

import { BoardCapabilities, ActionRule } from "../types";

/**
 * Capability Manager
 * Handles querying and caching board capabilities
 */
export class CapabilityManager {
  private capabilities: BoardCapabilities | null = null;
  private supportedActions: string[] = [];
  private actionRules: Map<number, ActionRule> = new Map();

  /**
   * Set board capabilities from CAPS message
   */
  setCapabilities(capabilities: BoardCapabilities): void {
    this.capabilities = capabilities;
    console.log(`Board detected: ${capabilities.board} (${capabilities.chip})`);
    console.log(`Features: ${capabilities.features?.join(", ")}`);
    console.log(`Max rules: ${capabilities.max_rules}`);
  }

  /**
   * Get current board capabilities
   */
  getCapabilities(): BoardCapabilities | null {
    return this.capabilities;
  }

  /**
   * Set supported actions from ACTIONS message
   */
  setSupportedActions(actions: string[]): void {
    this.supportedActions = actions;
    console.log(`Supported actions: ${actions.join(", ")}`);
  }

  /**
   * Get supported actions
   */
  getSupportedActions(): string[] {
    return this.supportedActions;
  }

  /**
   * Check if an action type is supported by the connected board
   */
  isActionSupported(actionType: string): boolean {
    return this.supportedActions.includes(actionType);
  }

  /**
   * Check if board has a specific feature
   */
  hasFeature(feature: string): boolean {
    return this.capabilities?.features?.includes(feature) || false;
  }

  /**
   * Get the maximum number of rules this board supports
   */
  getMaxRules(): number {
    return this.capabilities?.max_rules || 0;
  }

  /**
   * Add or update an action rule
   */
  addRule(rule: ActionRule): void {
    this.actionRules.set(rule.id, rule);
  }

  /**
   * Remove an action rule
   */
  removeRule(ruleId: number): void {
    this.actionRules.delete(ruleId);
  }

  /**
   * Get a specific action rule
   */
  getRule(ruleId: number): ActionRule | undefined {
    return this.actionRules.get(ruleId);
  }

  /**
   * Get all action rules
   */
  getAllRules(): ActionRule[] {
    return Array.from(this.actionRules.values());
  }

  /**
   * Clear all action rules
   */
  clearAllRules(): void {
    this.actionRules.clear();
  }

  /**
   * Get number of active rules
   */
  getRuleCount(): number {
    return this.actionRules.size;
  }

  /**
   * Check if we can add more rules
   */
  canAddRule(): boolean {
    return this.getRuleCount() < this.getMaxRules();
  }

  /**
   * Validate if a pin number is valid for GPIO operations
   */
  isValidGPIOPin(pin: number): boolean {
    const gpioTotal = this.capabilities?.gpio?.total ?? 0;
    return gpioTotal > 0 ? pin < gpioTotal : false;
  }

  /**
   * Validate if a pin number is valid for PWM operations
   */
  isValidPWMPin(pin: number): boolean {
    const pwmCount = this.capabilities?.gpio?.pwm ?? 0;
    return pwmCount > 0 && pin < pwmCount && this.hasFeature("PWM");
  }

  /**
   * Validate if a pin number is valid for ADC operations
   */
  isValidADCPin(pin: number): boolean {
    const adcCount = this.capabilities?.gpio?.adc ?? 0;
    return adcCount > 0 && pin < adcCount && this.hasFeature("ADC");
  }

  /**
   * Get board info summary for display
   */
  getBoardSummary(): string {
    if (!this.capabilities) {
      return "No board connected";
    }

    return `${this.capabilities.board} - ${this.capabilities.chip}`;
  }

  /**
   * Get CAN controller type
   */
  getCANControllerType(): string {
    if (!this.capabilities?.can) {
      return "Unknown";
    }

    return this.capabilities.can.controllers ? "Hardware CAN" : "Software CAN";
  }

  /**
   * Check if board is fully initialized
   */
  isInitialized(): boolean {
    return this.capabilities !== null && this.supportedActions.length > 0;
  }

  /**
   * Reset all cached data (for disconnect)
   */
  reset(): void {
    this.capabilities = null;
    this.supportedActions = [];
    this.actionRules.clear();
  }

  /**
   * Get feature summary for UI display
   */
  getFeatureSummary(): { name: string; available: boolean; count?: number }[] {
    if (!this.capabilities) {
      return [];
    }

    return [
      { name: "GPIO", available: true, count: this.capabilities.gpio?.total },
      {
        name: "PWM",
        available: this.hasFeature("PWM"),
        count: this.capabilities.gpio?.pwm,
      },
      {
        name: "ADC",
        available: this.hasFeature("ADC"),
        count: this.capabilities.gpio?.adc,
      },
      {
        name: "DAC",
        available: this.hasFeature("DAC"),
        count: this.capabilities.gpio?.dac,
      },
      { name: "NeoPixel", available: this.hasFeature("NEOPIXEL") },
      { name: "Flash Storage", available: this.hasFeature("FLASH") },
      { name: "RTC", available: this.hasFeature("RTC") },
      { name: "Crypto", available: this.hasFeature("CRYPTO") },
    ];
  }
}
