import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Phone, Video, Send, Smile, Paperclip, Lock, Sparkles, Heart } from "lucide-react";
import type { Contact, Message } from "../types";
import { Owl } from "./Shared";

interface Props {
  contact: Contact;
  messages: Message[];
  onSend: (text: string) => void;
  onBack: () => void;
  onCall: (type: "audio" | "video") => void;
  typing: boolean;
  play: (s: any) => void;
}

const REACTIONS = ["❤️", "😂", "😮", "😢", "🔥", "👍"];

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function dateSeparatorLabel(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const strip = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((strip(now) - strip(d)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function Bubble({
  msg,
  prevSame,
  contact,
}: {
  msg: Message;
  prevSame: boolean;
  contact: Contact;
}) {
  const mine = msg.senderId === "me";
  const [reaction, setReaction] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className={`flex w-full ${mine ? "justify-end" : "justify-start"} ${prevSame ? "mt-1" : "mt-3"} anim-slide-up`}>
      <div className={`flex max-w-[80%] items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
        {!mine && !prevSame && (
          <div className={`h-9 w-9 flex-shrink-0 rounded-2xl flex items-center justify-center text-white text-lg shadow-md ${contact.color}`}>
            {contact.avatar}
          </div>
        )}
        {!mine && prevSame && <div className="w-9 flex-shrink-0" />}
        <div className="relative">
          <div
            onDoubleClick={() => setShowPicker((s) => !s)}
            className={`relative rounded-3xl px-4 py-2.5 shadow-md ${
              mine
                ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white rounded-br-md"
                : "bg-white text-slate-900 rounded-bl-md ring-1 ring-violet-100"
            }`}
          >
            <p className="whitespace-pre-wrap break-words leading-relaxed font-semibold">{msg.text}</p>
            <div className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] font-bold ${
              mine ? "text-white/80" : "text-slate-400"
            }`}>
              <span>{formatTime(msg.timestamp)}</span>
              {mine && (
                <span>
                  {msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}
                </span>
              )}
            </div>
            {reaction && (
              <span className="absolute -bottom-2.5 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow-md ring-1 ring-violet-100 anim-pop">
                {reaction}
              </span>
            )}
          </div>
          {showPicker && (
            <div className={`absolute ${mine ? "right-0" : "left-0"} -bottom-12 flex gap-1 rounded-full bg-white p-1.5 shadow-lg ring-1 ring-violet-100 anim-pop z-10`}>
              {REACTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setReaction(r);
                    setShowPicker(false);
                  }}
                  className="h-7 w-7 rounded-full text-base hover:scale-125 transition-transform"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Chat({ contact, messages, onSend, onBack, onCall, typing, play }: Props) {
  const [draft, setDraft] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);

  const send = () => {
    if (!draft.trim()) return;
    play("pop");
    onSend(draft);
    setDraft("");
    setShowEmoji(false);
  };

  const quickEmojis = ["😀", "😂", "😍", "🥰", "😎", "🤩", "🥳", "😭", "🤔", "👍", "❤️", "🔥", "✨", "🎉"];

  const grouped: Array<{ type: "date"; label: string } | { type: "msg"; msg: Message; prevSame: boolean }> = [];
  let lastDate = "";
  let lastSender = "";
  messages.forEach((msg) => {
    const label = dateSeparatorLabel(msg.timestamp);
    if (label !== lastDate) {
      grouped.push({ type: "date", label });
      lastDate = label;
      lastSender = "";
    }
    grouped.push({ type: "msg", msg, prevSame: lastSender === msg.senderId });
    lastSender = msg.senderId;
  });

  return (
    <div className="relative flex h-full w-full flex-col bg-black/10 overflow-hidden backdrop-blur-[1px]">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-pink-500/20 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 border-b border-indigo-700/50 bg-indigo-950/80 px-3 py-3 backdrop-blur-xl">
        <button
          onClick={() => { play("tick"); onBack(); }}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-yellow-300 hover:bg-indigo-800 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative">
          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white text-xl shadow-md ${contact.color}`}>
            {contact.avatar}
          </div>
          {contact.status === "online" && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[3px] border-indigo-950 bg-emerald-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-black text-white">{contact.name}</p>
          <p className="flex items-center gap-1 text-xs font-bold">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span className="text-indigo-200">
              {typing ? (
                <span className="text-yellow-300">typing…</span>
              ) : contact.status === "online" ? (
                <span className="text-emerald-400">whisper-private · online</span>
              ) : (
                <span>{contact.lastSeen ?? "offline"}</span>
              )}
            </span>
          </p>
        </div>
        <button
          onClick={() => { play("hoot"); onCall("audio"); }}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_3px_0_0_#047857] active:translate-y-0.5 active:shadow-[0_0_0_0_#047857] transition-all"
        >
          <Phone className="h-4 w-4" />
        </button>
        <button
          onClick={() => { play("hoot"); onCall("video"); }}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-[0_3px_0_0_#312e81] active:translate-y-0.5 active:shadow-[0_0_0_0_#312e81] transition-all"
        >
          <Video className="h-4 w-4" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-3 py-3 md:px-5">
        {/* E2E intro badge */}
        <div className="my-4 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-indigo-950/70 px-4 py-1.5 text-xs font-bold text-indigo-200 shadow-sm ring-1 ring-indigo-700">
            <Lock className="h-3 w-3 text-emerald-400" />
            Whisper-private. Only you and {contact.name} can read these hoots. <Sparkles className="inline h-3 w-3 text-yellow-300" />
          </div>
        </div>

        {grouped.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="anim-float">
              <Owl size={120} mood="waving" onClick={() => play("hoot")} />
            </div>
            <p className="mt-4 font-black text-white">Start something fun!</p>
            <p className="text-sm text-indigo-200">Say hi or challenge {contact.name} to an owl game 🦉</p>
          </div>
        )}

        {grouped.map((item, i) => {
          if (item.type === "date") {
            return (
              <div key={`d-${i}`} className="my-3 flex justify-center">
                <span className="rounded-full bg-indigo-950/80 px-3 py-1 text-[11px] font-black text-yellow-300 shadow-sm ring-1 ring-indigo-700">
                  {item.label}
                </span>
              </div>
            );
          }
          return <Bubble key={item.msg.id} msg={item.msg} prevSame={item.prevSame} contact={contact} />;
        })}

        {typing && (
          <div className="mt-3 flex justify-start anim-slide-up">
            <div className="flex items-center gap-2 rounded-3xl rounded-bl-md bg-white px-4 py-3 shadow-md ring-1 ring-violet-100">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white text-sm ${contact.color}`}>
                {contact.avatar}
              </div>
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-violet-400 anim-bounce-soft" />
                <span className="h-2 w-2 rounded-full bg-violet-400 anim-bounce-soft" style={{ animationDelay: "0.15s" }} />
                <span className="h-2 w-2 rounded-full bg-violet-400 anim-bounce-soft" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <footer className="relative z-10 border-t border-violet-100 bg-white/90 px-3 py-2.5 backdrop-blur-xl">
        {showEmoji && (
          <div className="mb-2 flex flex-wrap gap-1 rounded-2xl bg-violet-50 p-2 anim-slide-up">
            {quickEmojis.map((e) => (
              <button
                key={e}
                onClick={() => setDraft((d) => d + e)}
                className="h-9 w-9 rounded-xl text-xl hover:bg-white hover:scale-125 transition-all"
              >
                {e}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowEmoji((s) => !s)}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-all ${
              showEmoji ? "bg-violet-500 text-white" : "bg-violet-50 text-violet-600"
            }`}
          >
            <Smile className="h-5 w-5" />
          </button>
          <button className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Paperclip className="h-5 w-5" />
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type something fun…"
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-violet-50 px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 max-h-28"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-all ${
              draft.trim()
                ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-[0_4px_0_0_#5b21b6] active:translate-y-0.5 active:shadow-[0_0_0_0_#5b21b6]"
                : "bg-slate-200 text-slate-400"
            }`}
          >
            {draft.trim() ? <Send className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
          </button>
        </div>
        <p className="mt-1 text-center text-[10px] text-slate-400">
          Double-tap a message to react ✨
        </p>
      </footer>
    </div>
  );
}
