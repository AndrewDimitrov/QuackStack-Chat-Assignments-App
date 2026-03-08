"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

export default function Assignments({
  groupId,
  isAdmin,
  session,
  initialAssignmentId,
}) {
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("subtab") || "assignments";
  });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [listOpen, setListOpen] = useState(true);

  // Create assignment form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  // Submit assignment form
  const [githubUrl, setGithubUrl] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState("");

  // Points override per submission
  const [pointsOverride, setPointsOverride] = useState({});

  // Custom work tab
  const [work, setWork] = useState([]);
  const [workLoading, setWorkLoading] = useState(false);
  const [workTitle, setWorkTitle] = useState("");
  const [workDesc, setWorkDesc] = useState("");
  const [workUrl, setWorkUrl] = useState("");
  const [workSubmitting, setWorkSubmitting] = useState(false);
  const [workError, setWorkError] = useState("");
  const [workPointsOverride, setWorkPointsOverride] = useState({});
  const [showWorkForm, setShowWorkForm] = useState(false);

  const [externalUrl, setExternalUrl] = useState("");
  const [requestedPoints, setRequestedPoints] = useState("");

  const [workExternalUrl, setWorkExternalUrl] = useState("");
  const [workRequestedPoints, setWorkRequestedPoints] = useState("");

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

  const loadWork = useCallback(async () => {
    setWorkLoading(true);
    const res = await fetch(`/api/groups/${groupId}/work`);
    const data = await res.json();
    setWork(data.work || []);
    setWorkLoading(false);
  }, [groupId]);

  useEffect(() => {
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  useEffect(() => {
    if (selected) loadSubmissions(selected._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?._id, groupId]);

  useEffect(() => {
    if (activeTab === "work") loadWork();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, groupId]);

  useEffect(() => {
    if (initialAssignmentId && assignments.length > 0) {
      const found = assignments.find((a) => a._id === initialAssignmentId);
      if (found) setSelected(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAssignmentId, assignments.length]);

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
    if (!githubUrl.trim() && !note.trim()) return;
    setSubmitting(true);
    setSubmitError("");

    const res = await fetch(
      `/api/groups/${groupId}/assignments/${selected._id}/submissions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubUrl,
          externalUrl,
          note,
          requestedPoints: requestedPoints ? Number(requestedPoints) : null,
        }),
      },
    );
    const data = await res.json();

    if (!res.ok) {
      setSubmitError(data.error);
      setSubmitting(false);
      return;
    }

    setGithubUrl("");
    setNote("");
    setSubmitting(false);
    loadSubmissions(selected._id);
  }

  async function reviewSubmission(submissionId, status, customPoints) {
    const pts = customPoints ? Number(customPoints) : undefined;
    await fetch(
      `/api/groups/${groupId}/assignments/${selected._id}/submissions`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          status,
          ...(pts ? { points: pts } : {}),
        }),
      },
    );
    setPointsOverride((prev) => {
      const n = { ...prev };
      delete n[submissionId];
      return n;
    });
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

  async function submitWork() {
    if (!workTitle.trim()) return;
    setWorkSubmitting(true);
    setWorkError("");

    const res = await fetch(`/api/groups/${groupId}/work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: workTitle,
        description: workDesc,
        githubUrl: workUrl,
        externalUrl: workExternalUrl,
        requestedPoints: workRequestedPoints
          ? Number(workRequestedPoints)
          : null,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setWorkError(data.error);
      setWorkSubmitting(false);
      return;
    }

    setWorkTitle("");
    setWorkDesc("");
    setWorkUrl("");
    setWorkExternalUrl("");
    setWorkRequestedPoints("");
    setShowWorkForm(false);
    setWorkSubmitting(false);
    loadWork();
  }

  async function reviewWork(workId, status, customPoints) {
    const pts = customPoints ? Number(customPoints) : undefined;
    await fetch(`/api/groups/${groupId}/work`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workId, status, ...(pts ? { points: pts } : {}) }),
    });
    setWorkPointsOverride((prev) => {
      const n = { ...prev };
      delete n[workId];
      return n;
    });
    loadWork();
  }

  async function deleteWork(workId) {
    await fetch(`/api/groups/${groupId}/work`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workId }),
    });
    loadWork();
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
          flex-direction: column;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* Tabs */
        .asgn-tabs {
          display: flex;
          border-bottom: 1px solid var(--color-border);
          background: white;
          padding: 0 16px;
          flex-shrink: 0;
        }

        .asgn-tab {
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-muted);
          cursor: pointer;
          border: none;
          background: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .asgn-tab:hover { color: var(--color-text-primary); }
        .asgn-tab.active {
          color: var(--color-text-primary);
          border-bottom-color: var(--color-text-primary);
          font-weight: 600;
        }

        .asgn-tab-badge {
          background: var(--color-accent-muted);
          color: var(--color-accent);
          border: 1px solid var(--color-accent-border);
          border-radius: 10px;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
        }

        /* Tab content */
        .asgn-tab-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* List panel */
        .asgn-list {
          width: 300px;
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          background: white;
          flex-shrink: 0;
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .asgn-list.collapsed {
          width: 48px;
          overflow: hidden;
        }

        .asgn-list-head {
          padding: 10px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          min-height: 53px;
        }

        .asgn-list-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
        }

        .asgn-list-head-btns {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
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
          flex-shrink: 0;
        }
        .asgn-create-btn:hover {
          border-color: var(--color-accent-border);
          color: var(--color-accent);
          background: var(--color-accent-muted);
        }

        .asgn-collapse-btn {
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
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .asgn-collapse-btn:hover {
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

        .submit-input-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
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

        .submit-note {
          width: 100%;
          padding: 9px 14px;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: var(--color-text-primary);
          outline: none;
          transition: all 0.2s;
          background: var(--color-bg);
          resize: none;
          box-sizing: border-box;
        }
        .submit-note:focus {
          border-color: var(--color-accent-border);
          box-shadow: 0 0 0 3px var(--color-accent-muted);
          background: white;
        }
        .submit-note::placeholder { color: var(--color-text-muted); }

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
          white-space: nowrap;
        }
        .status-pending { background: var(--color-warning-bg); color: var(--color-warning); }
        .status-approved { background: var(--color-success-bg); color: var(--color-success); }
        .status-rejected { background: var(--color-error-bg); color: var(--color-error); }

        /* Submissions list */
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
          font-size: 13px;
          color: var(--color-accent);
          text-decoration: none;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .submission-url:hover { text-decoration: underline; }

        .submission-note {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-top: 2px;
          font-style: italic;
        }

        .submission-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .points-override-input {
          width: 60px;
          padding: 5px 8px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          color: var(--color-text-primary);
          background: var(--color-bg);
          text-align: center;
          outline: none;
        }
        .points-override-input:focus { border-color: var(--color-accent-border); }

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
        .review-approve { background: var(--color-success-bg); color: var(--color-success); }
        .review-approve:hover { opacity: 0.8; }
        .review-reject { background: var(--color-error-bg); color: var(--color-error); }
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

        .create-row { display: flex; gap: 8px; }

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

        /* Work tab */
        .work-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--color-bg);
        }

        .work-panel-head {
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .work-panel-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .work-add-btn {
          padding: 7px 14px;
          background: var(--color-text-primary);
          color: white;
          border: none;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .work-add-btn:hover { opacity: 0.8; }

        .work-form {
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .work-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .work-list::-webkit-scrollbar { width: 4px; }
        .work-list::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

        .work-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 14px;
          padding: 16px;
        }

        .work-card-head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }

        .work-card-avatar {
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

        .work-card-info { flex: 1; min-width: 0; }

        .work-card-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: -4px;
        }

        .work-card-user {
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .work-card-desc {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 10px;
        }

        .work-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .work-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 640px) {
          .asgn-list { width: 100%; border-right: none; border-bottom: 1px solid var(--color-border); }
          .asgn-list.collapsed { width: 100%; height: 53px; }
          .asgn-tab-content { flex-direction: column; }
        }
      `}</style>

      <div className="assignments-wrap">
        {/* Tabs */}
        <div className="asgn-tabs">
          <button
            type="button"
            className={`asgn-tab ${activeTab === "assignments" ? "active" : ""}`}
            onClick={() => setActiveTab("assignments")}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            Assignments
            {assignments.length > 0 && (
              <span className="asgn-tab-badge">{assignments.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`asgn-tab ${activeTab === "work" ? "active" : ""}`}
            onClick={() => setActiveTab("work")}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Custom Projects
            {work.length > 0 && (
              <span className="asgn-tab-badge">{work.length}</span>
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="asgn-tab-content">
          {/* ── ASSIGNMENTS TAB ── */}
          {activeTab === "assignments" && (
            <>
              {/* Left panel */}
              <div className={`asgn-list ${listOpen ? "" : "collapsed"}`}>
                <div className="asgn-list-head">
                  {listOpen && (
                    <span className="asgn-list-title">Assignments</span>
                  )}
                  <div
                    className="asgn-list-head-btns"
                    style={{ marginLeft: listOpen ? 0 : "auto" }}
                  >
                    {isAdmin && listOpen && (
                      <button
                        type="button"
                        className="asgn-create-btn"
                        onClick={() => setShowCreate((v) => !v)}
                        title="New assignment"
                      >
                        +
                      </button>
                    )}
                    <button
                      type="button"
                      className="asgn-collapse-btn"
                      onClick={() => setListOpen((v) => !v)}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {listOpen ? (
                          <polyline points="15 18 9 12 15 6" />
                        ) : (
                          <polyline points="9 18 15 12 9 6" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                {listOpen && (
                  <>
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
                          onClick={() => {
                            setSelected(a);
                            setListOpen(true);
                          }}
                        >
                          <div className="asgn-item-title">{a.title}</div>
                          <div className="asgn-item-meta">
                            <span className="asgn-points">
                              ⭐ {a.points} pts
                            </span>
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
                  </>
                )}
              </div>

              {/* Right panel */}
              <div className="asgn-detail">
                {!selected ? (
                  <div className="asgn-detail-empty">
                    Select an assignment to view details
                  </div>
                ) : (
                  <>
                    <div className="asgn-detail-head">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div className="asgn-detail-title">
                          {selected.title}
                        </div>
                      </div>
                      <div className="asgn-detail-meta">
                        <span className="asgn-points">
                          ⭐ {selected.points} pts
                        </span>
                        {selected.dueDate && (
                          <span
                            className={`asgn-due ${isOverdue(selected.dueDate) ? "overdue" : ""}`}
                          >
                            {isOverdue(selected.dueDate)
                              ? "⚠ Overdue · "
                              : "Due "}
                            {formatDate(selected.dueDate)}
                          </span>
                        )}
                      </div>
                      {selected.description && (
                        <p className="asgn-detail-desc">
                          {selected.description}
                        </p>
                      )}
                    </div>

                    <div className="asgn-detail-body">
                      {/* Member submit */}
                      {!isAdmin && (
                        <div className="submit-section">
                          <div className="submit-section-title">
                            Your submission
                          </div>
                          {mySubmission ? (
                            editing ? (
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
                                    onClick={() =>
                                      editSubmission(mySubmission._id)
                                    }
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
                                {mySubmission.githubUrl && (
                                  <a
                                    href={mySubmission.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="submission-url"
                                    style={{ flex: 1 }}
                                  >
                                    {mySubmission.githubUrl}
                                  </a>
                                )}
                                {mySubmission.note &&
                                  !mySubmission.githubUrl && (
                                    <span
                                      style={{
                                        flex: 1,
                                        fontSize: "13px",
                                        color: "var(--color-text-secondary)",
                                        fontStyle: "italic",
                                      }}
                                    >
                                      &quot;{mySubmission.note}&quot;
                                    </span>
                                  )}
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
                                        border:
                                          "1px solid var(--color-error-bg)",
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
                            )
                          ) : (
                            <div className="submit-input-col">
                              <input
                                className="submit-input"
                                placeholder="GitHub URL — https://github.com/username/repo (optional)"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                              />
                              <input
                                className="submit-input"
                                placeholder="External link — https://yourproject.com (optional)"
                                value={externalUrl}
                                onChange={(e) => setExternalUrl(e.target.value)}
                              />
                              <textarea
                                className="submit-note"
                                placeholder="Add a note — describe what you built, any questions... (optional)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={2}
                              />
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <input
                                  className="submit-input"
                                  type="number"
                                  placeholder="Request points (optional)"
                                  value={requestedPoints}
                                  onChange={(e) =>
                                    setRequestedPoints(e.target.value)
                                  }
                                  min={1}
                                  style={{ maxWidth: "200px" }}
                                />
                                <button
                                  type="button"
                                  className="submit-btn"
                                  onClick={submitAssignment}
                                  disabled={
                                    submitting ||
                                    (!githubUrl.trim() &&
                                      !externalUrl.trim() &&
                                      !note.trim())
                                  }
                                >
                                  {submitting ? "Submitting..." : "Submit"}
                                </button>
                              </div>
                              {submitError && (
                                <p
                                  style={{
                                    fontSize: "12px",
                                    color: "var(--color-error)",
                                  }}
                                >
                                  {submitError}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Admin submissions */}
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
                                <div className="submission-name">
                                  {s.user?.name}
                                </div>
                                {s.githubUrl && (
                                  <a
                                    href={s.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="submission-url"
                                  >
                                    {s.githubUrl}
                                  </a>
                                )}
                                {s.externalUrl && (
                                  <a
                                    href={s.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="submission-url"
                                  >
                                    🔗 {s.externalUrl}
                                  </a>
                                )}
                                {s.note && (
                                  <div className="submission-note">
                                    &quot;{s.note}&quot;
                                  </div>
                                )}
                                {s.requestedPoints && (
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "var(--color-accent)",
                                      fontWeight: 600,
                                      marginTop: "2px",
                                    }}
                                  >
                                    Requested: {s.requestedPoints} pts
                                  </div>
                                )}
                              </div>
                              {s.status === "pending" ? (
                                <div className="submission-actions">
                                  <input
                                    type="number"
                                    className="points-override-input"
                                    placeholder={
                                      s.requestedPoints ||
                                      selected?.points ||
                                      "10"
                                    }
                                    value={pointsOverride[s._id] || ""}
                                    onChange={(e) =>
                                      setPointsOverride((prev) => ({
                                        ...prev,
                                        [s._id]: e.target.value,
                                      }))
                                    }
                                    min={1}
                                    title="Custom points"
                                  />
                                  <button
                                    type="button"
                                    className="review-btn review-approve"
                                    onClick={() =>
                                      reviewSubmission(
                                        s._id,
                                        "approved",
                                        pointsOverride[s._id] ||
                                          s.requestedPoints,
                                      )
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
                                <span
                                  className={`status-badge status-${s.status}`}
                                >
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
            </>
          )}

          {/* ── MY WORK TAB ── */}
          {activeTab === "work" && (
            <div className="work-panel">
              <div className="work-panel-head">
                <span className="work-panel-title">
                  {isAdmin
                    ? `All submissions (${work.length})`
                    : "Your Project Submissions"}
                </span>
                {!isAdmin && (
                  <button
                    type="button"
                    className="work-add-btn"
                    onClick={() => setShowWorkForm((v) => !v)}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Share work
                  </button>
                )}
              </div>

              {!isAdmin && showWorkForm && (
                <div className="work-form">
                  <input
                    className="create-input"
                    placeholder="Title *"
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                    autoFocus
                  />
                  <textarea
                    className="create-input"
                    placeholder="Describe what you built..."
                    value={workDesc}
                    onChange={(e) => setWorkDesc(e.target.value)}
                    rows={3}
                    style={{ resize: "none" }}
                  />
                  <input
                    className="create-input"
                    placeholder="GitHub URL — https://github.com/username/repo (optional)"
                    value={workUrl}
                    onChange={(e) => setWorkUrl(e.target.value)}
                  />
                  <input
                    className="create-input"
                    placeholder="External link — https://yourproject.com (optional)"
                    value={workExternalUrl}
                    onChange={(e) => setWorkExternalUrl(e.target.value)}
                  />
                  <input
                    className="create-input"
                    type="number"
                    placeholder="Request points (optional)"
                    value={workRequestedPoints}
                    onChange={(e) => setWorkRequestedPoints(e.target.value)}
                    min={1}
                  />
                  {workError && (
                    <p
                      style={{ fontSize: "12px", color: "var(--color-error)" }}
                    >
                      {workError}
                    </p>
                  )}
                  <div className="create-actions">
                    <button
                      type="button"
                      className="create-cancel"
                      onClick={() => setShowWorkForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="create-submit"
                      onClick={submitWork}
                      disabled={workSubmitting || !workTitle.trim()}
                    >
                      {workSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              )}

              <div className="work-list">
                {workLoading && (
                  <div
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "13px",
                    }}
                  >
                    Loading...
                  </div>
                )}
                {!workLoading && work.length === 0 && (
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
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    {isAdmin
                      ? "No submissions yet"
                      : "Share something you built!"}
                  </div>
                )}
                {work.map((w) => (
                  <div key={w._id} className="work-card">
                    <div className="work-card-head">
                      <div className="work-card-avatar">
                        {w.user?.avatar ? (
                          <Image
                            src={w.user.avatar}
                            alt={w.user.name}
                            width={32}
                            height={32}
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          w.user?.name?.[0]
                        )}
                      </div>
                      <div className="work-card-info">
                        <div className="work-card-title">{w.title}</div>
                        <div className="work-card-user">
                          {w.user?.name} ·{" "}
                          {new Date(w.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </div>
                      <span className={`status-badge status-${w.status}`}>
                        {w.status === "pending"
                          ? "Pending"
                          : w.status === "approved"
                            ? `✓ +${w.pointsGiven} pts`
                            : "✗ Rejected"}
                      </span>
                    </div>
                    {w.description && (
                      <p className="work-card-desc">{w.description}</p>
                    )}
                    <div className="work-card-footer">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {w.githubUrl && (
                          <a
                            href={w.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="submission-url"
                          >
                            GitHub: {w.githubUrl}
                          </a>
                        )}
                        {w.externalUrl && (
                          <a
                            href={w.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="submission-url"
                          >
                            🔗 {w.externalUrl}
                          </a>
                        )}
                        {w.requestedPoints && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--color-accent)",
                              fontWeight: 600,
                            }}
                          >
                            Requested: {w.requestedPoints} pts
                          </div>
                        )}
                      </div>
                      {isAdmin && w.status === "pending" ? (
                        <div className="work-card-actions">
                          <input
                            type="number"
                            className="points-override-input"
                            value={
                              workPointsOverride[w._id] ??
                              w.requestedPoints ??
                              ""
                            }
                            placeholder={"10"}
                            onChange={(e) =>
                              setWorkPointsOverride((prev) => ({
                                ...prev,
                                [w._id]: e.target.value,
                              }))
                            }
                            min={1}
                            title="Points to award"
                          />
                          <button
                            type="button"
                            className="review-btn review-approve"
                            onClick={() =>
                              reviewWork(
                                w._id,
                                "approved",
                                workPointsOverride[w._id] || w.requestedPoints,
                              )
                            }
                          >
                            ✓ Approve
                          </button>
                          <button
                            type="button"
                            className="review-btn review-reject"
                            onClick={() => reviewWork(w._id, "rejected")}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      ) : !isAdmin && w.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => deleteWork(w._id)}
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
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
