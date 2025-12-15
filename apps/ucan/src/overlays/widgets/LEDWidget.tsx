/**
 * LED Widget - Boolean Indicator
 *
 * Displays a colored circle that lights up when the value is true.
 * Configurable colors for on/off states and size.
 */

import React from "react";
import type { LEDWidgetConfig } from "../types";
import { BaseWidget } from "./BaseWidget";

export interface LEDWidgetProps {
  config: LEDWidgetConfig;
  value: boolean;
  valid?: boolean;
}

export const LEDWidget: React.FC<LEDWidgetProps> = ({
  config,
  value,
  valid = true,
}) => {
  const {
    label,
    showLabel = true,
    colorOn = "#00ff00",
    colorOff = "#003300",
    size = "medium",
  } = config;

  // Size mapping
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };

  const diameter = sizeMap[size];

  const ledStyle: React.CSSProperties = {
    width: `${diameter}px`,
    height: `${diameter}px`,
    borderRadius: "50%",
    backgroundColor: value ? colorOn : colorOff,
    boxShadow: value ? `0 0 ${diameter / 2}px ${colorOn}` : "none",
    transition: "all 0.2s ease",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    opacity: valid ? 1 : 0.3,
  };

  return (
    <BaseWidget label={label} showLabel={showLabel}>
      <div className="flex items-center justify-center">
        <div style={ledStyle} title={`${label}: ${value ? "ON" : "OFF"}`} />
      </div>
    </BaseWidget>
  );
};
