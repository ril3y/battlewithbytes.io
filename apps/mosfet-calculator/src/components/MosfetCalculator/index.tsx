"use client";

import React, { useState, useMemo } from "react";
import {
  calculateNChannelConduction,
  calculatePChannelConduction,
  parseSiPrefixedValue,
} from "./mosfetUtils";
import MosfetTypeSelector from "./MosfetTypeSelector";
import MosfetDiagram from "./MosfetDiagram";
import NChannelMosfetConfiguration from "./NChannelMosfetConfiguration";
import PChannelMosfetConfiguration from "./PChannelMosfetConfiguration";
import Description from "./Description";
import type { MosfetDetails, MosfetInputValues } from "@/types/tools";
import "./styles.css";

const EMPTY_DETAILS: MosfetDetails = { vth: "", rds_on: "" };
const EMPTY_INPUTS: MosfetInputValues = {
  vg: "",
  vcc: "",
  vd: "",
  vs: "0",
  loadResistance: "",
};

const EMPTY_RESULTS = {
  description: "Please select a MOSFET and provide valid numeric input values.",
  conducting: null as boolean | null,
  voltageAcrossLoad: "",
  powerDissipated: "",
  currentThroughLoad: "",
  vgs: "",
  id: "",
  vd: "",
};

export default function MosfetCalculator() {
  const [mosfetType, setMosfetType] = useState<string>("n-channel");
  const [mosfetName, setMosfetName] = useState<string>("");
  const [mosfetDetails, setMosfetDetails] =
    useState<MosfetDetails>(EMPTY_DETAILS);
  const [inputValues, setInputValues] =
    useState<MosfetInputValues>(EMPTY_INPUTS);

  const handleMosfetTypeChange = (type: string) => {
    setMosfetType(type);
    setMosfetName("");
    setMosfetDetails(EMPTY_DETAILS);
    setInputValues(EMPTY_INPUTS);
  };

  const handleMosfetDetailsChange = (name: string, details: MosfetDetails) => {
    setMosfetName(name);
    setMosfetDetails(details);
  };

  const handleInputChange = (name: string, value: string) => {
    setInputValues({ ...inputValues, [name]: value });
  };

  // Every displayed result is a pure function of the selected MOSFET and
  // the input values, so derive them in one place instead of fanning out
  // into per-field state from an effect.
  const results = useMemo(() => {
    const vth = parseFloat(mosfetDetails.vth);
    const rds_on = parseSiPrefixedValue(mosfetDetails.rds_on);
    const vg = parseFloat(inputValues.vg);
    const vs = parseFloat(inputValues.vs);
    const loadResistanceNum = parseSiPrefixedValue(inputValues.loadResistance);
    const numericLoadResistance = isNaN(loadResistanceNum)
      ? null
      : loadResistanceNum;

    let vccNum = NaN;
    if (mosfetType === "n-channel") {
      vccNum = parseFloat(inputValues.vcc);
    }

    const hasRequiredDetails = !isNaN(vth) && !isNaN(rds_on);
    const hasRequiredInputs =
      mosfetType === "n-channel"
        ? !isNaN(vg) &&
          !isNaN(vs) &&
          !isNaN(vccNum) &&
          !isNaN(loadResistanceNum)
        : !isNaN(vg) && !isNaN(vs) && !isNaN(loadResistanceNum);

    if (!hasRequiredDetails || !hasRequiredInputs) {
      return { ...EMPTY_RESULTS, numericLoadResistance };
    }

    const calc =
      mosfetType === "n-channel"
        ? calculateNChannelConduction(
            vth,
            vg,
            vs,
            vccNum,
            loadResistanceNum,
            rds_on,
          )
        : calculatePChannelConduction(vth, vg, vs, loadResistanceNum, rds_on);

    return {
      description: calc.description || "",
      conducting: calc.conducting,
      voltageAcrossLoad: calc.voltageAcrossLoad || "",
      powerDissipated: calc.powerDissipated || "",
      currentThroughLoad: calc.currentThroughLoad || "",
      vgs: calc.vgs || "",
      id: calc.id || "",
      vd: calc.vd || "",
      numericLoadResistance,
    };
  }, [mosfetType, inputValues, mosfetDetails]);

  return (
    <div className="mosfet-calculator">
      <div className="mosfet-container">
        <div className="mosfet-left-section">
          <MosfetTypeSelector
            mosfetType={mosfetType}
            onTypeChange={handleMosfetTypeChange}
          />
          <MosfetDiagram mosfetType={mosfetType} inputValues={inputValues} />
        </div>
        <div className="mosfet-right-section">
          {mosfetType === "n-channel" ? (
            <NChannelMosfetConfiguration
              mosfetName={mosfetName}
              mosfetDetails={mosfetDetails}
              inputValues={inputValues}
              onDetailsChange={handleMosfetDetailsChange}
              onInputChange={handleInputChange}
            />
          ) : (
            <PChannelMosfetConfiguration
              mosfetName={mosfetName}
              mosfetDetails={mosfetDetails}
              inputValues={inputValues}
              onDetailsChange={handleMosfetDetailsChange}
              onInputChange={handleInputChange}
            />
          )}
        </div>
      </div>
      <Description
        description={results.description}
        conducting={results.conducting}
        voltageAcrossLoad={results.voltageAcrossLoad}
        powerDissipated={results.powerDissipated}
        currentThroughLoad={results.currentThroughLoad}
        vgs={results.vgs}
        id={results.id}
        vd={results.vd}
        mosfetDetails={mosfetDetails}
        mosfetType={mosfetType}
        loadResistance={results.numericLoadResistance}
      />
    </div>
  );
}
