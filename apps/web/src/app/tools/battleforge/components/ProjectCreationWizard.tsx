"use client";

import { useState, useCallback } from "react";
import type { ProjectTemplate, Project } from "../lib/project/types";
import type {
  SelectedPlatform,
  PlatformRegistry,
  PlatformEntry,
  PlatformFamily,
  DeviceEntry,
} from "../lib/platform/types";
import { PROJECT_TEMPLATES } from "../lib/project/templates";

interface ProjectCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

type WizardStep = "template" | "platform" | "details";

export function ProjectCreationWizard({
  isOpen,
  onClose,
  onProjectCreated,
}: ProjectCreationWizardProps) {
  const [step, setStep] = useState<WizardStep>("template");
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProjectTemplate | null>(null);
  const [selectedPlatform, setSelectedPlatform] =
    useState<SelectedPlatform | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Platform selection state (reusing PlatformSelectorModal logic)
  const [registry, setRegistry] = useState<PlatformRegistry | null>(null);
  const [families, setFamilies] = useState<Map<string, PlatformFamily>>(
    new Map(),
  );
  const [currentPlatform, setCurrentPlatform] = useState<PlatformEntry | null>(
    null,
  );
  const [currentFamily, setCurrentFamily] = useState<PlatformFamily | null>(
    null,
  );
  const [currentDevice, setCurrentDevice] = useState<DeviceEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load registry when entering platform step
  const loadRegistry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/platforms/registry.json");
      if (!response.ok) throw new Error("Failed to load platform registry");
      const data = await response.json();
      setRegistry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load families for a platform
  const loadFamiliesForPlatform = useCallback(
    async (platform: PlatformEntry) => {
      setLoading(true);
      for (const familyId of platform.families) {
        const cacheKey = `${platform.id}/${familyId}`;
        if (!families.has(cacheKey)) {
          try {
            const response = await fetch(
              `/platforms/${platform.id}/${familyId}/family.json`,
            );
            if (response.ok) {
              const data = await response.json();
              setFamilies((prev) => new Map(prev).set(cacheKey, data));
            }
          } catch (err) {
            console.error("Failed to load family:", err);
          }
        }
      }
      setLoading(false);
    },
    [families],
  );

  // Handle template selection
  const handleTemplateSelect = useCallback(
    (template: ProjectTemplate) => {
      setSelectedTemplate(template);

      // If template has a platform preset, skip platform selection
      if (template.platformPreset) {
        setStep("details");
        setProjectName(template.name);
      } else {
        // Blank template - go to platform selection
        setStep("platform");
        setProjectName("My Project");
        // Load registry for platform step
        if (!registry) {
          loadRegistry();
        }
      }
    },
    [registry, loadRegistry],
  );

  // Handle platform selection
  const handlePlatformSelect = useCallback(
    async (platform: PlatformEntry) => {
      if (!platform.supported) return;

      setCurrentPlatform(platform);
      setCurrentFamily(null);
      setCurrentDevice(null);

      await loadFamiliesForPlatform(platform);
    },
    [loadFamiliesForPlatform],
  );

  // Handle family selection
  const handleFamilySelect = useCallback((family: PlatformFamily) => {
    setCurrentFamily(family);
    setCurrentDevice(null);
  }, []);

  // Handle device selection
  const handleDeviceSelect = useCallback((device: DeviceEntry) => {
    setCurrentDevice(device);
  }, []);

  // Apply platform selection and move to details
  const handlePlatformApply = useCallback(() => {
    if (!currentPlatform || !currentFamily || !currentDevice) return;

    const archConfigs: Record<
      string,
      {
        target: string;
        cpu: string;
        fpu?: string;
        float?: string;
        libPath: string;
      }
    > = {
      "cortex-m0": {
        target: "thumbv6m-none-eabi",
        cpu: "cortex-m0",
        libPath: "cortex-m0",
      },
      "cortex-m0+": {
        target: "thumbv6m-none-eabi",
        cpu: "cortex-m0plus",
        libPath: "cortex-m0",
      },
      "cortex-m3": {
        target: "thumbv7m-none-eabi",
        cpu: "cortex-m3",
        libPath: "cortex-m3",
      },
      "cortex-m4": {
        target: "thumbv7em-none-eabi",
        cpu: "cortex-m4",
        libPath: "cortex-m4",
      },
      "cortex-m4f": {
        target: "thumbv7em-none-eabihf",
        cpu: "cortex-m4",
        fpu: "fpv4-sp-d16",
        float: "hard",
        libPath: "cortex-m4f",
      },
      "cortex-m7": {
        target: "thumbv7em-none-eabi",
        cpu: "cortex-m7",
        libPath: "cortex-m7",
      },
      "cortex-m7f": {
        target: "thumbv7em-none-eabihf",
        cpu: "cortex-m7",
        fpu: "fpv5-d16",
        float: "hard",
        libPath: "cortex-m7f",
      },
    };

    const archConfig =
      archConfigs[currentFamily.architecture] || archConfigs["cortex-m3"];

    setSelectedPlatform({
      platformId: currentPlatform.id,
      familyId: currentFamily.id,
      deviceId: currentDevice.id,
      family: currentFamily,
      device: currentDevice,
      archConfig,
    });

    setStep("details");
  }, [currentPlatform, currentFamily, currentDevice]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (step === "details") {
      if (selectedTemplate?.platformPreset) {
        setStep("template");
      } else {
        setStep("platform");
      }
    } else if (step === "platform") {
      setStep("template");
    }
  }, [step, selectedTemplate]);

  // Create project
  const handleCreateProject = useCallback(() => {
    if (!selectedTemplate || !projectName.trim()) return;

    const now = Date.now();
    const project: Project = {
      metadata: {
        id: `project-${now}`,
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        createdAt: now,
        updatedAt: now,
        templateId: selectedTemplate.id,
      },
      platform:
        selectedTemplate.platformPreset || selectedPlatform
          ? {
              platformId:
                selectedTemplate.platformPreset?.platformId ||
                selectedPlatform!.platformId,
              familyId:
                selectedTemplate.platformPreset?.familyId ||
                selectedPlatform!.familyId,
              deviceId:
                selectedTemplate.platformPreset?.deviceId ||
                selectedPlatform!.deviceId,
              architecture:
                selectedPlatform?.family.architecture || "cortex-m3",
            }
          : null,
      files: [...selectedTemplate.files],
    };

    onProjectCreated(project);

    // Reset wizard state
    setStep("template");
    setSelectedTemplate(null);
    setSelectedPlatform(null);
    setProjectName("");
    setProjectDescription("");
    setCurrentPlatform(null);
    setCurrentFamily(null);
    setCurrentDevice(null);
  }, [
    selectedTemplate,
    selectedPlatform,
    projectName,
    projectDescription,
    onProjectCreated,
  ]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const availableFamilies = currentPlatform
    ? currentPlatform.families
        .map((fid) => families.get(`${currentPlatform.id}/${fid}`))
        .filter((f): f is PlatformFamily => f !== undefined)
    : [];

  const canApplyPlatform = currentPlatform && currentFamily && currentDevice;
  const canCreateProject = selectedTemplate && projectName.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content wizard-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="wizard-steps">
          <div
            className={`wizard-step-indicator ${step === "template" ? "active" : ""} ${selectedTemplate ? "completed" : ""}`}
          >
            <span className="step-number">1</span>
            <span className="step-label">Template</span>
          </div>
          {!selectedTemplate?.platformPreset && (
            <div
              className={`wizard-step-indicator ${step === "platform" ? "active" : ""} ${selectedPlatform ? "completed" : ""}`}
            >
              <span className="step-number">2</span>
              <span className="step-label">Platform</span>
            </div>
          )}
          <div
            className={`wizard-step-indicator ${step === "details" ? "active" : ""}`}
          >
            <span className="step-number">
              {selectedTemplate?.platformPreset ? "2" : "3"}
            </span>
            <span className="step-label">Details</span>
          </div>
        </div>

        <div className="modal-body">
          {/* Step 1: Template Selection */}
          {step === "template" && (
            <div className="wizard-step">
              <h3 className="step-title">Choose a Template</h3>
              <div className="template-grid">
                {PROJECT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    className={`template-card ${selectedTemplate?.id === template.id ? "selected" : ""}`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="template-icon">{template.icon}</div>
                    <div className="template-name">{template.name}</div>
                    <div className="template-desc">{template.description}</div>
                    {template.platformPreset && (
                      <div className="template-badge">Platform Included</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Platform Selection (only for blank template) */}
          {step === "platform" && (
            <div className="wizard-step">
              <h3 className="step-title">Select Target Platform</h3>

              {loading && !registry && (
                <div className="loading">
                  <div className="spinner" />
                  <span>Loading platforms...</span>
                </div>
              )}

              {error && (
                <div className="error-box">
                  <span>{error}</span>
                  <button onClick={loadRegistry}>Retry</button>
                </div>
              )}

              {registry && (
                <>
                  {/* Platform Selection */}
                  <div className="section">
                    <label className="section-label">Platform</label>
                    <div className="platform-row">
                      {registry.platforms.map((platform) => (
                        <button
                          key={platform.id}
                          className={`platform-btn ${currentPlatform?.id === platform.id ? "selected" : ""} ${!platform.supported ? "disabled" : ""}`}
                          onClick={() => handlePlatformSelect(platform)}
                          disabled={!platform.supported}
                        >
                          <div className="platform-icon">
                            {platform.id === "stm32" && (
                              <img
                                src="/platforms/icons/st.ico"
                                alt="STMicroelectronics"
                              />
                            )}
                            {platform.id === "esp32" && (
                              <img
                                src="/platforms/icons/espressif.png"
                                alt="Espressif"
                              />
                            )}
                            {platform.id === "nrf" && (
                              <img
                                src="/platforms/icons/nordic.png"
                                alt="Nordic Semiconductor"
                              />
                            )}
                            {platform.id === "rp2040" && (
                              <img
                                src="/platforms/icons/raspberrypi.png"
                                alt="Raspberry Pi"
                              />
                            )}
                          </div>
                          <span className="platform-name">{platform.name}</span>
                          {platform.comingSoon && (
                            <span className="coming-soon-badge">Soon</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Family Selection */}
                  {currentPlatform && (
                    <div className="section">
                      <label className="section-label">Family</label>
                      {loading ? (
                        <div className="inline-loading">
                          Loading families...
                        </div>
                      ) : availableFamilies.length > 0 ? (
                        <div className="family-row">
                          {availableFamilies.map((family) => (
                            <button
                              key={family.id}
                              className={`family-btn ${currentFamily?.id === family.id ? "selected" : ""}`}
                              onClick={() => handleFamilySelect(family)}
                            >
                              <span className="family-name">{family.name}</span>
                              <span className="family-arch">
                                {family.architecture}
                              </span>
                              <span className="family-devices">
                                {family.devices.length} devices
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="no-data">No families available</div>
                      )}
                    </div>
                  )}

                  {/* Device Selection */}
                  {currentFamily && (
                    <div className="section">
                      <label className="section-label">Device</label>
                      <div className="device-grid">
                        {currentFamily.devices.map((device) => (
                          <button
                            key={device.id}
                            className={`device-btn ${currentDevice?.id === device.id ? "selected" : ""}`}
                            onClick={() => handleDeviceSelect(device)}
                          >
                            <span className="device-name">{device.name}</span>
                            <span className="device-desc">
                              {device.description}
                            </span>
                            <div className="device-specs">
                              <span className="spec">
                                {formatBytes(device.flash)} Flash
                              </span>
                              <span className="spec">
                                {formatBytes(device.ram)} RAM
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selection Summary */}
                  {canApplyPlatform && (
                    <div className="summary-bar">
                      <div className="summary-path">
                        <span>{currentPlatform!.name}</span>
                        <span className="sep">→</span>
                        <span>{currentFamily!.name}</span>
                        <span className="sep">→</span>
                        <span className="highlight">{currentDevice!.name}</span>
                      </div>
                      <div className="summary-stats">
                        <span>{formatBytes(currentDevice!.flash)} Flash</span>
                        <span>{formatBytes(currentDevice!.ram)} RAM</span>
                        <span>{currentFamily!.architecture}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 3: Project Details */}
          {step === "details" && (
            <div className="wizard-step">
              <h3 className="step-title">Project Details</h3>

              <div className="form-section">
                <label className="form-label">
                  Project Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  autoFocus
                />
              </div>

              <div className="form-section">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your project..."
                  rows={3}
                />
              </div>

              <div className="summary-section">
                <h4 className="summary-title">Project Summary</h4>
                <div className="summary-items">
                  <div className="summary-item">
                    <span className="summary-item-label">Template:</span>
                    <span className="summary-item-value">
                      {selectedTemplate?.icon} {selectedTemplate?.name}
                    </span>
                  </div>
                  {(selectedTemplate?.platformPreset || selectedPlatform) && (
                    <div className="summary-item">
                      <span className="summary-item-label">Platform:</span>
                      <span className="summary-item-value">
                        {selectedTemplate?.platformPreset
                          ? `STM32 F1 Series`
                          : `${currentPlatform?.name} → ${currentFamily?.name} → ${currentDevice?.name}`}
                      </span>
                    </div>
                  )}
                  <div className="summary-item">
                    <span className="summary-item-label">Files:</span>
                    <span className="summary-item-value">
                      {selectedTemplate?.files.length || 0} file(s)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step !== "template" && (
            <button className="back-btn" onClick={handleBack}>
              Back
            </button>
          )}
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          {step === "platform" && (
            <button
              className="apply-btn"
              onClick={handlePlatformApply}
              disabled={!canApplyPlatform}
            >
              Continue
            </button>
          )}
          {step === "details" && (
            <button
              className="apply-btn create-btn"
              onClick={handleCreateProject}
              disabled={!canCreateProject}
            >
              Create Project
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 12px;
          width: 90%;
          max-width: 700px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid #1a1a1a;
          background: linear-gradient(180deg, #151515 0%, #0d0d0d 100%);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-header h2::before {
          content: "";
          display: block;
          width: 3px;
          height: 18px;
          background: #00ff9d;
          border-radius: 2px;
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

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #1a1a1a;
          background: #0a0a0a;
        }

        .cancel-btn {
          padding: 11px 24px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          border: 1px solid #333;
          color: #888;
        }

        .cancel-btn:hover {
          border-color: #555;
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
        }

        .apply-btn {
          padding: 11px 24px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: linear-gradient(135deg, #00ff9d 0%, #00cc7d 100%);
          border: none;
          color: #000;
        }

        .apply-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .apply-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .wizard-modal {
          max-width: 800px;
          max-height: 90vh;
        }

        .wizard-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 20px 24px;
          border-bottom: 1px solid #1a1a1a;
          background: #0a0a0a;
        }

        .wizard-step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid #333;
          transition: all 0.2s;
          opacity: 0.5;
        }

        .wizard-step-indicator.active {
          opacity: 1;
          border-color: #00ff9d;
          background: rgba(0, 255, 157, 0.1);
        }

        .wizard-step-indicator.completed {
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

        .wizard-step-indicator.active .step-number {
          background: #00ff9d;
          color: #000;
        }

        .wizard-step-indicator.completed .step-number {
          background: #00ff9d;
          color: #000;
        }

        .step-label {
          font-size: 0.85rem;
          color: #888;
          font-weight: 500;
        }

        .wizard-step-indicator.active .step-label {
          color: #00ff9d;
        }

        .wizard-step-indicator.completed .step-label {
          color: #fff;
        }

        .wizard-step {
          padding: 20px 0;
        }

        .step-title {
          margin: 0 0 20px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .template-card {
          background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
          border: 2px solid #2a2a2a;
          border-radius: 10px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
        }

        .template-card:hover {
          border-color: #00ff9d;
          background: linear-gradient(180deg, #1f1f1f 0%, #151515 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 255, 157, 0.15);
        }

        .template-card.selected {
          border-color: #00ff9d;
          background: linear-gradient(
            180deg,
            rgba(0, 255, 157, 0.15) 0%,
            rgba(0, 255, 157, 0.05) 100%
          );
          box-shadow: 0 0 20px rgba(0, 255, 157, 0.2);
        }

        .template-icon {
          font-size: 3rem;
          margin-bottom: 8px;
        }

        .template-name {
          font-size: 1rem;
          font-weight: 600;
          color: #e0e0e0;
        }

        .template-card.selected .template-name {
          color: #fff;
        }

        .template-desc {
          font-size: 0.8rem;
          color: #666;
          line-height: 1.4;
        }

        .template-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 0.6rem;
          font-weight: 600;
          padding: 3px 6px;
          background: rgba(0, 136, 255, 0.15);
          color: #0088ff;
          border-radius: 4px;
          border: 1px solid rgba(0, 136, 255, 0.3);
        }

        .form-section {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #ccc;
          margin-bottom: 8px;
        }

        .required {
          color: #ff4444;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 6px;
          color: #fff;
          font-size: 0.9rem;
          font-family: inherit;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #00ff9d;
          background: #0a0a0a;
        }

        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 6px;
          color: #fff;
          font-size: 0.9rem;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #00ff9d;
          background: #0a0a0a;
        }

        .summary-section {
          margin-top: 24px;
          padding: 16px;
          background: rgba(0, 255, 157, 0.05);
          border: 1px solid rgba(0, 255, 157, 0.2);
          border-radius: 8px;
        }

        .summary-title {
          margin: 0 0 12px 0;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #00ff9d;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }

        .summary-item-label {
          color: #888;
          font-weight: 500;
        }

        .summary-item-value {
          color: #fff;
          font-weight: 600;
        }

        .back-btn {
          padding: 11px 24px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          border: 1px solid #333;
          color: #888;
          margin-right: auto;
        }

        .back-btn:hover {
          border-color: #555;
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
        }

        .create-btn {
          background: linear-gradient(135deg, #0088ff 0%, #0066cc 100%);
          box-shadow: 0 4px 15px rgba(0, 136, 255, 0.3);
        }

        .create-btn:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(0, 136, 255, 0.4);
        }

        /* Platform Selection Styles */
        .section {
          margin-bottom: 24px;
        }

        .section-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #888;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .platform-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }

        .platform-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 16px 12px;
          background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
          border: 2px solid #2a2a2a;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          min-height: 120px;
        }

        .platform-btn:hover:not(.disabled) {
          border-color: #00ff9d;
          background: linear-gradient(180deg, #1f1f1f 0%, #151515 100%);
          transform: translateY(-2px);
        }

        .platform-btn.selected {
          border-color: #00ff9d;
          background: linear-gradient(
            180deg,
            rgba(0, 255, 157, 0.15) 0%,
            rgba(0, 255, 157, 0.05) 100%
          );
          box-shadow: 0 0 20px rgba(0, 255, 157, 0.2);
        }

        .platform-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .platform-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .platform-icon img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .platform-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #e0e0e0;
          text-align: center;
          line-height: 1.3;
        }

        .platform-btn.selected .platform-name {
          color: #fff;
        }

        .coming-soon-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 2px 6px;
          background: rgba(255, 170, 0, 0.2);
          color: #ffaa00;
          border-radius: 4px;
          border: 1px solid rgba(255, 170, 0, 0.3);
          text-transform: uppercase;
        }

        /* Family Selection Styles */
        .family-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .family-btn {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px 16px;
          background: #1a1a1a;
          border: 2px solid #2a2a2a;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .family-btn:hover {
          border-color: #00ff9d;
          background: #1f1f1f;
        }

        .family-btn.selected {
          border-color: #00ff9d;
          background: rgba(0, 255, 157, 0.1);
        }

        .family-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
        }

        .family-arch {
          font-size: 0.75rem;
          color: #00ff9d;
          font-family: monospace;
        }

        .family-devices {
          font-size: 0.7rem;
          color: #666;
        }

        /* Device Selection Styles */
        .device-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .device-btn {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px 16px;
          background: #1a1a1a;
          border: 2px solid #2a2a2a;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .device-btn:hover {
          border-color: #00ff9d;
          background: #1f1f1f;
        }

        .device-btn.selected {
          border-color: #00ff9d;
          background: rgba(0, 255, 157, 0.1);
        }

        .device-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
        }

        .device-desc {
          font-size: 0.75rem;
          color: #888;
        }

        .device-specs {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        .device-specs .spec {
          font-size: 0.7rem;
          color: #666;
          padding: 2px 6px;
          background: #0a0a0a;
          border-radius: 4px;
        }

        .inline-loading,
        .no-data {
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 0.85rem;
        }

        .selection-summary {
          padding: 16px;
          background: rgba(0, 255, 157, 0.05);
          border: 1px solid rgba(0, 255, 157, 0.2);
          border-radius: 8px;
          margin-top: 16px;
        }

        .selection-summary-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #00ff9d;
          margin-bottom: 12px;
        }

        .selection-summary-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.85rem;
        }

        .selection-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .selection-summary-row .label {
          color: #888;
        }

        .selection-summary-row .value {
          color: #fff;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
