"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  function handleCTA() {
    if (session) router.push("/dashboard");
    else signIn("github", { callbackUrl: "/dashboard" });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');

        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(180deg, #c8e8f5 0%, #d8eef8 30%, #e8f4fb 60%, #cde8f4 100%);
          min-height: 100vh;
          color: #1a2332;
          position: relative;
          overflow-x: hidden;
        }

        /* ── CLOUDS ── */
        .lp-clouds {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .cloud {
          position: absolute;
          background: rgba(255,255,255,0.45);
          border-radius: 50%;
          filter: blur(40px);
        }

        .cloud-1 { width: 200px; height: 80px; top: 12%; left: 3%; animation: cloudDrift 18s ease-in-out infinite; }
        .cloud-2 { width: 280px; height: 90px; top: 18%; right: 5%; animation: cloudDrift 22s ease-in-out infinite reverse; }
        .cloud-3 { width: 160px; height: 60px; top: 55%; left: 1%; animation: cloudDrift 16s ease-in-out infinite 4s; }
        .cloud-4 { width: 240px; height: 75px; top: 62%; right: 2%; animation: cloudDrift 20s ease-in-out infinite 2s reverse; }
        .cloud-5 { width: 180px; height: 65px; top: 80%; left: 15%; animation: cloudDrift 24s ease-in-out infinite 6s; }
        .cloud-6 { width: 120px; height: 50px; top: 35%; left: 8%; animation: cloudDrift 19s ease-in-out infinite 1s; }
        .cloud-7 { width: 200px; height: 70px; top: 40%; right: 10%; animation: cloudDrift 21s ease-in-out infinite 3s reverse; }

        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          33% { transform: translateX(12px) translateY(-6px); }
          66% { transform: translateX(-8px) translateY(4px); }
        }

        /* ── HEADER ── */
        .lp-header {
          position: fixed;
          width: stretch;
          top: 0;
          z-index: 100;
          height: 80px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 28px;
          background: rgba(200, 232, 245, 0.5);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.35);
        }

        .lp-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          justify-self: start;
        }

        .lp-logo-icon {
          width: 34px;
          height: 34px;
          background: #1a2332;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lp-logo-text {
          font-family: 'DM Serif Display', serif;
          font-size: 18px;
          color: #1a2332;
        }

        .lp-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          justify-self: center;
        }

        .lp-nav-link {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          color: #3a6070;
          text-decoration: none;
          transition: all 0.15s;
        }
        .lp-nav-link:hover {
          background: rgba(255,255,255,0.5);
          color: #1a2332;
        }

        .lp-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-self: end;
        }

        .lp-github-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3a6070;
          text-decoration: none;
          transition: all 0.15s;
        }
        .lp-github-icon-btn:hover {
          background: rgba(255,255,255,0.7);
          color: #1a2332;
        }

        .lp-header-cta {
          padding: 11px 16px;
          border-radius: 9px;
          border: none;
          background: #1a2332;
          color: white;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .lp-header-cta:hover { opacity: 0.8; }

        /* ── HERO ── */
        .lp-hero {
          position: relative;
          z-index: 1;
          min-height: calc(100vh - 50px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
        }

        .lp-hero-content {
          max-width: 620px;
          animation: lpFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes lpFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .lp-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 100px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.8);
          font-size: 12px;
          font-weight: 600;
          color: #4a7a9b;
          margin-bottom: 28px;
          letter-spacing: 0.3px;
        }

        .lp-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: lpPulse 2s infinite;
        }

        @keyframes lpPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .lp-hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(42px, 6vw, 72px);
          line-height: 1.08;
          color: #1a2332;
          margin-bottom: 20px;
          letter-spacing: -1.5px;
        }

        .lp-hero-title-accent { color: #2a7ab0; }

        .lp-hero-sub {
          font-size: 17px;
          color: #4a6a7a;
          line-height: 1.7;
          margin-bottom: 40px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }

        .lp-hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .lp-btn-primary {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 32px;
          border: none;
          border-radius: 14px;
          background: #1a2332;
          color: white;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 8px 24px rgba(26, 35, 50, 0.25);
        }
        .lp-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(26, 35, 50, 0.32);
        }

        .lp-btn-secondary {
          padding: 15px 24px;
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 14px;
          background: rgba(255,255,255,0.45);
          color: #3a6070;
          font-size: 15px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          transition: all 0.15s;
          backdrop-filter: blur(8px);
        }
        .lp-btn-secondary:hover {
          background: rgba(255,255,255,0.7);
          color: #1a2332;
        }

        .lp-section {
          position: relative;
          z-index: 1;
          padding: 90px 24px;
        }

        .lp-section-inner {
          max-width: 1060px;
          margin: 0 auto;
          text-align: center;
        }

        .lp-section-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #2a7ab0;
          margin-bottom: 12px;
        }

        .lp-section-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(28px, 4vw, 44px);
          color: #1a2332;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .lp-section-sub {
          font-size: 16px;
          color: #5a7a8a;
          margin-bottom: 52px;
        }

        /* ── BENTO GRID ── */
        .bento-grid {
  max-width: 1060px;
  margin: 48px auto 0;
  display: grid;
  grid-template-columns: 280px 1fr 1fr 280px;
  grid-template-rows: auto auto;
  gap: 14px;
  padding: 0 24px;
}

