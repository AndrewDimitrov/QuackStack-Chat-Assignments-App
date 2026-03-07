"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";

const STATUS_CONFIG = {
  approved: {
    label: "Approved",
    color: "var(--color-success)",
    bg: "var(--color-success-bg)",
    icon: "✓",
  },
  rejected: {
    label: "Rejected",
    color: "var(--color-error)",
    bg: "var(--color-error-bg)",
    icon: "✗",
  },
  pending: {
    label: "Pending",
    color: "var(--color-warning)",
    bg: "var(--color-warning-bg)",
    icon: "⏳",
  },
};

export default function ProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [githubUser, setGithubUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profileRes, reposRes, githubUserRes] = await Promise.all([
        fetch(`/api/profile/${username}`),
        fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`,
        ),
        fetch(`https://api.github.com/users/${username}`),
      ]);
      const profile = await profileRes.json();
      const reposData = await reposRes.json();
      const ghUser = await githubUserRes.json();
      setData(profile);
      setRepos(Array.isArray(reposData) ? reposData : []);
      setGithubUser(ghUser);
      setLoading(false);
    }
    load();
  }, [username]);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Header />
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            color: "var(--color-text-muted)",
          }}
        >
          Loading...
        </span>
      </div>
    );

  if (!data?.user)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Header />
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            color: "var(--color-text-muted)",
          }}
        >
          User not found.
        </span>
      </div>
    );

  const { user, groups, submissions } = data;
  const joinedDate = githubUser?.created_at
    ? new Date(githubUser.created_at).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        .profile-page {
          min-height: 100vh;
          background: var(--color-bg);
          padding-top: 0;
          font-family: 'DM Sans', sans-serif;
        }

        /* Subtle top accent stripe */
        .accent-stripe {
          height: 3px;
          background: linear-gradient(90deg, var(--color-accent-light), var(--color-accent), var(--color-accent-light));
          opacity: 0.5;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 80px;
        }

        @media (max-width: 1024px) {
          .container { padding: 0 40px; }
        }
        @media (max-width: 640px) {
          .container { padding: 0 20px; }
        }

        /* ── Hero ── */
        .hero {
          padding: 56px 0 48px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-bottom: 1px solid var(--color-border);
        }

        @media (max-width: 768px) {
          .hero { grid-template-columns: 1fr; }
          .hero-groups { display: none; }
        }

        .avatar-wrap {
          position: relative;
        }

        .avatar-img {
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: var(--shadow-md), 0 0 0 1px var(--color-border);
          display: block;
        }

        .hero-info {
          padding-top: 4px;
        }

        .hero-name {
          font-family: 'DM Serif Display', serif;
          font-size: 36px;
          color: var(--color-text-primary);
          letter-spacing: -0.5px;
          margin-bottom: 8px;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-github {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: color 0.2s;
          margin-bottom: 10px;
        }
        .hero-github:hover { color: var(--color-accent); }

        .hero-meta {
          display: flex;
          align-items: column;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--color-text-muted);
        }

        .points-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-accent-border);
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-accent);
        }

        .hero-bio {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.65;
          margin-top: 14px;
          max-width: 480px;
        }

        /* Groups in hero (right side) */
        .hero-groups {
          padding-top: 4px;
          min-width: 220px;
          max-width: 260px;
          align-self: flex-start;
        }

        .hero-groups-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-muted);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .group-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid var(--color-border);
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .group-row:last-child { border-bottom: none; }
        .group-row:hover { opacity: 0.65; }

        .group-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-accent-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .group-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        /* ── Activity ── */
        .section-wrap {
          padding: 52px 0;
          border-bottom: 1px solid var(--color-border);
        }

        .section-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: var(--color-text-primary);
          margin-bottom: 28px;
          letter-spacing: -0.3px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .activity-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .activity-row:last-child { border-bottom: none; }

        .activity-left {}

        .activity-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: 5px;
        }

        .activity-sub {
          font-size: 13px;
          color: var(--color-text-muted);
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
          white-space: nowrap;
        }

        /* ── Repos ── */
        .repos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 900px) {
          .repos-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .repos-grid { grid-template-columns: 1fr; }
        }

        .repo-card {
          padding: 22px 24px;
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .repo-card:hover {
          border-color: var(--color-accent-border);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .repo-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .repo-desc {
          font-size: 13px;
          color: var(--color-text-secondary);
          line-height: 1.5;
          flex: 1;
        }

        .repo-footer {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 4px;
        }

        .repo-lang {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .lang-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-accent);
        }

        .repo-stat {
          font-size: 12px;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .empty-state {
          font-size: 14px;
          color: var(--color-text-muted);
          padding: 8px 0;
        }
      `}</style>

      <Header />

      <div className="profile-page">
        <div className="accent-stripe" />

        <div className="container">
          {/* Hero */}
          <div className="hero">
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}
            >
              {/* Ляво: avatar + name в ред, а meta под тях */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {/* Avatar + Name в ред */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  <div className="avatar-wrap">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={88}
                      height={88}
                      className="avatar-img"
                    />
                  </div>
                  <div className="hero-info">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div className="hero-name">{user.name}</div>
                      <button
                        onClick={() => router.push(`/dashboard/dm/${user._id}`)} // трябва _id от API-то
                        style={{
                          padding: "6px 12px",
                          background: "var(--color-text-primary)",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
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
                        Message
                      </button>
                    </div>

                    <a
                      href={`https://github.com/${user.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-github"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      @{user.githubUsername}
                    </a>
                    {user.bio && <p className="hero-bio">{user.bio}</p>}
                  </div>
                </div>

                {/* Meta под avatar + name */}
                <div className="hero-meta">
                  {joinedDate && (
                    <span className="meta-pill">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      GitHub since {joinedDate}
                    </span>
                  )}
                  <span className="points-pill">✦ {user.points} points</span>
                </div>
              </div>

              {/* Groups вдясно */}
              <div
                className="hero-groups"
                style={{ marginLeft: "auto", flexShrink: 0 }}
              >
                <div className="hero-groups-label">Groups</div>
                {groups.length === 0 ? (
                  <p className="empty-state">No groups yet.</p>
                ) : (
                  groups.map((group) => (
                    <a
                      key={group.id}
                      href={`/dashboard/groups/${group.id}`}
                      className="group-row"
                    >
                      <div className="group-icon">
                        {group.icon ? (
                          <Image
                            src={group.icon}
                            alt={group.name}
                            width={34}
                            height={34}
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          "👥"
                        )}
                      </div>
                      <span className="group-name">{group.name}</span>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="section-wrap">
            <div className="section-heading">Recent Activity</div>
            {submissions.length === 0 ? (
              <p className="empty-state">No submissions yet.</p>
            ) : (
              <div className="activity-list">
                {submissions.map((s) => {
                  const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
                  const date = new Date(s.createdAt).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  );
                  return (
                    <div key={s.id} className="activity-row">
                      <div className="activity-left">
                        <div className="activity-title">
                          {s.assignmentTitle}
                        </div>
                        <div className="activity-sub">
                          {s.groupName && <span>in {s.groupName} · </span>}
                          {s.status === "approved" && (
                            <span>{s.pointsGiven} pts · </span>
                          )}
                          <span>{date}</span>
                        </div>
                      </div>
                      <span
                        className="status-chip"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* GitHub Repos */}
          {repos.length > 0 && (
            <div className="section-wrap">
              <div className="section-heading">GitHub Repositories</div>
              <div className="repos-grid">
                {repos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-card"
                  >
                    <div className="repo-name">{repo.name}</div>
                    <div className="repo-desc">
                      {repo.description || "No description"}
                    </div>
                    <div className="repo-footer">
                      {repo.language && (
                        <span className="repo-lang">
                          <span className="lang-dot" />
                          {repo.language}
                        </span>
                      )}
                      <span className="repo-stat">
                        ⭐ {repo.stargazers_count}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
