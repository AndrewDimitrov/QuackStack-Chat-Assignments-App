"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { pusherClient } from "@/lib/pusher";
import { useRouter } from "next/navigation";
import UserHoverCard from "@/components/UserHoverCard";
import { useActiveChat } from "@/app/providers";
import { createPortal } from "react-dom";
import MessageContextMenu from "@/components/MessageContextMenu";

export default function DMPage() {
  const { userId } = useParams();
  const { data: session } = useSession();
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const { setActiveChat } = useActiveChat();

  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  const [lightboxImage, setLightboxImage] = useState(null);

  const [contextMenu, setContextMenu] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);

  useEffect(() => {
    setActiveChat(`/dashboard/dm/${userId}`);
    return () => setActiveChat(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "42px";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    async function load() {
      const [userRes, messagesRes] = await Promise.all([
        fetch(`/api/dm/${userId}`),
        fetch(`/api/dm/${userId}/messages`),
      ]);
      const userData = await userRes.json();
      const messagesData = await messagesRes.json();
      setOtherUser(userData.user);
      setMessages(messagesData.messages || []);
      setHasMore(messagesData.hasMore || false);

      await fetch("/api/notifications/mark-by-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: `/dashboard/dm/${userId}` }),
      });

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
    load();

    const channelName = [session.user.id, userId].sort().join("-");
    const channel = pusherClient.subscribe(`dm-${channelName}`);

    channel.bind("new-message", async (data) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
      await fetch("/api/notifications/mark-by-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: `/dashboard/dm/${userId}` }),
      });
    });

    channel.bind("edit-message", (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data._id
            ? { ...m, content: data.content, edited: true }
            : m,
        ),
      );
    });

    channel.bind("delete-message", (data) => {
      setMessages((prev) => prev.filter((m) => m._id !== data._id));
    });

    return () => pusherClient.unsubscribe(`dm-${channelName}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, session?.user?.id]);

  useEffect(() => {
    setActiveChat(`/dashboard/dm/${userId}`);
    return () => {
      setActiveChat(null);
      // Принуди sidebar да се update-ва когато напускаш
      fetch("/api/notifications/mark-by-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: `/dashboard/dm/${userId}` }),
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function sendMessage() {
    if ((!input.trim() && !imageFile) || sending) return;
    setSending(true);

    if (editingMsg) {
      await saveEdit(editingMsg);
      setSending(false);
      return;
    }

    let imageUrl = null;
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/upload/chat", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    await fetch(`/api/dm/${userId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim(), image: imageUrl }),
    });

    setInput("");

    if (inputRef.current) {
      inputRef.current.style.height = "42px";
    }

    setImageFile(null);
    setImagePreview(null);
    setSending(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function saveEdit(messageId) {
    if (!input.trim()) return;
    await fetch(`/api/dm/${userId}/messages`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, content: input }),
    });
    setEditingMsg(null);
    setInput("");
  }

  async function deleteMessage(messageId) {
    await fetch(`/api/dm/${userId}/messages`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId }),
    });
  }

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const oldest = messages[0]?.createdAt;
    const container = messagesRef.current;
    const prevScrollHeight = container?.scrollHeight;

    const res = await fetch(`/api/dm/${userId}/messages?before=${oldest}`);
    const data = await res.json();

    setMessages((prev) => [...(data.messages || []), ...prev]);
    setHasMore(data.hasMore || false);
    setLoadingMore(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    });
  }

  function handleScroll() {
    if (messagesRef.current?.scrollTop === 0) {
      loadMore();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === "Escape" && editingMsg) {
      setEditingMsg(null);
      setInput("");
    }
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString([], {
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        .dm-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--color-bg);
          font-family: 'DM Sans', sans-serif;
        }

        .dm-header {
          height: 60px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
        }

        .dm-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dm-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--color-text-muted);
          flex-shrink: 0;
        }

        .dm-header-info {}

        .dm-header-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: -6px;
        }

        .dm-header-sub {
          font-size: 12px;
          color: var(--color-text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .dm-header-sub:hover { color: var(--color-accent); }

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
        .date-divider-line { flex: 1; height: 1px; background: var(--color-border); }
        .date-divider-label { font-size: 11px; color: var(--color-text-muted); font-weight: 500; white-space: nowrap; }

        .msg-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 4px 0;
        }
        .msg-row.own { flex-direction: row-reverse; }

        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          margin-top: 4px;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .msg-meta {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 3px;
        }
        .msg-row.own .msg-meta { flex-direction: row-reverse; }

        .msg-name { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
        .msg-time { font-size: 12px; color: var(--color-text-muted); }

        .msg-bubble {
          display: inline-flex;
          padding: 9px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          color: var(--color-text-primary);
          background: white;
          border: 1px solid var(--color-border);
          max-width: 480px;
          word-break: break-word;
          align-items: center;
        }
        .msg-row.own .msg-bubble {
          background: var(--color-accent-muted);
          border-color: var(--color-accent-border);
        }

        .flex-end {
          align-self: flex-end;
        }

        .msg-image-wrap {
          margin-top: 4px;
          cursor: pointer;
          display: inline-block;
        }

        .msg-image-wrap img {
          border-radius: 12px;
          max-width: 300px;
          width: 100%;
          height: auto !important;
          display: block;
        }

        .cancelHover:hover {
          color: black !important;
        }


        .chat-input-wrap {
          padding: 14px 24px;
          border-top: 1px solid var(--color-border);
          background: white;
        }

        .chat-input-inner {
          display: flex;
          gap: 10px;
          padding: 4px 14px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
          max-width: calc(100vw - 100px);
          align-items: center;
          margin-left: auto;
          
        }
        .chat-input-inner:focus-within {
          border-color: var(--color-accent-border);
          box-shadow: 0 0 0 3px var(--color-accent-muted);
          background: white;
        }

        .chat-upload-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .chat-upload-btn:hover {
          border-color: var(--color-accent-border);
          color: var(--color-accent);
        }

        .chat-image-preview {
          position: relative;
          padding: 8px 16px 0;
          display: inline-block;
        }
        .chat-image-preview img {
          height: 80px;
          border-radius: 10px;
          object-fit: cover;
          border: 1px solid var(--color-border);
        }
        .chat-image-remove {
          position: absolute;
          top: 4px;
          right: 12px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1a2332;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .chat-textarea {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          color: var(--color-text-primary);
          outline: none;
          resize: none;
          max-height: 120px;
          line-height: 1.5;
          overflow-y: auto;

          padding: 10px 0;
          box-sizing: border-box;
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
        .chat-send-btn:hover:not(:disabled) { background: var(--color-accent); transform: scale(1.05); }
        .chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

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

      <div className="dm-page">
        {/* Header */}
        <div className="dm-header">
          <div className="dm-header-left">
            <div className="dm-avatar">
              {otherUser?.avatar ? (
                <Image
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  width={36}
                  height={36}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                otherUser?.name?.[0]
              )}
            </div>
            <div className="dm-header-info">
              <div className="dm-header-name">{otherUser?.name}</div>
              <Link
                href={`/profile/${otherUser?.githubUsername}`}
                className="dm-header-sub"
              >
                @{otherUser?.githubUsername}
              </Link>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="chat-messages"
          ref={messagesRef}
          onScroll={handleScroll}
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
              Start a conversation with {otherUser?.name}
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
            const isOwn = msg.sender?._id?.toString() === session?.user?.id;

            return (
              <div
                key={msg._id}
                className={`msg-row ${isOwn ? "own" : ""}`}
                onContextMenu={(e) => {
                  if (!isOwn) return;
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, msg, isOwn });
                }}
              >
                {!isOwn && (
                  <UserHoverCard user={msg.sender}>
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
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  {!isOwn && (
                    <div className="msg-meta">
                      <span className="msg-name">{msg.sender?.name}</span>
                      <span className="msg-time">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  {isOwn && (
                    <div className="msg-meta flex-end">
                      <span className="msg-time">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  {msg.content && (
                    <div className={`msg-bubble ${isOwn ? "flex-end" : ""}`}>
                      {msg.content}
                      {msg.edited && (
                        <span
                          style={{
                            fontSize: "10px",
                            opacity: 0.5,
                            marginLeft: "6px",
                          }}
                        >
                          (edited)
                        </span>
                      )}
                    </div>
                  )}
                  {msg.image && (
                    <div
                      className="msg-image-wrap"
                      onClick={() => setLightboxImage(msg.image)}
                    >
                      <Image
                        src={msg.image}
                        alt="image"
                        width={0}
                        height={0}
                        unoptimized
                        onLoad={() =>
                          bottomRef.current?.scrollIntoView({
                            behavior: "smooth",
                          })
                        }
                        style={{
                          borderRadius: "12px",
                          maxWidth: "300px",
                          width: "100%",
                          height: "auto",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />

          {contextMenu && (
            <MessageContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              canEdit={!!contextMenu.msg.a}
              onEdit={() => {
                setEditingMsg(contextMenu.msg._id);
                setInput(contextMenu.msg.a);
                inputRef.current?.focus();
              }}
              onDelete={() => deleteMessage(contextMenu.msg._id)}
              onClose={() => setContextMenu(null)}
            />
          )}
        </div>

        {editingMsg && (
          <div
            style={{
              padding: "4px 36px 6px",
              fontSize: "14px",
              color: "var(--color-accent)",
              display: "flex",
              justifyContent: "flex-start",
              gap: "12px",
            }}
          >
            <span>✏️ Editing message</span>
            <button
              onClick={() => {
                setEditingMsg(null);
                setInput("");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "15px",
                color: "var(--color-text-muted)",
              }}
              className="cancelHover"
            >
              ✕ Cancel
            </button>
          </div>
        )}

        {/* Input */}
        <div className="chat-input-wrap">
          {imagePreview && (
            <div className="chat-image-preview">
              <img src={imagePreview} alt="preview" />
              <button
                className="chat-image-remove"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (imageInputRef.current) imageInputRef.current.value = "";
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
          <div className="chat-input-inner">
            <button
              className="chat-upload-btn"
              onClick={() => imageInputRef.current?.click()}
              disabled={sending}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <textarea
              ref={inputRef}
              className="chat-textarea"
              placeholder={`Message ${otherUser?.name || ""}...`}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "42px";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              style={{ height: "42px" }}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={(!input.trim() && !imageFile) || sending}
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

        {lightboxImage &&
          createPortal(
            <div
              onClick={() => setLightboxImage(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={lightboxImage}
                alt="full"
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  width: "auto",
                  height: "auto",
                  borderRadius: "12px",
                  display: "block",
                }}
              />
            </div>,
            document.body,
          )}
      </div>
    </>
  );
}
