"use client";
import { createContext, useContext, useState } from "react";
import { SessionProvider } from "next-auth/react";

const ActiveChatContext = createContext(null);

export function useActiveChat() {
  return useContext(ActiveChatContext);
}

export default function Providers({ children }) {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <SessionProvider>
      <ActiveChatContext.Provider value={{ activeChat, setActiveChat }}>
        {children}
      </ActiveChatContext.Provider>
    </SessionProvider>
  );
}
