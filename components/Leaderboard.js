"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Leaderboard({ groupId }) {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/groups/${groupId}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setLoading(false);
    }
    load();
  }, [groupId]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <style>{`
        .lb-wrap {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          font-family: 'DM Sans', sans-serif;
        }
        .lb-wrap::-webkit-scrollbar { width: 4px; }
        .lb-wrap::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

        .lb-title {
          font-family: 'DM Serif Display', serif;
          font-size: 18px;
          color: var(--color-text-primary);
          margin-bottom: 20px;
        }

        .lb-empty {
          text-align: center;
          color: var(--color-text-muted);
          font-size: 14px;
          padding: 40px 0;
        }

        .lb-podium {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .lb-podium-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .lb-podium-item:hover .lb-podium-avatar { border-color: var(--color-accent); }

        .lb-podium-avatar {
          border-radius: 50%;
          overflow: hidden;
          background: var(--color-accent-muted);
          border: 2px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--color-text-secondary);
          transition: border-color 0.2s;
          flex-shrink: 0;
        }

        .lb-podium-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-primary);
          max-width: 80px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .lb-podium-pts {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .lb-podium-bar {
          border-radius: 8px 8px 0 0;
          width: 60px;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-accent-border);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--color-accent);
        }

        .lb-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .lb-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
        }
        .lb-row:hover {
          background: var(--color-bg);
          border-color: var(--color-border);
        }
        .lb-row.me {
          background: var(--color-accent-muted);
          border-color: var(--color-accent-border);
        }

        .lb-rank {
          width: 24px;
          font-size: 13px;
          font-weight: 700;
          color: var(--color-text-muted);
          text-align: center;
          flex-shrink: 0;
        }

        .lb-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-secondary);
          flex-shrink: 0;
        }

        .lb-info {
          flex: 1;
          min-width: 0;
        }

        .lb-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .lb-username {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .lb-points {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-accent);
          flex-shrink: 0;
        }

        .lb-points-label {
          font-size: 11px;
          font-weight: 400;
          color: var(--color-text-muted);
        }

        .lb-divider {
          height: 1px;
          background: var(--color-border);
          margin: 16px 0;
        }
      `}</style>

      <div className="lb-wrap">
        <div className="lb-title">🏆 Leaderboard</div>

        {loading && <div className="lb-empty">Loading...</div>}

        {!loading && leaderboard.length === 0 && (
          <div className="lb-empty">
            No points yet. Complete assignments to earn points!
          </div>
        )}

        {!loading && leaderboard.length > 0 && (
          <>
            {/* Podium for top 3 */}
            {leaderboard.length >= 2 && (
              <div className="lb-podium">
                {/* 2nd place */}
                {leaderboard[1] && (
                  <div
                    className="lb-podium-item"
                    onClick={() =>
                      router.push(`/profile/${leaderboard[1].githubUsername}`)
                    }
                  >
                    <div
                      className="lb-podium-avatar"
                      style={{ width: 44, height: 44, fontSize: 16 }}
                    >
                      {leaderboard[1].avatar ? (
                        <Image
                          src={leaderboard[1].avatar}
                          alt={leaderboard[1].name}
                          width={44}
                          height={44}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        leaderboard[1].name?.[0]
                      )}
                    </div>
                    <div className="lb-podium-name">{leaderboard[1].name}</div>
                    <div className="lb-podium-pts">
                      {leaderboard[1].points} pts
                    </div>
                    <div className="lb-podium-bar" style={{ height: 48 }}>
                      🥈
                    </div>
                  </div>
                )}

                {/* 1st place */}
                {leaderboard[0] && (
                  <div
                    className="lb-podium-item"
                    onClick={() =>
                      router.push(`/profile/${leaderboard[0].githubUsername}`)
                    }
                  >
                    <div
                      className="lb-podium-avatar"
                      style={{ width: 56, height: 56, fontSize: 20 }}
                    >
                      {leaderboard[0].avatar ? (
                        <Image
                          src={leaderboard[0].avatar}
                          alt={leaderboard[0].name}
                          width={56}
                          height={56}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        leaderboard[0].name?.[0]
                      )}
                    </div>
                    <div className="lb-podium-name">{leaderboard[0].name}</div>
                    <div className="lb-podium-pts">
                      {leaderboard[0].points} pts
                    </div>
                    <div className="lb-podium-bar" style={{ height: 72 }}>
                      🥇
                    </div>
                  </div>
                )}

                {/* 3rd place */}
                {leaderboard[2] && (
                  <div
                    className="lb-podium-item"
                    onClick={() =>
                      router.push(`/profile/${leaderboard[2].githubUsername}`)
                    }
                  >
                    <div
                      className="lb-podium-avatar"
                      style={{ width: 40, height: 40, fontSize: 14 }}
                    >
                      {leaderboard[2].avatar ? (
                        <Image
                          src={leaderboard[2].avatar}
                          alt={leaderboard[2].name}
                          width={40}
                          height={40}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        leaderboard[2].name?.[0]
                      )}
                    </div>
                    <div className="lb-podium-name">{leaderboard[2].name}</div>
                    <div className="lb-podium-pts">
                      {leaderboard[2].points} pts
                    </div>
                    <div className="lb-podium-bar" style={{ height: 36 }}>
                      🥉
                    </div>
                  </div>
                )}
              </div>
            )}

            {leaderboard.length > 3 && <div className="lb-divider" />}

            {/* Rest of the list */}
            <div className="lb-list">
              {leaderboard
                .slice(leaderboard.length >= 2 ? 3 : 0)
                .map((user, i) => {
                  const rank = (leaderboard.length >= 2 ? 3 : 0) + i + 1;
                  return (
                    <div
                      key={user._id}
                      className={`lb-row ${user.isMe ? "me" : ""}`}
                      onClick={() =>
                        router.push(`/profile/${user.githubUsername}`)
                      }
                    >
                      <div className="lb-rank">{rank}</div>
                      <div className="lb-avatar">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={36}
                            height={36}
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          user.name?.[0]
                        )}
                      </div>
                      <div className="lb-info">
                        <div className="lb-name">
                          {user.name} {user.isMe ? "(you)" : ""}
                        </div>
                        <div className="lb-username">
                          @{user.githubUsername}
                        </div>
                      </div>
                      <div className="lb-points">
                        {user.points}{" "}
                        <span className="lb-points-label">pts</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