.bento-card {
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.85);
  border-radius: 22px;
  padding: 28px;
  backdrop-filter: blur(14px);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(26,35,50,0.1);
}

.bento-large  { grid-column: 1; grid-row: 1 / 3; }
.bento-small  { grid-column: span 1; }
.bento-wide   { grid-column: 2 / 4; flex-direction: row; align-items: center; gap: 20px; }
.bento-tall   { grid-column: 4; grid-row: 1 / 3; }
.bento-medium { grid-column: 1; grid-row: 3; }

.bento-accent  { background: rgba(200,232,248,0.7); }
.bento-accent2 { background: rgba(180,220,200,0.6); }

.bento-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2a7ab0;
  flex-shrink: 0;
}

.bento-title {
  font-family: 'DM Serif Display', serif;
  font-size: 18px;
  color: #1a2332;
  letter-spacing: -0.3px;
}

.bento-desc {
  font-size: 13px;
  color: #5a7a8a;
  line-height: 1.65;
}

.bento-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bento-list li {
  font-size: 13px;
  color: #3a5a6a;
  padding-left: 16px;
  position: relative;
}
.bento-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #2a7ab0;
  font-size: 11px;
}

.bento-lb-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.bento-lb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  background: rgba(255,255,255,0.6);
  border-radius: 10px;
  padding: 8px 12px;
}

