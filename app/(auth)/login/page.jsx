"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #a8d8f0 0%, #c8e8f8 40%, #e8f4fd 70%, #f0f8ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .cloud {
          position: absolute;
          background: white;
          border-radius: 50px;
          opacity: 0.55;
          filter: blur(2px);
        }
        .cloud::before, .cloud::after {
          content: '';
          position: absolute;
          background: white;
          border-radius: 50%;
        }

        .login-card {
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 28px;
          padding: 48px 44px;
          width: 100%;
          max-width: 420px;
          box-shadow: 
            0 8px 32px rgba(100,160,210,0.15),
            0 2px 8px rgba(100,160,210,0.1),
            inset 0 1px 0 rgba(255,255,255,0.8);
          position: relative;
          z-index: 10;
          animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .icon-wrap {
          width: 56px;
          height: 56px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 2px 12px rgba(100,160,210,0.2);
        }

        h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #1a2a3a;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: -0.3px;
        }

        .subtitle {
          font-size: 14px;
          color: #6b8090;
          text-align: center;
          line-height: 1.5;
          margin-bottom: 36px;
          font-weight: 400;
        }

        .github-btn {
          width: 100%;
          padding: 14px 20px;
          background: #1a2a3a;
          color: white;
          border: none;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s ease;
          letter-spacing: 0.1px;
          box-shadow: 0 2px 12px rgba(26,42,58,0.25);
        }

        .github-btn:hover {
          background: #0f1d2a;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(26,42,58,0.3);
        }

        .github-btn:active {
          transform: translateY(0);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0;
          color: #9bb0be;
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(100,160,210,0.2);
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #5a7585;
          font-weight: 400;
        }

        .feature-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #64b0e8, #4a90c8);
          flex-shrink: 0;
        }

        .logo {
          position: absolute;
          top: 28px;
          left: 32px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 20;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: #1a2a3a;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-family: 'DM Serif Display', serif;
          font-size: 18px;
          color: #1a2a3a;
          letter-spacing: -0.3px;
        }

        /* Decorative arc lines */
        .arc-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .arc {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.4);
        }
      `}</style>

      {/* Logo */}
      <div className="logo">
        <div className="logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="logo-text">DevSpace</span>
      </div>

      {/* Clouds */}
      <div
        className="cloud"
        style={{
          width: 180,
          height: 50,
          bottom: "18%",
          left: "-2%",
          opacity: 0.5,
        }}
      />
      <div
        className="cloud"
        style={{
          width: 240,
          height: 60,
          bottom: "12%",
          left: "5%",
          opacity: 0.4,
        }}
      />
      <div
        className="cloud"
        style={{
          width: 200,
          height: 55,
          bottom: "20%",
          right: "-3%",
          opacity: 0.45,
        }}
      />
      <div
        className="cloud"
        style={{
          width: 160,
          height: 45,
          bottom: "10%",
          right: "8%",
          opacity: 0.35,
        }}
      />
      <div
        className="cloud"
        style={{ width: 120, height: 35, top: "15%", left: "3%", opacity: 0.3 }}
      />
      <div
        className="cloud"
        style={{
          width: 100,
          height: 30,
          top: "20%",
          right: "5%",
          opacity: 0.25,
        }}
      />

      {/* Decorative arcs */}
      <div className="arc-container">
        <div
          className="arc"
          style={{ width: 600, height: 600, opacity: 0.3 }}
        />
        <div
          className="arc"
          style={{ width: 800, height: 800, opacity: 0.2 }}
        />
        <div
          className="arc"
          style={{ width: 1000, height: 1000, opacity: 0.15 }}
        />
      </div>

      {/* Card */}
      <div className="login-card">
        <div className="icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
              stroke="#1a2a3a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1>Welcome to DevSpace</h1>
        <p className="subtitle">
          A space for developers to collaborate,
          <br />
          share projects and grow together.
        </p>

        <button
          className="github-btn"
          onClick={() => signIn("github", { callbackUrl })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        <div className="divider">WHAT YOU GET</div>

        <div className="features">
          <div className="feature-item">
            <div className="feature-dot" />
            Real-time group chat & direct messages
          </div>
          <div className="feature-item">
            <div className="feature-dot" />
            Assignments linked to your GitHub repos
          </div>
          <div className="feature-item">
            <div className="feature-dot" />
            Points system & leaderboard
          </div>
          <div className="feature-item">
            <div className="feature-dot" />
            Automatic GitHub profile sync
          </div>
        </div>
      </div>
    </div>
  );
}
