import { useCallback, useEffect, useState } from "react";
import type { Chat, Contact, Message } from "../types";
import { botReplies } from "../data";

export type Screen =
  | "splash"
  | "welcome"
  | "phone"
  | "otp"
  | "profile"
  | "home"
  | "chat"
  | "call"
  | "games"
  | "game-play";

export type Tab = "chats" | "calls" | "games" | "me";

const STATE_KEY = "bubbly-state-v1";

interface PersistedState {
  onboarded: boolean;
  profile: { name: string; avatar: string };
  phone: string;
  messages: Message[];
  chats: Chat[];
  contacts: Contact[];
}

export const seedContacts: Contact[] = [
  { id: "c1", name: "Luna", avatar: "🦄", color: "bg-gradient-to-br from-pink-400 to-fuchsia-600", status: "online", bio: "Adventure seeker ✨" },
  { id: "c2", name: "Max", avatar: "🐻", color: "bg-gradient-to-br from-amber-400 to-orange-600", status: "online", bio: "Bear hug dealer 🤗" },
  { id: "c3", name: "Sage", avatar: "🦊", color: "bg-gradient-to-br from-orange-400 to-red-500", status: "offline", lastSeen: "last seen 2h ago", bio: "Clever fox vibes" },
  { id: "c4", name: "Ollie", avatar: "🐙", color: "bg-gradient-to-br from-sky-400 to-indigo-600", status: "online", bio: "Multitasking champion" },
  { id: "c5", name: "The Squad", avatar: "🎉", color: "bg-gradient-to-br from-emerald-400 to-teal-600", status: "online", bio: "5 members · weekend plans" },
  { id: "c6", name: "Nova", avatar: "🐼", color: "bg-gradient-to-br from-slate-400 to-slate-700", status: "offline", lastSeen: "last seen today", bio: "Sleeping 23h/day" },
];

const now = Date.now();
const m = (mins: number) => now - mins * 60_000;

export const seedChats: Chat[] = [
  { id: "chat1", contactId: "c1", unread: 2, pinned: true },
  { id: "chat2", contactId: "c2", unread: 1 },
  { id: "chat3", contactId: "c4", unread: 0 },
  { id: "chat4", contactId: "c5", unread: 3 },
  { id: "chat5", contactId: "c3", unread: 0 },
  { id: "chat6", contactId: "c6", unread: 0, muted: true },
];

export const seedMessages: Message[] = [
  { id: "m1", chatId: "chat1", senderId: "c1", text: "OMG did you see the new update?! 🎉", timestamp: m(8), status: "delivered" },
  { id: "m2", chatId: "chat1", senderId: "c1", text: "Wanna play a quick game?", timestamp: m(2), status: "delivered" },
  { id: "m3", chatId: "chat2", senderId: "c2", text: "Hug delivered 🤗", timestamp: m(45), status: "read" },
  { id: "m4", chatId: "chat3", senderId: "c4", text: "Eight arms of approval 👍", timestamp: m(180), status: "read" },
  { id: "m5", chatId: "chat4", senderId: "c5", text: "Beach this Saturday?", timestamp: m(60), status: "delivered" },
  { id: "m6", chatId: "chat4", senderId: "c5", text: "YES YES YES", timestamp: m(58), status: "delivered" },
  { id: "m7", chatId: "chat4", senderId: "c5", text: "I'll bring snacks! 🍕", timestamp: m(55), status: "delivered" },
  { id: "m8", chatId: "chat5", senderId: "c3", text: "Clever plans incoming 🦊", timestamp: m(300), status: "read" },
  { id: "m9", chatId: "chat6", senderId: "c6", text: "zzz", timestamp: m(1500), status: "read" },
];

export interface CallState {
  type: "audio" | "video";
  contactId: string;
  direction: "incoming" | "outgoing" | "active";
  startedAt: number;
}

const defaultState: PersistedState = {
  onboarded: false,
  profile: { name: "", avatar: "🐵" },
  phone: "",
  messages: seedMessages,
  chats: seedChats,
  contacts: seedContacts,
};

