/**
 * Switch Widget - Boolean Toggle Display
 *
 * Displays a toggle switch representation (not interactive, display only).
 */

import React from "react";
import type { SwitchWidgetConfig } from "../types";
import { BaseWidget } from "./BaseWidget";

export interface SwitchWidgetProps {
  config: SwitchWidgetConfig;
  value: boolean;
  valid?: boolean;
}

export const SwitchWidget: React.FC<SwitchWidgetProps> = ({
  config,
  value,
  valid = true,
}) => {
  const { label, showLabel = true, labelOn = "ON", labelOff = "OFF" } = config;

  const switchStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    opacity: valid ? 1 : 0.3,
  };

  const trackStyle: React.CSSProperties = {
    width: "44px",
    height: "24px",
    borderRadius: "12px",
    backgroundColor: value ? "#00ff00" : "#444444",
    position: "relative",
    transition: "background-color 0.2s ease",
    border: "2px solid rgba(255, 255, 255, 0.2)",
  };

  const thumbStyle: React.CSSProperties = {
    position: "absolute",
    top: "2px",
    left: value ? "22px" : "2px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    transition: "left 0.2s ease",
  };

  const textStyle: React.CSSProperties = {
    color: value ? "#00ff00" : "#888888",
    fontWeight: "bold",
    fontSize: "12px",
  };

  return (
    <BaseWidget label={label} showLabel={showLabel}>
      <div style={switchStyle}>
        <div style={trackStyle}>
          <div style={thumbStyle} />
        </div>
        <span style={textStyle}>{value ? labelOn : labelOff}</span>
      </div>
    </BaseWidget>
  );
};
