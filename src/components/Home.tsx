import { useMemo, useState } from "react";
import {
  MessageCircle,
  Phone,
  Video,
  Gamepad2,
  User,
  Search,
  Shield,
  Lock,
  BellOff,
  Pin,
  LogOut,
  Sparkles,
  Trophy,
  Zap,
  Volume2,
  VolumeX,
  Download,
  X,
} from "lucide-react";
import type { Chat, Contact, Message } from "../types";
import { Moon } from "./Shared";
import type { Tab } from "../hooks/useAppState";
import type { ForestMode } from "./ForestScene";
import type { UserSoundtrack } from "../hooks/useUserSoundtracks";

interface Props {
  tab: Tab;
  setTab: (t: Tab) => void;
  chats: Chat[];
  contacts: Contact[];
  contactById: (id: string) => Contact | undefined;
  messagesByChat: (chatId: string) => Message[];
  profile: { name: string; avatar: string };
  openChat: (chatId: string) => void;
  startCall: (contactId: string, type: "audio" | "video") => void;
  setActiveGame: (g: string) => void;
  setScreen: (s: any) => void;
  resetApp: () => void;
  typingIn: string | null;
  play: (s: any) => void;
  muted?: boolean;
  setMuted?: (m: boolean) => void;
  onShowApk: () => void;
  forestMode: ForestMode;
  setForestMode: (mode: ForestMode) => void;
  soundtracks: Partial<Record<ForestMode, UserSoundtrack>>;
  addSoundtrack: (mode: ForestMode, file: File) => Promise<UserSoundtrack>;
  removeSoundtrack: (mode: ForestMode) => void;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const diff = (now.getTime() - ts) / 86_400_000;
  if (diff < 2) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function Avatar({ contact, size = "md" }: { contact: Contact; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-11 w-11 text-xl" : size === "lg" ? "h-16 w-16 text-3xl" : "h-14 w-14 text-2xl";
  return (
    <div className={`relative flex-shrink-0 rounded-2xl flex items-center justify-center text-white shadow-lg ${contact.color} ${sz}`}>
      <span>{contact.avatar}</span>
    </div>
  );
}

function StatusDot({ status }: { status: Contact["status"] }) {
  if (status === "offline") return null;
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-indigo-950 ${
        status === "online" ? "bg-emerald-400" : "bg-amber-400"
      }`}
    />
  );
}

function ChatsTab({
  chats,
  contactById,
  messagesByChat,
  openChat,
  typingIn,
}: {
  chats: Chat[];
  contactById: (id: string) => Contact | undefined;
  messagesByChat: (chatId: string) => Message[];
  openChat: (id: string) => void;
  typingIn: string | null;
}) {
  const [q, setQ] = useState("");
  const filtered = chats.filter((c) => {
    const contact = contactById(c.contactId);
    return contact?.name.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-3 pt-2">
        <div className="flex items-center gap-2 rounded-2xl bg-indigo-950/80 px-4 py-2.5 shadow-sm ring-1 ring-indigo-700 backdrop-blur">
          <Search className="h-4 w-4 text-yellow-300" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your flock…"
            className="flex-1 bg-transparent text-sm font-semibold text-white placeholder:text-indigo-300/60 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {filtered.map((chat, i) => {
          const contact = contactById(chat.contactId);
          if (!contact) return null;
          const msgs = messagesByChat(chat.id);
          const last = msgs[msgs.length - 1];
          const isTyping = typingIn === chat.id;
          const preview = isTyping
            ? "typing…"
            : last
            ? `${last.senderId === "me" ? "You: " : ""}${last.text}`
            : "Say hi 🦉";
          return (
            <button
              key={chat.id}
              onClick={() => openChat(chat.id)}
              className="mb-2 flex w-full items-center gap-3 rounded-3xl bg-gradient-to-r from-indigo-900/90 to-purple-900/90 p-3 text-left shadow-md ring-1 ring-indigo-700/60 transition-all hover:from-indigo-800 hover:to-purple-800 active:scale-[0.98] anim-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="relative">
                <Avatar contact={contact} />
                <StatusDot status={contact.status} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-black text-white">{contact.name}</p>
                  {chat.pinned && <Pin className="h-3 w-3 text-yellow-300" />}
                  {chat.muted && <BellOff className="h-3 w-3 text-indigo-400" />}
                  <Lock className="ml-auto h-3 w-3 text-emerald-400" />
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className={`truncate text-xs ${isTyping ? "font-bold text-yellow-300" : "text-indigo-200"}`}>
                    {preview}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {last && (
                      <span className="text-[10px] font-bold text-indigo-300">
                        {formatTime(last.timestamp)}
                      </span>
                    )}
                    {chat.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-500 px-1.5 text-[10px] font-black text-white shadow-sm anim-bounce-soft">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CallsTab({
  contacts,
  startCall,
}: {
  contacts: Contact[];
  startCall: (id: string, type: "audio" | "video") => void;
}) {
  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 pb-36 pt-2">
      <div className="card-night p-5 bg-gradient-to-br from-indigo-600 to-purple-700 border-purple-500">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/20 p-2">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-black text-lg text-white">Night calls 🌙</p>
            <p className="text-sm text-indigo-100">Crystal HD video & voice, whisper-private</p>
          </div>
        </div>
      </div>

      <p className="mt-5 mb-3 px-2 text-xs font-black uppercase tracking-wider text-yellow-300">
        Call someone in your flock
      </p>
      <div className="grid grid-cols-1 gap-3">
        {contacts.slice(0, 6).map((c, i) => (
          <div
            key={c.id}
            className="card-night flex items-center gap-3 p-3 anim-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="relative">
              <Avatar contact={c} />
              <StatusDot status={c.status} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-black text-white">{c.name}</p>
              <p className="text-xs text-indigo-200">
                {c.status === "online" ? "🟢 Awake now" : c.lastSeen ?? "Sleeping"}
              </p>
            </div>
            <button
              onClick={() => startCall(c.id, "audio")}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_4px_0_0_#047857] active:translate-y-1 active:shadow-none transition-all"
            >
              <Phone className="h-5 w-5" />
            </button>
            <button
              onClick={() => startCall(c.id, "video")}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-[0_4px_0_0_#312e81] active:translate-y-1 active:shadow-none transition-all"
            >
              <Video className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const GAMES = [
  {
    id: "tictactoe",
    name: "Tic-Tac-Hoot",
    desc: "Classic 3×3 battle",
    emoji: "⭕",
    players: "2 players",
    color: "from-indigo-500 to-purple-700",
  },
  {
    id: "rps",
    name: "Beak Paper Claw",
    desc: "Best of 5 rounds",
    emoji: "🦉",
    players: "1v1",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "memory",
    name: "Night Memory",
    desc: "Find all pairs",
    emoji: "🌙",
    players: "1-4 players",
    color: "from-amber-400 to-orange-600",
  },
  {
    id: "reaction",
    name: "Owl Reflexes",
    desc: "Tap fastest!",
    emoji: "⚡",
    players: "2+ players",
    color: "from-emerald-500 to-teal-600",
  },
];

function GamesTab({ setActiveGame, setScreen, play }: { setActiveGame: (g: string) => void; setScreen: (s: any) => void; play: (s: any) => void }) {
  const surpriseMe = () => {
    const random = GAMES[Math.floor(Math.random() * GAMES.length)];
    play("surprise");
    setActiveGame(random.id);
    setScreen("game-play");
  };

  return (
    <div className="relative min-h-full px-4 pb-48 pt-2">
      <button
        type="button"
        onClick={surpriseMe}
        className="w-full text-left card-night p-5 bg-gradient-to-br from-pink-600 via-orange-500 to-yellow-400 border-yellow-500 transition-transform active:scale-[0.98] hover:scale-[1.01]"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/20 p-2 anim-bounce-soft">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-black text-lg text-white">Play with your flock 🦉</p>
            <p className="text-sm text-white/90">Tap for a surprise game!</p>
          </div>
          <Sparkles className="h-5 w-5 text-white anim-bounce-soft" />
        </div>
      </button>

      <p className="mt-5 mb-3 px-2 text-xs font-black uppercase tracking-wider text-yellow-300">
        Owl games
      </p>
      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((g, i) => (
          <button
            key={g.id}
            onClick={() => {
              setActiveGame(g.id);
              setScreen("game-play");
            }}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${g.color} p-4 text-left text-white shadow-lg ring-1 ring-white/10 transition-all active:scale-95 anim-slide-up`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="text-4xl mb-3 anim-float">{g.emoji}</div>
            <p className="font-black text-lg leading-tight">{g.name}</p>
            <p className="text-xs opacity-90 mt-1">{g.desc}</p>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-black">
              <Zap className="h-3 w-3" />
              {g.players}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MeTab({
  profile,
  resetApp,
  muted,
  setMuted,
  play,
  onShowApk,
  forestMode,
  setForestMode,
  soundtracks,
  addSoundtrack,
  removeSoundtrack,
}: {
  profile: { name: string; avatar: string };
  resetApp: () => void;
  muted?: boolean;
  setMuted?: (m: boolean) => void;
  play: (s: any) => void;
  onShowApk: () => void;
  forestMode: ForestMode;
  setForestMode: (mode: ForestMode) => void;
  soundtracks: Partial<Record<ForestMode, UserSoundtrack>>;
  addSoundtrack: (mode: ForestMode, file: File) => Promise<UserSoundtrack>;
  removeSoundtrack: (mode: ForestMode) => void;
}) {
  const [panel, setPanel] = useState<"privacy" | "notifications" | "themes" | "invite" | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [privacy, setPrivacy] = useState({
    e2ee: true,
    safetyNumbers: true,
    disappearing: false,
    screenLock: false,
    readReceipts: true,
    lastSeen: false,
    profilePhoto: true,
    linkPreview: false,
    encryptedBackup: true,
    unknownContacts: true,
  });
  const [notifications, setNotifications] = useState({
    messageHoots: true,
    callRinging: true,
    gameInvites: true,
    quietHours: false,
    groupHoots: true,
    mentions: true,
    previewText: false,
    vibration: true,
    badges: true,
    forestAmbience: true,
  });
  const [themePrefs, setThemePrefs] = useState({
    bubbles: "Moon glow",
    animation: "Immersive",
    mascot: "Cute owl",
  });
  const [inviteCopied, setInviteCopied] = useState(false);

  const openPanel = (next: typeof panel) => {
    play("tick");
    setPanel(next);
  };

  const panels = {
    privacy: {
      title: "Privacy & encryption",
      body: "Whisper-private mode is on. In production, this screen would manage device keys, safety numbers, disappearing messages, blocked owls, and encrypted backups.",
      items: ["End-to-end encryption: On", "Safety numbers: Ready", "Disappearing messages: 24 hours", "Screen lock: Optional"],
    },
    notifications: {
      title: "Notifications",
      body: "Choose how Night OWL should alert you without waking the whole forest.",
      items: ["Message hoots: On", "Call ringing: On", "Game invites: On", "Quiet hours: 10:00 PM - 7:00 AM"],
    },
    themes: {
      title: "Themes & feathers",
      body: "Customize the feeling of the night forest around you. Each mode changes the moving trees, lights, sky, mist, and weather.",
      items: ["Theme: Midnight Forest", "Mascot mood: Cute owl", `Active forest mode: ${forestMode}`, "Animation level: Immersive"],
    },
    invite: {
      title: "Invite to the flock",
      body: "Share Night OWL with friends. In a real release this would open your phone share sheet and referral link.",
      items: ["Invite link copied-ready", "QR invite available", "Contacts sync: Planned", "Flock games: Enabled"],
    },
  } as const;

  return (
    <div className="relative min-h-full px-4 pb-48 pt-2">
      <div className="card-night p-6 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-600 text-5xl shadow-xl anim-pop ring-4 ring-yellow-300/30">
          {profile.avatar}
        </div>
        <p className="mt-4 font-black text-2xl text-white">{profile.name}</p>
        <p className="text-sm text-indigo-200">Night owl since today 🌙</p>
        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          <div className="rounded-2xl bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 ring-1 ring-emerald-500/40">
            🔒 Whisper-private
          </div>
          <div className="rounded-2xl bg-yellow-300/20 px-3 py-1 text-xs font-black text-yellow-300 ring-1 ring-yellow-300/40">
            ✨ Verified owl
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {/* Prominent APK Get Button */}
        <button
          onClick={() => { play("surprise"); onShowApk(); }}
          className="card-night flex w-full items-center gap-3 p-4 text-left active:scale-[0.98] border-yellow-300/60 bg-gradient-to-r from-yellow-300/15 to-amber-500/15"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-300 text-indigo-950 font-black shadow-md anim-bounce-soft">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-yellow-300 text-sm">📥 Get Android APK (.apk)</p>
            <p className="text-xs text-indigo-200 truncate">Instant web package or native compilation</p>
          </div>
          <span className="text-yellow-300 font-bold">›</span>
        </button>

        {[
          { id: "privacy", icon: Shield, label: "Privacy & encryption", color: "text-emerald-300 bg-emerald-500/20" },
          { id: "notifications", icon: BellOff, label: "Notifications", color: "text-indigo-300 bg-indigo-500/20" },
          { id: "themes", icon: Sparkles, label: "Themes & feathers", color: "text-pink-300 bg-pink-500/20" },
          { id: "invite", icon: User, label: "Invite to the flock", color: "text-orange-300 bg-orange-500/20" },
        ].map((it) => {
          const Icon = it.icon;
          const active = panel === it.id;
          return (
            <button
              key={it.label}
              onClick={() => openPanel(it.id as typeof panel)}
              className={`card-night flex w-full items-center gap-3 p-4 text-left active:scale-[0.98] ${active ? "ring-2 ring-yellow-300" : ""}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${it.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="flex-1 font-bold text-white">{it.label}</span>
              <span className="text-indigo-400">{active ? "⌃" : "›"}</span>
            </button>
          );
        })}

        {panel && (
          <div
            className="fixed inset-0 z-[90] flex items-end bg-black/70 p-3 backdrop-blur-sm"
            onClick={() => setPanel(null)}
          >
            <div
              className="card-night flex h-[86vh] w-full flex-col overflow-hidden border-yellow-300/50 anim-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-shrink-0 items-start gap-3 border-b border-indigo-800/80 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300 text-indigo-950 text-2xl shadow-md">
                  🦉
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-yellow-300">{panels[panel].title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-indigo-100">{panels[panel].body}</p>
                </div>
                <button
                  onClick={() => setPanel(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-950 text-indigo-200 ring-1 ring-indigo-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-8 [scrollbar-gutter:stable]" style={{ WebkitOverflowScrolling: "touch" }}>
              {panel === "privacy" && (
                <div className="grid gap-2">
                  {[
                    { key: "e2ee", label: "End-to-end encryption", locked: true },
                    { key: "safetyNumbers", label: "Show safety numbers" },
                    { key: "disappearing", label: "Disappearing messages" },
                    { key: "screenLock", label: "Screen lock" },
                    { key: "readReceipts", label: "Read receipts" },
                    { key: "lastSeen", label: "Hide last seen" },
                    { key: "profilePhoto", label: "Show profile photo to contacts" },
                    { key: "linkPreview", label: "Private link previews" },
                    { key: "encryptedBackup", label: "Encrypted local backup" },
                    { key: "unknownContacts", label: "Block unknown contacts" },
                  ].map((item) => {
                    const value = privacy[item.key as keyof typeof privacy];
                    return (
                      <button
                        key={item.key}
                        disabled={item.locked}
                        onClick={() => {
                          if (item.locked) return;
                          play("tick");
                          setPrivacy((current) => ({ ...current, [item.key]: !value }));
                        }}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left ring-1 ring-indigo-700/70 ${
                          value ? "bg-emerald-500/15" : "bg-indigo-950/70"
                        } ${item.locked ? "opacity-80" : "active:scale-[0.99]"}`}
                      >
                        <span className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-emerald-400" : "bg-slate-600"}`}>
                          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
                        </span>
                        <span className="flex-1 font-bold text-white">{item.label}</span>
                        {item.locked && <span className="text-xs font-black text-yellow-300">Always on</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {panel === "notifications" && (
                <div className="grid gap-2">
                  {[
                    { key: "messageHoots", label: "Message hoots" },
                    { key: "callRinging", label: "Call ringing" },
                    { key: "gameInvites", label: "Game invites" },
                    { key: "quietHours", label: "Quiet hours" },
                    { key: "groupHoots", label: "Group chat hoots" },
                    { key: "mentions", label: "Mentions and replies" },
                    { key: "previewText", label: "Show message preview" },
                    { key: "vibration", label: "Vibration" },
                    { key: "badges", label: "Unread badges" },
                    { key: "forestAmbience", label: "Forest ambience alerts" },
                  ].map((item) => {
                    const value = notifications[item.key as keyof typeof notifications];
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          play("tick");
                          setNotifications((current) => ({ ...current, [item.key]: !value }));
                        }}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left ring-1 ring-indigo-700/70 active:scale-[0.99] ${
                          value ? "bg-yellow-300/15" : "bg-indigo-950/70"
                        }`}
                      >
                        <span className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-yellow-300" : "bg-slate-600"}`}>
                          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
                        </span>
                        <span className="flex-1 font-bold text-white">{item.label}</span>
                        <span className="text-xs font-black text-indigo-300">{value ? "On" : "Off"}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {panel === "themes" && (
                <div className="grid gap-3">
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-wider text-yellow-300">Chat bubbles</p>
                    <div className="grid grid-cols-3 gap-2">
                      {["Moon glow", "Leaf", "Crystal"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            play("tick");
                            setThemePrefs((current) => ({ ...current, bubbles: option }));
                          }}
                          className={`rounded-2xl px-3 py-2 text-xs font-black ${themePrefs.bubbles === option ? "bg-yellow-300 text-indigo-950" : "bg-indigo-950 text-indigo-200 ring-1 ring-indigo-700"}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-wider text-yellow-300">Animation level</p>
                    <div className="grid grid-cols-3 gap-2">
                      {["Soft", "Immersive", "Wild"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            play("tick");
                            setThemePrefs((current) => ({ ...current, animation: option }));
                          }}
                          className={`rounded-2xl px-3 py-2 text-xs font-black ${themePrefs.animation === option ? "bg-yellow-300 text-indigo-950" : "bg-indigo-950 text-indigo-200 ring-1 ring-indigo-700"}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {panel === "invite" && (
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-indigo-950/70 px-3 py-3 ring-1 ring-indigo-700/70">
                    <p className="text-xs font-black uppercase tracking-wider text-yellow-300">Invite link</p>
                    <p className="mt-1 break-all text-xs text-indigo-200">{window.location.href}</p>
                  </div>
                  <div className="rounded-2xl bg-indigo-950/70 px-3 py-3 ring-1 ring-indigo-700/70">
                    <p className="font-bold text-white">Invite code</p>
                    <p className="text-2xl font-black text-yellow-300">OWL-{profile.name.slice(0, 3).toUpperCase() || "NEW"}-2026</p>
                  </div>
                  {[
                    { title: "Share with contacts", desc: "Open your phone share sheet in a production build.", action: "Share" },
                    { title: "Create flock invite", desc: "Generate a private group invite for games and chats.", action: "Create" },
                    { title: "Show QR invite", desc: "Let a friend scan your Night OWL invite code.", action: "Show QR" },
                    { title: "Invite by SMS", desc: "Send a short invite text to a phone number.", action: "SMS" },
                    { title: "Invite by email", desc: "Send a friendly Night OWL invitation email.", action: "Email" },
                    { title: "Reset invite code", desc: "Create a fresh invite code and expire the old one.", action: "Reset" },
                  ].map((item) => (
                    <button
                      key={item.title}
                      onClick={() => play("tick")}
                      className="rounded-2xl bg-indigo-950/70 p-3 text-left ring-1 ring-indigo-700/70 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/20 text-lg">
                          🪶
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-white">{item.title}</p>
                          <p className="text-xs text-indigo-300">{item.desc}</p>
                        </div>
                        <span className="rounded-xl bg-yellow-300 px-2.5 py-1 text-[10px] font-black text-indigo-950">
                          {item.action}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {panel === "invite" && (
                <button
                  onClick={() => {
                    play("happy");
                    navigator.clipboard?.writeText?.(window.location.href);
                    setInviteCopied(true);
                    window.setTimeout(() => setInviteCopied(false), 1600);
                  }}
                  className="btn-chunky btn-moon mt-4 w-full py-2 text-xs"
                >
                  {inviteCopied ? "Copied invite link" : "Copy invite link"}
                </button>
              )}

              {panel === "themes" && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(["calm", "windy", "rain", "fireflies", "aurora"] as ForestMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          play(mode === "rain" ? "flap" : "happy");
                          setForestMode(mode);
                        }}
                        className={`rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                          forestMode === mode
                            ? "bg-yellow-300 text-indigo-950"
                            : "bg-indigo-950 text-indigo-200 ring-1 ring-indigo-700 hover:bg-indigo-800"
                        }`}
                      >
                        {mode === "fireflies" ? "glow" : mode}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-indigo-950/70 p-3 ring-1 ring-indigo-700">
                    <p className="text-xs font-black uppercase tracking-wider text-yellow-300">
                      Upload your own soundtracks
                    </p>
                    <p className="mt-1 text-xs text-indigo-200">
                      Add your personal audio loops for Calm, Wind, Rain, Glow, and Aurora. Files stay only on this device.
                    </p>
                    {uploadError && (
                      <p className="mt-2 rounded-xl bg-red-500/15 px-3 py-2 text-xs font-bold text-red-300 ring-1 ring-red-500/30">
                        {uploadError}
                      </p>
                    )}
                    <div className="mt-3 space-y-2">
                      {(["calm", "windy", "rain", "fireflies", "aurora"] as ForestMode[]).map((mode) => {
                        const track = soundtracks[mode];
                        const label = mode === "fireflies" ? "Glow" : mode[0].toUpperCase() + mode.slice(1);
                        return (
                          <div key={mode} className="rounded-2xl bg-black/20 p-3 ring-1 ring-indigo-800/80">
                            <div className="flex items-center gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-white">{label}</p>
                                <p className="truncate text-[11px] text-indigo-300">
                                  {track ? track.name : "No custom track uploaded"}
                                </p>
                              </div>
                              {track && (
                                <button
                                  onClick={() => {
                                    play("tick");
                                    removeSoundtrack(mode);
                                  }}
                                  className="rounded-xl bg-red-500/20 px-3 py-1.5 text-[10px] font-black text-red-300 ring-1 ring-red-500/40"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <label className="mt-2 flex cursor-pointer items-center justify-center rounded-xl bg-yellow-300 px-3 py-2 text-xs font-black text-indigo-950 transition-transform active:scale-95">
                              {track ? "Replace audio" : "Upload audio"}
                              <input
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  e.target.value = "";
                                  if (!file) return;
                                  try {
                                    setUploadError("");
                                    await addSoundtrack(mode, file);
                                    setForestMode(mode);
                                    play("success");
                                  } catch (err) {
                                    setUploadError(err instanceof Error ? err.message : "Could not add this audio file.");
                                    play("sad");
                                  }
                                }}
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {setMuted && (
          <button
            onClick={() => { setMuted(!muted); play(muted ? "hoot" : "tick"); }}
            className="card-night flex w-full items-center gap-3 p-4 text-left active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-500/20 text-yellow-300">
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </div>
            <span className="flex-1 font-bold text-white">
              {muted ? "Unmute forest soundtrack" : "Mute forest soundtrack"}
            </span>
          </button>
        )}
        <button
          onClick={resetApp}
          className="card-night flex w-full items-center gap-3 p-4 text-left active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/20 text-red-300">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="flex-1 font-bold text-red-300">Fly away (log out)</span>
        </button>
      </div>
    </div>
  );
}

export function Home(props: Props) {
  const { tab, setTab, profile, chats, contacts, contactById, messagesByChat, openChat, startCall, setActiveGame, setScreen, resetApp, typingIn, play, muted, setMuted, onShowApk, forestMode, setForestMode, soundtracks, addSoundtrack, removeSoundtrack } = props;

  const totalUnread = useMemo(() => chats.reduce((s, c) => s + c.unread, 0), [chats]);

  const tabs: Array<{ id: Tab; icon: any; label: string; badge?: number }> = [
    { id: "chats", icon: MessageCircle, label: "Chats", badge: totalUnread },
    { id: "calls", icon: Phone, label: "Calls" },
    { id: "games", icon: Gamepad2, label: "Play" },
    { id: "me", icon: User, label: "Me" },
  ];

  return (
    <div className="stars flex h-full w-full flex-col relative">
      {/* Header */}
      <header className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-2xl shadow-lg ring-2 ring-yellow-300/30">
            {profile.avatar}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Good evening, {profile.name} 🌙
            </p>
            <h1 className="text-2xl font-black text-moon">Night OWL</h1>
          </div>
          <button
            onClick={() => { play("pop"); onShowApk(); }}
            className="flex items-center gap-1.5 rounded-xl bg-yellow-300/20 px-3 py-2 text-xs font-black text-yellow-300 ring-1 ring-yellow-300/40 hover:bg-yellow-300 hover:text-indigo-950 transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Get APK</span>
          </button>
          <div className="anim-moon-glow hidden xs:block">
            <Moon size={36} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className={`relative z-10 flex-1 min-h-0 ${tab === "me" ? "overflow-y-auto overscroll-contain" : "overflow-hidden"}`}>
        {tab === "chats" && (
          <ChatsTab
            chats={chats}
            contactById={contactById}
            messagesByChat={messagesByChat}
            openChat={openChat}
            typingIn={typingIn}
          />
        )}
        {tab === "calls" && <CallsTab contacts={contacts} startCall={startCall} />}
        {tab === "games" && <GamesTab setActiveGame={setActiveGame} setScreen={setScreen} play={play} />}
        {tab === "me" && <MeTab profile={profile} resetApp={resetApp} muted={muted} setMuted={setMuted} play={play} onShowApk={onShowApk} forestMode={forestMode} setForestMode={setForestMode} soundtracks={soundtracks} addSoundtrack={addSoundtrack} removeSoundtrack={removeSoundtrack} />}
      </div>

      {/* Bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-indigo-700/50 bg-indigo-950/95 px-2 py-2 backdrop-blur-xl md:static md:border-t">
        <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { play("tick"); setTab(t.id); }}
                className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 transition-all ${
                  active
                    ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-indigo-950 shadow-lg"
                    : "text-indigo-300 hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "anim-bounce-soft" : ""}`} />
                <span className="text-[10px] font-black uppercase tracking-wider">{t.label}</span>
                {!!t.badge && t.badge > 0 && !active && (
                  <span className="absolute top-1 right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[9px] font-black text-white">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
