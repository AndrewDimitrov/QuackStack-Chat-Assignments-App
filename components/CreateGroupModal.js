"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateGroupModal({ onClose, editGroup = null }) {
  const router = useRouter();
  const isEdit = !!editGroup;
  const [name, setName] = useState(editGroup?.name || "");
  const [description, setDescription] = useState(editGroup?.description || "");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(editGroup?.icon || null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");

    let iconUrl = editGroup?.icon || null;

    if (logo) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", logo);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError("Failed to upload logo");
        setSaving(false);
        setUploading(false);
        return;
      }
      iconUrl = uploadData.url;
      setUploading(false);
    }

    if (isEdit) {
      const res = await fetch(`/api/groups/${editGroup._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon: iconUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update group");
        setSaving(false);
        return;
      }
      setSaving(false);
      onClose(data.group);
      return;
    }

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
        icon: iconUrl,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create group");
      setSaving(false);
      return;
    }
    setSaving(false);
    onClose();
    router.push(`/dashboard/groups/${data.group._id}`);
  }

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-card {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-head {
          padding: 24px 24px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title {
          font-family: 'DM Serif Display', serif;
          font-size: 20px;
          color: var(--color-text-primary);
        }

        .modal-close {
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
          transition: all 0.15s;
        }
        .modal-close:hover {
          background: var(--color-bg);
          color: var(--color-text-primary);
        }

        .modal-body {
          padding: 20px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Logo upload */
        .logo-upload {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo-preview {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          background: var(--color-accent-muted);
          border: 2px dashed var(--color-accent-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          overflow: hidden;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logo-preview:hover {
          border-color: var(--color-accent);
          background: rgba(100, 176, 232, 0.15);
        }

        .logo-upload-info {}

        .logo-upload-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 4px;
        }

        .logo-upload-sub {
          font-size: 12px;
          color: var(--color-text-muted);
          margin-bottom: 8px;
        }

        .logo-upload-btn {
          padding: 6px 14px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: white;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.15s;
        }
        .logo-upload-btn:hover {
          border-color: var(--color-accent-border);
          color: var(--color-accent);
        }

        /* Inputs */
        .modal-field {}

        .modal-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .modal-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--color-border);
          border-radius: 11px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: var(--color-text-primary);
          outline: none;
          background: var(--color-bg);
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .modal-input:focus {
          border-color: var(--color-accent-border);
          box-shadow: 0 0 0 3px var(--color-accent-muted);
          background: white;
        }
        .modal-input::placeholder { color: var(--color-text-muted); }

        .modal-textarea {
          resize: none;
          height: 80px;
        }

        .modal-error {
          font-size: 12px;
          color: var(--color-error);
          background: var(--color-error-bg);
          padding: 8px 12px;
          border-radius: 8px;
        }

        /* Footer */
        .modal-footer {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .modal-btn-cancel {
          padding: 10px 20px;
          border: 1px solid var(--color-border);
          border-radius: 11px;
          background: white;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.15s;
        }
        .modal-btn-cancel:hover {
          border-color: var(--color-accent-border);
          color: var(--color-text-primary);
        }

        .modal-btn-create {
          padding: 10px 24px;
          border: none;
          border-radius: 11px;
          background: var(--color-text-primary);
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .modal-btn-create:hover:not(:disabled) { opacity: 0.85; }
        .modal-btn-create:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div
        className="modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-card">
          <div className="modal-head">
            <span className="modal-title">
              {isEdit ? "Edit group" : "Create a group"}
            </span>
            <button
              type="button"
              className="modal-close"
              onClick={() => onClose()}
            >
              <svg
                width="14"
                height="14"
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
          <div className="modal-body">
            <div className="logo-upload">
              <div
                className="logo-preview"
                onClick={() => fileRef.current?.click()}
              >
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="logo"
                    width={64}
                    height={64}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : (
                  "👥"
                )}
              </div>
              <div className="logo-upload-info">
                <div className="logo-upload-title">Group logo</div>
                <div className="logo-upload-sub">PNG, JPG up to 5MB</div>
                <button
                  type="button"
                  className="logo-upload-btn"
                  onClick={() => fileRef.current?.click()}
                >
                  {logoPreview ? "Change logo" : "Upload logo"}
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleLogoChange}
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Group name *</label>
              <input
                className="modal-input"
                placeholder="e.g. Frontend Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Description</label>
              <textarea
                className="modal-input modal-textarea"
                placeholder="What is this group about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn-create"
                onClick={handleSubmit}
                disabled={saving || uploading || !name.trim()}
              >
                {uploading
                  ? "Uploading..."
                  : saving
                    ? "Saving..."
                    : isEdit
                      ? "Save changes"
                      : "Create group"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
