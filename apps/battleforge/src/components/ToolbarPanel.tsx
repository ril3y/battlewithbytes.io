"use client";

import Image from "next/image";
import battleforgeLogo from "../battleforge.png";

interface ToolbarPanelProps {
  onLoadCompiler: () => void;
  onCompile: () => void;
  onClean?: () => void;
  onFlash: () => void;
  onSave?: () => void;
  onCloseProject?: () => void;
  onEditProject?: () => void;
  onOpenWasmTools?: () => void;
  isLoading?: boolean;
  compilerReady?: boolean;
  canSave?: boolean;
  hasBuildArtifacts?: boolean;
}

export function ToolbarPanel({
  onLoadCompiler,
  onCompile,
  onClean,
  onFlash,
  onSave,
  onCloseProject,
  onEditProject,
  onOpenWasmTools,
  isLoading,
  compilerReady,
  canSave,
  hasBuildArtifacts,
}: ToolbarPanelProps) {
  // Show simplified loading view when compiler is loading
  if (isLoading) {
    return (
      <div className="toolbar toolbar-loading">
        <Image
          src={battleforgeLogo}
          alt="BattleForge"
          height={80}
          className="toolbar-logo"
          style={{ marginRight: "20px" }}
        />
        <div className="toolbar-loading-indicator">
          <span className="loading-spinner-small" />
          <span>Loading Compiler...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="toolbar">
      <Image
        src={battleforgeLogo}
        alt="BattleForge"
        height={80}
        className="toolbar-logo"
        style={{ marginRight: "20px" }}
      />
      {!compilerReady && (
        <button onClick={onLoadCompiler}>Load Compiler</button>
      )}
      <button
        onClick={onCompile}
        disabled={!compilerReady}
        style={{ opacity: compilerReady ? 1 : 0.5 }}
      >
        Compile
      </button>
      <button
        onClick={onClean}
        disabled={!hasBuildArtifacts}
        style={{ opacity: hasBuildArtifacts ? 1 : 0.5 }}
      >
        Clean
      </button>
      <button
        onClick={onFlash}
        disabled={!compilerReady}
        style={{ opacity: compilerReady ? 1 : 0.5 }}
      >
        Flash
      </button>
      <button
        onClick={onSave}
        disabled={!canSave}
        style={{ opacity: canSave ? 1 : 0.5 }}
      >
        Save
      </button>
      <div style={{ flex: 1 }} />
      <button onClick={onOpenWasmTools}>WASM Tools</button>
      <button onClick={onEditProject}>Edit Project</button>
      <button onClick={onCloseProject}>Close Project</button>
    </div>
  );
}
