// MOSFET Calculator types
export interface MosfetCalculatorState {
  mosfetType: "n-channel" | "p-channel";
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
