/**
 * Analysis State Hook
 *
 * Manages firmware analysis prompts, progress, and auto-start state
 */

import { useState, useRef } from "react";
import { ArchitectureInfo } from "../../../lib/wasmAnalyzer";

export interface AnalysisProgress {
  stage: string;
  progress: number;
}

export interface AnalysisState {
  // State
  showAnalysisPrompt: boolean;
  detectedArchInfo: ArchitectureInfo | null;
  shouldAutoStartAnalysis: boolean;
  existingAnalysisDetected: boolean;
  showLoadingModal: boolean;
  loadingProgress: AnalysisProgress;
  hasAutoLoaded: boolean;

  // Setters
  setShowAnalysisPrompt: (show: boolean) => void;
  setDetectedArchInfo: (info: ArchitectureInfo | null) => void;
  setShouldAutoStartAnalysis: (should: boolean) => void;
  setExistingAnalysisDetected: (detected: boolean) => void;
  setShowLoadingModal: (show: boolean) => void;
  setLoadingProgress: (progress: AnalysisProgress) => void;
  setHasAutoLoaded: (loaded: boolean) => void;
}

export function useAnalysisState(): AnalysisState {
  const [showAnalysisPrompt, setShowAnalysisPrompt] = useState(false);
  const [detectedArchInfo, setDetectedArchInfo] =
    useState<ArchitectureInfo | null>(null);
  const [shouldAutoStartAnalysis, setShouldAutoStartAnalysis] = useState(false);
  const [existingAnalysisDetected, setExistingAnalysisDetected] =
    useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<AnalysisProgress>({
    stage: "",
    progress: 0,
  });

  const hasAutoLoadedRef = useRef(false);

  const setHasAutoLoaded = (loaded: boolean) => {
    hasAutoLoadedRef.current = loaded;
  };

  return {
    // State
    showAnalysisPrompt,
    detectedArchInfo,
    shouldAutoStartAnalysis,
    existingAnalysisDetected,
    showLoadingModal,
    loadingProgress,
    hasAutoLoaded: hasAutoLoadedRef.current,

    // Setters
    setShowAnalysisPrompt,
    setDetectedArchInfo,
    setShouldAutoStartAnalysis,
    setExistingAnalysisDetected,
    setShowLoadingModal,
    setLoadingProgress,
    setHasAutoLoaded,
  };
}
