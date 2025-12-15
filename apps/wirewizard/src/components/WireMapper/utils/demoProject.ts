import { WireMapperProject } from "../types";
import { RectangleRenderer } from "../connectors/RectangleRenderer";

/**
 * Demo wiring harness project showcasing WireMapper features
 * This demonstrates an automotive-style harness connecting various components
 */

// Helper to generate properly formatted connector with pins
const createConnector = (
  id: string,
  name: string,
  type: string,
  x: number,
  y: number,
  rows: number,
  cols: number,
  gender: "Male" | "Female" | "Unknown" = "Unknown",
) => {
  const renderer = new RectangleRenderer();

  // Calculate appropriate dimensions based on pin layout
  const horizontalSpacing = 25;
  const verticalSpacing = 25;
  const padding = 30; // Extra padding for connector border

  const width = cols * horizontalSpacing + padding;
  const height = rows * verticalSpacing + padding;

  const config = {
    rows,
    cols,
    centerPinsHorizontally: true,
    pinNumberingMode: "sequential" as const,
  };

  const pins = renderer.generatePins(config, { width, height });

  return {
    id,
    name,
    type,
    shape: "Rectangle" as const,
    x,
    y,
    rows,
    cols,
    width,
    height,
    config,
    pins,
    gender,
  };
};

