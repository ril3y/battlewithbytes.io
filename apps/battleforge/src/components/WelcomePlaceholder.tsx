"use client";

import Image from "next/image";

interface WelcomePlaceholderProps {
  onGetStarted: () => void;
}

export function WelcomePlaceholder({ onGetStarted }: WelcomePlaceholderProps) {
  return (
    <div className="welcome-placeholder">
      <div className="welcome-content">
        <div className="welcome-logo">
          <Image
            src="/battleforge.png"
            alt="BattleForge Logo"
            width={120}
            height={120}
            priority
          />
        </div>
        <h2>Welcome to BattleForge</h2>
        <p>Browser-based embedded firmware development</p>
        <div className="welcome-steps">
          <div className="welcome-step">
            <span className="step-number">1</span>
            <span className="step-text">Select a target platform</span>
          </div>
          <div className="welcome-step">
            <span className="step-number">2</span>
            <span className="step-text">Write your C code</span>
          </div>
          <div className="welcome-step">
            <span className="step-number">3</span>
            <span className="step-text">Compile to ARM firmware</span>
          </div>
        </div>
        <button className="welcome-start-btn" onClick={onGetStarted}>
          Get Started
        </button>
      </div>

      <style jsx>{`
        .welcome-placeholder {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #0a0a0a 0%, #111 100%);
        }

        .welcome-content {
          text-align: center;
          max-width: 400px;
          padding: 40px;
        }

        .welcome-logo {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 24px;
        }

        .welcome-content h2 {
          margin: 0 0 8px 0;
          font-size: 1.8rem;
          font-weight: 600;
          color: #fff;
        }

        .welcome-content p {
          margin: 0 0 32px 0;
          font-size: 1rem;
          color: #888;
        }

        .welcome-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .welcome-step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #222;
          border-radius: 8px;
          text-align: left;
        }

        .step-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0, 255, 157, 0.15);
          border: 1px solid rgba(0, 255, 157, 0.3);
          color: #00ff9d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .step-text {
          color: #ccc;
          font-size: 0.9rem;
        }

        .welcome-start-btn {
          padding: 14px 32px;
          background: linear-gradient(135deg, #00ff9d 0%, #00cc7d 100%);
          border: none;
          border-radius: 8px;
          color: #000;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .welcome-start-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
