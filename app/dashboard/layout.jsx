"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        .dashboard-root {
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        .dashboard-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          margin-top: 0;
        }

        /* Desktop sidebar */
        .sidebar-desktop {
          width: 260px;
          flex-shrink: 0;
          height: 100%;
          display: flex;
        }

        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
        }

        /* Mobile sidebar overlay */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
        }

        .sidebar-overlay-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(26, 42, 58, 0.4);
          backdrop-filter: blur(2px);
          animation: fadeIn 0.2s ease both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .sidebar-overlay-panel {
          position: relative;
          width: 280px;
          height: 100%;
          z-index: 1;
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        .main-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: var(--color-bg);
        }

        /* Hamburger button */
        .hamburger {
          display: none;
          position: fixed;
          bottom: 24px;
          left: 16px;
          z-index: 150;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--color-text-primary);
          border: none;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(26,42,58,0.2);
          transition: all 0.2s;
        }
        .hamburger:hover {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .hamburger { display: flex; }
        }
      `}</style>

      <div className="dashboard-root">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-body">
          {/* Desktop sidebar */}
          <div className="sidebar-desktop">
            <Sidebar />
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="sidebar-overlay">
              <div
                className="sidebar-overlay-backdrop"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="sidebar-overlay-panel">
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="main-content">{children}</main>
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      </div>
    </>
  );
}
