"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { pusherClient } from "@/lib/pusher";
import { useActiveChat } from "@/app/providers";

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const { activeChat } = useActiveChat();

  const loadNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    loadNotifications();

    const channel = pusherClient.subscribe(`notifications-${session.user.id}`);

    channel.bind("new-notification", (data) => {
      if (activeChat && data.link === activeChat) return;
      setNotifications((prev) => {
        if (prev.find((n) => n._id === data._id)) {
          return prev;
        }
        return [data, ...prev].slice(0, 30);
      });
      setUnreadCount((prev) => prev + 1);
    });

    channel.bind("read-all", () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    });

    return () => {
      pusherClient.unsubscribe(`notifications-${session.user.id}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAsRead(notificationId, link) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setShowNotifications(false);
    router.push(link);
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  function notifIcon(type) {
    switch (type) {
      case "message":
        return (
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
        );
      case "assignment":
        return (
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
        );
      case "submission_approved":
        return (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case "submission_rejected":
        return (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case "join":
        return (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        );
      default:
        return null;
    }
  }

  function notifColor(type) {
    switch (type) {
      case "message":
        return "#64b0e8";
      case "assignment":
        return "#8b6fc4";
      case "submission_approved":
        return "#2d7a4f";
      case "submission_rejected":
        return "#e05c5c";
      case "join":
        return "#b07d2a";
      default:
        return "#64b0e8";
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        .header {
          height: 56px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: 100;
          flex-shrink: 0;
        }

        .header-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 20px;
          color: var(--color-text-primary);
          text-decoration: none;
          letter-spacing: -0.3px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Notification bell */
        .notif-wrap {
          position: relative;
        }

        .notif-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: white;
          color: var(--color-text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.15s;
        }
        .notif-btn:hover {
          background: var(--color-bg);
          border-color: var(--color-accent-border);
          color: var(--color-accent);
        }

        .notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          border-radius: 8px;
          background: #e05c5c;
          color: white;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          border: 2px solid white;
        }

        /* Notification dropdown */
        .notif-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 340px;
          background: white;
          border: 1px solid var(--color-border-strong);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          overflow: hidden;
          z-index: 200;
          animation: dropIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .notif-head {
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-border);
        }

        .notif-head-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
          font-family: 'DM Sans', sans-serif;
        }

        .notif-mark-all {
          font-size: 12px;
          color: var(--color-accent);
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
          transition: opacity 0.15s;
        }
        .notif-mark-all:hover { opacity: 0.7; }

        .notif-list {
          max-height: 380px;
          overflow-y: auto;
        }
        .notif-list::-webkit-scrollbar { width: 4px; }
        .notif-list::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.15s;
          border-bottom: 1px solid var(--color-border);
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: var(--color-bg); }
        .notif-item.unread { background: var(--color-accent-muted); }
        .notif-item.unread:hover { background: rgba(100, 176, 232, 0.18); }

        .notif-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .notif-content { flex: 1; min-width: 0; }

        .notif-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 2px;
        }

        .notif-body {
          font-size: 12px;
          color: var(--color-text-secondary);
          font-family: 'DM Sans', sans-serif;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notif-time {
          font-size: 11px;
          color: var(--color-text-muted);
          font-family: 'DM Sans', sans-serif;
          margin-top: 3px;
        }

        .notif-unread-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-accent);
          flex-shrink: 0;
          margin-top: 6px;
        }

        .notif-empty {
          padding: 32px 16px;
          text-align: center;
          font-size: 13px;
          color: var(--color-text-muted);
          font-family: 'DM Sans', sans-serif;
        }

        /* Avatar menu */
        .avatar-wrap {
          position: relative;
        }

        .avatar-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid var(--color-border);
          overflow: hidden;
          cursor: pointer;
          background: var(--color-accent-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-accent);
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
          padding: 0;
        }
        .avatar-btn:hover { border-color: var(--color-accent); }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 200px;
          background: white;
          border: 1px solid var(--color-border-strong);
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          overflow: hidden;
          z-index: 200;
          animation: dropIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .user-dropdown-head {
          padding: 12px 14px;
          border-bottom: 1px solid var(--color-border);
        }

        .user-dropdown-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          font-family: 'DM Sans', sans-serif;
        }

        .user-dropdown-email {
          font-size: 11px;
          color: var(--color-text-muted);
          font-family: 'DM Sans', sans-serif;
          margin-top: 1px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 14px;
          font-size: 13px;
          color: var(--color-text-secondary);
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s;
          text-decoration: none;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .dropdown-item:hover { background: var(--color-bg); color: var(--color-text-primary); }
        .dropdown-item.danger:hover { background: var(--color-error-bg); color: var(--color-error); }

        .dropdown-sep {
          height: 1px;
          background: var(--color-border);
          margin: 4px 0;
        }
      `}</style>

      <header className="header">
        <Link href="/dashboard" className="header-logo">
          DevTask
        </Link>

        <div className="header-right">
          {/* Notification bell */}
          <div className="notif-wrap" ref={notifRef}>
            <button
              className="notif-btn"
              onClick={() => {
                setShowNotifications((v) => !v);
                setShowUserMenu(false);
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
              >
                <path
                  d="M9.1 2.67C9.98 2.24 10.96 2 12 2c3.73 0 6.75 3.14 6.75 7v.71c0 .85.24 1.67.69 2.38l1.11 1.72c1.01 1.57.24 3.72-1.52 4.22-4.6 1.3-9.46 1.3-14.06 0-1.76-.5-2.53-2.65-1.52-4.22l1.11-1.72c.45-.71.69-1.53.69-2.38V9c0-1.07.23-2.09.65-3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M9 19a3 3 0 0 0 6 0"
                  stroke-width="1.75"
                  stroke-linecap="round"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="notif-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notif-dropdown">
                <div className="notif-head">
                  <span className="notif-head-title">
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </span>
                  {unreadCount > 0 && (
                    <button className="notif-mark-all" onClick={markAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`notif-item ${!n.read ? "unread" : ""}`}
                        onClick={() => markAsRead(n._id, n.link)}
                      >
                        <div
                          className="notif-icon"
                          style={{
                            background: `${notifColor(n.type)}18`,
                            color: notifColor(n.type),
                          }}
                        >
                          {notifIcon(n.type)}
                        </div>
                        <div className="notif-content">
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-body">{n.body}</div>
                          <div className="notif-time">
                            {timeAgo(n.createdAt)}
                          </div>
                        </div>
                        {!n.read && <div className="notif-unread-dot" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar menu */}
          <div className="avatar-wrap" ref={userMenuRef}>
            <button
              className="avatar-btn"
              onClick={() => {
                setShowUserMenu((v) => !v);
                setShowNotifications(false);
              }}
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || ""}
                  width={36}
                  height={36}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                session?.user?.name?.[0]
              )}
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-head">
                  <div className="user-dropdown-name">
                    {session?.user?.name}
                  </div>
                  <div className="user-dropdown-email">
                    {session?.user?.email}
                  </div>
                </div>

                <Link
                  href={`/profile/${session?.user?.githubUsername}`}
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </Link>

                <Link
                  href="/settings"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                  Settings
                </Link>

                <a
                  href={`https://github.com/${session?.user?.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </a>

                <div className="dropdown-sep" />

                <button
                  className="dropdown-item danger"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
