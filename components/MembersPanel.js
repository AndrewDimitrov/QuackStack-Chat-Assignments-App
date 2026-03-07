"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UserHoverCard from "@/components/UserHoverCard";

export default function MembersPanel({
  group,
  currentUserId,
  onClose,
  onGroupUpdate,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isAdmin =
    group?.members?.find((m) => m.user?._id?.toString() === currentUserId)
      ?.role === "admin";

  async function promoteMember(userId) {
    setLoading(true);
    await fetch(`/api/groups/${group._id}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: "admin" }),
    });
    setLoading(false);
    onGroupUpdate();
  }

  async function demoteMember(userId) {
    setLoading(true);
    await fetch(`/api/groups/${group._id}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: "member" }),
    });
    setLoading(false);
    onGroupUpdate();
  }

  async function kickMember(userId) {
    setLoading(true);
    await fetch(`/api/groups/${group._id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setLoading(false);
    onGroupUpdate();
  }

  async function leaveGroup() {
    setLoading(true);
    await fetch(`/api/groups/${group._id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId }),
    });
    setLoading(false);
    router.push("/dashboard");
  }

  const admins = group?.members?.filter((m) => m.role === "admin") || [];
  const members = group?.members?.filter((m) => m.role === "member") || [];

  return (
    <>
      <style>{`
        .members-panel {
          width: 300px;
          border-left: 1px solid var(--color-border);
          background: white;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          font-family: 'DM Sans', sans-serif;
          animation: slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .members-head {
          height: 60px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
        }

        .members-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .members-close {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          transition: all 0.15s;
        }
        .members-close:hover {
          background: var(--color-bg);
          color: var(--color-text-primary);
        }

        .members-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px 8px;
        }
        .members-body::-webkit-scrollbar { width: 4px; }
        .members-body::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

        .members-section-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          padding: 4px 8px 8px;
        }

        .member-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 8px;
          border-radius: 10px;
          transition: background 0.15s;
          position: relative;
        }
        .member-row:hover { background: var(--color-bg); }
        .member-row:hover .member-actions { opacity: 1; }

        .member-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
          cursor: pointer;
        }

        .member-info {
          flex: 1;
          min-width: 0;
          cursor: pointer;
        }

        .member-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .member-username {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .member-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .member-action-btn {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          color: var(--color-text-muted);
        }
        .member-action-btn:hover {
          border-color: var(--color-accent-border);
          color: var(--color-accent);
        }
        .member-action-btn.danger:hover {
          border-color: var(--color-error);
          color: var(--color-error);
          background: var(--color-error-bg);
        }

        .members-footer {
          padding: 12px 8px;
          border-top: 1px solid var(--color-border);
        }

        .leave-btn {
          width: 100%;
          padding: 9px;
          border: 1px solid var(--color-error-bg);
          border-radius: 10px;
          background: var(--color-error-bg);
          color: var(--color-error);
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .leave-btn:hover { opacity: 0.8; }
      `}</style>

      <div className="members-panel">
        <div className="members-head">
          <span className="members-title">
            Members · {group?.members?.length || 0}
          </span>
          <button type="button" className="members-close" onClick={onClose}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="members-body">
          {/* Admins */}
          {admins.length > 0 && (
            <>
              <div className="members-section-label">
                Admin — {admins.length}
              </div>
              {admins.map((m) => (
                <div key={m.user?._id} className="member-row">
                  <UserHoverCard user={m.user}>
                    <div className="member-avatar">
                      {m.user?.avatar ? (
                        <Image
                          src={m.user.avatar}
                          alt={m.user.name}
                          width={32}
                          height={32}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        m.user?.name?.[0]
                      )}
                    </div>
                  </UserHoverCard>
                  <div
                    className="member-info"
                    onClick={() =>
                      router.push(`/profile/${m.user?.githubUsername}`)
                    }
                  >
                    <div className="member-name">
                      {m.user?.name}{" "}
                      {m.user?._id?.toString() === currentUserId ? "(you)" : ""}
                    </div>
                    <div className="member-username">
                      @{m.user?.githubUsername}
                    </div>
                  </div>
                  {isAdmin && m.user?._id?.toString() !== currentUserId && (
                    <div className="member-actions">
                      <button
                        type="button"
                        className="member-action-btn danger"
                        title="Demote"
                        onClick={() => demoteMember(m.user._id)}
                        disabled={loading}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline
                            points="18 15 12 9 6 15"
                            transform="rotate(180 12 12)"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="member-action-btn danger"
                        title="Kick"
                        onClick={() => kickMember(m.user._id)}
                        disabled={loading}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Members */}
          {members.length > 0 && (
            <>
              <div
                className="members-section-label"
                style={{ marginTop: "12px" }}
              >
                Members — {members.length}
              </div>
              {members.map((m) => (
                <div key={m.user?._id} className="member-row">
                  <UserHoverCard user={m.user}>
                    <div className="member-avatar">
                      {m.user?.avatar ? (
                        <Image
                          src={m.user.avatar}
                          alt={m.user.name}
                          width={32}
                          height={32}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        m.user?.name?.[0]
                      )}
                    </div>
                  </UserHoverCard>
                  <div
                    className="member-info"
                    onClick={() =>
                      router.push(`/profile/${m.user?.githubUsername}`)
                    }
                  >
                    <div className="member-name">
                      {m.user?.name}{" "}
                      {m.user?._id?.toString() === currentUserId ? "(you)" : ""}
                    </div>
                    <div className="member-username">
                      @{m.user?.githubUsername}
                    </div>
                  </div>
                  {isAdmin && m.user?._id?.toString() !== currentUserId && (
                    <div className="member-actions">
                      <button
                        type="button"
                        className="member-action-btn"
                        title="Promote to admin"
                        onClick={() => promoteMember(m.user._id)}
                        disabled={loading}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 15 12 9 18 15" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="member-action-btn"
                        title="Message"
                        onClick={() =>
                          router.push(`/dashboard/dm/${m.user._id}`)
                        }
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="member-action-btn danger"
                        title="Kick"
                        onClick={() => kickMember(m.user._id)}
                        disabled={loading}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="members-footer">
          <button
            type="button"
            className="leave-btn"
            onClick={leaveGroup}
            disabled={loading}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Leave group
          </button>
        </div>
      </div>
    </>
  );
}
