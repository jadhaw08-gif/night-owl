import { useEffect, useState } from "react";
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Volume2, VolumeX, UserPlus } from "lucide-react";
import type { Contact } from "../types";
import type { CallState } from "../hooks/useAppState";
import { Owl } from "./Shared";

interface Props {
  call: CallState;
  contact: Contact;
  onEnd: () => void;
  play: (s: any) => void;
}

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function CallScreen({ call, contact, onEnd, play }: Props) {
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(call.type === "video");
  const [speaker, setSpeaker] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Play ring hoot when outgoing starts
  useEffect(() => {
    if (call.direction === "outgoing") {
      play("hoot");
      const i = setInterval(() => play("hoot"), 2500);
      return () => clearInterval(i);
    }
    if (call.direction === "active") {
      play("happy");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call.direction]);

  useEffect(() => {
    if (call.direction !== "active") return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [call.direction]);

  const duration = call.direction === "active" ? now - call.startedAt : 0;
  const statusText =
    call.direction === "outgoing"
      ? "Hooting…"
      : call.direction === "incoming"
      ? "Incoming hoot"
      : formatDuration(duration);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black/10 text-white backdrop-blur-[1px]">
      {/* Animated rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border-2 border-yellow-300/25"
            style={{
              width: 200 + i * 120,
              height: 200 + i * 120,
              animation: `pulse-ring ${2 + i * 0.3}s ease-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative glows */}
      <div className="pointer-events-none absolute top-10 left-10 h-20 w-20 rounded-full bg-yellow-300/20 blur-2xl anim-float" />
      <div className="pointer-events-none absolute bottom-20 right-10 h-32 w-32 rounded-full bg-indigo-400/30 blur-2xl anim-float" style={{ animationDelay: "1s" }} />

      {/* Top status */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-10">
        <p className="text-xs font-bold uppercase tracking-widest text-yellow-300/80">
          🔒 Whisper-private call
        </p>
        <h1 className="mt-1 text-sm font-black text-white opacity-90">
          {call.type === "video" ? "Video hoot" : "Voice hoot"}
        </h1>
      </div>

      {/* Center */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        {videoOn ? (
          <div className="relative">
            <div className="relative h-64 w-64 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-800 shadow-2xl ring-4 ring-yellow-300/30">
              <div className="absolute inset-0 flex items-center justify-center text-9xl">
                {contact.avatar}
              </div>
              {/* Self view pip */}
              <div className="absolute bottom-3 right-3 h-20 w-14 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 shadow-xl flex items-center justify-center text-2xl">
                🦉
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-black backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 anim-bounce-soft" />
                LIVE
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {call.direction !== "active" ? (
              <div className={`relative flex h-44 w-44 items-center justify-center rounded-full shadow-2xl ring-4 ring-yellow-300/40 ${contact.color} anim-float`}>
                <span className="text-7xl">{contact.avatar}</span>
                <span className="absolute inset-0 rounded-full ring-4 ring-yellow-300/30 anim-pulse-ring" />
                <span className="absolute inset-0 rounded-full ring-4 ring-yellow-300/20 anim-pulse-ring" style={{ animationDelay: "0.6s" }} />
              </div>
            ) : (
              <div className="anim-head-bob">
                <Owl size={200} mood="hooting" onClick={() => play("hoot")} />
              </div>
            )}
          </div>
        )}

        <h2 className="mt-6 text-3xl font-black text-white">{contact.name}</h2>
        <p className={`mt-1 text-sm font-bold ${call.direction === "active" ? "text-emerald-300" : "text-yellow-300"}`}>
          {statusText}
        </p>
      </div>

      {/* Controls */}
      <div className="relative z-10 px-6 pb-8">
        <div className="grid grid-cols-4 gap-3 mb-5">
          <ControlButton
            icon={muted ? MicOff : Mic}
            label="Mute"
            active={muted}
            onClick={() => { play("tick"); setMuted(!muted); }}
          />
          <ControlButton
            icon={call.type === "video" ? (videoOn ? VideoIcon : VideoOff) : UserPlus}
            label={call.type === "video" ? "Video" : "Add"}
            active={call.type === "video" ? !videoOn : false}
            onClick={() => { play("tick"); call.type === "video" && setVideoOn(!videoOn); }}
          />
          <ControlButton
            icon={speaker ? Volume2 : VolumeX}
            label="Speaker"
            active={!speaker}
            onClick={() => { play("tick"); setSpeaker(!speaker); }}
          />
          <ControlButton icon={UserPlus} label="Add" active={false} onClick={() => play("tick")} />
        </div>

        <button
          onClick={() => { play("sad"); onEnd(); }}
          className="btn-chunky w-full bg-red-500"
          style={{ boxShadow: "0 6px 0 0 #991b1b" }}
        >
          <PhoneOff className="h-5 w-5" />
          Fly back (end call)
        </button>
      </div>
    </div>
  );
}

function ControlButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-3xl p-3 transition-all active:scale-95 ${
        active ? "bg-yellow-300 text-indigo-950" : "bg-indigo-900/60 hover:bg-indigo-800/60 text-white ring-1 ring-indigo-700"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );
}
