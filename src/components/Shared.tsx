import { useEffect, useState } from "react";

export type OwlMood =
  | "happy"
  | "excited"
  | "thinking"
  | "sleepy"
  | "surprised"
  | "hooting"
  | "waving"
  | "sad";

/**
 * Hoot — the Night OWL mascot.
 * A cute, expressive owl with animated eyes, wings, and beak.
 */
export function Owl({
  size = 160,
  mood = "happy",
  onClick,
}: {
  size?: number;
  mood?: OwlMood;
  onClick?: () => void;
}) {
  // Blink occasionally
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const i = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(i);
  }, []);

  const eyeOffsetY = mood === "thinking" ? -2 : mood === "surprised" ? -1 : 0;
  const pupilX = mood === "thinking" ? 2 : 0;
  const pupilY = mood === "thinking" ? -1 : 0;
  const eyeScale = mood === "surprised" ? 1.2 : mood === "excited" ? 1.1 : 1;
  const eyeOpen = mood === "sleepy" ? 0.35 : blink ? 0.1 : 1;

  return (
    <svg
      viewBox="0 0 220 240"
      width={size}
      height={(size * 240) / 220}
      onClick={onClick}
      className={`drop-shadow-2xl ${onClick ? "cursor-pointer" : ""}`}
      aria-label="Hoot the owl"
    >
      <defs>
        <radialGradient id="owlBody" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="70%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#312e81" />
        </radialGradient>
        <radialGradient id="owlBelly" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#a5b4fc" />
        </radialGradient>
        <radialGradient id="owlEye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </radialGradient>
        <linearGradient id="owlBeak" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="110" cy="225" rx="55" ry="5" fill="#00000040" />

      {/* Feet */}
      <g fill="#fb923c" stroke="#c2410c" strokeWidth="1.5">
        <path d="M85,210 L75,222 M85,210 L85,224 M85,210 L95,222" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M135,210 L125,222 M135,210 L135,224 M135,210 L145,222" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>

      {/* Body */}
      <g className={mood === "happy" || mood === "excited" ? "anim-head-bob" : mood === "hooting" ? "anim-hoot-pulse" : ""} style={{ transformOrigin: "110px 130px" }}>
        {/* Main body */}
        <ellipse cx="110" cy="150" rx="62" ry="68" fill="url(#owlBody)" />
        {/* Belly patch */}
        <ellipse cx="110" cy="165" rx="38" ry="48" fill="url(#owlBelly)" opacity="0.9" />

        {/* Wing left */}
        <g className={mood === "waving" || mood === "excited" ? "anim-wing-flap" : ""} style={{ transformOrigin: "55px 140px" }}>
          <path
            d="M55,130 Q35,155 50,195 Q65,175 68,145 Z"
            fill="#3730a3"
            stroke="#312e81"
            strokeWidth="1.5"
          />
          {/* Wing feather details */}
          <path d="M52,150 Q50,170 58,185" stroke="#1e1b4b" strokeWidth="1" fill="none" opacity="0.5" />
        </g>

        {/* Wing right (waving if mood=waving) */}
        <g
          className={mood === "waving" ? "anim-wave" : mood === "excited" ? "anim-wing-flap" : ""}
          style={{ transformOrigin: "165px 140px", animationDuration: mood === "waving" ? "1.5s" : "0.6s" }}
        >
          <path
            d={mood === "waving"
              ? "M165,130 Q195,95 190,60 Q175,80 158,115 Z"
              : "M165,130 Q185,155 170,195 Q155,175 152,145 Z"}
            fill="#3730a3"
            stroke="#312e81"
            strokeWidth="1.5"
          />
          <path d="M168,150 Q170,170 162,185" stroke="#1e1b4b" strokeWidth="1" fill="none" opacity="0.5" />
        </g>

        {/* Head */}
        <g>
          {/* Ear tufts */}
          <path d="M65,85 L55,50 L80,75 Z" fill="#4338ca" stroke="#312e81" strokeWidth="1.5" />
          <path d="M155,85 L165,50 L140,75 Z" fill="#4338ca" stroke="#312e81" strokeWidth="1.5" />

          {/* Head shape */}
          <ellipse cx="110" cy="95" rx="55" ry="48" fill="url(#owlBody)" />

          {/* Face mask (lighter) */}
          <ellipse cx="110" cy="100" rx="42" ry="35" fill="#4f46e5" opacity="0.8" />

          {/* Eye sockets (white disc) */}
          <circle cx="88" cy="98" r="22" fill="#f8fafc" />
          <circle cx="132" cy="98" r="22" fill="#f8fafc" />

          {/* Eyes */}
          <g style={{ transform: `scale(${eyeScale})`, transformOrigin: "88px 98px" }}>
            <ellipse
              cx="88"
              cy={98 + eyeOffsetY}
              rx="18"
              ry={18 * eyeOpen}
              fill="url(#owlEye)"
            />
            {eyeOpen > 0.5 && (
              <>
                <circle cx={88 + pupilX} cy={98 + eyeOffsetY + pupilY} r="8" fill="#0f172a" />
                <circle cx={91 + pupilX} cy={95 + eyeOffsetY + pupilY} r="2.5" fill="#ffffff" />
              </>
            )}
          </g>
          <g style={{ transform: `scale(${eyeScale})`, transformOrigin: "132px 98px" }}>
            <ellipse
              cx="132"
              cy={98 + eyeOffsetY}
              rx="18"
              ry={18 * eyeOpen}
              fill="url(#owlEye)"
            />
            {eyeOpen > 0.5 && (
              <>
                <circle cx={132 + pupilX} cy={98 + eyeOffsetY + pupilY} r="8" fill="#0f172a" />
                <circle cx={135 + pupilX} cy={95 + eyeOffsetY + pupilY} r="2.5" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Eyebrows for thinking */}
          {mood === "thinking" && (
            <>
              <path d="M72,78 L100,84" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" />
              <path d="M120,84 L148,78" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {/* Beak */}
          {mood === "hooting" ? (
            <g>
              <ellipse cx="110" cy="120" rx="9" ry="11" fill="url(#owlBeak)" stroke="#c2410c" strokeWidth="1.5" />
              <ellipse cx="110" cy="118" rx="4" ry="5" fill="#7c2d12" />
            </g>
          ) : mood === "surprised" ? (
            <ellipse cx="110" cy="118" rx="7" ry="9" fill="url(#owlBeak)" stroke="#c2410c" strokeWidth="1.5" />
          ) : mood === "sad" ? (
            <path d="M103,120 L110,124 L117,120 Z" fill="url(#owlBeak)" stroke="#c2410c" strokeWidth="1.5" />
          ) : (
            <path d="M103,116 L110,126 L117,116 Z" fill="url(#owlBeak)" stroke="#c2410c" strokeWidth="1.5" />
          )}

          {/* Cheeks when happy/excited */}
          {(mood === "happy" || mood === "excited") && (
            <>
              <circle cx="70" cy="115" r="5" fill="#ec4899" opacity="0.5" />
              <circle cx="150" cy="115" r="5" fill="#ec4899" opacity="0.5" />
            </>
          )}
        </g>
      </g>

      {/* Sound waves when hooting */}
      {mood === "hooting" && (
        <g stroke="#fde047" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path className="anim-sound-wave" d="M135,115 Q145,120 135,125" opacity="0.8" />
          <path className="anim-sound-wave" style={{ animationDelay: "0.2s" }} d="M145,108 Q160,120 145,132" opacity="0.6" />
          <path className="anim-sound-wave" style={{ animationDelay: "0.4s" }} d="M155,100 Q175,120 155,140" opacity="0.4" />
        </g>
      )}

      {/* ZZZ when sleepy */}
      {mood === "sleepy" && (
        <g fill="#fde047" className="anim-float">
          <text x="155" y="70" fontSize="18" fontWeight="900">Z</text>
          <text x="170" y="55" fontSize="14" fontWeight="900" opacity="0.7">z</text>
          <text x="180" y="45" fontSize="10" fontWeight="900" opacity="0.5">z</text>
        </g>
      )}

      {/* Sparkles when excited */}
      {mood === "excited" && (
        <>
          <g className="anim-bounce-soft">
            <path d="M30,50 L33,58 L41,61 L33,64 L30,72 L27,64 L19,61 L27,58 Z" fill="#fde047" />
          </g>
          <g className="anim-bounce-soft" style={{ animationDelay: "0.3s" }}>
            <path d="M190,40 L192,46 L198,48 L192,50 L190,56 L188,50 L182,48 L188,46 Z" fill="#ec4899" />
          </g>
        </>
      )}

      {/* Tear when sad */}
      {mood === "sad" && (
        <g fill="#38bdf8">
          <ellipse cx="78" cy="125" rx="2.5" ry="4" className="anim-bounce-soft" />
        </g>
      )}
    </svg>
  );
}

/** Burst of colorful confetti pieces */
export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<Array<{ id: number; left: number; color: string; delay: number; duration: number; shape: "star" | "square" | "feather" }>>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    const colors = ["#fde047", "#ec4899", "#818cf8", "#10b981", "#fb923c", "#f0abfc"];
    const shapes: Array<"star" | "square" | "feather"> = ["star", "square", "feather"];
    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 0.4,
      duration: 1.8 + Math.random() * 1.4,
      shape: shapes[i % shapes.length],
    }));
    setPieces(newPieces);
    const t = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(t);
  }, [active]);

  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute block"
          style={{
            left: `${p.left}%`,
            top: "-10px",
            color: p.color,
            fontSize: p.shape === "star" ? "16px" : p.shape === "feather" ? "14px" : "10px",
            animation: `confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
          }}
        >
          {p.shape === "star" ? "★" : p.shape === "feather" ? "🪶" : "■"}
        </span>
      ))}
    </div>
  );
}

/** Decorative moon + stars */
export function Moon({ size = 80 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="anim-moon-glow">
      <defs>
        <radialGradient id="moonGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="70%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="38" fill="url(#moonGrad)" />
      {/* Craters */}
      <circle cx="40" cy="42" r="5" fill="#eab308" opacity="0.4" />
      <circle cx="58" cy="55" r="3" fill="#eab308" opacity="0.4" />
      <circle cx="48" cy="62" r="4" fill="#eab308" opacity="0.3" />
      <circle cx="62" cy="38" r="2.5" fill="#eab308" opacity="0.3" />
    </svg>
  );
}

/** A few scattered twinkling stars as a decorative element */
export function Stars({ count = 8 }: { count?: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <svg
          key={s.id}
          viewBox="0 0 20 20"
          width={s.size}
          height={s.size}
          className="absolute anim-bounce-soft"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#fde047" />
        </svg>
      ))}
    </div>
  );
}
