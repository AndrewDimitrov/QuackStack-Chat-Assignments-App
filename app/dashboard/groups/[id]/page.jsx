"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChatHeader from "@/components/ChatHeader";
import { pusherClient } from "@/lib/pusher";
import UserHoverCard from "@/components/UserHoverCard";
import TabBar from "@/components/TabBar";
import Assignments from "@/components/Assignments";
import { useActiveChat } from "@/app/providers";
import MembersPanel from "@/components/MembersPanel";
import Leaderboard from "@/components/Leaderboard";

export default function GroupPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("chat");
  const [initialAssignmentId, setInitialAssignmentId] = useState(null); // ← добави
  const isAdmin =
    group?.members?.find((m) => m.user?._id?.toString() === session?.user?.id)
      ?.role === "admin";
  const { setActiveChat } = useActiveChat();
  const searchParams = useSearchParams();
  const [showMembers, setShowMembers] = useState(false);

  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    async function load() {
      const [groupRes, messagesRes] = await Promise.all([
        fetch(`/api/groups/${id}`),
        fetch(`/api/groups/${id}/messages`),
      ]);
      const groupData = await groupRes.json();
      const messagesData = await messagesRes.json();
      setGroup(groupData.group);
      setMessages(messagesData.messages || []);
      setHasMore(messagesData.hasMore || false);
      setIsMember(groupData.isMember);

      await fetch("/api/notifications/mark-by-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: `/dashboard/groups/${id}` }),
      });

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
    load();
  }, [id]);

  // Pusher real-time
  useEffect(() => {
    if (!id) return;

    const channel = pusherClient.subscribe(`group-${id}`);

    channel.bind("new-message", (data) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      pusherClient.unsubscribe(`group-${id}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setActiveChat(`/dashboard/groups/${id}`);
    return () => {
      setActiveChat(null);
      fetch("/api/notifications/mark-by-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: `/dashboard/groups/${id}` }),
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    const assignmentId = searchParams.get("assignmentId");
    if (tab === "assignments") {
      setActiveTab("assignments");
    }
    if (assignmentId) {
      setInitialAssignmentId(assignmentId);
    }
  }, [searchParams]);

  async function joinGroup() {
    setJoining(true);
    await fetch(`/api/groups/${id}/join`, { method: "POST" });
    setIsMember(true);
    setJoining(false);
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    await fetch(`/api/groups/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setSending(false);
    router.refresh();
    inputRef.current?.focus();
  }

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const oldest = messages[0]?.createdAt;
    const container = messagesRef.current;
    const prevScrollHeight = container?.scrollHeight;

    const res = await fetch(`/api/groups/${id}/messages?before=${oldest}`);
    const data = await res.json();

    setMessages((prev) => [...(data.messages || []), ...prev]);
    setHasMore(data.hasMore || false);
    setLoadingMore(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }
      });
    });
  }

  function handleScroll() {
    if (messagesRef.current?.scrollTop === 0) {
      loadMore();
    }
  }

  async function refreshGroup() {
    const res = await fetch(`/api/groups/${id}`);
    const data = await res.json();
    setGroup(data.group);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(date) {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // Group messages by date
  function groupByDate(messages) {
    const groups = [];
    let currentDate = null;

    for (const msg of messages) {
      const date = formatDate(msg.createdAt);
      if (date !== currentDate) {
        currentDate = date;
        groups.push({ type: "date", label: date });
      }
      groups.push({ type: "message", data: msg });
    }

    return groups;
  }

  const grouped = groupByDate(messages);

  if (!group) return null;

  if (!isMember)
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "20px",
            padding: "40px",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "var(--color-accent-muted)",
              border: "1px solid var(--color-accent-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "28px",
            }}
          >
            {group.icon ? (
              <Image
                src={group.icon}
                alt={group.name}
                width={64}
                height={64}
                style={{ objectFit: "cover", borderRadius: "16px" }}
              />
            ) : (
              "👥"
            )}
          </div>

          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "22px",
              color: "var(--color-text-primary)",
              margin: "0 0 8px",
            }}
          >
            {group.name}
          </h2>

          {group.description && (
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-text-secondary)",
                margin: "0 0 8px",
                lineHeight: 1.6,
              }}
            >
              {group.description}
            </p>
          )}

          <p
            style={{
              fontSize: "13px",
              color: "var(--color-text-muted)",
              margin: "0 0 24px",
            }}
          >
            {group.members?.length || 0} members
          </p>

          <button
            onClick={joinGroup}
            disabled={joining}
            style={{
              width: "100%",
              padding: "12px",
              background: "var(--color-text-primary)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "opacity 0.2s",
            }}
          >
            {joining ? "Joining..." : "Join Group"}
          </button>
        </div>
      </div>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        .chat-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--color-bg);
          font-family: 'DM Sans', sans-serif;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

        .date-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0 8px;
        }

        .date-divider-line {
          flex: 1;
          height: 1px;
          background: var(--color-border);
        }

        .date-divider-label {
          font-size: 11px;
          color: var(--color-text-muted);
          font-weight: 500;
          white-space: nowrap;
        }

        .msg-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 3px 0;
        }

        .msg-row.own {
          flex-direction: row-reverse;
        }

        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          margin-top: 2px;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .msg-body {}

        .msg-meta {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 3px;
        }

        .msg-row.own .msg-meta {
          flex-direction: row-reverse;
        }

        .msg-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .msg-time {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .msg-bubble {
          display: inline-block;
          padding: 9px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          color: var(--color-text-primary);
          background: white;
          border: 1px solid var(--color-border);
          max-width: 480px;
          word-break: break-word;
        }

        .msg-row.own .msg-bubble {
          background: var(--color-accent-muted);
          border-color: var(--color-accent-border);
          color: var(--color-text-primary);
        }

        /* Input */
        .chat-input-wrap {
          padding: 14px 24px;
          border-top: 1px solid var(--color-border);
          background: white;
        }

        .chat-input-inner {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          padding: 10px 14px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .chat-input-inner:focus-within {
          border-color: var(--color-accent-border);
          box-shadow: 0 0 0 3px var(--color-accent-muted);
          background: white;
        }

        .chat-textarea {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: var(--color-text-primary);
          outline: none;
          resize: none;
          max-height: 120px;
          line-height: 1.5;
          padding: 0;
        }

        .chat-textarea::placeholder { color: var(--color-text-muted); }

        .chat-send-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: none;
          background: var(--color-text-primary);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .chat-send-btn:hover:not(:disabled) {
          background: var(--color-accent);
          transform: scale(1.05);
        }
        .chat-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .chat-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          color: var(--color-text-muted);
          font-size: 14px;
        }
      `}</style>

      <div className="chat-page">
        <ChatHeader
          group={group}
          onlineCount={onlineCount}
          onMembersClick={() => setShowMembers((v) => !v)}
        />
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasUnreadAssignments={0}
        />

        {activeTab === "chat" && (
          <>
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              <div
                className="chat-messages"
                ref={messagesRef}
                onScroll={handleScroll}
                style={{ flex: 1, minWidth: 0 }}
              >
                {loadingMore && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "8px",
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Loading older messages...
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="chat-empty">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      style={{ opacity: 0.3 }}
                    >
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    No messages yet. Say hello!
                  </div>
                )}

                {grouped.map((item, i) => {
                  if (item.type === "date")
                    return (
                      <div key={`date-${i}`} className="date-divider">
                        <div className="date-divider-line" />
                        <span className="date-divider-label">{item.label}</span>
                        <div className="date-divider-line" />
                      </div>
                    );

                  const msg = item.data;
                  const isOwn =
                    msg.sender?._id === session?.user?.id ||
                    msg.sender?._id?.toString() === session?.user?.id;

                  return (
                    <div
                      key={msg._id}
                      className={`msg-row ${isOwn ? "own" : ""}`}
                    >
                      <UserHoverCard user={isOwn ? null : msg.sender}>
                        <div className="msg-avatar">
                          {msg.sender?.avatar ? (
                            <Image
                              src={msg.sender.avatar}
                              alt={msg.sender.name}
                              width={32}
                              height={32}
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            msg.sender?.name?.[0]
                          )}
                        </div>
                      </UserHoverCard>
                      <div className="msg-body">
                        <div className="msg-meta">
                          <span className="msg-name">
                            {isOwn ? "You" : msg.sender?.name}
                          </span>
                          <span className="msg-time">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <div className="msg-bubble">{msg.content}</div>
                      </div>
                    </div>
                  );
                })}

                <div ref={bottomRef} />
              </div>

              {showMembers && (
                <MembersPanel
                  group={group}
                  currentUserId={session?.user?.id}
                  onClose={() => setShowMembers(false)}
                  onGroupUpdate={refreshGroup}
                />
              )}
            </div>

            <div className="chat-input-wrap">
              <div className="chat-input-inner">
                <textarea
                  ref={inputRef}
                  className="chat-textarea"
                  placeholder={`Message ${group?.name || ""}...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  className="chat-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === "assignments" && (
          <Assignments
            groupId={id}
            isAdmin={isAdmin}
            session={session}
            initialAssignmentId={initialAssignmentId}
          />
        )}

        {activeTab === "leaderboard" && <Leaderboard groupId={id} />}
      </div>
    </>
  );
}
