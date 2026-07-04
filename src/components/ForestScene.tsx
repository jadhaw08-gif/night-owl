import { useState } from "react";
import { ChevronDown, CloudRain, Leaf, Sparkles, Wind, WandSparkles } from "lucide-react";

export type ForestMode = "calm" | "windy" | "rain" | "fireflies" | "aurora";

interface Props {
  mode: ForestMode;
  setMode: (mode: ForestMode) => void;
  play: (sound: any) => void;
}

const modes: Array<{ id: ForestMode; label: string; icon: any }> = [
  { id: "calm", label: "Calm", icon: Leaf },
  { id: "windy", label: "Wind", icon: Wind },
  { id: "rain", label: "Rain", icon: CloudRain },
  { id: "fireflies", label: "Glow", icon: Sparkles },
  { id: "aurora", label: "Aurora", icon: WandSparkles },
];

const fireflies = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: 6 + ((i * 19) % 88),
  bottom: 16 + ((i * 23) % 58),
  delay: (i * 0.37) % 6,
  duration: 5.5 + (i % 5) * 0.9,
}));

const rain = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  left: (i * 7) % 100,
  delay: (i * 0.07) % 1.2,
  duration: 0.8 + (i % 4) * 0.14,
  opacity: 0.25 + (i % 5) * 0.1,
}));

const heavyRain = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  left: (i * 11) % 100,
  delay: (i * 0.05) % 0.9,
  duration: 0.55 + (i % 4) * 0.08,
}));

const splashes = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: 4 + ((i * 13) % 92),
  delay: (i * 0.19) % 1.7,
}));

const leaves = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  top: 8 + ((i * 17) % 70),
  delay: (i * 0.42) % 6,
  duration: 4.2 + (i % 6) * 0.7,
  leaf: ["🍂", "🍃", "🌿"][i % 3],
}));

const calmOrbs = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  left: 8 + ((i * 23) % 82),
  top: 18 + ((i * 19) % 62),
  size: 70 + (i % 4) * 34,
  delay: (i * 0.8) % 7,
}));

export function ForestScene({ mode, setMode, play }: Props) {
  const [open, setOpen] = useState(false);
  const activeMode = modes.find((m) => m.id === mode) ?? modes[0];
  const ActiveIcon = activeMode.icon;

  return (
    <>
      <div className={`forest-scene forest-mode-${mode}`} aria-hidden>
        <div className="forest-aurora" />
        <div className="glow-field" />
        <div className="moonbeam" style={{ left: "18%", animationDelay: "0s" }} />
        <div className="moonbeam" style={{ left: "58%", animationDelay: "3s", width: "18%" }} />
        <div className="shooting-star" />
        <div className="shooting-star" style={{ top: "22%", animationDelay: "3.8s", animationDuration: "11s" }} />
        <div className="forest-canopy" />

        {calmOrbs.map((orb) => (
          <span
            key={orb.id}
            className="calm-orb"
            style={{
              left: `${orb.left}%`,
              top: `${orb.top}%`,
              width: orb.size,
              height: orb.size,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}

        {leaves.map((leaf) => (
          <span
            key={leaf.id}
            className="wind-leaf"
            style={{
              top: `${leaf.top}%`,
              animationDelay: `${leaf.delay}s`,
              animationDuration: `${leaf.duration}s`,
            }}
          >
            {leaf.leaf}
          </span>
        ))}

        {fireflies.map((f) => (
          <span
            key={f.id}
            className="firefly"
            style={{
              left: `${f.left}%`,
              bottom: `${f.bottom}%`,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s, 2s`,
            }}
          />
        ))}

        <div className="forest-rain">
          {rain.map((r) => (
            <span
              key={r.id}
              className="rain-drop"
              style={{
                left: `${r.left}%`,
                animationDelay: `${r.delay}s`,
                animationDuration: `${r.duration}s`,
                opacity: r.opacity,
              }}
            />
          ))}
          {heavyRain.map((r) => (
            <span
              key={`h-${r.id}`}
              className="rain-drop heavy"
              style={{
                left: `${r.left}%`,
                animationDelay: `${r.delay}s`,
                animationDuration: `${r.duration}s`,
              }}
            />
          ))}
          {splashes.map((s) => (
            <span
              key={`s-${s.id}`}
              className="rain-splash"
              style={{ left: `${s.left}%`, animationDelay: `${s.delay}s` }}
            />
          ))}
        </div>

        <span className="forest-bird" style={{ animationDelay: "0s" }}>⌁</span>
        <span className="forest-bird" style={{ top: "28%", animationDelay: "5.2s", animationDuration: "15s" }}>⌁</span>
        <span className="forest-deer" style={{ animationDelay: "2s" }}>🦌</span>
        <span className="forest-fox" style={{ animationDelay: "3s" }}>🦊</span>

        <div className="forest-tree-line back" />
        <div className="forest-mist" />
        <div className="forest-eyes"><span /><span /></div>
        <div className="forest-tree-line front" />

        <div className="umbrella-owl">
          <div className="umbrella-shape" />
          <div className="umbrella-handle" />
          <div className="tiny-owl-body" />
          <div className="tiny-owl-beak" />
        </div>

        <div className="forest-vignette" />
      </div>

      <div className="pointer-events-auto absolute left-3 top-3 z-30">
        <button
          onClick={() => {
            play("tick");
            setOpen((value) => !value);
          }}
          className="flex items-center gap-1.5 rounded-2xl border border-indigo-700/60 bg-indigo-950/80 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-yellow-300 shadow-lg backdrop-blur-xl active:scale-95"
        >
          <ActiveIcon className="h-3.5 w-3.5" />
          {activeMode.label}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="mt-2 grid w-36 gap-1 rounded-2xl border border-indigo-700/60 bg-indigo-950/90 p-1 shadow-xl backdrop-blur-xl anim-slide-up">
            {modes.map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    play(m.id === "rain" ? "flap" : m.id === "fireflies" || m.id === "aurora" ? "happy" : "tick");
                    setMode(m.id);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider transition-all ${
                    active
                      ? "bg-yellow-300 text-indigo-950 shadow"
                      : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}