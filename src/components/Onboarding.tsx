import { useEffect, useRef, useState } from "react";
import { Phone, ArrowRight, Sparkles, Shield, Zap, Heart, Search, X } from "lucide-react";
import { Owl, Moon, Stars } from "./Shared";
import { COUNTRIES, POPULAR_COUNTRIES, OTHER_COUNTRIES } from "../data/countries";
import type { Country } from "../data/countries";

interface Props {
  screen: "splash" | "welcome" | "phone" | "otp" | "profile";
  setScreen: (s: any) => void;
  setPhone: (p: string) => void;
  completeOtp: () => void;
  completeProfile: (name: string, avatar: string) => void;
  phone: string;
  play: (s: any) => void;
}

export function Onboarding({ screen, setScreen, setPhone, completeOtp, completeProfile, phone, play }: Props) {
  return (
    <div className="stars relative h-full w-full overflow-hidden">
      <div className="relative z-10 flex h-full w-full items-center justify-center p-5">
        {screen === "splash" && <Splash play={play} />}
        {screen === "welcome" && <Welcome onContinue={() => { play("doubleHoot"); setScreen("phone"); }} play={play} />}
        {screen === "phone" && (
          <PhoneScreen
            phone={phone}
            setPhone={setPhone}
            onContinue={() => { play("surprise"); setScreen("otp"); }}
            onBack={() => setScreen("welcome")}
            play={play}
          />
        )}
        {screen === "otp" && (
          <OtpScreen
            phone={phone}
            onComplete={() => { play("success"); completeOtp(); }}
            onBack={() => setScreen("phone")}
            play={play}
          />
        )}
        {screen === "profile" && <ProfileScreen onComplete={(n, a) => { play("success"); completeProfile(n, a); }} play={play} />}
      </div>
    </div>
  );
}

function Splash({ play }: { play: (s: any) => void }) {
  useEffect(() => {
    const t = setTimeout(() => play("hoot"), 400);
    return () => clearTimeout(t);
  }, [play]);

  return (
    <div className="flex flex-col items-center gap-6 anim-bounce-in relative">
      <Stars count={6} />
      <div className="absolute -top-8 -right-16 opacity-70">
        <Moon size={70} />
      </div>
      <div className="anim-float relative">
        <Owl size={200} mood="hooting" />
      </div>
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300/80">Welcome to</p>
        <h1 className="mt-1 text-6xl font-black tracking-tight text-moon">
          Night <span className="text-aurora">OWL</span>
        </h1>
        <p className="mt-2 text-base font-bold text-indigo-200">
          Hoot · Chat · Play 🌙
        </p>
      </div>
      <div className="flex gap-2">
        <span className="h-2 w-2 rounded-full bg-yellow-300 anim-bounce-soft" />
        <span className="h-2 w-2 rounded-full bg-pink-400 anim-bounce-soft" style={{ animationDelay: "0.2s" }} />
        <span className="h-2 w-2 rounded-full bg-indigo-400 anim-bounce-soft" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}

function Welcome({ onContinue, play }: { onContinue: () => void; play: (s: any) => void }) {
  useEffect(() => {
    const t = setTimeout(() => play("doubleHoot"), 200);
    return () => clearTimeout(t);
  }, [play]);

  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: "privacy",
      icon: Shield,
      title: "Whisper-private",
      desc: "End-to-end encrypted chats 🦉",
      color: "from-emerald-400 to-teal-600",
      sound: "hoot" as const,
      action: () => onContinue(),
    },
    {
      id: "calls",
      icon: Zap,
      title: "Night calls",
      desc: "Crystal HD video & voice",
      color: "from-indigo-400 to-violet-600",
      sound: "doubleHoot" as const,
      action: () => onContinue(),
    },
    {
      id: "games",
      icon: Heart,
      title: "Owl games",
      desc: "Play with your flock →",
      color: "from-pink-400 to-rose-600",
      sound: "happy" as const,
      action: () => { play("success"); onContinue(); },
    },
  ];

  return (
    <div className="w-full max-w-md anim-slide-up">
      <div className="flex flex-col items-center gap-3 text-center relative">
        <Stars count={4} />
        <div className="anim-head-bob">
          <Owl size={140} mood={activeFeature === "games" ? "excited" : activeFeature ? "happy" : "waving"} onClick={() => play("hoot")} />
        </div>
        <h1 className="text-4xl font-black leading-tight text-white">
          Hey there, <span className="text-moon">night owl!</span>
        </h1>
        <p className="max-w-xs text-indigo-200">
          The forest is <span className="font-bold text-yellow-300">awake</span>. Tap any card to learn more, or jump in below. 🌳
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {features.map((f, i) => {
          const Icon = f.icon;
          const isActive = activeFeature === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setActiveFeature(f.id);
                play(f.sound);
                f.action();
              }}
              className={`card-night flex w-full items-center gap-4 p-4 text-left transition-all active:scale-[0.98] anim-slide-up ${
                isActive ? "ring-2 ring-yellow-300" : "hover:ring-1 hover:ring-yellow-300/50"
              }`}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-white">{f.title}</p>
                <p className="text-sm text-indigo-200">{f.desc}</p>
              </div>
              <Sparkles className="h-4 w-4 text-yellow-300 anim-bounce-soft" />
            </button>
          );
        })}
      </div>

      <button onClick={onContinue} className="btn-chunky btn-moon mt-6 w-full">
        Enter the forest <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-3 text-center text-xs text-indigo-300/60">
        By continuing, you agree to hoot responsibly.
      </p>
    </div>
  );
}


