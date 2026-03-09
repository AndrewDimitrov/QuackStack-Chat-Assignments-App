"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

export default function JoinPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { code } = useParams();
  const [state, setState] = useState("loading"); // loading, joining, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      localStorage.setItem("pendingInviteCode", code);
      router.push("/login");
      return;
    }
    if (status !== "authenticated" || !code) return;

    const pending = localStorage.getItem("pendingInviteCode");
    if (pending === code) {
      localStorage.removeItem("pendingInviteCode");
    }

    setState("joining");

    fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: code }),
    })
      .then((res) => res.json().then((data) => ({ res, data })))
      .then(({ res, data }) => {
        if (!res.ok) {
          setState("error");
          setMessage(data.error || "Invalid invite link");
          return;
        }
        router.push(`/dashboard/groups/${data.group._id}`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, code]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-primary)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          background: "white",
          borderRadius: "16px",
          border: "1px solid var(--color-border)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {state === "loading" && (
          <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
        )}
        {state === "joining" && (
          <p style={{ color: "var(--color-text-muted)" }}>Joining group...</p>
        )}
        {state === "error" && (
          <>
            <p style={{ color: "var(--color-error)", marginBottom: "16px" }}>
              {message}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
