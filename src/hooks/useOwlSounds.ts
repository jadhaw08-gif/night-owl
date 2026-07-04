import { useCallback, useEffect, useRef, useState } from "react";

type SoundName =
  | "hoot"
  | "doubleHoot"
  | "happy"
  | "sad"
  | "surprise"
  | "success"
  | "pop"
  | "tick"
  | "flap";

/**
 * Owl sound generator using the Web Audio API.
 * No audio files needed — every hoot is synthesized on demand.
 */
export function useOwlSounds() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const ensureCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (sound: SoundName) => {
      if (mutedRef.current) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      const makeOsc = (type: OscillatorType, freq: number, when = 0) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.value = 0;
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t + when);
        return { o, g };
      };

      const makeNoise = (duration: number) => {
        const buffer = ctx.createBuffer(1, Math.ceil(duration * ctx.sampleRate), ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const fade = 1 - i / data.length;
          data[i] = (Math.random() * 2 - 1) * fade;
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        return src;
      };

      const makeEchoBus = () => {
        const input = ctx.createGain();
        const delay = ctx.createDelay(1.2);
        const feedback = ctx.createGain();
        const wet = ctx.createGain();
        delay.delayTime.value = 0.23;
        feedback.gain.value = 0.18;
        wet.gain.value = 0.22;
        input.connect(ctx.destination);
        input.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(wet);
        wet.connect(ctx.destination);
        return input;
      };

      const realisticHoot = (start: number, base = 205, length = 0.82, loudness = 0.32) => {
        const out = makeEchoBus();
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(900, t + start);
        lowpass.frequency.linearRampToValueAtTime(520, t + start + length);
        lowpass.Q.value = 0.7;
        lowpass.connect(out);

        // Three warm formants create a breathy "whooo" instead of a pure tone.
        [base, base * 1.52, base * 2.05].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.type = i === 0 ? "sine" : "triangle";
          osc.frequency.setValueAtTime(freq * 1.08, t + start);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.86, t + start + length * 0.78);
          filter.type = "bandpass";
          filter.frequency.value = i === 0 ? 320 : i === 1 ? 620 : 1040;
          filter.Q.value = i === 0 ? 2.2 : 4.5;
          gain.gain.setValueAtTime(0, t + start);
          gain.gain.linearRampToValueAtTime(loudness / (i + 1.15), t + start + 0.09);
          gain.gain.setTargetAtTime(loudness / (i + 1.4), t + start + 0.14, 0.22);
          gain.gain.linearRampToValueAtTime(0.0001, t + start + length);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(lowpass);
          osc.start(t + start);
          osc.stop(t + start + length + 0.05);
        });

        // Subtle throat flutter.
        const flutter = ctx.createOscillator();
        const flutterGain = ctx.createGain();
        flutter.frequency.value = 5.4;
        flutterGain.gain.value = 5;
        flutter.connect(flutterGain);
        flutter.start(t + start);
        flutter.stop(t + start + length);

        // Air/noise layer gives the call a less electronic edge.
        const noise = makeNoise(length);
        const noiseGain = ctx.createGain();
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.value = 720;
        noiseFilter.Q.value = 0.8;
        noiseGain.gain.setValueAtTime(0, t + start);
        noiseGain.gain.linearRampToValueAtTime(0.035, t + start + 0.05);
        noiseGain.gain.linearRampToValueAtTime(0.008, t + start + length * 0.65);
        noiseGain.gain.linearRampToValueAtTime(0, t + start + length);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(lowpass);
        noise.start(t + start);
        noise.stop(t + start + length);
      };

      switch (sound) {
        case "hoot": {
          realisticHoot(0, 205, 0.9, 0.34);
          break;
        }
        case "doubleHoot": {
          realisticHoot(0, 230, 0.58, 0.3);
          realisticHoot(0.48, 185, 0.78, 0.34);
          break;
        }
        case "happy": {
          // Ascending chirpy notes
          const notes = [523, 659, 784, 1047]; // C E G C
          notes.forEach((freq, i) => {
            const { o, g } = makeOsc("triangle", freq, i * 0.09);
            g.gain.setValueAtTime(0, t + i * 0.09);
            g.gain.linearRampToValueAtTime(0.28, t + i * 0.09 + 0.02);
            g.gain.linearRampToValueAtTime(0, t + i * 0.09 + 0.14);
            o.stop(t + i * 0.09 + 0.16);
          });
          break;
        }
        case "sad": {
          // Descending minor tones
          const notes = [392, 330, 262];
          notes.forEach((freq, i) => {
            const { o, g } = makeOsc("sine", freq, i * 0.2);
            g.gain.setValueAtTime(0, t + i * 0.2);
            g.gain.linearRampToValueAtTime(0.3, t + i * 0.2 + 0.05);
            g.gain.linearRampToValueAtTime(0, t + i * 0.2 + 0.3);
            o.stop(t + i * 0.2 + 0.35);
          });
          break;
        }
        case "surprise": {
          // Quick upward "woo!"
          const { o, g } = makeOsc("sine", 300);
          o.frequency.setValueAtTime(300, t);
          o.frequency.exponentialRampToValueAtTime(900, t + 0.25);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.35, t + 0.05);
          g.gain.linearRampToValueAtTime(0, t + 0.35);
          o.stop(t + 0.4);
          break;
        }
        case "success": {
          // Triumphant chord
          [523, 659, 784].forEach((freq, i) => {
            const { o, g } = makeOsc("triangle", freq, 0);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.22, t + 0.03 + i * 0.02);
            g.gain.linearRampToValueAtTime(0, t + 0.7);
            o.stop(t + 0.75);
          });
          break;
        }
        case "pop": {
          const { o, g } = makeOsc("sine", 600);
          o.frequency.exponentialRampToValueAtTime(200, t + 0.12);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.3, t + 0.01);
          g.gain.linearRampToValueAtTime(0, t + 0.15);
          o.stop(t + 0.17);
          break;
        }
        case "tick": {
          const { o, g } = makeOsc("triangle", 1100);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.12, t + 0.005);
          g.gain.linearRampToValueAtTime(0, t + 0.04);
          o.stop(t + 0.05);
          break;
        }
        case "flap": {
          // White noise burst for wing flap
          const bufferSize = 0.2 * ctx.sampleRate;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
          }
          const src = ctx.createBufferSource();
          const g = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 800;
          src.buffer = buffer;
          g.gain.value = 0.15;
          src.connect(filter);
          filter.connect(g);
          g.connect(ctx.destination);
          src.start(t);
          break;
        }
      }
    },
    [ensureCtx]
  );

  // Prime the audio context on first user interaction
  useEffect(() => {
    const prime = () => {
      ensureCtx();
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
    };
    window.addEventListener("pointerdown", prime);
    window.addEventListener("keydown", prime);
    return () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
    };
  }, [ensureCtx]);

  return { play, muted, setMuted };
}