function CountryRow({
  c,
  selected,
  onClick,
}: {
  c: Country;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
        selected
          ? "bg-yellow-300/15 text-yellow-300"
          : "text-white hover:bg-indigo-800"
      }`}
    >
      <span className="text-xl flex-shrink-0">{c.flag}</span>
      <span className="flex-1 font-semibold truncate">{c.name}</span>
      <span className="text-sm text-indigo-300 font-bold">{c.code}</span>
      {selected && <span className="text-yellow-300">✓</span>}
    </button>
  );
}

function PhoneScreen({
  phone,
  setPhone,
  onContinue,
  onBack,
  play,
}: {
  phone: string;
  setPhone: (p: string) => void;
  onContinue: () => void;
  onBack: () => void;
  play: (s: any) => void;
}) {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [showList, setShowList] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Close country picker on outside click
  useEffect(() => {
    if (!showList) return;
    const handler = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setShowList(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showList]);

  const digits = phone.replace(/\D/g, "");
  const valid = digits.length >= 7;

  const q = search.trim().toLowerCase();
  const filteredPopular = q
    ? POPULAR_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.includes(q) ||
          c.iso.toLowerCase() === q
      )
    : POPULAR_COUNTRIES;
  const filteredOther = q
    ? OTHER_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.includes(q) ||
          c.iso.toLowerCase() === q
      )
    : OTHER_COUNTRIES;
  const noResults = filteredPopular.length === 0 && filteredOther.length === 0;

  const pickCountry = (c: Country) => {
    play("tick");
    setCountry(c);
    setShowList(false);
    setSearch("");
  };

  const submit = () => {
    if (!valid) {
      setError("Please enter a valid number");
      play("sad");
      return;
    }
    setError("");
    setPhone(`${country.code}${digits}`);
    onContinue();
  };

  return (
    <div className="w-full max-w-md anim-slide-up">
      <button onClick={onBack} className="mb-4 text-sm font-bold text-yellow-300 hover:underline">
        ← Back
      </button>
      <div className="flex flex-col items-center gap-2 text-center">
        <Owl size={120} mood="thinking" onClick={() => play("hoot")} />
        <h1 className="text-3xl font-black text-white">What's your number?</h1>
        <p className="text-indigo-200">
          We'll send a quick 6-digit code to your nest 🪺
        </p>
      </div>

      <div className="mt-5 card-night p-5">
        <label className="mb-2 block text-xs font-black uppercase tracking-wider text-yellow-300">
          Country / region
        </label>
        <button
          onClick={() => { play("tick"); setShowList(!showList); }}
          className="flex w-full items-center justify-between rounded-2xl border-2 border-indigo-400 bg-indigo-950/50 px-4 py-3 font-bold text-white hover:border-yellow-300"
        >
          <span className="truncate">
            <span className="mr-2 text-xl">{country.flag}</span>
            {country.name}
            <span className="ml-2 text-indigo-300">({country.code})</span>
          </span>
          <span className="text-yellow-300 ml-2">▾</span>
        </button>

        {showList && (
          <div ref={listRef} className="mt-2 flex flex-col overflow-hidden rounded-2xl border-2 border-indigo-400 bg-indigo-950 shadow-xl anim-slide-up">
            {/* Search bar */}
            <div className="flex items-center gap-2 border-b border-indigo-800 px-3 py-2">
              <Search className="h-4 w-4 text-yellow-300 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code…"
                className="flex-1 bg-transparent text-sm font-semibold text-white placeholder:text-indigo-300/60 focus:outline-none"
                autoFocus
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-indigo-300 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Country list */}
            <div className="max-h-72 overflow-y-auto">
              {noResults ? (
                <div className="flex flex-col items-center gap-2 p-6 text-center">
                  <Owl size={60} mood="thinking" />
                  <p className="text-sm font-bold text-indigo-300">
                    No country matches "{search}"
                  </p>
                </div>
              ) : (
                <>
                  {filteredPopular.length > 0 && (
                    <>
                      {!q && (
                        <div className="sticky top-0 bg-indigo-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-yellow-300 border-b border-indigo-800">
                          ⭐ Popular
                        </div>
                      )}
                      {filteredPopular.map((c) => (
                        <CountryRow
                          key={c.iso}
                          c={c}
                          selected={c.iso === country.iso}
                          onClick={() => pickCountry(c)}
                        />
                      ))}
                    </>
                  )}
                  {filteredOther.length > 0 && (
                    <>
                      {!q && filteredPopular.length > 0 && (
                        <div className="sticky top-0 bg-indigo-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-300 border-y border-indigo-800">
                          🌍 All countries
                        </div>
                      )}
                      {filteredOther.map((c) => (
                        <CountryRow
                          key={c.iso}
                          c={c}
                          selected={c.iso === country.iso}
                          onClick={() => pickCountry(c)}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-indigo-800 px-3 py-1.5 text-[10px] text-indigo-400 text-center">
              {COUNTRIES.length} countries supported worldwide 🌐
            </div>
          </div>
        )}

        <label className="mt-5 mb-2 block text-xs font-black uppercase tracking-wider text-yellow-300">
          Phone number
        </label>
        <div className="flex items-center gap-2 rounded-2xl border-2 border-indigo-400 bg-indigo-950/50 px-4 py-3 focus-within:border-yellow-300">
          <Phone className="h-5 w-5 text-yellow-300 flex-shrink-0" />
          <span className="font-bold text-white flex-shrink-0">{country.code}</span>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^\d\s]/g, "");
              setPhone(cleaned);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && valid) submit();
            }}
            placeholder="123 456 7890"
            className="flex-1 min-w-0 bg-transparent font-bold text-white placeholder:text-indigo-300/60 focus:outline-none"
            autoFocus
          />
        </div>
        {error && <p className="mt-2 text-sm font-bold text-pink-400 anim-shake">{error}</p>}
        {!error && !valid && phone.length > 0 && (
          <p className="mt-2 text-xs text-indigo-300">
            {7 - digits.length > 0
              ? `${7 - digits.length} more digit${7 - digits.length === 1 ? "" : "s"} needed`
              : "Enter your mobile number"}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!valid}
        className={`btn-chunky mt-5 w-full ${valid ? "btn-moon" : "btn-ghost opacity-50 cursor-not-allowed"}`}
      >
        {valid ? "Send the hoot" : "Enter your number"} <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-3 text-center text-xs text-indigo-300/60">
        Press <kbd className="mx-1 rounded bg-indigo-900 px-1.5 py-0.5 font-mono text-yellow-300">Enter ↵</kbd> to continue
      </p>
    </div>
  );
}

function OtpScreen({
  phone,
  onComplete,
  onBack,
  play,
}: {
  phone: string;
  onComplete: () => void;
  onBack: () => void;
  play: (s: any) => void;
}) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
    play("pop");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // Auto-fill demo helper
  useEffect(() => {
    const t = setTimeout(() => {
      if (code.every((d) => d === "")) {
        const demo = "123456".split("");
        demo.forEach((d, i) => {
          setTimeout(() => {
            setCode((c) => {
              const next = [...c];
              next[i] = d;
              return next;
            });
            inputs.current[i + 1]?.focus();
            play("tick");
          }, i * 180);
        });
      }
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    if (digit) play("tick");
    setCode((c) => {
      const next = [...c];
      next[i] = digit;
      return next;
    });
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === "Enter" && filled) {
      verify();
    }
  };

  const verify = () => {
    if (code.join("").length !== 6) {
      setError("Enter the full 6-digit code");
      play("sad");
      return;
    }
    setError("");
    onComplete();
  };

  const filled = code.every((d) => d);

  return (
    <div className="w-full max-w-md anim-slide-up">
      <button onClick={onBack} className="mb-4 text-sm font-bold text-yellow-300 hover:underline">
        ← Back
      </button>
      <div className="flex flex-col items-center gap-2 text-center">
        <Owl size={110} mood="surprised" onClick={() => play("surprise")} />
        <h1 className="text-3xl font-black text-white">Check your nest!</h1>
        <p className="text-indigo-200">
          We sent a code to <span className="font-bold text-yellow-300">{phone}</span>
        </p>
      </div>

      <div className="mt-5 card-night p-6">
        <div className="flex justify-center gap-2.5">
          {code.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              className="otp-input h-14 w-12 rounded-2xl border-2 border-indigo-400 bg-indigo-950 text-center text-2xl font-black text-yellow-300 transition-all"
            />
          ))}
        </div>
        {error && <p className="mt-3 text-center text-sm font-bold text-pink-400 anim-shake">{error}</p>}
        <p className="mt-4 text-center text-sm text-indigo-200">
          {timer > 0 ? (
            <>Resend hoot in <span className="font-bold text-yellow-300">{timer}s</span></>
          ) : (
            <button onClick={() => { play("pop"); setTimer(30); }} className="font-bold text-yellow-300 hover:underline">
              Resend hoot
            </button>
          )}
        </p>
        <p className="mt-3 text-center text-xs text-indigo-300/60">
          Demo tip: the code auto-fills ✨
        </p>
      </div>

      <button
        type="button"
        onClick={verify}
        disabled={!filled}
        className={`btn-chunky mt-5 w-full ${filled ? "btn-mint" : "btn-ghost opacity-50 cursor-not-allowed"}`}
      >
        {filled ? "Verify & enter" : "Enter all 6 digits"} <Sparkles className="h-5 w-5" />
      </button>
      <p className="mt-3 text-center text-xs text-indigo-300/60">
        Press <kbd className="mx-1 rounded bg-indigo-900 px-1.5 py-0.5 font-mono text-yellow-300">Enter ↵</kbd> when done
      </p>
    </div>
  );
}

const AVATARS = ["🦉", "🐧", "🦜", "🦅", "🦆", "🐦", "🦢", "🦩", "🐤", "🦚", "🦃", "🕊️", "🐓", "🐔", "🦤", "🐣"];

function ProfileScreen({ onComplete, play }: { onComplete: (name: string, avatar: string) => void; play: (s: any) => void }) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🦉");

  useEffect(() => {
    play("happy");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-md anim-slide-up">
      <div className="flex flex-col items-center gap-2 text-center">
        <div
          onClick={() => play("hoot")}
          className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 text-6xl shadow-2xl ring-4 ring-yellow-300/30 anim-pop cursor-pointer"
        >
          {avatar}
        </div>
        <h1 className="text-3xl font-black text-white">Claim your branch!</h1>
        <p className="text-indigo-200">Pick an avatar and tell us your name.</p>
      </div>

      <div className="mt-5 card-night p-5">
        <label className="mb-2 block text-xs font-black uppercase tracking-wider text-yellow-300">
          Your name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What should we call you?"
          className="w-full rounded-2xl border-2 border-indigo-400 bg-indigo-950/50 px-4 py-3 font-bold text-white placeholder:text-indigo-300/60 focus:border-yellow-300 focus:outline-none"
          autoFocus
          maxLength={24}
        />

        <label className="mt-5 mb-3 block text-xs font-black uppercase tracking-wider text-yellow-300">
          Pick your feathers
        </label>
        <div className="grid grid-cols-8 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => { play("tick"); setAvatar(a); }}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl text-2xl transition-all ${
                avatar === a
                  ? "bg-yellow-300 ring-4 ring-yellow-500/40 scale-110"
                  : "bg-indigo-950 hover:bg-indigo-800"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onComplete(name, avatar)}
        className="btn-chunky btn-beak mt-5 w-full"
      >
        Fly into Night OWL <Sparkles className="h-5 w-5" />
      </button>
    </div>
  );
}
