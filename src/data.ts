import type { Contact, Chat, Message } from "./types";

export const ME_ID = "me";

export const seedContacts: Contact[] = [
  {
    id: "c1",
    name: "Ada Lovelace",
    avatar: "👩‍💻",
    color: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
    status: "online",
    bio: "Analytical engine enthusiast 🧮",
  },
  {
    id: "c2",
    name: "Family Group",
    avatar: "👨‍👩‍👧‍👦",
    color: "bg-gradient-to-br from-amber-500 to-orange-600",
    status: "online",
    bio: "5 members · Mom, Dad, Sis, Bro, You",
  },
  {
    id: "c3",
    name: "Kenji Tanaka",
    avatar: "🧑‍🎨",
    color: "bg-gradient-to-br from-sky-500 to-indigo-600",
    status: "offline",
    lastSeen: "last seen today at 10:42",
    bio: "Designer · Coffee powered ☕",
  },
  {
    id: "c4",
    name: "Priya Sharma",
    avatar: "👩‍🔬",
    color: "bg-gradient-to-br from-emerald-500 to-teal-600",
    status: "online",
    bio: "Biotech · Running · Dogs 🐕",
  },
  {
    id: "c5",
    name: "Work Team",
    avatar: "💼",
    color: "bg-gradient-to-br from-slate-500 to-slate-700",
    status: "online",
    bio: "12 members · Project Nova",
  },
  {
    id: "c6",
    name: "Marco Rossi",
    avatar: "🧑‍🍳",
    color: "bg-gradient-to-br from-rose-500 to-red-600",
    status: "offline",
    lastSeen: "last seen yesterday",
    bio: "Chef · Pasta is life 🍝",
  },
];

const now = Date.now();
const m = (mins: number) => now - mins * 60_000;

export const seedChats: Chat[] = [
  { id: "chat1", contactId: "c1", unread: 2, pinned: true },
  { id: "chat2", contactId: "c2", unread: 5 },
  { id: "chat3", contactId: "c4", unread: 0 },
  { id: "chat4", contactId: "c5", unread: 0, muted: true },
  { id: "chat5", contactId: "c3", unread: 1 },
  { id: "chat6", contactId: "c6", unread: 0 },
];

export const seedMessages: Message[] = [
  // chat1 - Ada
  { id: "m1", chatId: "chat1", senderId: "c1", text: "Hey! Did you see the new WebSocket API?", timestamp: m(45), status: "read" },
  { id: "m2", chatId: "chat1", senderId: "me", text: "Not yet, looks promising though", timestamp: m(44), status: "read" },
  { id: "m3", chatId: "chat1", senderId: "c1", text: "We should refactor the chat engine with it. Realtime without polling 🔥", timestamp: m(43), status: "read" },
  { id: "m4", chatId: "chat1", senderId: "me", text: "Agreed. I'll draft a PR tonight.", timestamp: m(42), status: "read" },
  { id: "m5", chatId: "chat1", senderId: "c1", text: "Perfect. Also, are we still on for the code review at 3?", timestamp: m(10), status: "delivered" },
  { id: "m6", chatId: "chat1", senderId: "c1", text: "Bring the end-to-end encryption notes too 📝", timestamp: m(2), status: "delivered" },

  // chat2 - Family
  { id: "m7", chatId: "chat2", senderId: "c2", text: "Mom: Don't forget Sunday dinner! 🍲", timestamp: m(120), status: "read" },
  { id: "m8", chatId: "chat2", senderId: "c2", text: "Dad: I'm making lasagna", timestamp: m(118), status: "read" },
  { id: "m9", chatId: "chat2", senderId: "me", text: "I'll be there! Bringing dessert 🍰", timestamp: m(60), status: "read" },
  { id: "m10", chatId: "chat2", senderId: "c2", text: "Sis: Can you grab milk on the way?", timestamp: m(8), status: "delivered" },
  { id: "m11", chatId: "chat2", senderId: "c2", text: "Bro: I'm bringing friends, is that cool?", timestamp: m(5), status: "delivered" },

  // chat3 - Priya
  { id: "m12", chatId: "chat3", senderId: "c4", text: "The paper on CRISPR delivery is wild", timestamp: m(180), status: "read" },
  { id: "m13", chatId: "chat3", senderId: "me", text: "Send me the link when you get a chance?", timestamp: m(170), status: "read" },
  { id: "m14", chatId: "chat3", senderId: "c4", text: "https://example.com/crispr-paper — page 14 is the good part", timestamp: m(165), status: "read" },

  // chat4 - Work
  { id: "m15", chatId: "chat4", senderId: "c5", text: "Sarah: Standup at 9:30 tomorrow", timestamp: m(300), status: "read" },
  { id: "m16", chatId: "chat4", senderId: "me", text: "Got it 👍", timestamp: m(299), status: "read" },

  // chat5 - Kenji
  { id: "m17", chatId: "chat5", senderId: "c3", text: "Finished the mockups for the onboarding flow", timestamp: m(600), status: "read" },
  { id: "m18", chatId: "chat5", senderId: "c3", text: "Let me know what you think 🎨", timestamp: m(55), status: "delivered" },

  // chat6 - Marco
  { id: "m19", chatId: "chat6", senderId: "c6", text: "Try the new carbonara spot on 5th", timestamp: m(2000), status: "read" },
  { id: "m20", chatId: "chat6", senderId: "me", text: "This weekend!", timestamp: m(1999), status: "read" },
];

// Canned auto-replies from "contacts" when the user sends a message.
export const botReplies: Record<string, string[]> = {
  c1: [
    "Interesting, tell me more 🤔",
    "Let me check the docs.",
    "Shipped! 🚀",
    "Hmm, have you tried using a typed event schema?",
    "Pushing a fix now.",
  ],
  c2: [
    "Mom: Love you sweetheart ❤️",
    "Dad: See you soon!",
    "Sis: Thanks!!",
    "Bro: You're the best",
  ],
  c3: [
    "I'll iterate on that screen tonight 🎨",
    "Figma link coming up",
    "What do you think of the color palette?",
  ],
  c4: [
    "The data is fascinating 🧬",
    "Let's discuss over coffee",
    "Sending you the supplementary materials",
  ],
  c5: [
    "Sarah: Added to the board",
    "Dev: LGTM, merging",
    "PM: Timeline looks good",
  ],
  c6: [
    "It's *chef's kiss* 🤌",
    "Reservations at 8?",
    "Bring an appetite!",
  ],
};
