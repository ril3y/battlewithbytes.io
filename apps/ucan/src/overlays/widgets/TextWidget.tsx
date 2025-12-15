/**
 * Text Widget - String Value Display
 *
 * Displays text values (e.g., enum labels, strings).
 */

import React from "react";
import type { TextWidgetConfig } from "../types";
import { BaseWidget } from "./BaseWidget";

export interface TextWidgetProps {
  config: TextWidgetConfig;
  value: string;
  valid?: boolean;
}

export const TextWidget: React.FC<TextWidgetProps> = ({
  config,
  value,
  valid = true,
}) => {
  const { label, showLabel = true, fontSize = 18 } = config;

  const textStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: "bold",
    color: valid ? "#ffffff" : "#ff0000",
    textAlign: "center",
    padding: "4px 8px",
    backgroundColor: "rgba(0, 255, 0, 0.1)",
    borderRadius: "4px",
    border: "1px solid rgba(0, 255, 0, 0.3)",
  };

  return (
    <BaseWidget label={label} showLabel={showLabel}>
      <div className="flex items-center justify-center">
        <span style={textStyle}>{value || "--"}</span>
      </div>
    </BaseWidget>
  );
};
