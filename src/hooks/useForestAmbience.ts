import { useCallback, useEffect, useRef } from "react";
import type { ForestMode } from "../components/ForestScene";
import { LICENSED_AUDIO_TRACKS } from "../data/audioTracks";
import type { UserSoundtrack } from "./useUserSoundtracks";

export type AmbienceContext =
  | "onboarding"
  | "home-chats"
  | "home-calls"
  | "home-games"
  | "home-profile"
  | "chat"
  | "call"
  | "game"
  | "apk";

type StopHandle = { stop: () => void };

/**
 * Relaxing procedural forest ambience.
 * Designed to feel like a soft background environment, not game sound effects.
 */
export function useForestAmbience(
  mode: ForestMode,
  muted: boolean,
  context: AmbienceContext,
  userSoundtracks: Partial<Record<ForestMode, UserSoundtrack>> = {}
) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const activeRef = useRef<StopHandle[]>([]);
  const startedRef = useRef(false);
  const modeRef = useRef(mode);
  const contextRef = useRef(context);
  const mutedRef = useRef(muted);
  const userSoundtracksRef = useRef(userSoundtracks);

  useEffect(() => {
    modeRef.current = mode;
    contextRef.current = context;
    mutedRef.current = muted;
    userSoundtracksRef.current = userSoundtracks;
  }, [mode, context, muted, userSoundtracks]);

  const ensureCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const stopAll = useCallback(() => {
    activeRef.current.forEach((item) => item.stop());
    activeRef.current = [];
  }, []);

  const softNoiseBuffer = (ctx: AudioContext, seconds: number) => {
    const buffer = ctx.createBuffer(1, Math.ceil(seconds * ctx.sampleRate), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) {
      brown = brown * 0.992 + (Math.random() * 2 - 1) * 0.008;
      data[i] = Math.max(-1, Math.min(1, brown * 4));
    }
    return buffer;
  };

  const startLicensedAudioLoop = (candidates: string[], volume: number): StopHandle => {
    let stopped = false;
    let index = 0;
    let fadeTimer: number | null = null;
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;

    const fadeTo = (target: number, ms = 1800) => {
      if (fadeTimer) window.clearInterval(fadeTimer);
      const start = audio.volume;
      const started = performance.now();
      fadeTimer = window.setInterval(() => {
        const p = Math.min(1, (performance.now() - started) / ms);
        audio.volume = start + (target - start) * p;
        if (p >= 1 && fadeTimer) {
          window.clearInterval(fadeTimer);
          fadeTimer = null;
        }
      }, 60);
    };

    const tryNext = () => {
      if (stopped || index >= candidates.length) return;
      audio.src = candidates[index++];
      audio.load();
      audio.play()
        .then(() => fadeTo(mutedRef.current ? 0 : volume))
        .catch(() => {
          // Try next candidate if the local file is missing or unsupported.
          window.setTimeout(tryNext, 120);
        });
    };

    audio.addEventListener("error", tryNext);
    tryNext();

    return {
      stop: () => {
        stopped = true;
        if (fadeTimer) window.clearInterval(fadeTimer);
        const start = audio.volume;
        const started = performance.now();
        const timer = window.setInterval(() => {
          const p = Math.min(1, (performance.now() - started) / 700);
          audio.volume = start * (1 - p);
          if (p >= 1) {
            window.clearInterval(timer);
            audio.pause();
            audio.src = "";
          }
        }, 50);
      },
    };
  };

  const startDataUrlAudioLoop = (dataUrl: string, volume: number): StopHandle => {
    let fadeTimer: number | null = null;
    const audio = new Audio(dataUrl);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;

    const fadeTo = (target: number, ms = 1600) => {
      if (fadeTimer) window.clearInterval(fadeTimer);
      const start = audio.volume;
      const started = performance.now();
      fadeTimer = window.setInterval(() => {
        const p = Math.min(1, (performance.now() - started) / ms);
        audio.volume = start + (target - start) * p;
        if (p >= 1 && fadeTimer) {
          window.clearInterval(fadeTimer);
          fadeTimer = null;
        }
      }, 60);
    };

    audio.play().then(() => fadeTo(mutedRef.current ? 0 : volume)).catch(() => {});

    return {
      stop: () => {
        if (fadeTimer) window.clearInterval(fadeTimer);
        const start = audio.volume;
        const started = performance.now();
        const timer = window.setInterval(() => {
          const p = Math.min(1, (performance.now() - started) / 650);
          audio.volume = start * (1 - p);
          if (p >= 1) {
            window.clearInterval(timer);
            audio.pause();
            audio.src = "";
          }
        }, 50);
      },
    };
  };

  const noiseLayer = (
    ctx: AudioContext,
    out: AudioNode,
    opts: { gain: number; type: BiquadFilterType; freq: number; q?: number; pan?: number }
  ) => {
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const pan = ctx.createStereoPanner();
    src.buffer = softNoiseBuffer(ctx, 6);
    src.loop = true;
    filter.type = opts.type;
    filter.frequency.value = opts.freq;
    filter.Q.value = opts.q ?? 0.55;
    gain.gain.value = opts.gain;
    pan.pan.value = opts.pan ?? 0;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(pan);
    pan.connect(out);
    src.start();
    return {
      stop: () => {
        try { src.stop(); } catch { /* noop */ }
        src.disconnect();
        filter.disconnect();
        gain.disconnect();
        pan.disconnect();
      },
    };
  };

  const breathingWind = (ctx: AudioContext, out: AudioNode, gainValue: number, strength = 1) => {
    const group = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    group.gain.value = gainValue;
    lfo.frequency.value = 0.035 * strength;
    lfoGain.gain.value = gainValue * 0.55;
    lfo.connect(lfoGain);
    lfoGain.connect(group.gain);
    group.connect(out);
    const layerA = noiseLayer(ctx, group, { gain: 0.7, type: "lowpass", freq: 430 + 120 * strength, pan: -0.18 });
    const layerB = noiseLayer(ctx, group, { gain: 0.22, type: "bandpass", freq: 900 + 260 * strength, q: 0.35, pan: 0.22 });
    lfo.start();
    return {
      stop: () => {
        layerA.stop();
        layerB.stop();
        try { lfo.stop(); } catch { /* noop */ }
        lfo.disconnect();
        lfoGain.disconnect();
        group.disconnect();
      },
    };
  };

  const softPad = (ctx: AudioContext, out: AudioNode, freqs: number[], gainValue: number, filterFreq = 520) => {
    const group = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const oscs: OscillatorNode[] = [];
    group.gain.value = gainValue;
    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.35;
    lfo.frequency.value = 0.025;
    lfoGain.gain.value = 18;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    group.connect(filter);
    filter.connect(out);
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? "triangle" : "sine";
      osc.frequency.value = freq;
      osc.detune.value = (i - 1) * 5;
      osc.connect(group);
      osc.start();
      oscs.push(osc);
    });
    lfo.start();
    return {
      stop: () => {
        oscs.forEach((osc) => {
          try { osc.stop(); } catch { /* noop */ }
          osc.disconnect();
        });
        try { lfo.stop(); } catch { /* noop */ }
        lfo.disconnect();
        lfoGain.disconnect();
        group.disconnect();
        filter.disconnect();
      },
    };
  };

  const gentleCrickets = (ctx: AudioContext, out: AudioNode, density: number) => {
    const interval = window.setInterval(() => {
      if (mutedRef.current) return;
      const now = ctx.currentTime;
      const count = Math.random() > 0.55 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const start = now + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = "sine";
        osc.frequency.value = 2400 + Math.random() * 500;
        filter.type = "bandpass";
        filter.frequency.value = 2500;
        filter.Q.value = 5;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.007 * density, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        osc.start(start);
        osc.stop(start + 0.18);
        window.setTimeout(() => {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        }, 250);
      }
    }, 2600 + Math.random() * 2600);
    return { stop: () => window.clearInterval(interval) };
  };

  const waterStream = (ctx: AudioContext, out: AudioNode, gainValue: number) => {
    const group = ctx.createGain();
    group.gain.value = gainValue;
    group.connect(out);
    const low = noiseLayer(ctx, group, { gain: 0.55, type: "bandpass", freq: 620, q: 0.45, pan: -0.15 });
    const high = noiseLayer(ctx, group, { gain: 0.18, type: "highpass", freq: 1700, pan: 0.2 });
    return {
      stop: () => {
        low.stop();
        high.stop();
        group.disconnect();
      },
    };
  };

  const rainBed = (ctx: AudioContext, out: AudioNode, gainValue: number) => {
    const group = ctx.createGain();
    group.gain.value = gainValue;
    group.connect(out);
    const bed = noiseLayer(ctx, group, { gain: 0.8, type: "bandpass", freq: 980, q: 0.32 });
    const softRoof = noiseLayer(ctx, group, { gain: 0.22, type: "lowpass", freq: 280 });
    const drops = window.setInterval(() => {
      if (mutedRef.current) return;
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      src.buffer = softNoiseBuffer(ctx, 0.08);
      filter.type = "bandpass";
      filter.frequency.value = 1400 + Math.random() * 1100;
      filter.Q.value = 1.2;
      gain.gain.value = 0.006 + Math.random() * 0.01;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(group);
      const start = ctx.currentTime + Math.random() * 0.4;
      src.start(start);
      src.stop(start + 0.07);
      window.setTimeout(() => {
        src.disconnect();
        filter.disconnect();
        gain.disconnect();
      }, 180);
    }, 360);
    return {
      stop: () => {
        bed.stop();
        softRoof.stop();
        window.clearInterval(drops);
        group.disconnect();
      },
    };
  };

  const rareSoftGlow = (ctx: AudioContext, out: AudioNode, gainValue: number) => {
    const notes = [392, 493.88, 587.33, 739.99];
    const interval = window.setInterval(() => {
      if (mutedRef.current) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const freq = notes[Math.floor(Math.random() * notes.length)];
      osc.type = "sine";
      osc.frequency.value = freq;
      filter.type = "lowpass";
      filter.frequency.value = 1100;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.4);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(out);
      osc.start();
      osc.stop(ctx.currentTime + 3.5);
      window.setTimeout(() => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      }, 3600);
    }, 9500 + Math.random() * 7000);
    return { stop: () => window.clearInterval(interval) };
  };

  const contextVolume = (nextContext: AmbienceContext) => {
    if (nextContext === "call") return 0.22;
    if (nextContext === "game") return 0.34;
    if (nextContext === "home-games") return 0.36;
    if (nextContext === "apk") return 0.26;
    return 0.42;
  };

  const startScene = useCallback((nextMode: ForestMode, nextContext: AmbienceContext) => {
    const ctx = ensureCtx();
    const master = masterRef.current;
    if (!ctx || !master) return;

    stopAll();

    const now = ctx.currentTime;
    const targetVolume = mutedRef.current ? 0 : contextVolume(nextContext);
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(targetVolume, now + 1.8);

    const scene = ctx.createGain();
    scene.gain.value = 1;
    scene.connect(master);
    activeRef.current.push({ stop: () => scene.disconnect() });

    const uploadedTrack = userSoundtracksRef.current[nextMode];
    if (uploadedTrack?.dataUrl) {
      activeRef.current.push(startDataUrlAudioLoop(uploadedTrack.dataUrl, 0.46));
    }

    // Base sound based on selected forest mode. If user uploaded a track, this becomes a very subtle bed.
    const hasUserTrack = Boolean(uploadedTrack?.dataUrl);
    if (nextMode === "calm") {
      const calmTrack = LICENSED_AUDIO_TRACKS.calm;
      if (!hasUserTrack) {
        activeRef.current.push(startLicensedAudioLoop(calmTrack.localCandidates, 0.34));
      }
      // A very quiet procedural bed remains underneath in case the local track is unavailable.
      activeRef.current.push(breathingWind(ctx, scene, hasUserTrack ? 0.012 : 0.035, 0.55));
      activeRef.current.push(softPad(ctx, scene, [73.42, 110], hasUserTrack ? 0.004 : 0.009, 430));
    }
    if (nextMode === "windy") {
      activeRef.current.push(breathingWind(ctx, scene, hasUserTrack ? 0.025 : 0.14, 1.35));
      activeRef.current.push(softPad(ctx, scene, [65.41, 98], hasUserTrack ? 0.004 : 0.015, 360));
    }
    if (nextMode === "rain") {
      activeRef.current.push(rainBed(ctx, scene, hasUserTrack ? 0.025 : 0.16));
      activeRef.current.push(breathingWind(ctx, scene, hasUserTrack ? 0.012 : 0.045, 0.75));
    }
    if (nextMode === "fireflies") {
      activeRef.current.push(breathingWind(ctx, scene, hasUserTrack ? 0.014 : 0.06, 0.6));
      activeRef.current.push(softPad(ctx, scene, [82.41, 123.47, 164.81], hasUserTrack ? 0.005 : 0.02, 520));
      activeRef.current.push(rareSoftGlow(ctx, scene, hasUserTrack ? 0.003 : 0.012));
    }
    if (nextMode === "aurora") {
      activeRef.current.push(breathingWind(ctx, scene, hasUserTrack ? 0.012 : 0.052, 0.55));
      activeRef.current.push(softPad(ctx, scene, [65.41, 98, 130.81, 196], hasUserTrack ? 0.006 : 0.034, 720));
      activeRef.current.push(rareSoftGlow(ctx, scene, hasUserTrack ? 0.002 : 0.009));
    }

    // Context layer: each tab gets a matching natural texture.
    if (nextContext === "onboarding") {
      activeRef.current.push(rareSoftGlow(ctx, scene, 0.01));
    }
    if (nextContext === "home-chats" || nextContext === "chat") {
      activeRef.current.push(gentleCrickets(ctx, scene, nextContext === "chat" ? 0.55 : 0.75));
    }
    if (nextContext === "home-calls" || nextContext === "call") {
      activeRef.current.push(softPad(ctx, scene, [55, 82.41], 0.012, 300));
    }
    if (nextContext === "home-games" || nextContext === "game") {
      activeRef.current.push(gentleCrickets(ctx, scene, 0.38));
      activeRef.current.push(rareSoftGlow(ctx, scene, 0.008));
    }
    if (nextContext === "home-profile") {
      activeRef.current.push(waterStream(ctx, scene, 0.055));
    }
    if (nextContext === "apk") {
      activeRef.current.push(breathingWind(ctx, scene, 0.035, 0.45));
    }
  }, [ensureCtx, stopAll]);

  useEffect(() => {
    if (!startedRef.current) return;
    startScene(mode, context);
  }, [mode, context, startScene]);

  useEffect(() => {
    const master = masterRef.current;
    const ctx = ctxRef.current;
    if (!master || !ctx || !startedRef.current) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(muted ? 0 : contextVolume(contextRef.current), now + 0.8);
  }, [muted]);

  useEffect(() => {
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      ensureCtx();
      startScene(modeRef.current, contextRef.current);
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      stopAll();
      const ctx = ctxRef.current;
      if (ctx && ctx.state !== "closed") ctx.close();
    };
  }, [ensureCtx, startScene, stopAll]);
}