"use client";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <>
      <style>{`
        .welcome {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 100%;
          font-family: 'DM Sans', sans-serif;
        }

        .welcome-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-accent-border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .welcome-title {
          font-family: 'DM Serif Display', serif;
          font-size: 24px;
          color: var(--color-text-primary);
          letter-spacing: -0.3px;
        }

        .welcome-sub {
          font-size: 14px;
          color: var(--color-text-muted);
          margin-bottom: 20%;
        }
      `}</style>

      <div className="welcome">
        <div className="welcome-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="welcome-title">
          Hey there, {session?.user?.name?.split(" ")[0]}!
        </div>
        <div className="welcome-sub">
          Select a group or conversation to get started.
        </div>
      </div>
    </>
  );
}
