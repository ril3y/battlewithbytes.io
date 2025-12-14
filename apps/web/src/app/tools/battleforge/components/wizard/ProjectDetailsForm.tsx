"use client";

import type { BoardManifest, BoardExample } from "../../lib/registry/types";

interface ProjectDetailsFormProps {
  board: BoardManifest;
  example: BoardExample | null;
  projectName: string;
  projectDescription: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function ProjectDetailsForm({
  board,
  example,
  projectName,
  projectDescription,
  onNameChange,
  onDescriptionChange,
}: ProjectDetailsFormProps) {
  return (
    <div className="project-details-form">
      <h3 className="step-title">Project Details</h3>
      <p className="step-subtitle">
        Review your selections and name your project
      </p>

      {/* Summary */}
      <div className="summary-section">
        <h4 className="section-label">Configuration Summary</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Platform</span>
            <span className="summary-value">{board.chip.platform.toUpperCase()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Board</span>
            <span className="summary-value">{board.name}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Architecture</span>
            <span className="summary-value">{board.chip.architecture}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Template</span>
            <span className="summary-value">{example?.name || "Blank Project"}</span>
          </div>
        </div>
      </div>

      {/* Board info card */}
      <div className="board-info-card">
        <div className="board-image">
          {board.assets?.image ? (
            <img src={board.assets.image} alt={board.name} />
          ) : board.assets?.thumbnail ? (
            <img src={board.assets.thumbnail} alt={board.name} />
          ) : (
            <div className="placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <circle cx="16" cy="8" r="1.5" fill="currentColor" />
                <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                <circle cx="16" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </div>
          )}
        </div>
        <div className="board-details">
          <div className="board-name">{board.name}</div>
          <div className="board-desc">{board.description}</div>
          {board.features && board.features.length > 0 && (
            <div className="board-features">
              {board.features.slice(0, 6).map((feature) => (
                <span key={feature} className="feature-tag">
                  {feature}
                </span>
              ))}
            </div>
          )}
          <div className="board-links">
            {board.documentation?.productPage && (
              <a
                href={board.documentation.productPage}
                target="_blank"
                rel="noopener noreferrer"
                className="doc-link"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15,3 21,3 21,9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Product Page
              </a>
            )}
            {board.documentation?.pinout && (
              <a
                href={board.documentation.pinout}
                target="_blank"
                rel="noopener noreferrer"
                className="doc-link"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                Pinout
              </a>
            )}
            {board.documentation?.datasheet && (
              <a
                href={board.documentation.datasheet}
                target="_blank"
                rel="noopener noreferrer"
                className="doc-link"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                Datasheet
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="form-section">
        <h4 className="section-label">Project Information</h4>

        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input
            type="text"
            className="form-input"
            value={projectName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="My Project"
            maxLength={64}
          />
          <div className="input-hint">
            Choose a descriptive name for your project
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <textarea
            className="form-textarea"
            value={projectDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="A brief description of what your project does..."
            rows={3}
            maxLength={256}
          />
        </div>
      </div>

      {/* Example preview */}
      {example && example.files.length > 0 && (
        <div className="example-preview">
          <h4 className="section-label">Template Preview</h4>
          <div className="file-preview">
            <div className="file-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <span>{example.files[0].path}</span>
            </div>
            <pre className="file-content">
              <code>{example.files[0].content.slice(0, 500)}</code>
              {example.files[0].content.length > 500 && (
                <span className="truncated">... (truncated)</span>
              )}
            </pre>
          </div>
        </div>
      )}

      <style jsx>{`
        .project-details-form {
          padding: 20px 0;
        }

        .step-title {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
        }

        .step-subtitle {
          margin: 0 0 24px 0;
          font-size: 0.9rem;
          color: #888;
        }

        .section-label {
          margin: 0 0 12px 0;
          font-size: 0.85rem;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-section {
          margin-bottom: 24px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .summary-item {
          padding: 12px 16px;
          background: #0a0a0a;
          border: 1px solid #222;
          border-radius: 8px;
        }

        .summary-label {
          display: block;
          font-size: 0.7rem;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .summary-value {
          display: block;
          font-size: 0.9rem;
          color: #fff;
          font-weight: 500;
        }

        .board-info-card {
          display: flex;
          gap: 20px;
          padding: 20px;
          background: linear-gradient(180deg, #151515 0%, #0d0d0d 100%);
          border: 1px solid #222;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .board-image {
          width: 160px;
          height: 120px;
          border-radius: 8px;
          background: #0a0a0a;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .board-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .placeholder {
          width: 64px;
          height: 64px;
          color: #333;
        }

        .board-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .board-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
        }

        .board-desc {
          font-size: 0.85rem;
          color: #888;
          line-height: 1.4;
        }

        .board-features {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .feature-tag {
          font-size: 0.7rem;
          padding: 3px 10px;
          background: rgba(0, 255, 157, 0.1);
          color: #00ff9d;
          border-radius: 4px;
        }

        .board-links {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .doc-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #0088ff;
          text-decoration: none;
          transition: color 0.2s;
        }

        .doc-link:hover {
          color: #00aaff;
        }

        .doc-link svg {
          width: 14px;
          height: 14px;
        }

        .form-section {
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          font-size: 0.9rem;
          color: #e0e0e0;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 0.95rem;
        }

        .form-input:focus {
          outline: none;
          border-color: #00ff9d;
        }

        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 0.9rem;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #00ff9d;
        }

        .input-hint {
          margin-top: 6px;
          font-size: 0.75rem;
          color: #666;
        }

        .example-preview {
          margin-top: 24px;
        }

        .file-preview {
          background: #0a0a0a;
          border: 1px solid #222;
          border-radius: 8px;
          overflow: hidden;
        }

        .file-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #151515;
          border-bottom: 1px solid #222;
          font-size: 0.8rem;
          color: #888;
        }

        .file-header svg {
          width: 14px;
          height: 14px;
        }

        .file-content {
          padding: 16px;
          margin: 0;
          font-size: 0.75rem;
          line-height: 1.5;
          color: #a0a0a0;
          overflow-x: auto;
          max-height: 200px;
          overflow-y: auto;
        }

        .file-content code {
          font-family: "Fira Code", "Consolas", monospace;
        }

        .truncated {
          color: #555;
          font-style: italic;
        }

        @media (max-width: 640px) {
          .board-info-card {
            flex-direction: column;
          }

          .board-image {
            width: 100%;
            height: 160px;
          }
        }
      `}</style>
    </div>
  );
}
