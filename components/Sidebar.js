"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";
import { useRef, useCallback } from "react";
import { useActiveChat } from "@/app/providers";
import CreateGroupModal from "@/components/CreateGroupModal";

export default function Sidebar({ onClose }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [dms, setDms] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const { activeChat } = useActiveChat();
  const activeChatRef = useRef(activeChat);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadData = useCallback(async () => {
    const [groupsRes, dmsRes] = await Promise.all([
      fetch("/api/groups"),
      fetch("/api/dm/conversations"),
    ]);
    const groupsData = await groupsRes.json();
    const dmsData = await dmsRes.json();
    setGroups(groupsData.groups || []);
    setDms(dmsData.conversations || []);
  }, []);

  useEffect(() => {
    activeChatRef.current = activeChat;
    if (!activeChat) {
      loadData();
    }
  }, [activeChat, loadData]);

  useEffect(() => {
    if (!session?.user?.id) return;
    loadData();

    const channel = pusherClient.subscribe(`sidebar-${session.user.id}`);
    channel.bind("update", (data) => {
      if (
        activeChatRef.current &&
        data?.link &&
        activeChatRef.current === data?.link
      ) {
        return;
      }
      loadData();
    });

    return () => {
      pusherClient.unsubscribe(`sidebar-${session.user.id}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  async function createGroup() {
    if (!newGroupName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName, description: newGroupDesc }),
    });
    const data = await res.json();
    setCreating(false);
    setNewGroupName("");
    setNewGroupDesc("");
    const groupsRes = await fetch("/api/groups");
    const groupsData = await groupsRes.json();
    setGroups(groupsData.groups || []);
    navigate(`/dashboard/groups/${data.group._id}`);
  }

  function navigate(path) {
    router.push(path);
    if (onClose) onClose();
  }

  function timeAgo(date) {
    if (!date) return "";
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredDMs = dms.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        .sidebar {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: white;
          border-right: 1px solid var(--color-border);
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* Search */
        .sb-search {
          padding: 14px 16px;
          border-bottom: 1px solid var(--color-border);
        }

        .sb-search-wrap {
          position: relative;
        }

        .sb-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .sb-search-input {
          width: 100%;
          padding: 9px 12px 9px 34px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: var(--color-text-primary);
          outline: none;
          transition: all 0.2s;
        }
        .sb-search-input::placeholder { color: var(--color-text-muted); }
        .sb-search-input:focus {
          border-color: var(--color-accent-border);
          background: white;
          box-shadow: 0 0 0 3px var(--color-accent-muted);
        }

        /* Scroll area */
        .sb-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 8px 10px 16px;
        }
        .sb-scroll::-webkit-scrollbar { width: 3px; }
        .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .sb-scroll::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

        /* Section header */
        .sb-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 6px 10px;
        }

        .sb-section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-muted);
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .sb-new-btn {
          width: 24px;
          height: 24px;
          border-radius: 7px;
          border: 1px solid var(--color-accent-border);
          background: var(--color-accent-muted);
          color: var(--color-accent);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-size: 18px;
          line-height: 1;
          font-family: 'DM Sans', sans-serif;
        }
        .sb-new-btn:hover {
          background: var(--color-accent);
          color: white;
          border-color: var(--color-accent);
        }

        /* Conversation item */
        .sb-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
          text-decoration: none;
        }
        .sb-item:hover { background: var(--color-bg); }
        .sb-item.active { background: var(--color-accent-muted); }

        /* Avatar */
        .sb-avatar {
          position: relative;
          flex-shrink: 0;
        }

        .sb-avatar-img {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .sb-avatar-img.circle {
          border-radius: 50%;
        }

        .sb-online-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid white;
        }

        /* Item content */
        .sb-item-content {
          flex: 1;
          min-width: 0;
        }

        .sb-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-bottom: 3px;
        }

        .sb-item-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sb-item-time {
          font-size: 11px;
          color: var(--color-text-muted);
          flex-shrink: 0;
        }

        .sb-item-preview {
          font-size: 12px;
          color: var(--color-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sb-item-preview.unread {
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        /* Unread badge */
        .sb-badge {
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 9px;
          background: var(--color-accent);
          color: white;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* New group form */
        .sb-form {
          margin: 4px 0 8px;
          padding: 12px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: slideDown 0.2s ease both;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sb-form-input {
          padding: 8px 10px;
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: var(--color-text-primary);
          outline: none;
          width: 100%;
          transition: border-color 0.2s;
        }
        .sb-form-input:focus { border-color: var(--color-accent-border); }
        .sb-form-input::placeholder { color: var(--color-text-muted); }

        .sb-form-actions {
          display: flex;
          gap: 6px;
        }

        .sb-form-submit {
          flex: 1;
          padding: 7px;
          background: var(--color-text-primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .sb-form-submit:hover:not(:disabled) { opacity: 0.85; }
        .sb-form-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .sb-form-cancel {
          padding: 7px 12px;
          background: transparent;
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
        }
        .sb-form-cancel:hover { color: var(--color-text-primary); }

        .sb-empty {
          font-size: 12px;
          color: var(--color-text-muted);
          padding: 4px 8px;
        }
      `}</style>

      <div className="sidebar">
        {/* Search */}
        <div className="sb-search">
          <div className="sb-search-wrap">
            <svg
              className="sb-search-icon"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="sb-search-input"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sb-scroll">
          {/* Groups */}
          <div className="sb-section-head">
            <span className="sb-section-label">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              Groups
            </span>
            <button
              className="sb-new-btn"
              onClick={() => setShowCreateModal(true)}
              title="New group"
            >
              +
            </button>
          </div>

          {showCreateModal && (
            <CreateGroupModal onClose={() => setShowCreateModal(false)} />
          )}

          {filteredGroups.length === 0 ? (
            <p className="sb-empty">No groups yet</p>
          ) : (
            filteredGroups.map((group) => {
              const isActive = pathname === `/dashboard/groups/${group._id}`;
              return (
                <div
                  key={group._id}
                  className={`sb-item ${isActive ? "active" : ""}`}
                  onClick={() => navigate(`/dashboard/groups/${group._id}`)}
                >
                  <div className="sb-avatar">
                    <div className="sb-avatar-img">
                      {group.icon ? (
                        <Image
                          src={group.icon}
                          alt={group.name}
                          width={42}
                          height={42}
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "20px" }}>👥</span>
                      )}
                    </div>
                  </div>
                  <div className="sb-item-content">
                    <div className="sb-item-top">
                      <span className="sb-item-name">{group.name}</span>
                      {group.lastMessageAt && (
                        <span className="sb-item-time">
                          {timeAgo(group.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <div
                      className={`sb-item-preview ${group.unreadCount > 0 ? "unread" : ""}`}
                    >
                      {group.lastMessage ||
                        `${group.members?.length || 0} members`}
                    </div>
                  </div>
                  {group.unreadCount > 0 && (
                    <span className="sb-badge">{group.unreadCount}</span>
                  )}
                </div>
              );
            })
          )}

          {/* Direct Messages */}
          <div className="sb-section-head" style={{ marginTop: "8px" }}>
            <span className="sb-section-label">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Direct Messages
            </span>
          </div>

          {filteredDMs.length === 0 ? (
            <p className="sb-empty">No conversations yet</p>
          ) : (
            filteredDMs.map((dm) => {
              const isActive = pathname === `/dashboard/dm/${dm.userId}`;
              return (
                <div
                  key={dm.userId}
                  className={`sb-item ${isActive ? "active" : ""}`}
                  onClick={() => navigate(`/dashboard/dm/${dm.userId}`)}
                >
                  <div className="sb-avatar">
                    <div className="sb-avatar-img circle">
                      {dm.avatar ? (
                        <Image
                          src={dm.avatar}
                          alt={dm.name}
                          width={42}
                          height={42}
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "18px" }}>👤</span>
                      )}
                    </div>
                    {dm.online && <span className="sb-online-dot" />}
                  </div>
                  <div className="sb-item-content">
                    <div className="sb-item-top">
                      <span className="sb-item-name">{dm.name}</span>
                      {dm.lastMessageAt && (
                        <span className="sb-item-time">
                          {timeAgo(dm.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <div
                      className={`sb-item-preview ${dm.unreadCount > 0 ? "unread" : ""}`}
                    >
                      {dm.lastMessage || `@${dm.githubUsername}`}
                    </div>
                  </div>
                  {dm.unreadCount > 0 && (
                    <span className="sb-badge">{dm.unreadCount}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
