/**
 * Analog Widget - Analog position display (wheel, pedal, etc.)
 *
 * Displays analog position values visually.
 */

import React from "react";
import type { AnalogWidgetConfig } from "../types";
import { BaseWidget } from "./BaseWidget";

export interface AnalogWidgetProps {
  config: AnalogWidgetConfig;
  value: number;
  unit?: string;
  valid?: boolean;
}

export const AnalogWidget: React.FC<AnalogWidgetProps> = ({
  config,
  value,
  unit,
  valid = true,
}) => {
  const {
    label,
    showLabel = true,
    min,
    max,
    icon,
    unit: configUnit,
    width = 120,
    height = 120,
  } = config;

  const displayUnit = unit || configUnit;

  // Calculate percentage
  const percentage = Math.max(
    0,
    Math.min(100, ((value - min) / (max - min)) * 100),
  );

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  };

  const iconContainerStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  // Simple visual representation based on icon type
  const renderIcon = () => {
    switch (icon) {
      case "pedal":
        // Vertical bar representing pedal position
        return (
          <div
            style={{
              width: "40px",
              height: "80px",
              backgroundColor: "#222222",
              border: "2px solid #444444",
              borderRadius: "4px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: `${percentage}%`,
                backgroundColor: valid ? "#00ff00" : "#666666",
                transition: "height 0.2s ease",
              }}
            />
          </div>
        );

      case "wheel":
        // Circular indicator for steering angle
        const angle = -90 + (percentage / 100) * 180; // -90° to +90°
        return (
          <div style={{ position: "relative", width: "80px", height: "80px" }}>
            <svg width="80" height="80">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="#444444"
                strokeWidth="3"
                fill="none"
              />
              <line
                x1="40"
                y1="40"
                x2="40"
                y2="10"
                stroke={valid ? "#00ff00" : "#666666"}
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${angle} 40 40)`}
              />
            </svg>
          </div>
        );

      case "slider":
      case "stick":
      default:
        // Horizontal slider
        return (
          <div
            style={{
              width: "100px",
              height: "20px",
              backgroundColor: "#222222",
              border: "2px solid #444444",
              borderRadius: "10px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${percentage}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: valid ? "#00ff00" : "#666666",
                boxShadow: valid ? "0 0 8px #00ff00" : "none",
                transition: "left 0.2s ease",
              }}
            />
          </div>
        );
    }
  };

  const valueStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: "bold",
    fontFamily: "monospace",
    color: valid ? "#ffffff" : "#ff0000",
  };

  const formattedValue =
    typeof value === "number" && !isNaN(value) ? value.toFixed(1) : "--";

  return (
    <BaseWidget label={label} showLabel={showLabel}>
      <div style={containerStyle}>
        <div style={iconContainerStyle}>{renderIcon()}</div>
        <div style={valueStyle}>
          {formattedValue}
          {displayUnit && ` ${displayUnit}`}
        </div>
      </div>
    </BaseWidget>
  );
};
