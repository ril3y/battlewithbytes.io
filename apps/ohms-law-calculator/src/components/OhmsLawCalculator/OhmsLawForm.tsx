"use client";

import React, { useState } from "react";
import Tooltip from "@battlewithbytes/utils/Tooltip"; // Assuming Tooltip component exists
import {
  // Import necessary functions from the corrected inputUtils
  isValidNumberInput,
  isValidVoltage, // Use if specific validation needed beyond basic number
  isValidResistance, // Use if specific validation needed beyond basic number
  parseValueWithSuffix, // Use for parsing before warning checks
  getParameterWarning,
  getParameterTooltip,
  // FieldType // Removed as validateFieldInput/parseFieldValue are removed
} from "@battlewithbytes/utils/inputUtils";
import type { OhmsLawValues } from "@/types/tools";

interface OhmsLawFormProps {
  values: OhmsLawValues;
  onValueChange: (name: string, value: string) => void;
  onCalculate: (
    calculationMode: "voltage" | "current" | "resistance" | "power",
  ) => void;
  onClear: () => void;
}

type FieldName = keyof OhmsLawValues;

/** The four Ohm's-law quantities; the one being solved for is hidden. */
const FIELDS: ReadonlyArray<{
  name: FieldName;
  label: string;
  placeholder: string;
}> = [
  { name: "voltage", label: "Voltage (V)", placeholder: "Enter voltage" },
  {
    name: "current",
    label: "Current (I)",
    placeholder: "e.g., 5 (5A), 5m or 5mA (5mA)",
  },
  {
    name: "resistance",
    label: "Resistance (R)",
    placeholder: "e.g., 5 (5Ω), 1k (1kΩ)",
  },
  { name: "power", label: "Power (P)", placeholder: "e.g., 5 (5W), 10m (10mW)" },
];

