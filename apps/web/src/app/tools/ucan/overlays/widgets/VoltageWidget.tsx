/**
 * Voltage Widget - Specialized voltage display with thresholds
 *
 * Displays voltage with color-coded warnings based on thresholds.
 */

import React from "react";
import type { VoltageWidgetConfig } from "../types";
import { BaseWidget } from "./BaseWidget";

export interface VoltageWidgetProps {
  config: VoltageWidgetConfig;
  value: number;
  valid?: boolean;
}

export const VoltageWidget: React.FC<VoltageWidgetProps> = ({
  config,
  value,
  valid = true,
}) => {
  const {
    label,
    showLabel = true,
    precision = 2,
    lowThreshold,
    highThreshold,
  } = config;

  // Determine color based on thresholds
  let color = "#00ff00"; // Normal green
  if (lowThreshold !== undefined && value < lowThreshold) {
    color = "#ff0000"; // Low red
  } else if (highThreshold !== undefined && value > highThreshold) {
    color = "#ff6600"; // High orange
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

  const voltageStyle: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: "bold",
    fontFamily: "monospace",
    color: valid ? color : "#ff0000",
  };

  const unitStyle: React.CSSProperties = {
    fontSize: "16px",
    color: "#888888",
  };

  const thresholdStyle: React.CSSProperties = {
    fontSize: "10px",
    color: "#666666",
    display: "flex",
    gap: "8px",
  };

  return (
    <BaseWidget label={label} showLabel={showLabel}>
      <div style={containerStyle}>
        <div>
          <span style={voltageStyle}>{formattedValue}</span>
          <span style={unitStyle}> V</span>
        </div>
        {(lowThreshold !== undefined || highThreshold !== undefined) && (
          <div style={thresholdStyle}>
            {lowThreshold !== undefined && <span>Low: {lowThreshold}V</span>}
            {highThreshold !== undefined && <span>High: {highThreshold}V</span>}
          </div>
        )}
      </div>
    </BaseWidget>
  );
};