function load(): PersistedState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function useAppState() {
  const [state, setState] = useState<PersistedState>(() => load());
  const [screen, setScreen] = useState<Screen>(load().onboarded ? "home" : "splash");
  const [tab, setTab] = useState<Tab>("chats");
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [activeCall, setActiveCall] = useState<CallState | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [typingIn, setTypingIn] = useState<string | null>(null);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  // Splash auto-advance
  useEffect(() => {
    if (screen === "splash") {
      const t = setTimeout(() => {
        setScreen(state.onboarded ? "home" : "welcome");
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [screen, state.onboarded]);

  const contactById = (id: string) => state.contacts.find((c) => c.id === id);

  const messagesByChat = (chatId: string) =>
    state.messages
      .filter((m) => m.chatId === chatId)
      .sort((a, b) => a.timestamp - b.timestamp);

  const setPhone = (phone: string) => setState((s) => ({ ...s, phone }));

  const completeOtp = () => {
    setState((s) => ({ ...s, onboarded: true }));
    setScreen("profile");
    setConfetti(true);
  };

  const completeProfile = (name: string, avatar: string) => {
    setState((s) => ({ ...s, profile: { name: name || "Friend", avatar } }));
    setScreen("home");
    setConfetti(true);
  };

  const openChat = (chatId: string) => {
    setActiveChatId(chatId);
    setScreen("chat");
    setState((s) => ({
      ...s,
      chats: s.chats.map((c) => (c.id === chatId ? { ...c, unread: 0 } : c)),
      messages: s.messages.map((m) =>
        m.chatId === chatId && m.senderId !== "me" && m.status !== "read"
          ? { ...m, status: "read" as const }
          : m
      ),
    }));
  };

  const sendMessage = (text: string) => {
    const chat = state.chats.find((c) => c.id === activeChatId);
    if (!chat || !text.trim()) return;
    const msg: Message = {
      id: `m_${Date.now()}`,
      chatId: chat.id,
      senderId: "me",
      text: text.trim(),
      timestamp: Date.now(),
      status: "sent",
    };
    setState((s) => ({ ...s, messages: [...s.messages, msg] }));
    const id = msg.id;
    setTimeout(() => {
      setState((s) => ({
        ...s,
        messages: s.messages.map((m) => (m.id === id ? { ...m, status: "delivered" } : m)),
      }));
    }, 500);
    setTimeout(() => {
      setState((s) => ({
        ...s,
        messages: s.messages.map((m) => (m.id === id ? { ...m, status: "read" } : m)),
      }));
    }, 1300);

    // Bot reply
    const pool = botReplies[chat.contactId] ?? ["😊", "Cool!", "Let's go!"];
    const replyText = pool[Math.floor(Math.random() * pool.length)];
    setTimeout(() => setTypingIn(chat.id), 1400);
    setTimeout(() => {
      setTypingIn(null);
      const reply: Message = {
        id: `m_${Date.now() + 1}`,
        chatId: chat.id,
        senderId: chat.contactId,
        text: replyText,
        timestamp: Date.now(),
        status: "delivered",
      };
      setState((s) => ({ ...s, messages: [...s.messages, reply] }));
    }, 3000);
  };

  const startCall = (contactId: string, type: "audio" | "video") => {
    setActiveCall({
      type,
      contactId,
      direction: "outgoing",
      startedAt: Date.now(),
    });
    setScreen("call");
    // Auto-connect after 2s
    setTimeout(() => {
      setActiveCall((c) => (c ? { ...c, direction: "active", startedAt: Date.now() } : c));
    }, 2200);
  };

  const endCall = () => {
    setActiveCall(null);
    setScreen("home");
  };

  const resetApp = useCallback(() => {
    localStorage.removeItem(STATE_KEY);
    setState(defaultState);
    setScreen("splash");
    setActiveChatId("");
    setActiveCall(null);
    setTab("chats");
  }, []);

  return {
    state,
    screen,
    setScreen,
    tab,
    setTab,
    activeChatId,
    openChat,
    sendMessage,
    contactById,
    messagesByChat,
    setPhone,
    completeOtp,
    completeProfile,
    activeCall,
    startCall,
    endCall,
    activeGame,
    setActiveGame,
    confetti,
    setConfetti,
    typingIn,
    resetApp,
  };
}
