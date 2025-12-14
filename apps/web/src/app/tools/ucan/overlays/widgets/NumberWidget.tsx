/**
 * Number Widget - Numeric Value Display
 *
 * Displays a numeric value with optional unit and precision.
 */

import React from "react";
import type { NumberWidgetConfig } from "../types";
import { BaseWidget } from "./BaseWidget";

export interface NumberWidgetProps {
  config: NumberWidgetConfig;
  value: number;
  unit?: string;
  valid?: boolean;
}

export const NumberWidget: React.FC<NumberWidgetProps> = ({
  config,
  value,
  unit,
  valid = true,
}) => {
  const {
    label,
    showLabel = true,
    precision = 2,
    unit: configUnit,
    fontSize = 24,
  } = config;

  const displayUnit = unit || configUnit;

  // Format number with precision
  const formattedValue =
    typeof value === "number" && !isNaN(value)
      ? value.toFixed(precision)
      : "--";

  const numberStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: "bold",
    fontFamily: "monospace",
    color: valid ? "#00ff00" : "#ff0000",
    textAlign: "center",
  };

  const unitStyle: React.CSSProperties = {
    fontSize: `${fontSize * 0.6}px`,
    color: "#888888",
    marginLeft: "4px",
  };

  return (
    <BaseWidget label={label} showLabel={showLabel}>
      <div className="flex items-center justify-center">
        <span style={numberStyle}>{formattedValue}</span>
        {displayUnit && <span style={unitStyle}>{displayUnit}</span>}
      </div>
    </BaseWidget>
  );
};
