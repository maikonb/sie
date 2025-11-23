"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface SingleTabContextType {
  isBlocked: boolean;
  isChecking: boolean;
  takeOver: () => void;
}

const SingleTabContext = createContext<SingleTabContextType | undefined>(
  undefined
);

const CHANNEL_NAME = "sie_app_single_tab_channel";

type MessageType = "CHECK_ACTIVE" | "I_AM_ACTIVE" | "FORCE_TAKEOVER";

interface ChannelMessage {
  type: MessageType;
  tabId: string;
}

export function SingleTabProvider({ children }: { children: React.ReactNode }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  // Generate a unique ID for this tab session
  const [tabId] = useState(() => Math.random().toString(36).substring(2));

  const postMessage = useCallback(
    (type: MessageType) => {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type, tabId } as ChannelMessage);
      channel.close();
    },
    [tabId]
  );

  const takeOver = useCallback(() => {
    setIsBlocked(false);
    postMessage("FORCE_TAKEOVER");
  }, [postMessage]);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);

    const handleMessage = (event: MessageEvent<ChannelMessage>) => {
      const { type, tabId: senderTabId } = event.data;

      // Ignore messages from self
      if (senderTabId === tabId) return;

      switch (type) {
        case "CHECK_ACTIVE":
          if (!isBlocked && !isChecking) {
            postMessage("I_AM_ACTIVE");
          }
          break;
        case "I_AM_ACTIVE":
          setIsBlocked(true);
          setIsChecking(false);
          break;
        case "FORCE_TAKEOVER":
          setIsBlocked(true);
          break;
      }
    };

    channel.onmessage = handleMessage;

    postMessage("CHECK_ACTIVE");

    const timeoutId = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => {
      channel.close();
      clearTimeout(timeoutId);
    };
  }, [isBlocked, isChecking, postMessage, tabId]);

  return (
    <SingleTabContext.Provider value={{ isBlocked, isChecking, takeOver }}>
      {children}
    </SingleTabContext.Provider>
  );
}

export function useSingleTab() {
  const context = useContext(SingleTabContext);
  if (context === undefined) {
    throw new Error("useSingleTab must be used within a SingleTabProvider");
  }
  return context;
}
