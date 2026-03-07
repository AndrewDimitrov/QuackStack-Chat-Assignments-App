"use client";

export default function TabBar({
  activeTab,
  onTabChange,
  hasUnreadAssignments,
}) {
  return (
    <>
      <style>{`
        .tab-bar {
          display: flex;
          background: white;
          border-bottom: 1px solid var(--color-border);
          padding: 0 24px;
          flex-shrink: 0;
        }

        .tab-btn {
          padding: 12px 20px;
          border: none;
          border-bottom: 2px solid transparent;
          background: none;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.15s;
          margin-bottom: -1px;
          position: relative;
        }

        .tab-btn.active {
          border-bottom-color: var(--color-text-primary);
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .tab-btn:not(.active) {
          color: var(--color-text-muted);
          font-weight: 400;
        }

        .tab-btn:not(.active):hover {
          color: var(--color-text-secondary);
        }

        .tab-badge {
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 9px;
          background: #e05c5c;
          color: white;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => onTabChange("chat")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          Messages
        </button>

        <button
          className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`}
          onClick={() => onTabChange("assignments")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          Assignments
          {hasUnreadAssignments > 0 && (
            <span className="tab-badge">{hasUnreadAssignments}</span>
          )}
        </button>

        <button
          className={`tab-btn ${activeTab === "leaderboard" ? "active" : ""}`}
          onClick={() => onTabChange("leaderboard")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          Leaderboard
        </button>
      </div>
    </>
  );
}
