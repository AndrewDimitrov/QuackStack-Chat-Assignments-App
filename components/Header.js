"use client";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: 64px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .header-logo:hover { opacity: 0.75; }

        .logo-icon {
          width: 34px;
          height: 34px;
          background: var(--color-text-primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-text {
          font-family: 'DM Serif Display', serif;
          font-size: 19px;
          color: var(--color-text-primary);
          letter-spacing: -0.3px;
        }

        .header-right {
          position: relative;
        }

        .avatar-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid var(--color-border-strong);
          cursor: pointer;
          overflow: hidden;
          transition: all 0.2s ease;
          background: var(--color-accent-muted);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-btn:hover {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-muted);
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 220px;
          background: white;
          border: 1px solid var(--color-border-strong);
          border-radius: 16px;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          animation: dropIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .dropdown-header {
          padding: 14px 16px;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-bg-subtle);
        }

        .dropdown-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .dropdown-username {
          font-size: 12px;
          color: var(--color-text-muted);
          margin-top: 2px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          background: none;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
        }
        .dropdown-item:hover {
          background: var(--color-bg-subtle);
          color: var(--color-text-primary);
        }

        .dropdown-item svg {
          flex-shrink: 0;
          opacity: 0.6;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--color-border);
          margin: 4px 0;
        }

        .dropdown-item.danger {
          color: var(--color-error);
        }
        .dropdown-item.danger:hover {
          background: var(--color-error-bg);
          color: var(--color-error);
        }
      `}</style>

      <header className="header">
        {/* Logo */}
        <Link href="/dashboard" className="header-logo">
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
        </Link>

        {/* User avatar + dropdown */}
        {session?.user && (
          <div className="header-right" ref={dropdownRef}>
            <button className="avatar-btn" onClick={() => setOpen((v) => !v)}>
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name}
                  width={36}
                  height={36}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {session.user.name?.[0]}
                </span>
              )}
            </button>

            {open && (
              <div className="dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-name">{session.user.name}</div>
                  <div className="dropdown-username">
                    @{session.user.githubUsername}
                  </div>
                </div>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    router.push("/settings");
                    setOpen(false);
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Settings
                </button>

                <a
                  className="dropdown-item"
                  href={`https://github.com/${session.user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub Profile
                </a>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item danger"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
