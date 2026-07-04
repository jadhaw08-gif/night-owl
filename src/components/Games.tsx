import { useEffect, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, Trophy, Zap } from "lucide-react";
import { Confetti, Owl } from "./Shared";

interface Props {
  game: string;
  onBack: () => void;
  play: (s: any) => void;
}

export function GamePlay({ game, onBack, play }: Props) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black/10 backdrop-blur-[1px]">
      <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
      <header className="relative z-10 flex items-center gap-3 border-b border-indigo-700/50 bg-indigo-950/80 px-3 py-3 backdrop-blur-xl">
        <button
          onClick={() => { play("tick"); onBack(); }}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-yellow-300 hover:bg-indigo-800 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-black text-white">
          {game === "tictactoe" && "⭕ Tic-Tac-Hoot"}
          {game === "rps" && "🦉 Beak Paper Claw"}
          {game === "memory" && "🌙 Night Memory"}
          {game === "reaction" && "⚡ Owl Reflexes"}
        </h1>
      </header>
      <div className="relative z-10 flex-1 overflow-y-auto p-4 pb-24">
        {game === "tictactoe" && <TicTacToe play={play} />}
        {game === "rps" && <RockPaperScissors play={play} />}
        {game === "memory" && <MemoryMatch play={play} />}
        {game === "reaction" && <ReactionRace play={play} />}
      </div>
    </div>
  );
}

