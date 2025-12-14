"use client";

import { useState } from "react";
import { useProject, ProjectProvider } from "../lib/project/ProjectContext";
import type { Project } from "../lib/project/types";
import { WelcomePage } from "./WelcomePage";
import { ProjectCreationWizard } from "./ProjectCreationWizard";
import { BattleForgeIDE } from "./BattleForgeIDE";

/**
 * Loading screen component
 */
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner" />
        <div className="loading-text">Loading BattleForge...</div>
      </div>

      <style jsx>{`
        .loading-screen {
          width: 100%;
          height: 100vh;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #222;
          border-top-color: #00ff9d;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          font-size: 1rem;
          color: #888;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

/**
 * Main BattleForge app content (wrapped in ProjectProvider)
 */
function BattleForgeAppContent() {
  const {
    currentProject,
    projects,
    isLoading,
    openProject,
    createProject,
    deleteProject,
  } = useProject();
  const [showWizard, setShowWizard] = useState(false);

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // No project = show welcome page
  if (!currentProject) {
    return (
      <>
        <WelcomePage
          onCreateProject={() => setShowWizard(true)}
          onOpenProject={openProject}
          onDeleteProject={deleteProject}
          recentProjects={projects}
        />
        {showWizard && (
          <ProjectCreationWizard
            isOpen={showWizard}
            onClose={() => setShowWizard(false)}
            onProjectCreated={async (project: Project) => {
              try {
                // The wizard creates the project object, we just need to save it
                // Use the template to create via context
                const template = {
                  id: project.metadata.templateId || "custom",
                  name: project.metadata.name,
                  description: "",
                  icon: "📄",
                  platformPreset: project.platform
                    ? {
                        platformId: project.platform.platformId,
                        familyId: project.platform.familyId,
                        deviceId: project.platform.deviceId,
                      }
                    : null,
                  files: project.files,
                };
                await createProject(
                  template,
                  project.metadata.name,
                  project.platform,
                );
                setShowWizard(false);
              } catch (error) {
                console.error("Failed to create project:", error);
              }
            }}
          />
        )}
      </>
    );
  }

  // Project active = show IDE
  return <BattleForgeIDE />;
}

/**
 * Main BattleForge app component with ProjectProvider
 */
export function BattleForgeApp() {
  return (
    <ProjectProvider>
      <BattleForgeAppContent />
    </ProjectProvider>
  );
}