.bento-lb-num  { font-weight: 700; color: #2a7ab0; width: 28px; }
.bento-lb-name { flex: 1; font-weight: 500; color: #1a2332; }
.bento-lb-pts  { font-weight: 700; color: #3a8a6a; font-size: 12px; }

@media (max-width: 1024px) {
  .bento-grid { grid-template-columns: 1fr 1fr; }
  .bento-large, .bento-tall { grid-column: span 1; grid-row: span 0; }
  .bento-wide { grid-column: span 2; flex-direction: column; }
}

@media (max-width: 480px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-wide { flex-direction: column; }
}

        .fw-blocks {
            max-width: 1060px;
            margin: 52px auto 0;
            display: flex;
            flex-direction: column;
            gap: 40px;
        }

        .fw-block {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            background: rgba(255,255,255,0.55);
            border: 1px solid rgba(255,255,255,0.8);
            border-radius: 24px;
            overflow: hidden;
            backdrop-filter: blur(12px);
        }

        .fw-block-reverse { direction: rtl; }
        .fw-block-reverse > * { direction: ltr; }

        .fw-block-text {
            padding: 48px 44px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            justify-content: center;
        }

        .fw-tag {
            font-size: 13px;
            font-weight: 700;
            color: #2a7ab0;
            letter-spacing: 0.3px;
        }

        .fw-title {
            font-family: 'DM Serif Display', serif;
            font-size: 28px;
            color: #1a2332;
            letter-spacing: -0.5px;
            line-height: 1.2;
        }

        .fw-desc {
            font-size: 15px;
            color: #5a7a8a;
            line-height: 1.7;
        }

        .fw-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .fw-list li {
            font-size: 14px;
            color: #3a5a6a;
            padding-left: 20px;
            position: relative;
        }

        .fw-list li::before {
            content: '→';
            position: absolute;
            left: 0;
            color: #2a7ab0;
            font-weight: 700;
        }

        .fw-block-visual {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 40px;
            background: linear-gradient(135deg, rgb(0 146 219 / 60%) 0%, rgba(180, 220, 242, 0.4) 100%);
            flex-wrap: wrap;
        }

        /* Stats */
        .fw-stat-card {
            background: rgba(255,255,255,0.8);
            border: 1px solid rgba(255,255,255,0.95);
            border-radius: 16px;
            padding: 20px 24px;
            text-align: center;
            min-width: 100px;
            box-shadow: 0 4px 16px rgba(26,35,50,0.08);
        }

        .fw-stat-num {
            font-family: 'DM Serif Display', serif;
            font-size: 36px;
            color: #1a2332;
            line-height: 1;
            margin-bottom: 6px;
        }

        .fw-stat-label {
            font-size: 12px;
            color: #7a9aaa;
            font-weight: 500;
        }

        /* Leaderboard */
        .fw-leaderboard {
            background: rgba(255,255,255,0.85);
            border: 1px solid rgba(255,255,255,0.95);
            border-radius: 16px;
            overflow: hidden;
            width: 100%;
            max-width: 280px;
            box-shadow: 0 4px 16px rgba(26,35,50,0.08);
        }

        .fw-lb-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            font-size: 14px;
        }
        .fw-lb-row:last-child { border-bottom: none; }

        .fw-lb-row.fw-lb-you {
            background: rgba(200, 232, 248, 0.5);
        }

        .fw-lb-rank { font-weight: 700; color: #2a7ab0; width: 28px; }
        .fw-lb-name { flex: 1; font-weight: 500; color: #1a2332; }
        .fw-lb-pts { font-weight: 700; color: #3a8a6a; font-size: 13px; }

        @media (max-width: 700px) {
            .fw-block { grid-template-columns: 1fr; }
            .fw-block-reverse { direction: ltr; }
            .fw-block-text { padding: 32px 24px; }
        }

        .lp-divider {
          position: relative;
          z-index: 1;
          height: 1px;
          background: rgba(255,255,255,0.45);
          max-width: 1060px;
          margin: 0 auto;
        }

        .lp-footer {
          position: relative;
          z-index: 1;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 1060px;
          margin: 0 auto;
        }

        .lp-footer-copy { font-size: 13px; color: #7aaabb; }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: #1a2a3a;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #1a2a3a;
          letter-spacing: -0.3px;
        }

        @media (max-width: 640px) {
          .lp-nav { visibility: hidden; width: 0; }
          .lp-footer { flex-direction: column; gap: 8px; text-align: center; }
          .bento-large, .bento-tall {
            grid-column: span 2;
            grid-row: span 1;
        }
      `}</style>

      <div className="lp-root">
        <div className="lp-clouds">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
          <div className="cloud cloud-4" />
          <div className="cloud cloud-5" />
          <div className="cloud cloud-6" />
          <div className="cloud cloud-7" />
        </div>

        <header className="lp-header">
          <a className="lp-logo" href="#home">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
          </a>

          <nav className="lp-nav">
            <a className="lp-nav-link" href="#home">
              Home
            </a>
            <a className="lp-nav-link" href="#features">
              Features
            </a>
            <a className="lp-nav-link" href="#for-who">
              For who
            </a>
          </nav>

          <div className="lp-header-right">
            <a
              className="lp-github-icon-btn"
              href="https://github.com/your-username/devspace"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <button className="lp-header-cta" onClick={handleCTA}>
              {session ? "Dashboard" : "Sign in"}
            </button>
          </div>
        </header>

        <section id="home" className="lp-hero">
          <div className="lp-hero-content">
            <div className="lp-hero-badge">
              <span className="lp-badge-dot" />
              Built for developers
            </div>
            <h1 className="lp-hero-title">
              Where your team
              <br />
              <span className="lp-hero-title-accent">codes together</span>
            </h1>
            <p className="lp-hero-sub">
              Group chats, direct messages, assignments and a leaderboard —
              everything your coding team needs in one place.
            </p>
            <div className="lp-hero-actions">
              <button className="lp-btn-primary" onClick={handleCTA}>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                {session ? "Go to Dashboard" : "Get started with GitHub"}
              </button>
              <a className="lp-btn-secondary" href="#features">
                See features
              </a>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        <section id="features" className="lp-section">
          <div className="lp-section-inner">
            <div className="lp-section-tag">Features</div>
            <h2 className="lp-section-title">Everything your team needs</h2>
            <p className="lp-section-sub">
              Built specifically for coding teams and instructors.
            </p>
          </div>

          <div className="bento-grid">
            <div className="bento-card bento-large">
              <div className="bento-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  <circle cx="9" cy="10" r="1" fill="currentColor" />
                  <circle cx="12" cy="10" r="1" fill="currentColor" />
                  <circle cx="15" cy="10" r="1" fill="currentColor" />
                </svg>
              </div>
              <h3 className="bento-title">Group Chats</h3>
              <p className="bento-desc">
                Real-time messaging for your entire team. Stay in sync with
                instant updates powered by Pusher.
              </p>
              <ul className="bento-list">
                <li>Instant real-time messages</li>
                <li>Organised by groups</li>
                <li>Online presence indicators</li>
              </ul>
            </div>

            <div className="bento-card bento-wide">
              <div className="bento-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 className="bento-title">Developer Profiles</h3>
                <p className="bento-desc">
                  Linked to your GitHub. Showcase your work and connect with
                  teammates instantly.
                </p>
              </div>
            </div>

            <div className="bento-card bento-wide">
              <div className="bento-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <div>
                <h3 className="bento-title">Assignments</h3>
                <p className="bento-desc">
                  Create coding tasks, link GitHub repos and track all
                  submissions in one place.
                </p>
              </div>
            </div>

            <div className="bento-card bento-tall bento-accent2">
              <div className="bento-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0012 0V2z" />
                </svg>
              </div>
              <h3 className="bento-title">Leaderboard</h3>
              <p className="bento-desc">
                Earn points for every completed assignment and climb the ranks.
              </p>
              <div className="bento-lb-preview">
                {[
                  { rank: "#1", name: "Alex K.", pts: "340pts" },
                  { rank: "#2", name: "You", pts: "280pts" },
                  { rank: "#3", name: "Maria", pts: "210pts" },
                ].map((u, i) => (
                  <div key={i} className="bento-lb-row">
                    <span className="bento-lb-num">{u.rank}</span>
                    <span className="bento-lb-name">{u.name}</span>
                    <span className="bento-lb-pts">{u.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        <section id="for-who" className="lp-section">
          <div className="lp-section-inner">
            <div className="lp-section-tag">For who</div>
            <h2 className="lp-section-title">Made for coding teams</h2>
            <p className="lp-section-sub">
              Whether you teach or learn — DevSpace has you covered.
            </p>
          </div>

          <div className="fw-blocks">
            {/* Block 1 — Instructors */}
            <div className="fw-block">
              <div className="fw-block-text">
                <div className="fw-tag">👨‍🏫 Instructors</div>
                <h3 className="fw-title">Manage your class with ease</h3>
                <p className="fw-desc">
                  Create groups, assign coding tasks and review GitHub
                  submissions — all from one dashboard.
                </p>
                <ul className="fw-list">
                  <li>Create assignments linked to GitHub repos</li>
                  <li>Review and grade submissions instantly</li>
                  <li>Reward students with points</li>
                </ul>
              </div>
              <div className="fw-block-visual fw-visual-instructor">
                <div className="fw-stat-card">
                  <div className="fw-stat-num">12</div>
                  <div className="fw-stat-label">Assignments created</div>
                </div>
                <div className="fw-stat-card">
                  <div className="fw-stat-num">94%</div>
                  <div className="fw-stat-label">Submission rate</div>
                </div>
                <div className="fw-stat-card">
                  <div className="fw-stat-num">8</div>
                  <div className="fw-stat-label">Active students</div>
                </div>
              </div>
            </div>

            {/* Block 2 — Students */}
            <div className="fw-block fw-block-reverse">
              <div className="fw-block-text">
                <div className="fw-tag">👨‍💻 Students</div>
                <h3 className="fw-title">Learn, build and level up</h3>
                <p className="fw-desc">
                  Submit your GitHub projects, earn points and see how you rank
                  against your peers.
                </p>
                <ul className="fw-list">
                  <li>Submit projects directly from GitHub</li>
                  <li>Earn points for every approved task</li>
                  <li>Climb the group leaderboard</li>
                </ul>
              </div>
              <div className="fw-block-visual fw-visual-student">
                <div className="fw-leaderboard">
                  {[
                    { name: "Alex K.", pts: 340, you: false },
                    { name: "You", pts: 280, you: true },
                    { name: "Maria S.", pts: 210, you: false },
                  ].map((u, i) => (
                    <div
                      key={i}
                      className={`fw-lb-row ${u.you ? "fw-lb-you" : ""}`}
                    >
                      <span className="fw-lb-rank">#{i + 1}</span>
                      <span className="fw-lb-name">{u.name}</span>
                      <span className="fw-lb-pts">{u.pts} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        <footer className="lp-footer">
          <div className="lp-footer-copy">
            © {new Date().getFullYear()} DevSpace. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
