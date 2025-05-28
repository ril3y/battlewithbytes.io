// Tool-specific types

// MOSFET Calculator types
export interface MosfetCalculatorState {
  mosfetType: 'n-channel' | 'p-channel';
  mosfetName: string;
  mosfetDetails: MosfetDetails;
  inputValues: MosfetInputValues;
  conducting: boolean | null;
  description: string;
}

export interface MosfetDetails {
  vth: string;
  rds_on: string;
  vgs_th?: string;
  type?: string;
  [key: string]: string | undefined;
}

export interface MosfetInputValues {
  vg: string;
  vcc: string;
  vd: string;
  vs: string;
  loadResistance: string;
}

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
  calculatedProperty: 'voltage' | 'current' | 'resistance' | 'power' | null;
  description: string;
  displayCurrentInMilliamps?: boolean;
}

// Wire Mapper types (re-export from existing)
export type { 
  Connector, 
  Pin, 
  Mapping, 
  Wire, 
  WireMapperProject 
} from '../components/tools/WireMapper/types';

// Generic tool types
export interface ToolMetadata {
  name: string;
  description: string;
  path: string;
  category: 'hardware' | 'software' | 'electrical' | 'general';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface CalculatorState {
  inputs: Record<string, string>;
  outputs: Record<string, number>;
  errors: Record<string, string>;
  isValid: boolean;
}