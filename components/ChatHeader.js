"use client";
import Image from "next/image";

export default function ChatHeader({ group, onlineCount, onMembersClick }) {
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
          font-size: 15px;
          font-weight: 600;
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
          font-size: 12px;
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
          <button
            className="header-btn"
            onClick={onMembersClick}
            title="Members"
          >
            <svg
              width="15"
              height="15"
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