export const demoProject: WireMapperProject = {
  projectName: "Demo Automotive Harness",
  connectors: [
    (() => {
      const conn = createConnector(
        "conn-ecu-main",
        "ECU Main",
        "DB25 Male",
        100,
        100,
        2,
        6,
        "Male",
      );
      // Customize pin names and colors
      conn.pins[0].name = "VCC";
      conn.pins[0].config = { color: "#ff0000", type: "power" };
      conn.pins[1].name = "GND";
      conn.pins[1].config = { color: "#000000", type: "ground" };
      conn.pins[2].name = "CAN_H";
      conn.pins[2].config = { color: "#ffff00", type: "data" };
      conn.pins[3].name = "CAN_L";
      conn.pins[3].config = { color: "#00ff00", type: "data" };
      conn.pins[4].name = "SENSOR_IN";
      conn.pins[4].config = { color: "#0000ff", type: "signal" };
      conn.pins[5].name = "PWM_OUT";
      conn.pins[5].config = { color: "#ff00ff", type: "signal" };
      conn.pins[6].name = "RELAY_1";
      conn.pins[6].config = { color: "#00ffff", type: "signal" };
      conn.pins[7].name = "RELAY_2";
      conn.pins[7].config = { color: "#ffa500", type: "signal" };
      conn.pins[8].name = "SWITCH_IN";
      conn.pins[8].config = { color: "#a52a2a", type: "signal" };
      conn.pins[9].name = "LED_OUT";
      conn.pins[9].config = { color: "#ffffff", type: "signal" };
      conn.pins[10].name = "SERIAL_TX";
      conn.pins[10].config = { color: "#808080", type: "data" };
      conn.pins[11].name = "SERIAL_RX";
      conn.pins[11].config = { color: "#c0c0c0", type: "data" };
      return conn;
    })(),
    (() => {
      const conn = createConnector(
        "conn-sensor-module",
        "Sensor Module",
        "6-Pin Connector",
        400,
        100,
        2,
        3,
        "Female",
      );
      conn.pins[0].name = "VCC";
      conn.pins[0].config = { color: "#ff0000", type: "power" };
      conn.pins[1].name = "GND";
      conn.pins[1].config = { color: "#000000", type: "ground" };
      conn.pins[2].name = "SIGNAL_OUT";
      conn.pins[2].config = { color: "#0000ff", type: "signal" };
      conn.pins[3].name = "NC";
      conn.pins[3].config = { color: "#cccccc", type: "nc" };
      conn.pins[3].active = false;
      conn.pins[4].name = "NC";
      conn.pins[4].config = { color: "#cccccc", type: "nc" };
      conn.pins[4].active = false;
      conn.pins[5].name = "NC";
      conn.pins[5].config = { color: "#cccccc", type: "nc" };
      conn.pins[5].active = false;
      return conn;
    })(),
    (() => {
      const conn = createConnector(
        "conn-canbus",
        "CAN Bus",
        "4-Pin CAN",
        100,
        300,
        1,
        4,
        "Unknown",
      );
      conn.pins[0].name = "VCC";
      conn.pins[0].config = { color: "#ff0000", type: "power" };
      conn.pins[1].name = "CAN_H";
      conn.pins[1].config = { color: "#ffff00", type: "data" };
      conn.pins[2].name = "CAN_L";
      conn.pins[2].config = { color: "#00ff00", type: "data" };
      conn.pins[3].name = "GND";
      conn.pins[3].config = { color: "#000000", type: "ground" };
      return conn;
    })(),
    (() => {
      const conn = createConnector(
        "conn-relay-board",
        "Relay Board",
        "4-Pin Power",
        400,
        300,
        1,
        4,
        "Female",
      );
      conn.pins[0].name = "CTRL_1";
      conn.pins[0].config = { color: "#00ffff", type: "signal" };
      conn.pins[1].name = "CTRL_2";
      conn.pins[1].config = { color: "#ffa500", type: "signal" };
      conn.pins[2].name = "GND";
      conn.pins[2].config = { color: "#000000", type: "ground" };
      conn.pins[3].name = "VCC";
      conn.pins[3].config = { color: "#ff0000", type: "power" };
      return conn;
    })(),
  ],
  mappings: [
    // Power connections
    {
      id: "map-1",
      wireId: "wire-1",
      source: { connectorId: "conn-ecu-main", pinPos: 1 },
      target: { connectorId: "conn-sensor-module", pinPos: 1 },
      netName: "12V_SUPPLY",
      color: "#ff0000",
      gauge: "18 AWG",
    },
    {
      id: "map-2",
      wireId: "wire-2",
      source: { connectorId: "conn-ecu-main", pinPos: 1 },
      target: { connectorId: "conn-canbus", pinPos: 1 },
      netName: "12V_SUPPLY",
      color: "#ff0000",
      gauge: "18 AWG",
    },
    {
      id: "map-3",
      wireId: "wire-3",
      source: { connectorId: "conn-ecu-main", pinPos: 1 },
      target: { connectorId: "conn-relay-board", pinPos: 4 },
      netName: "12V_SUPPLY",
      color: "#ff0000",
      gauge: "16 AWG",
    },

    // Ground connections
    {
      id: "map-4",
      wireId: "wire-4",
      source: { connectorId: "conn-ecu-main", pinPos: 2 },
      target: { connectorId: "conn-sensor-module", pinPos: 2 },
      netName: "GROUND",
      color: "#000000",
      gauge: "18 AWG",
    },
    {
      id: "map-5",
      wireId: "wire-5",
      source: { connectorId: "conn-ecu-main", pinPos: 2 },
      target: { connectorId: "conn-canbus", pinPos: 4 },
      netName: "GROUND",
      color: "#000000",
      gauge: "18 AWG",
    },
    {
      id: "map-6",
      wireId: "wire-6",
      source: { connectorId: "conn-ecu-main", pinPos: 2 },
      target: { connectorId: "conn-relay-board", pinPos: 3 },
      netName: "GROUND",
      color: "#000000",
      gauge: "18 AWG",
    },

    // CAN Bus connections
    {
      id: "map-7",
      wireId: "wire-7",
      source: { connectorId: "conn-ecu-main", pinPos: 3 },
      target: { connectorId: "conn-canbus", pinPos: 2 },
      netName: "CAN_HIGH",
      color: "#ffff00",
      gauge: "24 AWG",
    },
    {
      id: "map-8",
      wireId: "wire-8",
      source: { connectorId: "conn-ecu-main", pinPos: 4 },
      target: { connectorId: "conn-canbus", pinPos: 3 },
      netName: "CAN_LOW",
      color: "#00ff00",
      gauge: "24 AWG",
    },

    // Sensor connection
    {
      id: "map-9",
      wireId: "wire-9",
      source: { connectorId: "conn-ecu-main", pinPos: 5 },
      target: { connectorId: "conn-sensor-module", pinPos: 3 },
      netName: "TEMP_SENSOR",
      color: "#0000ff",
      gauge: "22 AWG",
    },

    // Relay control
    {
      id: "map-10",
      wireId: "wire-10",
      source: { connectorId: "conn-ecu-main", pinPos: 7 },
      target: { connectorId: "conn-relay-board", pinPos: 1 },
      netName: "RELAY_CTRL_1",
      color: "#00ffff",
      gauge: "22 AWG",
    },
    {
      id: "map-11",
      wireId: "wire-11",
      source: { connectorId: "conn-ecu-main", pinPos: 8 },
      target: { connectorId: "conn-relay-board", pinPos: 2 },
      netName: "RELAY_CTRL_2",
      color: "#ffa500",
      gauge: "22 AWG",
    },
  ],
};
