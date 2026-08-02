"use client";

import React from "react";
import { ArgAnnotation } from "../lib/context/AnalysisContext";

interface ArgumentAnnotationProps {
  annotation: ArgAnnotation;
  functionName?: string;
  compact?: boolean;
  className?: string;
}

export function ArgumentAnnotation({
  annotation,
  functionName,
  compact,
  className,
}: ArgumentAnnotationProps) {
  if (!annotation || !annotation.args || annotation.args.length === 0) {
    return null;
  }

  const argsStr = annotation.args.map((arg) => arg[1]).join(", ");

  return (
    <span className={`text-gray-500 text-xs ${className || ""}`}>
      {compact ? argsStr : `${functionName || "func"}(${argsStr})`}
    </span>
  );
}

export default ArgumentAnnotation;
