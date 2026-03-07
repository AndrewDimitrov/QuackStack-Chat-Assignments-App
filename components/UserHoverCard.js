"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UserHoverCard({ user, children }) {
  const [visible, setVisible] = useState(false);
  const [animated, setAnimated] = useState(false);
  const hideTimer = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timerRef = useRef(null);
  const cardRef = useRef(null);
  const triggerRef = useRef(null);
  const router = useRouter();

  function handleMouseEnter() {
    clearTimeout(hideTimer.current);
    timerRef.current = setTimeout(() => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const cardWidth = 240;
      const cardHeight = 160;
      const padding = 8;

      let left = rect.right + padding;
      let top = rect.top;

      if (left + cardWidth > window.innerWidth - 16) {
        left = rect.left - cardWidth - padding;
      }
      if (top + cardHeight > window.innerHeight - 16) {
        top = window.innerHeight - cardHeight - 16;
      }

      setPosition({ top, left });
      setVisible(true);
      setTimeout(() => setAnimated(true), 10);
    }, 400);
  }

  function handleMouseLeave() {
    clearTimeout(timerRef.current);
    hideTimer.current = setTimeout(() => {
      setAnimated(false);
      setTimeout(() => setVisible(false), 200);
    }, 350);
  }

  function handleCardLeave() {
    hideTimer.current = setTimeout(() => {
      setAnimated(false);
      setTimeout(() => setVisible(false), 200);
    }, 150);
  }

  function handleCardEnter() {
    clearTimeout(hideTimer.current);
  }

  if (!user) return children;

  return (
    <>
      <style>{`
        .hover-trigger {
          display: contents;
          cursor: pointer;
        }

        .hover-card {
            position: fixed;
            z-index: 1000;
            width: 240px;
            background: white;
            border: 1px solid var(--color-border-strong);
            border-radius: 16px;
            box-shadow: var(--shadow-lg);
            padding: 16px;
            font-family: 'DM Sans', sans-serif;
            opacity: 0;
            transform: translateY(6px) scale(0.97);
            transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hover-card.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        @keyframes hoverIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .hc-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .hc-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .hc-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .hc-username {
          font-size: 12px;
          color: var(--color-text-muted);
          margin-top: 1px;
        }

        .hc-bio {
          font-size: 12px;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hc-actions {
          display: flex;
          gap: 6px;
        }

        .hc-btn {
          flex: 1;
          padding: 7px 10px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          text-decoration: none;
        }

        .hc-btn-primary {
          background: var(--color-text-primary);
          color: white;
          border: none;
        }
        .hc-btn-primary:hover { opacity: 0.85; }

        .hc-btn-secondary {
          background: white;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
        }
        .hc-btn-secondary:hover {
          border-color: var(--color-accent-border);
          color: var(--color-accent);
        }
      `}</style>

      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => router.push(`/profile/${user.githubUsername}`)}
        style={{ cursor: "pointer", display: "inline-flex" }} // беше display: contents
      >
        {children}
      </span>

      {visible && (
        <div
          ref={cardRef}
          className={`hover-card ${animated ? "visible" : ""}`}
          style={{ top: position.top, left: position.left }}
          onMouseEnter={handleCardEnter}
          onMouseLeave={handleCardLeave}
        >
          <div className="hc-top">
            <div className="hc-avatar">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={40}
                  height={40}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                user.name?.[0]
              )}
            </div>
            <div>
              <div className="hc-name">{user.name}</div>
              <div className="hc-username">@{user.githubUsername}</div>
            </div>
          </div>

          {user.bio && <p className="hc-bio">{user.bio}</p>}

          <div className="hc-actions">
            <button
              className="hc-btn hc-btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
                router.push(`/dashboard/dm/${user._id}`);
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Message
            </button>
            <button
              className="hc-btn hc-btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
                router.push(`/profile/${user.githubUsername}`);
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile
            </button>
          </div>
        </div>
      )}
    </>
  );
}
