"use client";

import { useState } from "react";
import Image from "next/image";
import { withBasePath } from "../lib/utils/basePath";

interface WelcomePageProps {
  onCreateProject: () => void;
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  recentProjects: Array<{
    id: string;
    name: string;
    platformId: string | null;
    deviceId: string | null;
    updatedAt: number;
  }>;
}

export function WelcomePage({
  onCreateProject,
  onOpenProject,
  onDeleteProject,
  recentProjects,
}: WelcomePageProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const formatLastModified = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    return "Just now";
  };

  const hasRecentProjects = recentProjects.length > 0;

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        {/* Main Welcome Section */}
        <div className="welcome-hero">
          <div className="welcome-logo">
            <Image
              src={withBasePath("/battleforge.png")}
              alt="BattleForge Logo"
              width={160}
              height={160}
              priority
            />
          </div>
          <h1 className="welcome-title">Welcome to BattleForge</h1>
          <p className="welcome-subtitle">
            Browser-based embedded firmware development
          </p>

          {/* Primary Action Buttons */}
          <div className="welcome-actions">
            <button className="btn-primary" onClick={onCreateProject}>
              Create New Project
            </button>
            {hasRecentProjects && (
              <button
                className="btn-secondary"
                onClick={() => {
                  // Open the most recent project
                  if (recentProjects[0]) {
                    onOpenProject(recentProjects[0].id);
                  }
                }}
              >
                Open Project
              </button>
            )}
          </div>
        </div>

        {/* Recent Projects Section */}
        {hasRecentProjects && (
          <div className="recent-projects-section">
            <h2 className="section-title">Recent Projects</h2>
            <div className="recent-projects-grid">
              {recentProjects.slice(0, 6).map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => onOpenProject(project.id)}
                >
                  <div className="project-card-header">
                    <div className="project-icon">📁</div>
                    <div className="project-info">
                      <div className="project-name">{project.name}</div>
                      <div className="project-meta">
                        {project.platformId && (
                          <span className="project-platform">
                            {project.deviceId || project.platformId}
                          </span>
                        )}
                        <span className="project-time">
                          {formatLastModified(project.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(project.id);
                      }}
                      title="Delete project"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {confirmDelete && (
          <div
            className="confirm-overlay"
            onClick={() => setConfirmDelete(null)}
          >
            <div
              className="confirm-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="confirm-title">Delete Project?</div>
              <div className="confirm-message">
                Are you sure you want to delete &quot;
                {recentProjects.find((p) => p.id === confirmDelete)?.name}&quot;?
                This action cannot be undone.
              </div>
              <div className="confirm-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-delete"
                  onClick={() => {
                    onDeleteProject(confirmDelete);
                    setConfirmDelete(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Start Guide */}
        <div className="quick-start-section">
          <h2 className="section-title">Quick Start</h2>
          <div className="quick-start-steps">
            <div className="quick-start-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-title">Create or open a project</div>
                <div className="step-description">
                  Start a new firmware project or continue working on an
                  existing one
                </div>
              </div>
            </div>
            <div className="quick-start-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-title">Write your C code</div>
                <div className="step-description">
                  Use our Monaco-based editor with syntax highlighting and
                  autocomplete
                </div>
              </div>
            </div>
            <div className="quick-start-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-title">Compile to ARM firmware</div>
                <div className="step-description">
                  Build and download ELF binaries ready to flash to your device
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .welcome-page {
          width: 100%;
          height: 100%;
          background: #0a0a0a;
          color: #ededed;
          overflow-y: auto;
          display: flex;
          justify-content: center;
          padding: 60px 20px;
        }

        .welcome-container {
          max-width: 900px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        /* Hero Section */
        .welcome-hero {
          text-align: center;
          padding: 40px 20px;
        }

        .welcome-logo {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 32px;
        }

        .welcome-title {
          margin: 0 0 12px 0;
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .welcome-subtitle {
          margin: 0 0 40px 0;
          font-size: 1.1rem;
          color: #888;
          font-weight: 400;
        }

        /* Action Buttons */
        .welcome-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
        }

        .btn-primary {
          padding: 16px 32px;
          background: linear-gradient(135deg, #00ff9d 0%, #00cc7d 100%);
          border: none;
          border-radius: 8px;
          color: #000;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 255, 157, 0.2);
        }

        .btn-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 255, 157, 0.3);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          padding: 16px 32px;
          background: transparent;
          border: 2px solid #333;
          border-radius: 8px;
          color: #ededed;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          border-color: #00ff9d;
          background: rgba(0, 255, 157, 0.05);
        }

        /* Recent Projects Section */
        .recent-projects-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #fff;
          padding-bottom: 12px;
          border-bottom: 1px solid #222;
        }

        .recent-projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .project-card {
          background: #111;
          border: 1px solid #222;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .project-card:hover {
          border-color: #00ff9d;
          background: #141414;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 255, 157, 0.1);
        }

        .project-card-header {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .project-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .project-info {
          flex: 1;
          min-width: 0;
        }

        .project-name {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .project-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.75rem;
          color: #666;
        }

        .project-platform {
          color: #888;
          background: #1a1a1a;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          width: fit-content;
        }

        .project-time {
          color: #666;
        }

        /* Quick Start Section */
        .quick-start-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .quick-start-steps {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .quick-start-step {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #111;
          border: 1px solid #222;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .quick-start-step:hover {
          border-color: #333;
          background: #141414;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0, 255, 157, 0.15);
          border: 2px solid rgba(0, 255, 157, 0.3);
          color: #00ff9d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .step-title {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
        }

        .step-description {
          font-size: 0.9rem;
          color: #888;
          line-height: 1.5;
        }

        /* Delete Button */
        .delete-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          padding: 4px 8px;
          border-radius: 4px;
          opacity: 0;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .project-card:hover .delete-btn {
          opacity: 0.6;
        }

        .delete-btn:hover {
          opacity: 1 !important;
          background: rgba(255, 100, 100, 0.2);
        }

        /* Confirmation Dialog */
        .confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .confirm-dialog {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
        }

        .confirm-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 12px;
        }

        .confirm-message {
          font-size: 0.9rem;
          color: #888;
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .confirm-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-cancel {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid #333;
          border-radius: 6px;
          color: #888;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #222;
          color: #fff;
        }

        .btn-delete {
          padding: 10px 20px;
          background: #ff4444;
          border: none;
          border-radius: 6px;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-delete:hover {
          background: #ff5555;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .welcome-page {
            padding: 40px 16px;
          }

          .welcome-title {
            font-size: 2rem;
          }

          .welcome-subtitle {
            font-size: 1rem;
          }

          .welcome-actions {
            flex-direction: column;
            width: 100%;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
          }

          .recent-projects-grid {
            grid-template-columns: 1fr;
          }

          .quick-start-step {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