const OhmsLawForm: React.FC<OhmsLawFormProps> = ({
  values,
  onValueChange,
  onCalculate,
  onClear,
}) => {
  const [calculationMode, setCalculationMode] = useState<
    "voltage" | "current" | "resistance" | "power"
  >("voltage");
  const [warnings, setWarnings] = useState<{ [key: string]: string }>({
    voltage: "",
    current: "",
    resistance: "",
    power: "",
  });

  // Count how many fields have values
  const filledFieldsCount = Object.values(values).filter(
    (value) => value.trim() !== "",
  ).length;

  // Determine which fields have values (excluding the calculation mode)
  const filledFields = Object.entries(values)
    .filter(([key, value]) => key !== calculationMode && value.trim() !== "")
    .map(([key]) => key);

  // Determine if a field should be disabled
  const shouldDisableField = (fieldName: string) => {
    if (fieldName === calculationMode) return false; // Never disable the calculated field
    return filledFieldsCount >= 2 && !filledFields.includes(fieldName);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldType = name as keyof OhmsLawValues; // Get field type from name

    // --- Basic Input Filtering (Optional but good UX) ---
    let allowUpdate = false;
    if (value === "") {
      allowUpdate = true; // Always allow clearing
    } else if (fieldType === "voltage") {
      allowUpdate = isValidVoltage(value);
    } else if (fieldType === "resistance") {
      allowUpdate = isValidResistance(value);
    } else {
      // For current, power, or others
      allowUpdate = isValidNumberInput(value); // Use the general validator
    }
    // --- End Basic Input Filtering ---

    if (allowUpdate) {
      onValueChange(name, value); // Update parent state

      // Check for warnings only if the field has a potentially valid value
      if (value.trim() !== "") {
        // Use parseValueWithSuffix to get a number for the warning check
        const parsedValue = parseValueWithSuffix(value);
        // Pass the field name directly to getParameterWarning
        const warning = getParameterWarning(fieldType, parsedValue); // Pass parsed number
        setWarnings((prev) => ({
          ...prev,
          [name]: warning || "", // Ensure empty string if no warning
        }));
      } else {
        // Clear warning if field is empty
        setWarnings((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
    // If !allowUpdate, the input change is ignored, preventing invalid characters
    // (Adjust this behavior if you prefer looser input filtering)
  };

  // Removed formatCurrentDisplay function - Input displays raw value

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Cast the value to the specific literal type union
    setCalculationMode(
      e.target.value as "voltage" | "current" | "resistance" | "power",
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if exactly two fields are filled before calculating
    if (filledFieldsCount === 2) {
      onCalculate(calculationMode);
    } else {
      // Optionally provide feedback if not exactly 2 fields are filled
      console.warn("Calculation requires exactly 2 input values.");
      // You could update a status message here instead of console logging
    }
  };

  // Tooltip function remains the same
  const getTooltip = (name: string) => {
    return getParameterTooltip(name);
  };
  const getDisabledTooltip = (fieldName: string) => {
    if (shouldDisableField(fieldName)) {
      return "Enter exactly 2 values to calculate the others. Clear a field to edit this one.";
    }
    return getTooltip(fieldName);
  };

  // --- JSX Structure ---
  return (
    <form onSubmit={handleSubmit} className="ohms-law-form">
      {/* Calculation Mode Selector */}
      <div className="mb-6">
        <label
          htmlFor="calculationModeSelect"
          className="block text-sm font-medium mb-2"
        >
          Calculate
        </label>
        <select
          id="calculationModeSelect" // Added id for label association
          className="w-full bg-black/30 border border-gray-700 rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
          value={calculationMode}
          onChange={handleModeChange}
        >
          <option value="voltage">Voltage (V)</option>
          <option value="current">Current (I)</option>
          <option value="resistance">Resistance (R)</option>
          <option value="power">Power (P)</option>
        </select>
      </div>

      {/* Instructions Box */}
      <div className="bg-black/40 border border-gray-800 rounded-md p-4 mb-6">
        <p className="text-sm text-[#00ff9d] font-mono mb-2">INSTRUCTIONS</p>
        <p className="text-sm text-gray-300">
          Select the value to calculate, then enter values for{" "}
          <strong>exactly 2</strong> of the other parameters.
        </p>
        <div className="mt-2 text-xs text-gray-400 space-y-1">
          <p>• Examples:</p>
          <ul className="ml-4 list-disc">
            <li>
              Voltage: <span className="text-yellow-400">5</span> (5V)
            </li>
            <li>
              Current: <span className="text-yellow-400">5</span> (5A),{" "}
              <span className="text-yellow-400">5m</span> or{" "}
              <span className="text-yellow-400">5mA</span> (5mA),{" "}
              <span className="text-yellow-400">10u</span> (10µA)
            </li>
            <li>
              Resistance: <span className="text-yellow-400">5</span> (5Ω),{" "}
              <span className="text-yellow-400">1k</span> (1kΩ),{" "}
              <span className="text-yellow-400">2M</span> (2MΩ)
            </li>
            <li>
              Power: <span className="text-yellow-400">5</span> (5W),{" "}
              <span className="text-yellow-400">10m</span> (10mW)
            </li>
          </ul>
          <p>• Suffixes k, M, G, m, u/µ are supported.</p>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {filledFieldsCount < 2 ? (
            `Enter ${2 - filledFieldsCount} more value(s).`
          ) : filledFieldsCount > 2 ? (
            <span className="text-red-500">
              Clear a value. Only 2 inputs needed.
            </span>
          ) : (
            <span className="text-green-500">Ready to Calculate!</span>
          )}
        </p>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        {FIELDS.map(({ name, label, placeholder }) =>
          calculationMode === name ? null : (
            <div key={name}>
              <label
                htmlFor={`${name}Input`}
                className="block text-sm font-medium mb-2"
              >
                {label}
              </label>
              <Tooltip text={getDisabledTooltip(name)} position="top">
                <input
                  id={`${name}Input`}
                  // "text" keeps SI-suffix input (5m, 1k) working; validation
                  // handles the format. inputMode hints mobile keyboards.
                  type="text"
                  inputMode="decimal"
                  name={name}
                  className={`w-full bg-black/30 border ${shouldDisableField(name) ? "border-red-800 bg-red-900/20 cursor-not-allowed text-gray-500" : "border-gray-700"} rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]`}
                  value={values[name]}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  disabled={shouldDisableField(name)}
                />
              </Tooltip>
              {warnings[name] && (
                <div className="text-yellow-400 text-sm mt-1">
                  {warnings[name]}
                </div>
              )}
            </div>
          ),
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4 mb-8">
        <button
          type="submit"
          className={`flex-1 font-mono py-2 px-4 rounded-md transition-all duration-300 ${
            filledFieldsCount === 2
              ? "bg-[#00ff9d]/20 hover:bg-[#00ff9d]/30 border border-[#00ff9d]/50 text-[#00ff9d]"
              : "bg-gray-700/50 border border-gray-600 text-gray-500 cursor-not-allowed"
          }`}
          disabled={filledFieldsCount !== 2} // Disable if not exactly 2 fields are filled
        >
          Calculate{" "}
          {calculationMode.charAt(0).toUpperCase() + calculationMode.slice(1)}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex-1 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 text-gray-300 font-mono py-2 px-4 rounded-md transition-all duration-300"
        >
          Clear All
        </button>
      </div>
    </form>
  );
};

export default OhmsLawForm;
