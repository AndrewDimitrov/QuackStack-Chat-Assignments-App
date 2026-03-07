"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

export default function Assignments({
  groupId,
  isAdmin,
  session,
  initialAssignmentId,
}) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Create form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  // Submit form state
  const [githubUrl, setGithubUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState("");

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/groups/${groupId}/assignments`);
    const data = await res.json();
    setAssignments(data.assignments || []);
    setLoading(false);
  }, [groupId]);

  const loadSubmissions = useCallback(
    async (assignmentId) => {
      const res = await fetch(
        `/api/groups/${groupId}/assignments/${assignmentId}/submissions`,
      );
      const data = await res.json();
      setSubmissions(data.submissions || []);
    },
    [groupId],
  );

  useEffect(() => {
    setLoading(true);
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAssignments]);

  useEffect(() => {
    if (selected) loadSubmissions(selected._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, loadSubmissions]);

  useEffect(() => {
    if (initialAssignmentId && assignments.length > 0) {
      const found = assignments.find((a) => a._id === initialAssignmentId);
      if (found) setSelected(found);
    }
  }, [initialAssignmentId, assignments]);

  async function createAssignment() {
    if (!title.trim()) return;
    setCreating(true);
    const res = await fetch(`/api/groups/${groupId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        points,
        dueDate: dueDate || null,
      }),
    });
    const data = await res.json();
    setAssignments((prev) => [data.assignment, ...prev]);
    setTitle("");
    setDescription("");
    setPoints(10);
    setDueDate("");
    setShowCreate(false);
    setCreating(false);
  }

  async function submitAssignment() {
    if (!githubUrl.trim()) return;
    setSubmitting(true);
    setSubmitError("");

    const res = await fetch(
      `/api/groups/${groupId}/assignments/${selected._id}/submissions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl }),
      },
    );
    const data = await res.json();

    if (!res.ok) {
      setSubmitError(data.error);
      setSubmitting(false);
      return;
    }

    setGithubUrl("");
    setSubmitting(false);
    loadSubmissions(selected._id);
  }

  async function reviewSubmission(submissionId, status) {
    await fetch(
      `/api/groups/${groupId}/assignments/${selected._id}/submissions`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, status }),
      },
    );
    loadSubmissions(selected._id);
  }

  async function deleteSubmission(submissionId) {
    await fetch(
      `/api/groups/${groupId}/assignments/${selected._id}/submissions`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      },
    );
    loadSubmissions(selected._id);
  }

  async function editSubmission(submissionId) {
    setEditError("");
    const res = await fetch(
      `/api/groups/${groupId}/assignments/${selected._id}/submissions`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, githubUrl: editUrl }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setEditError(data.error);
      return;
    }
    setEditing(false);
    setEditUrl("");
    loadSubmissions(selected._id);
  }

  function formatDate(date) {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function isOverdue(date) {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  const mySubmission = selected
    ? submissions.find((s) => s.user?._id?.toString() === session?.user?.id)
    : null;

  return (
    <>
      <style>{`
        .assignments-wrap {
          flex: 1;
          display: flex;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* List panel */
        .asgn-list {
          width: 300px;
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          background: white;
          flex-shrink: 0;
        }

        .asgn-list-head {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .asgn-list-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .asgn-create-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: white;
          color: var(--color-text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          line-height: 1;
          transition: all 0.15s;
        }
        .asgn-create-btn:hover {
          border-color: var(--color-accent-border);
          color: var(--color-accent);
          background: var(--color-accent-muted);
        }

        .asgn-items {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        .asgn-items::-webkit-scrollbar { width: 4px; }
        .asgn-items::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

        .asgn-item {
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          border: 1px solid transparent;
          margin-bottom: 4px;
        }
        .asgn-item:hover { background: var(--color-bg); }
        .asgn-item.active {
          background: var(--color-accent-muted);
          border-color: var(--color-accent-border);
        }

        .asgn-item-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 4px;
        }

        .asgn-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .asgn-points {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-accent);
          background: var(--color-accent-muted);
          border: 1px solid var(--color-accent-border);
          padding: 2px 7px;
          border-radius: 6px;
        }

        .asgn-due {
          font-size: 11px;
          color: var(--color-text-muted);
        }
        .asgn-due.overdue { color: var(--color-error); }

        .asgn-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--color-text-muted);
          font-size: 13px;
          padding: 32px;
          text-align: center;
        }

        /* Detail panel */
        .asgn-detail {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--color-bg);
        }

        .asgn-detail-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          font-size: 14px;
        }

        .asgn-detail-head {
          padding: 20px 24px 16px;
          background: white;
          border-bottom: 1px solid var(--color-border);
        }

        .asgn-detail-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: 'DM Serif Display', serif;
          margin-bottom: 8px;
        }

        .asgn-detail-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .asgn-detail-desc {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-top: 10px;
        }

        .asgn-detail-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }
        .asgn-detail-body::-webkit-scrollbar { width: 4px; }
        .asgn-detail-body::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

        /* Submit section */
        .submit-section {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .submit-section-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 12px;
        }

        .submit-input-row {
          display: flex;
          gap: 8px;
        }

        .submit-input {
          flex: 1;
          padding: 9px 14px;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: var(--color-text-primary);
          outline: none;
          transition: all 0.2s;
          background: var(--color-bg);
        }
        .submit-input:focus {
          border-color: var(--color-accent-border);
          box-shadow: 0 0 0 3px var(--color-accent-muted);
          background: white;
        }
        .submit-input::placeholder { color: var(--color-text-muted); }

        .submit-btn {
          padding: 9px 18px;
          background: var(--color-text-primary);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.85; }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .my-submission {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 10px;
        }

        .status-badge {
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        .status-pending { background: var(--color-warning-bg); color: var(--color-warning); }
        .status-approved { background: var(--color-success-bg); color: var(--color-success); }
        .status-rejected { background: var(--color-error-bg); color: var(--color-error); }

        /* Submissions list (admin) */
        .submissions-section-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 12px;
        }

        .submission-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          margin-bottom: 8px;
        }

        .submission-avatar {
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
        }

        .submission-info { flex: 1; min-width: 0; }

        .submission-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .submission-url {
          font-size: 12px;
          color: var(--color-accent);
          text-decoration: none;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .submission-url:hover { text-decoration: underline; }

        .submission-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .review-btn {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
        }
        .review-approve {
          background: var(--color-success-bg);
          color: var(--color-success);
        }
        .review-approve:hover { opacity: 0.8; }
        .review-reject {
          background: var(--color-error-bg);
          color: var(--color-error);
        }
        .review-reject:hover { opacity: 0.8; }

        /* Create form */
        .create-form {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-bg-subtle);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .create-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--color-border);
          border-radius: 9px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: var(--color-text-primary);
          outline: none;
          background: white;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .create-input:focus {
          border-color: var(--color-accent-border);
          box-shadow: 0 0 0 3px var(--color-accent-muted);
        }
        .create-input::placeholder { color: var(--color-text-muted); }

        .create-row {
          display: flex;
          gap: 8px;
        }

        .create-actions {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
        }

        .create-submit {
          padding: 7px 16px;
          background: var(--color-text-primary);
          color: white;
          border: none;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .create-submit:hover:not(:disabled) { opacity: 0.85; }
        .create-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        .create-cancel {
          padding: 7px 16px;
          background: white;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          border-radius: 9px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }
        .create-cancel:hover { border-color: var(--color-accent-border); color: var(--color-accent); }
      `}</style>

      <div className="assignments-wrap">
        {/* Left panel — list */}
        <div className="asgn-list">
          <div className="asgn-list-head">
            <span className="asgn-list-title">Assignments</span>
            {isAdmin && (
              <button
                type="button"
                className="asgn-create-btn"
                onClick={() => setShowCreate((v) => !v)}
                title="New assignment"
              >
                +
              </button>
            )}
          </div>

          {showCreate && (
            <div className="create-form">
              <input
                className="create-input"
                placeholder="Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <textarea
                className="create-input"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                style={{ resize: "none" }}
              />
              <div className="create-row">
                <input
                  className="create-input"
                  type="number"
                  placeholder="Points"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  min={1}
                  style={{ flex: 1 }}
                />
                <input
                  className="create-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
              <div className="create-actions">
                <button
                  type="button"
                  className="create-cancel"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="create-submit"
                  onClick={createAssignment}
                  disabled={creating || !title.trim()}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          )}

          <div className="asgn-items">
            {loading && <div className="asgn-empty">Loading...</div>}
            {!loading && assignments.length === 0 && (
              <div className="asgn-empty">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ opacity: 0.3 }}
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                {isAdmin
                  ? "Create your first assignment"
                  : "No assignments yet"}
              </div>
            )}
            {assignments.map((a) => (
              <div
                key={a._id}
                className={`asgn-item ${selected?._id === a._id ? "active" : ""}`}
                onClick={() => setSelected(a)}
              >
                <div className="asgn-item-title">{a.title}</div>
                <div className="asgn-item-meta">
                  <span className="asgn-points">⭐ {a.points} pts</span>
                  {a.dueDate && (
                    <span
                      className={`asgn-due ${isOverdue(a.dueDate) ? "overdue" : ""}`}
                    >
                      {isOverdue(a.dueDate) ? "⚠ " : ""}Due{" "}
                      {formatDate(a.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — detail */}
        <div className="asgn-detail">
          {!selected ? (
            <div className="asgn-detail-empty">
              Select an assignment to view details
            </div>
          ) : (
            <>
              <div className="asgn-detail-head">
                <div className="asgn-detail-title">{selected.title}</div>
                <div className="asgn-detail-meta">
                  <span className="asgn-points">⭐ {selected.points} pts</span>
                  {selected.dueDate && (
                    <span
                      className={`asgn-due ${isOverdue(selected.dueDate) ? "overdue" : ""}`}
                    >
                      {isOverdue(selected.dueDate) ? "⚠ Overdue · " : "Due "}
                      {formatDate(selected.dueDate)}
                    </span>
                  )}
                </div>
                {selected.description && (
                  <p className="asgn-detail-desc">{selected.description}</p>
                )}
              </div>

              <div className="asgn-detail-body">
                {/* Member submit section */}
                {!isAdmin && (
                  <div className="submit-section">
                    <div className="submit-section-title">Your submission</div>
                    {mySubmission ? (
                      <div>
                        {editing ? (
                          <>
                            <div className="submit-input-row">
                              <input
                                className="submit-input"
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                placeholder="https://github.com/username/repo"
                              />
                              <button
                                type="button"
                                className="submit-btn"
                                onClick={() => editSubmission(mySubmission._id)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditing(false)}
                                style={{
                                  padding: "9px 14px",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: "10px",
                                  background: "white",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  color: "var(--color-text-secondary)",
                                  fontFamily: "'DM Sans', sans-serif",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                            {editError && (
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "var(--color-error)",
                                  marginTop: "6px",
                                }}
                              >
                                {editError}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="my-submission">
                            <a
                              href={mySubmission.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="submission-url"
                              style={{ flex: 1 }}
                            >
                              {mySubmission.githubUrl}
                            </a>
                            <span
                              className={`status-badge status-${mySubmission.status}`}
                            >
                              {mySubmission.status === "pending"
                                ? "Pending review"
                                : mySubmission.status === "approved"
                                  ? `✓ Approved · +${mySubmission.pointsGiven} pts`
                                  : "✗ Rejected"}
                            </span>
                            {mySubmission.status === "pending" && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  marginLeft: "8px",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditing(true);
                                    setEditUrl(mySubmission.githubUrl);
                                  }}
                                  style={{
                                    padding: "4px 10px",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "7px",
                                    background: "white",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    color: "var(--color-text-secondary)",
                                    fontFamily: "'DM Sans', sans-serif",
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteSubmission(mySubmission._id)
                                  }
                                  style={{
                                    padding: "4px 10px",
                                    border: "1px solid var(--color-error-bg)",
                                    borderRadius: "7px",
                                    background: "var(--color-error-bg)",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    color: "var(--color-error)",
                                    fontFamily: "'DM Sans', sans-serif",
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="submit-input-row">
                          <input
                            className="submit-input"
                            placeholder="https://github.com/username/repo"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                          />
                          <button
                            type="button"
                            className="submit-btn"
                            onClick={submitAssignment}
                            disabled={submitting || !githubUrl.trim()}
                          >
                            {submitting ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                        {submitError && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--color-error)",
                              marginTop: "6px",
                            }}
                          >
                            {submitError}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Admin submissions list */}
                {isAdmin && (
                  <>
                    <div className="submissions-section-title">
                      Submissions ({submissions.length})
                    </div>
                    {submissions.length === 0 && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        No submissions yet.
                      </p>
                    )}
                    {submissions.map((s) => (
                      <div key={s._id} className="submission-row">
                        <div className="submission-avatar">
                          {s.user?.avatar ? (
                            <Image
                              src={s.user.avatar}
                              alt={s.user.name}
                              width={32}
                              height={32}
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            s.user?.name?.[0]
                          )}
                        </div>
                        <div className="submission-info">
                          <div className="submission-name">{s.user?.name}</div>
                          <a
                            href={s.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="submission-url"
                          >
                            {s.githubUrl}
                          </a>
                        </div>
                        {s.status === "pending" ? (
                          <div className="submission-actions">
                            <button
                              type="button"
                              className="review-btn review-approve"
                              onClick={() =>
                                reviewSubmission(s._id, "approved")
                              }
                            >
                              ✓ Approve
                            </button>
                            <button
                              type="button"
                              className="review-btn review-reject"
                              onClick={() =>
                                reviewSubmission(s._id, "rejected")
                              }
                            >
                              ✗ Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`status-badge status-${s.status}`}>
                            {s.status === "approved"
                              ? `✓ +${s.pointsGiven} pts`
                              : "✗ Rejected"}
                          </span>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
