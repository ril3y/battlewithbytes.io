"use client";

import { useState, useCallback, useEffect } from "react";
import type { Project, ProjectTemplate } from "../../lib/project/types";
import type {
  BoardManifest,
  BoardIndexEntry,
  BoardExample,
} from "../../lib/registry/types";
import type { WizardState, PlatformOption } from "./types";
import { WIZARD_STEPS } from "./types";
import { PlatformSelector } from "./PlatformSelector";
import { BoardBrowser } from "./BoardBrowser";
import { FrameworkSelector } from "./FrameworkSelector";
import { ExamplePicker } from "./ExamplePicker";
import { ProjectDetailsForm } from "./ProjectDetailsForm";
import { GitHubRegistryFetcher } from "../../lib/registry/GitHubRegistryFetcher";
import { withBasePath } from "@battlewithbytes/utils";

interface BoardSelectionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export function BoardSelectionWizard({
  isOpen,
  onClose,
  onProjectCreated,
}: BoardSelectionWizardProps) {
  const [state, setState] = useState<WizardState>({
    currentStep: "platform",
    selectedPlatformId: null,
    selectedBoard: null,
    selectedFramework: null,
    selectedExample: null,
    projectName: "",
    projectDescription: "",
  });

  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);
  const [boards, setBoards] = useState<BoardIndexEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load registry on mount
  useEffect(() => {
    if (isOpen) {
      loadRegistry();
    }
  }, [isOpen]);

  const loadRegistry = async () => {
    try {
      setLoading(true);
      // Load registry from GitHub
      const fetcher = new GitHubRegistryFetcher();
      const registryData = await fetcher.fetchJson<{
        version: string;
        platforms: Array<{ id: string; configPath: string; boardsPath: string }>;
      }>("registry.json");

      // Load platform.json for each platform to get display metadata
      const platformList: PlatformOption[] = await Promise.all(
        (registryData.platforms || []).map(async (p) => {
          try {
            // Load platform config from GitHub
            const config = await fetcher.fetchJson<{
              name?: string;
              description?: string;
              icon?: string;
              color?: string;
              families?: string[];
            }>(p.configPath);

            // Load boards index to get board count
            let boardCount = 0;
            try {
              const boardsData = await fetcher.fetchJson<{ boards?: unknown[] }>(p.boardsPath);
              boardCount = boardsData.boards?.length || 0;
            } catch {
              // Ignore board count errors
            }

            return {
              id: p.id,
              name: config.name || p.id.toUpperCase(),
              description: config.description || "",
              icon: withBasePath(`/images/platforms/${config.icon || p.id}.svg`),
              color: config.color || "#333",
              supported: true,
              boardCount,
              indexPath: p.boardsPath,
            };
          } catch (err) {
            console.warn(`Failed to load platform ${p.id}:`, err);
            // Return fallback for failed platform
            return {
              id: p.id,
              name: p.id.toUpperCase(),
              description: "",
              icon: withBasePath(`/images/platforms/${p.id}.svg`),
              color: "#333",
              supported: true,
              boardCount: 0,
              indexPath: p.boardsPath,
            };
          }
        }),
      );

      setPlatforms(platformList);
      // Boards will be loaded when platform is selected
      setBoards([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const loadPlatformBoards = async (platformId: string, indexPath?: string) => {
    try {
      setLoadingBoards(true);
      setError(null);

      // Load boards from the platform's index file
      const fetcher = new GitHubRegistryFetcher();
      const path = indexPath || `${platformId}/index.json`;
      const data = await fetcher.fetchJson<{
        platform?: string;
        boards?: BoardIndexEntry[];
      }>(path);

      // Transform boards from platform index
      const basePlatform = data.platform || platformId.split("-")[0];
      const boardList: BoardIndexEntry[] = (data.boards || []).map(
        (b) => ({
          ...b,
          // Add platform field from index data for filtering
          platform: b.platform || basePlatform,
          // Ensure path doesn't have 'boards/' prefix
          path: b.path.replace(/^boards\//, ""),
        }),
      );

      setBoards(boardList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error loading boards");
      setBoards([]);
    } finally {
      setLoadingBoards(false);
    }
  };

  const handlePlatformSelect = useCallback(
    (platformId: string) => {
      setState((prev) => ({
        ...prev,
        selectedPlatformId: platformId,
        selectedBoard: null,
        selectedExample: null,
        currentStep: "board",
      }));
      // Find the platform to get its indexPath
      const platform = platforms.find((p) => p.id === platformId);
      // Load boards for selected platform using indexPath
      loadPlatformBoards(platformId, platform?.indexPath);
    },
    [platforms],
  );

  const handleBoardSelect = useCallback(async (board: BoardIndexEntry) => {
    try {
      setLoading(true);
      // Load full board manifest from GitHub
      const fetcher = new GitHubRegistryFetcher();
      const manifest = await fetcher.fetchJson<BoardManifest>(board.path);
      if (!manifest) throw new Error("Failed to load board");

      setState((prev) => ({
        ...prev,
        selectedBoard: manifest,
        selectedFramework: null,
        selectedExample: null,
        projectName: manifest.name.split(" ")[0] + " Project",
        currentStep: "framework",
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load board");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFrameworkSelect = useCallback((frameworkId: string) => {
    setState((prev) => ({
      ...prev,
      selectedFramework: frameworkId,
      selectedExample: null,
      currentStep: "example",
    }));
  }, []);

  const handleExampleSelect = useCallback((example: BoardExample | ProjectTemplate | null) => {
    setState((prev) => ({
      ...prev,
      selectedExample: example,
      projectName: example ? example.name : prev.projectName,
      currentStep: "details",
    }));
  }, []);

  const handleBack = useCallback(() => {
    setState((prev) => {
      const stepIndex = WIZARD_STEPS.findIndex(
        (s) => s.key === prev.currentStep,
      );
      if (stepIndex > 0) {
        const previousStep = WIZARD_STEPS[stepIndex - 1].key;
        // Clear boards when going back to platform selection
        if (previousStep === "platform") {
          setBoards([]);
        }
        return {
          ...prev,
          currentStep: previousStep,
        };
      }
      return prev;
    });
  }, []);

  const handleCreateProject = useCallback(() => {
    if (!state.selectedBoard || !state.projectName.trim()) return;

    const now = Date.now();
    const board = state.selectedBoard;
    const example = state.selectedExample;

    // Get files from example or create blank based on framework
    let files;
    if (example) {
      files = example.files.map((f) => ({
        path: f.path,
        content: f.content,
        editable: true,
      }));
    } else if (state.selectedFramework === "arduino") {
      // Arduino framework: .ino file with setup()/loop()
      files = [
        {
          path: "/src/main.ino",
          content: `/**
 * ${state.projectName}
 * Board: ${board.name}
 * Framework: Arduino
 */

void setup() {
  // Initialize your hardware here
}

void loop() {
  // Main loop - runs repeatedly
}
`,
          editable: true,
        },
      ];
    } else {
      // Native/bare-metal framework: .c file with main()
      files = [
        {
          path: "/src/main.c",
          content: `/**
 * ${state.projectName}
 * Board: ${board.name}
 * Framework: Native (Bare Metal)
 *
 * This is a minimal bare-metal template.
 * Add your startup code, vector table, and peripheral initialization.
 */

#include <stdint.h>

int main(void) {
    // Initialize hardware

    // Main loop
    while (1) {
        // Your code here
    }

    return 0;
}
`,
          editable: true,
        },
      ];
    }

    const project: Project = {
      metadata: {
        id: `project-${now}`,
        name: state.projectName.trim(),
        description: state.projectDescription.trim() || undefined,
        createdAt: now,
        updatedAt: now,
        templateId: example?.id,
      },
      platform: {
        platformId: board.chip.platform,
        familyId: board.chip.family,
        deviceId: board.chip.device,
        architecture: board.chip.architecture,
        frameworkId: (state.selectedFramework as "native" | "arduino") || "native",
      },
      files,
    };

    onProjectCreated(project);
    resetWizard();
  }, [state, onProjectCreated]);

  const resetWizard = () => {
    setState({
      currentStep: "platform",
      selectedPlatformId: null,
      selectedBoard: null,
      selectedFramework: null,
      selectedExample: null,
      projectName: "",
      projectDescription: "",
    });
    // Clear boards when resetting wizard
    setBoards([]);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  if (!isOpen) return null;

  const currentStepIndex = WIZARD_STEPS.findIndex(
    (s) => s.key === state.currentStep,
  );
  // Boards are already filtered by platform from loadPlatformBoards()
  // but keep filter as safeguard - compare using base platform ID
  const basePlatformId = state.selectedPlatformId?.split("-")[0];
  const filteredBoards = boards.filter(
    (b) => b.platform === basePlatformId || b.platform === state.selectedPlatformId,
  );

  return (
    <div className="wizard-overlay" onClick={handleClose}>
      <div className="wizard-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wizard-header">
          <h2>Create New Project</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="wizard-progress">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.key}
              className={`progress-step ${
                index < currentStepIndex
                  ? "completed"
                  : index === currentStepIndex
                    ? "active"
                    : ""
              }`}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="wizard-content">
          {(loading || loadingBoards) && (
            <div className="loading-overlay">
              <div className="spinner" />
              <span>{loadingBoards ? "Loading boards..." : "Loading..."}</span>
            </div>
          )}

          {error && (
            <div className="error-box">
              <span>{error}</span>
              <button onClick={loadRegistry}>Retry</button>
            </div>
          )}

          {state.currentStep === "platform" && (
            <PlatformSelector
              platforms={platforms}
              selectedId={state.selectedPlatformId}
              onSelect={handlePlatformSelect}
            />
          )}

          {state.currentStep === "board" && (
            <BoardBrowser
              boards={filteredBoards}
              onSelect={handleBoardSelect}
            />
          )}

          {state.currentStep === "framework" && state.selectedBoard && (
            <FrameworkSelector
              board={state.selectedBoard}
              selectedFramework={state.selectedFramework}
              onSelect={handleFrameworkSelect}
            />
          )}

          {state.currentStep === "example" && state.selectedBoard && (
            <ExamplePicker
              board={state.selectedBoard}
              selectedFramework={state.selectedFramework}
              selectedExample={state.selectedExample}
              onSelect={handleExampleSelect}
            />
          )}

          {state.currentStep === "details" && state.selectedBoard && (
            <ProjectDetailsForm
              board={state.selectedBoard}
              example={state.selectedExample}
              projectName={state.projectName}
              projectDescription={state.projectDescription}
              onNameChange={(name) =>
                setState((prev) => ({ ...prev, projectName: name }))
              }
              onDescriptionChange={(desc) =>
                setState((prev) => ({ ...prev, projectDescription: desc }))
              }
            />
          )}
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          {currentStepIndex > 0 && (
            <button className="back-btn" onClick={handleBack}>
              Back
            </button>
          )}
          <button className="cancel-btn" onClick={handleClose}>
            Cancel
          </button>
          {state.currentStep === "details" && (
            <button
              className="create-btn"
              onClick={handleCreateProject}
              disabled={!state.projectName.trim()}
            >
              Create Project
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .wizard-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .wizard-modal {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 12px;
          width: 95%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .wizard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid #1a1a1a;
          background: linear-gradient(180deg, #151515 0%, #0d0d0d 100%);
        }

        .wizard-header h2 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 600;
          color: #fff;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #666;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 4px 8px;
          line-height: 1;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #fff;
        }

        .wizard-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          border-bottom: 1px solid #1a1a1a;
          background: #0a0a0a;
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid #333;
          opacity: 0.5;
          transition: all 0.2s;
        }

        .progress-step.active {
          opacity: 1;
          border-color: #00ff9d;
          background: rgba(0, 255, 157, 0.1);
        }

        .progress-step.completed {
          opacity: 1;
          border-color: #00ff9d;
        }

        .step-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #333;
          color: #888;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .progress-step.active .step-number,
        .progress-step.completed .step-number {
          background: #00ff9d;
          color: #000;
        }

        .step-label {
          font-size: 0.85rem;
          color: #888;
          font-weight: 500;
        }

        .progress-step.active .step-label {
          color: #00ff9d;
        }

        .progress-step.completed .step-label {
          color: #fff;
        }

        .wizard-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          position: relative;
          min-height: 400px;
        }

        .loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          z-index: 10;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #333;
          border-top-color: #00ff9d;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-box {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .error-box button {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid #ef4444;
          border-radius: 4px;
          color: #ef4444;
          cursor: pointer;
        }

        .wizard-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #1a1a1a;
          background: #0a0a0a;
        }

        .back-btn {
          margin-right: auto;
          padding: 11px 24px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
          border: 1px solid #333;
          color: #888;
          transition: all 0.2s;
        }

        .back-btn:hover {
          border-color: #555;
          color: #fff;
        }

        .cancel-btn {
          padding: 11px 24px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
          border: 1px solid #333;
          color: #888;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          border-color: #555;
          color: #fff;
        }

        .create-btn {
          padding: 11px 24px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #0088ff 0%, #0066cc 100%);
          border: none;
          color: #fff;
          transition: all 0.2s;
        }

        .create-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .create-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
