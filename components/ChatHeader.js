"use client";

import Image from "next/image";
import { useState } from "react";

export default function ChatHeader({
  group,
  onlineCount,
  onMembersClick,
  onEditClick,
  isAdmin,
}) {
  const [copied, setCopied] = useState(false);

  if (!group) return null;

  return (
    <>
      <style>{`
        .chat-header {
          height: 68px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
        }

        .chat-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-header-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-accent-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .chat-header-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: -2px;
          color: var(--color-text-primary);
          font-family: 'DM Sans', sans-serif;
        }

        .header-btn {
          padding: 6px 4px;
          cursor: pointer;
          transition: background-color 0.5s;
          border-radius: 6px;
        }

        .header-btn:hover {
          background-color: rgba(128, 128, 128, 0.25);
        }

        .chat-header-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 2px;
        }

        .chat-header-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--color-text-muted);
          font-family: 'DM Sans', sans-serif;
        }

        .online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
        }

        .header-sep {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--color-border);
        }
      `}</style>

      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-header-icon">
            {group.icon ? (
              <Image
                src={group.icon}
                alt={group.name}
                width={38}
                height={38}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : (
              "👥"
            )}
          </div>
          <div>
            <div className="chat-header-name">{group.name}</div>
            <div className="chat-header-meta">
              <span className="chat-header-stat">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
                {group.members?.length || 0} members
              </span>
              {onlineCount > 0 && (
                <>
                  <span className="header-sep" />
                  <span className="chat-header-stat">
                    <span className="online-dot" />
                    {onlineCount} online
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="header-right">
          {isAdmin && (
            <button
              className="header-btn"
              onClick={onEditClick}
              title="Edit group"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          {group?.inviteCode && (
            <button
              className="header-btn"
              title="Copy invite link"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/join/${group.inviteCode}`,
                );
                // показване на copied feedback
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
              )}
            </button>
          )}
          <button
            className="header-btn"
            onClick={onMembersClick}
            title="Members"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
