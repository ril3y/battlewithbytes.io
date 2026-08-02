"use client";

import React, { useState, useCallback } from "react";
import {
  parseValueWithSuffix,
  formatValueWithSuffix,
  isValidVoltage,
  getParameterWarning,
  getParameterTooltip,
} from "@battlewithbytes/utils/inputUtils";
import Tooltip from "@battlewithbytes/utils/Tooltip";
import mosfetData from "./mosfetData.json";

interface MosfetPreset {
  vth: number;
  rds_on: number;
  Id: string;
  P_max: string;
  Vds_max: string;
  Vgs_max: string;
}

type ChannelType = "n-channel" | "p-channel";

interface MosfetConfigurationProps {
  channelType: ChannelType;
  mosfetName: string;
  mosfetDetails: { vth: string; rds_on: string };
  inputValues: {
    vg: string;
    vcc: string;
    vs: string;
    loadResistance: string;
  };
  onDetailsChange: (
    name: string,
    details: { vth: string; rds_on: string },
  ) => void;
  onInputChange: (name: string, value: string) => void;
}

interface VoltageField {
  name: "vg" | "vcc" | "vs" | "loadResistance";
  label: string;
  placeholder: string;
  /** Extra hint line under the input */
  hint?: string;
  /** Show the SI-suffix helper line */
  siSuffixes?: boolean;
}

/** Per-channel copy differences live here; the markup is shared. */
const CHANNEL_CONFIG: Record<
  ChannelType,
  {
    heading: string;
    vthPlaceholder: string;
    vthHint?: string;
    fields: VoltageField[];
  }
> = {
  "n-channel": {
    heading: "N-Channel Configuration",
    vthPlaceholder: "Enter threshold voltage",
    fields: [
      {
        name: "vg",
        label: "Gate Voltage (Vg)",
        placeholder: "Enter gate voltage",
      },
      {
        name: "vcc",
        label: "Supply Voltage (Vcc)",
        placeholder: "Enter supply voltage",
      },
      {
        name: "vs",
        label: "Source Voltage (Vs)",
        placeholder: "Usually 0V (ground)",
      },
      {
        name: "loadResistance",
        label: "Load Resistance",
        placeholder: "Enter load resistance",
        siSuffixes: true,
      },
    ],
  },
  "p-channel": {
    heading: "P-Channel Configuration",
    vthPlaceholder: "e.g., -2 (MUST be negative)",
    vthHint: "For P-Channel MOSFETs, Vth should be negative.",
    fields: [
      {
        name: "vg",
        label: "Gate Voltage (Vg)",
        placeholder: "Enter gate voltage",
      },
      {
        name: "vs",
        label: "Source Voltage (Vs - Connects to Supply)",
        placeholder: "Enter voltage at Source (usually Vcc)",
        hint: "For high-side switching, Vs is typically connected to the positive supply (Vcc).",
      },
      {
        name: "loadResistance",
        label: "Load Resistance",
        placeholder: "Enter load resistance",
        siSuffixes: true,
      },
    ],
  },
};

export default function MosfetConfiguration({
  channelType,
  mosfetName,
  mosfetDetails,
  inputValues,
  onDetailsChange,
  onInputChange,
}: MosfetConfigurationProps) {
  const presets = mosfetData.mosfets[channelType] as Record<
    string,
    MosfetPreset
  >;
  const config = CHANNEL_CONFIG[channelType];
  const [warnings, setWarnings] = useState<{ [key: string]: string }>({});

  const handleMosfetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setWarnings({});
    if (selectedName === "" || selectedName === "custom") {
      onDetailsChange(selectedName, { vth: "", rds_on: "" });
      return;
    }

    const selected = presets[selectedName];
    onDetailsChange(selectedName, {
      vth: selected.vth.toString(),
      rds_on: selected.rds_on.toString(),
    });
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      const isValid =
        value === "" || name === "loadResistance" || isValidVoltage(value);

      if (isValid) {
        onInputChange(name, value);
        const warning = getParameterWarning(name, value);
        setWarnings((prev) => ({ ...prev, [name]: warning || "" }));
      }
    },
    [onInputChange],
  );

  const handleCustomParamChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      const isValid =
        value === "" || name === "rds_on" || isValidVoltage(value);

      if (isValid) {
        onDetailsChange("custom", { ...mosfetDetails, [name]: value });
        const warning = getParameterWarning(name, value);
        setWarnings((prev) => ({ ...prev, [name]: warning || "" }));
      }
    },
    [mosfetDetails, onDetailsChange],
  );

  const renderWarning = (name: string) =>
    warnings[name] && (
      <div className="text-yellow-400 text-sm mt-1">{warnings[name]}</div>
    );

  const renderVoltageFields = () =>
    config.fields.map((field) => (
      <div key={field.name}>
        <label className="mosfet-label">{field.label}</label>
        <Tooltip text={getParameterTooltip(field.name)}>
          <input
            type="text"
            name={field.name}
            className="mosfet-input"
            value={inputValues[field.name]}
            onChange={handleInputChange}
            placeholder={field.placeholder}
          />
        </Tooltip>
        {field.siSuffixes && (
          <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
        )}
        {field.hint && (
          <small className="text-gray-400 block mt-1">{field.hint}</small>
        )}
        {renderWarning(field.name)}
      </div>
    ));

  return (
    <div>
      <h3 className="text-xl font-bold mb-3">{config.heading}</h3>

      <div className="mosfet-inputs">
        <div>
          <label className="mosfet-label">Select MOSFET</label>
          <select
            className="mosfet-select"
            value={mosfetName}
            onChange={handleMosfetSelect}
          >
            <option value="">-- Select a MOSFET --</option>
            <option value="custom">-- Custom MOSFET --</option>
            {Object.keys(presets).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {mosfetName === "custom" ? (
          <>
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <Tooltip text={getParameterTooltip("vth")}>
                <input
                  type="text"
                  name="vth"
                  className="mosfet-input"
                  value={mosfetDetails.vth}
                  onChange={handleCustomParamChange}
                  placeholder={config.vthPlaceholder}
                />
              </Tooltip>
              {config.vthHint && (
                <small className="text-gray-400 block mt-1">
                  {config.vthHint}
                </small>
              )}
              {renderWarning("vth")}
            </div>

            <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <Tooltip text={getParameterTooltip("rds_on")}>
                <input
                  type="text"
                  name="rds_on"
                  className="mosfet-input"
                  value={mosfetDetails.rds_on}
                  onChange={handleCustomParamChange}
                  placeholder="Enter on resistance (e.g., 22m)"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">
                Use k, M, m, u/µ
              </small>
              {renderWarning("rds_on")}
            </div>

            {renderVoltageFields()}
          </>
        ) : (
          mosfetName && (
            <>
              <div className="mt-4">
                <label className="mosfet-label">Threshold Voltage (Vth)</label>
                <Tooltip text={getParameterTooltip("vth")}>
                  <input
                    type="text"
                    className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                    value={formatValueWithSuffix(
                      parseFloat(mosfetDetails.vth || "NaN"),
                      "V",
                    )}
                    readOnly
                  />
                </Tooltip>
              </div>

              <div>
                <label className="mosfet-label">On Resistance (Rds_on)</label>
                <Tooltip text={getParameterTooltip("rds_on")}>
                  <input
                    type="text"
                    className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                    value={formatValueWithSuffix(
                      parseValueWithSuffix(mosfetDetails.rds_on || "0"),
                      "Ω",
                    )}
                    readOnly
                  />
                </Tooltip>
              </div>

              {renderVoltageFields()}
            </>
          )
        )}
      </div>
    </div>
  );
}