/* ===================== TIC-TAC-HOOT ===================== */
type Cell = "X" | "O" | null;

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: Cell[]): { winner: Cell; line: number[] | null } {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

function TicTacToe({ play }: { play: (s: any) => void }) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 });
  const [confetti, setConfetti] = useState(false);
  const { winner, line } = checkWinner(board);
  const full = board.every(Boolean);
  const over = !!winner || full;

  const playCell = (i: number) => {
    if (board[i] || over) return;
    play("tick");
    const next = [...board];
    next[i] = turn;
    setBoard(next);
    setTurn(turn === "X" ? "O" : "X");
  };

  useEffect(() => {
    if (winner === "X") {
      setScore((s) => ({ ...s, X: s.X + 1 }));
      setConfetti(true);
      play("happy");
    } else if (winner === "O") {
      setScore((s) => ({ ...s, O: s.O + 1 }));
      play("sad");
    } else if (full) {
      setScore((s) => ({ ...s, draw: s.draw + 1 }));
      play("hoot");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, full]);

  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setConfetti(false);
  };

  return (
    <div className="mx-auto max-w-sm">
      <Confetti active={confetti} />
      <div className="grid grid-cols-3 gap-2 mb-4">
        <ScorePill label="You (X)" value={score.X} color="from-indigo-500 to-purple-700" active={turn === "X" && !over} />
        <ScorePill label="Draws" value={score.draw} color="from-slate-600 to-slate-700" active={false} />
        <ScorePill label="Hoot (O)" value={score.O} color="from-orange-500 to-red-600" active={turn === "O" && !over} />
      </div>

      <div className="card-night p-4">
        <div className="grid grid-cols-3 gap-2.5">
          {board.map((c, i) => {
            const isWin = line?.includes(i);
            return (
              <button
                key={i}
                onClick={() => playCell(i)}
                disabled={!!c || over}
                className={`aspect-square rounded-2xl text-5xl font-black shadow-md transition-all active:scale-95 ${
                  c === "X"
                    ? "bg-gradient-to-br from-indigo-500 to-purple-700 text-white ring-2 ring-indigo-300"
                    : c === "O"
                    ? "bg-gradient-to-br from-orange-500 to-red-600 text-white ring-2 ring-orange-300"
                    : "bg-indigo-900/60 text-indigo-300 hover:bg-indigo-800 ring-1 ring-indigo-700"
                } ${isWin ? "ring-4 ring-yellow-300 anim-pop" : ""}`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col items-center gap-3">
          {over && (
            <div className="anim-bounce-in flex flex-col items-center gap-2">
              <Owl size={80} mood={winner === "X" ? "excited" : winner === "O" ? "sad" : "thinking"} />
              <p className="text-2xl font-black text-white">
                {winner === "X" && "🎉 You win!"}
                {winner === "O" && "😭 Hoot wins!"}
                {!winner && "🤝 Draw!"}
              </p>
            </div>
          )}
          {!over && (
            <div className="flex items-center gap-2 text-sm font-black text-yellow-300">
              {turn === "X" ? "Your turn 🦉" : "Hoot is thinking…"}
            </div>
          )}
          <button onClick={() => { play("pop"); reset(); }} className="btn-chunky btn-moon">
            <RotateCcw className="h-4 w-4" />
            New round
          </button>
        </div>
      </div>
    </div>
  );
}

function ScorePill({ label, value, color, active }: { label: string; value: number; color: string; active: boolean }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${color} p-2.5 text-center text-white shadow-md ring-1 ring-white/10 ${active ? "ring-4 ring-yellow-300" : ""}`}>
      <p className="text-[10px] font-black uppercase tracking-wider opacity-90">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

/* ===================== BEAK PAPER CLAW (RPS) ===================== */
const CHOICES = [
  { id: "beak", emoji: "🦅", label: "Beak", beats: "claw" },
  { id: "paper", emoji: "📄", label: "Paper", beats: "beak" },
  { id: "claw", emoji: "🦀", label: "Claw", beats: "paper" },
];

function RockPaperScissors({ play }: { play: (s: any) => void }) {
  const [user, setUser] = useState<string | null>(null);
  const [bot, setBot] = useState<string | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [round, setRound] = useState(1);
  const [confetti, setConfetti] = useState(false);
  const [shaking, setShaking] = useState(false);

  const doPlay = (choice: string) => {
    if (shaking) return;
    play("pop");
    setUser(choice);
    setBot(null);
    setResult(null);
    setShaking(true);
    setTimeout(() => {
      const botChoice = CHOICES[Math.floor(Math.random() * 3)].id;
      setBot(botChoice);
      const userObj = CHOICES.find((c) => c.id === choice)!;
      const r: "win" | "lose" | "draw" =
        botChoice === choice ? "draw" : userObj.beats === botChoice ? "win" : "lose";
      setResult(r);
      setShaking(false);
      setScore((s) => ({
        wins: s.wins + (r === "win" ? 1 : 0),
        losses: s.losses + (r === "lose" ? 1 : 0),
        draws: s.draws + (r === "draw" ? 1 : 0),
      }));
      setRound((x) => x + 1);
      if (r === "win") {
        setConfetti(true);
        play("happy");
      } else if (r === "lose") {
        play("sad");
      } else {
        play("hoot");
      }
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-sm">
      <Confetti active={confetti} />
      <div className="card-night p-4 mb-4 flex items-center justify-around">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-emerald-300">Wins</p>
          <p className="text-2xl font-black text-emerald-300">{score.wins}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-yellow-300">Round</p>
          <p className="text-2xl font-black text-white">#{round}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-indigo-300">Draws</p>
          <p className="text-2xl font-black text-indigo-300">{score.draws}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-red-300">Losses</p>
          <p className="text-2xl font-black text-red-300">{score.losses}</p>
        </div>
      </div>

      <div className="card-night p-6 mb-4">
        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="text-xs font-black uppercase text-yellow-300 mb-2">You</p>
            <div className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-700 text-5xl shadow-lg ring-2 ring-indigo-300 ${shaking ? "anim-wiggle" : user ? "anim-pop" : ""}`}>
              {user ? CHOICES.find((c) => c.id === user)!.emoji : "❓"}
            </div>
          </div>
          <div className="text-3xl font-black text-yellow-300">VS</div>
          <div className="text-center">
            <p className="text-xs font-black uppercase text-yellow-300 mb-2">Hoot</p>
            <div className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 text-5xl shadow-lg ring-2 ring-orange-300 ${shaking ? "anim-wiggle" : bot ? "anim-pop" : ""}`}>
              {bot ? CHOICES.find((c) => c.id === bot)!.emoji : shaking ? "🎲" : "❓"}
            </div>
          </div>
        </div>
        {result && (
          <div className="mt-4 flex flex-col items-center gap-2 anim-bounce-in">
            <Owl size={70} mood={result === "win" ? "excited" : result === "lose" ? "sad" : "thinking"} />
            <p className="text-3xl font-black text-white">
              {result === "win" && "🎉 You win!"}
              {result === "lose" && "😭 Hoot wins!"}
              {result === "draw" && "🤝 Draw!"}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {CHOICES.map((c) => (
          <button
            key={c.id}
            onClick={() => doPlay(c.id)}
            disabled={shaking}
            className="btn-chunky btn-beak flex-col py-4 text-4xl disabled:opacity-60"
          >
            <span>{c.emoji}</span>
            <span className="text-[10px] uppercase">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===================== NIGHT MEMORY ===================== */
const EMOJI_POOL = ["🦉", "🌙", "⭐", "🪺", "🌲", "🦊", "🌠", "🔮"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MemoryMatch({ play }: { play: (s: any) => void }) {
  const [cards, setCards] = useState(() =>
    shuffle([...EMOJI_POOL, ...EMOJI_POOL].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })))
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [confetti, setConfetti] = useState(false);

  const matched = cards.every((c) => c.matched);

  useEffect(() => {
    if (matched && cards.length > 0) {
      setConfetti(true);
      play("success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched, cards.length]);

  useEffect(() => {
    if (selected.length === 2) {
      const [a, b] = selected;
      const ca = cards[a];
      const cb = cards[b];
      if (ca.emoji === cb.emoji) {
        play("happy");
        setTimeout(() => {
          setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
          setSelected([]);
        }, 500);
      } else {
        play("tick");
        setTimeout(() => {
          setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
          setSelected([]);
        }, 900);
      }
    }
  }, [selected, cards, play]);

  const flip = (i: number) => {
    if (selected.length === 2 || cards[i].flipped || cards[i].matched) return;
    play("pop");
    setCards((cs) => cs.map((c, idx) => (idx === i ? { ...c, flipped: true } : c)));
    setSelected((s) => [...s, i]);
    setMoves((m) => m + 1);
  };

  const reset = () => {
    setCards(shuffle([...EMOJI_POOL, ...EMOJI_POOL].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))));
    setSelected([]);
    setMoves(0);
    setConfetti(false);
    play("pop");
  };

  return (
    <div className="mx-auto max-w-sm">
      <Confetti active={confetti} />
      <div className="card-night p-4 mb-4 flex items-center justify-around">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-indigo-300">Moves</p>
          <p className="text-2xl font-black text-white">{moves}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-pink-300">Pairs</p>
          <p className="text-2xl font-black text-white">
            {cards.filter((c) => c.matched).length / 2}/{EMOJI_POOL.length}
          </p>
        </div>
        <button onClick={reset} className="btn-chunky btn-beak py-2 px-3 text-xs">
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => flip(i)}
            className={`aspect-square rounded-2xl text-3xl shadow-md transition-all active:scale-95 ${
              c.matched
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-emerald-300"
                : c.flipped
                ? "bg-gradient-to-br from-yellow-300 to-amber-500 ring-2 ring-yellow-200"
                : "bg-gradient-to-br from-indigo-600 to-purple-800 ring-1 ring-indigo-500"
            }`}
          >
            {c.flipped || c.matched ? (
              <span className="anim-pop inline-block">{c.emoji}</span>
            ) : (
              <span className="text-2xl">🦉</span>
            )}
          </button>
        ))}
      </div>

      {matched && (
        <div className="mt-5 card-night p-5 text-center anim-bounce-in">
          <Trophy className="mx-auto h-10 w-10 text-yellow-300" />
          <div className="my-3 flex justify-center">
            <Owl size={90} mood="excited" />
          </div>
          <p className="text-2xl font-black text-white">🎉 Hoot hoot!</p>
          <p className="text-sm text-indigo-200">Solved in {moves} moves</p>
        </div>
      )}
    </div>
  );
}

/* ===================== OWL REFLEXES ===================== */
type Phase = "idle" | "waiting" | "go" | "done" | "early";

function ReactionRace({ play }: { play: (s: any) => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [time, setTime] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const [confetti, setConfetti] = useState(false);
  const startRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const start = () => {
    setPhase("waiting");
    setTime(null);
    play("tick");
    const delay = 1500 + Math.random() * 2500;
    timerRef.current = window.setTimeout(() => {
      startRef.current = Date.now();
      setPhase("go");
      play("surprise");
    }, delay);
  };

  const tap = () => {
    if (phase === "idle") {
      start();
      return;
    }
    if (phase === "waiting") {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setPhase("early");
      play("sad");
      return;
    }
    if (phase === "go") {
      const t = Date.now() - startRef.current;
      setTime(t);
      if (!best || t < best) {
        setBest(t);
        setConfetti(true);
        play("success");
      } else {
        play("happy");
      }
      setPhase("done");
    }
    if (phase === "done" || phase === "early") {
      start();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const bg =
    phase === "waiting"
      ? "from-orange-600 to-red-700"
      : phase === "go"
      ? "from-emerald-400 to-teal-500"
      : phase === "early"
      ? "from-red-500 to-pink-600"
      : "from-indigo-500 to-purple-700";

  const label =
    phase === "idle"
      ? "Tap to start"
      : phase === "waiting"
      ? "Wait for green…"
      : phase === "go"
      ? "TAP NOW!"
      : phase === "early"
      ? "Too early! 😅"
      : `${time}ms — tap to retry`;

  return (
    <div className="mx-auto max-w-sm">
      <Confetti active={confetti} />
      <div className="card-night p-4 mb-4 flex items-center justify-around">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-indigo-300">Last</p>
          <p className="text-2xl font-black text-white">{time ? `${time}ms` : "—"}</p>
        </div>
        <Zap className="h-8 w-8 text-yellow-300 anim-bounce-soft" />
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-pink-300">Best</p>
          <p className="text-2xl font-black text-white">{best ? `${best}ms` : "—"}</p>
        </div>
      </div>

      <button
        onClick={tap}
        className={`w-full rounded-3xl bg-gradient-to-br ${bg} p-10 text-white shadow-xl transition-all active:scale-95 ring-2 ring-white/20`}
      >
        <p className="text-4xl font-black">{label}</p>
        {phase === "idle" && (
          <div className="mt-4 flex justify-center">
            <Owl size={80} mood="excited" />
          </div>
        )}
        {phase === "go" && (
          <div className="mt-4 flex justify-center">
            <Owl size={80} mood="surprised" />
          </div>
        )}
        {phase === "early" && (
          <div className="mt-4 flex justify-center">
            <Owl size={80} mood="sad" />
          </div>
        )}
      </button>

      <div className="mt-4 card-night p-4 text-sm text-indigo-100">
        <p className="font-black text-yellow-300 mb-1">How to play 🦉</p>
        <p>Tap when the screen turns green. Don't tap early! Challenge a friend by taking turns — fastest reflexes win ⚡</p>
      </div>
    </div>
  );
}
