// Ohm's Law Calculator types
export interface OhmsLawValues {
  voltage: string;
  current: string;
  resistance: string;
  power: string;
}

export interface OhmsLawResults {
  voltage: string;
  current: string;
  resistance: string;
  power: string;
  calculatedProperty: "voltage" | "current" | "resistance" | "power" | null;
  description: string;
  displayCurrentInMilliamps?: boolean;
}
