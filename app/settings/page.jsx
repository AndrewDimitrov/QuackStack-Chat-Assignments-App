"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(session?.user?.name || "");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (deleteInput !== session?.user?.name) return;
    setDeleting(true);
    try {
      await fetch("/api/user/delete", { method: "DELETE" });
      await signOut({ callbackUrl: "/login" });
    } catch (e) {
      console.error(e);
    }
    setDeleting(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #a8d8f0 0%, #c8e8f8 40%, #e8f4fd 70%, #f0f8ff 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
        paddingTop: "80px",
        paddingBottom: "80px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .cloud {
          position: absolute;
          background: white;
          border-radius: 50px;
          opacity: 0.55;
          filter: blur(2px);
          pointer-events: none;
        }

        .settings-card {
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 28px;
          width: 100%;
          max-width: 520px;
          box-shadow: 
            0 8px 32px rgba(100,160,210,0.15),
            0 2px 8px rgba(100,160,210,0.1),
            inset 0 1px 0 rgba(255,255,255,0.8);
          position: relative;
          z-index: 10;
          animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          overflow: hidden;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .card-header {
          padding: 36px 44px 28px;
          border-bottom: 1px solid rgba(100,160,210,0.15);
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b8090;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 20px;
          padding: 0;
          transition: color 0.2s;
        }
        .back-btn:hover { color: #1a2a3a; }

        .page-title {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #1a2a3a;
          letter-spacing: -0.3px;
        }

        .page-subtitle {
          font-size: 13px;
          color: #6b8090;
          margin-top: 4px;
        }

        .section {
          padding: 28px 44px;
          border-bottom: 1px solid rgba(100,160,210,0.12);
        }

        .section:last-child {
          border-bottom: none;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: #9bb0be;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .field {
          margin-bottom: 18px;
        }

        .field:last-child { margin-bottom: 0; }

        label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #3a5060;
          margin-bottom: 8px;
        }

        input[type="text"], textarea, select {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(100,160,210,0.25);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1a2a3a;
          outline: none;
          transition: all 0.2s;
          -webkit-appearance: none;
        }

        input[type="text"]:focus, textarea:focus, select:focus {
          border-color: rgba(100,160,210,0.6);
          background: rgba(255,255,255,0.8);
          box-shadow: 0 0 0 3px rgba(100,160,210,0.1);
        }

        textarea {
          resize: none;
          height: 88px;
          line-height: 1.5;
        }

        select {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b8090' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }

        .hint {
          font-size: 12px;
          color: #9bb0be;
          margin-top: 6px;
        }

        .github-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(26,42,58,0.06);
          border: 1px solid rgba(26,42,58,0.1);
          border-radius: 12px;
        }

        .github-badge span {
          font-size: 14px;
          color: #1a2a3a;
          font-weight: 500;
        }

        .github-badge .sub {
          font-size: 12px;
          color: #6b8090;
          font-weight: 400;
          margin-left: auto;
        }

        .save-btn {
          width: 100%;
          padding: 13px 20px;
          background: #1a2a3a;
          color: white;
          border: none;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(26,42,58,0.2);
        }

        .save-btn:hover:not(:disabled) {
          background: #0f1d2a;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(26,42,58,0.25);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .save-btn.saved {
          background: #2d7a4f;
        }

        .delete-zone {
          padding: 28px 44px;
        }

        .delete-title {
          font-size: 11px;
          font-weight: 600;
          color: #e05c5c;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .delete-info {
          font-size: 13px;
          color: #6b8090;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .delete-btn {
          padding: 11px 20px;
          background: transparent;
          color: #e05c5c;
          border: 1px solid rgba(224,92,92,0.3);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          background: rgba(224,92,92,0.06);
          border-color: rgba(224,92,92,0.5);
        }

        .delete-confirm-box {
          margin-top: 16px;
          padding: 18px;
          background: rgba(224,92,92,0.05);
          border: 1px solid rgba(224,92,92,0.15);
          border-radius: 14px;
          animation: cardIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .delete-confirm-box p {
          font-size: 13px;
          color: #6b8090;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .delete-confirm-box strong {
          color: #1a2a3a;
        }

        .delete-final-btn {
          width: 100%;
          padding: 11px;
          background: #e05c5c;
          color: white;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 10px;
        }

        .delete-final-btn:hover:not(:disabled) {
          background: #c94c4c;
        }

        .delete-final-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .cancel-btn {
          width: 100%;
          padding: 10px;
          background: transparent;
          color: #6b8090;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          margin-top: 6px;
          transition: color 0.2s;
        }

        .cancel-btn:hover { color: #1a2a3a; }

        .logo {
          position: fixed;
          top: 28px;
          left: 32px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 20;
          cursor: pointer;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: #1a2a3a;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-family: 'DM Serif Display', serif;
          font-size: 18px;
          color: #1a2a3a;
        }
      `}</style>

      {/* Logo */}
      <div className="logo" onClick={() => router.push("/dashboard")}>
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
      </div>

      {/* Clouds */}
      <div
        className="cloud"
        style={{ width: 180, height: 50, bottom: "18%", left: "-2%" }}
      />
      <div
        className="cloud"
        style={{
          width: 240,
          height: 60,
          bottom: "12%",
          left: "5%",
          opacity: 0.4,
        }}
      />
      <div
        className="cloud"
        style={{
          width: 200,
          height: 55,
          bottom: "20%",
          right: "-3%",
          opacity: 0.45,
        }}
      />
      <div
        className="cloud"
        style={{
          width: 160,
          height: 45,
          bottom: "10%",
          right: "8%",
          opacity: 0.35,
        }}
      />
      <div
        className="cloud"
        style={{ width: 120, height: 35, top: "15%", left: "3%", opacity: 0.3 }}
      />

      {/* Card */}
      <div className="settings-card">
        {/* Header */}
        <div className="card-header">
          <button
            className="back-btn"
            onClick={() => router.push("/dashboard")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Manage your account preferences</div>
        </div>

        {/* GitHub (read-only) */}
        <div className="section">
          <div className="section-title">GitHub Account</div>
          <div className="github-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a2a3a">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>{session?.user?.githubUsername || session?.user?.name}</span>
            <span className="sub">Connected</span>
          </div>
          <p className="hint" style={{ marginTop: "10px" }}>
            Avatar and email are synced automatically from GitHub.
          </p>
        </div>

        {/* Profile */}
        <div className="section">
          <div className="section-title">Profile</div>
          <div className="field">
            <label>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="field">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a bit about yourself..."
            />
          </div>
        </div>

        {/* Save */}
        <div className="section">
          <button
            className={`save-btn ${saved ? "saved" : ""}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Danger Zone */}
        <div
          className="delete-zone"
          style={{ borderTop: "1px solid rgba(224,92,92,0.12)" }}
        >
          <div className="delete-title">Danger Zone</div>
          <p className="delete-info">
            Permanently delete your account. This will remove your profile, all
            messages, submissions, and points.{" "}
            <strong>This cannot be undone.</strong>
          </p>

          {!deleteConfirm ? (
            <button
              className="delete-btn"
              onClick={() => setDeleteConfirm(true)}
            >
              Delete my account
            </button>
          ) : (
            <div className="delete-confirm-box">
              <p>
                Type your name <strong>{session?.user?.name}</strong> to confirm
                deletion:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Your name"
              />
              <button
                className="delete-final-btn"
                onClick={handleDelete}
                disabled={deleteInput !== session?.user?.name || deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, permanently delete my account"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setDeleteConfirm(false);
                  setDeleteInput("");
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
