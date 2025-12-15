/**
 * Temperature Widget - Temperature display with color coding
 *
 * Displays temperature with color-coded zones (cold/normal/hot).
 */

import React from "react";
import type { TemperatureWidgetConfig } from "../types";
import { BaseWidget } from "./BaseWidget";

export interface TemperatureWidgetProps {
  config: TemperatureWidgetConfig;
  value: number;
  valid?: boolean;
}

export const TemperatureWidget: React.FC<TemperatureWidgetProps> = ({
  config,
  value,
  valid = true,
}) => {
  const {
    label,
    showLabel = true,
    precision = 1,
    unit = "°C",
    coldThreshold,
    normalRange,
    hotThreshold,
  } = config;

  // Determine color based on temperature zones
  let color = "#00ff00"; // Normal green
  let zone = "NORMAL";

  if (coldThreshold !== undefined && value < coldThreshold) {
    color = "#00ccff"; // Cold blue
    zone = "COLD";
  } else if (normalRange) {
    if (value < normalRange[0]) {
      color = "#88ccff"; // Cool light blue
      zone = "COOL";
    } else if (value > normalRange[1]) {
      color = "#ffaa00"; // Warm orange
      zone = "WARM";
    }
  }

  if (hotThreshold !== undefined && value > hotThreshold) {
    color = "#ff0000"; // Hot red
    zone = "HOT";
  }

  const formattedValue =
    typeof value === "number" && !isNaN(value)
      ? value.toFixed(precision)
      : "--";

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  };

  const tempStyle: React.CSSProperties = {
    fontSize: "32px",
    fontWeight: "bold",
    fontFamily: "monospace",
    color: valid ? color : "#ff0000",
  };

  const unitStyle: React.CSSProperties = {
    fontSize: "20px",
    color: "#888888",
  };

  const zoneStyle: React.CSSProperties = {
    fontSize: "12px",
    color: color,
    fontWeight: "bold",
    padding: "2px 6px",
    backgroundColor: `${color}22`,
    borderRadius: "3px",
  };

  return (
    <BaseWidget label={label} showLabel={showLabel}>
      <div style={containerStyle}>
        <div>
          <span style={tempStyle}>{formattedValue}</span>
          <span style={unitStyle}>{unit}</span>
        </div>
        <div style={zoneStyle}>{zone}</div>
      </div>
    </BaseWidget>
  );
};
