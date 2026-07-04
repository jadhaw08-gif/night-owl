import { useCallback, useEffect, useState } from "react";
import type { ForestMode } from "../components/ForestScene";

export interface UserSoundtrack {
  mode: ForestMode;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  updatedAt: number;
}

const STORAGE_KEY = "night-owl-user-soundtracks-v1";

type SoundtrackMap = Partial<Record<ForestMode, UserSoundtrack>>;

function loadSoundtracks(): SoundtrackMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useUserSoundtracks() {
  const [soundtracks, setSoundtracks] = useState<SoundtrackMap>(() => loadSoundtracks());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(soundtracks));
    } catch {
      // localStorage can fail if files are too large; callers show the error.
    }
  }, [soundtracks]);

  const addSoundtrack = useCallback((mode: ForestMode, file: File) => {
    return new Promise<UserSoundtrack>((resolve, reject) => {
      if (!file.type.startsWith("audio/")) {
        reject(new Error("Please upload an audio file."));
        return;
      }

      // Keep localStorage safe. For bigger files, a production app should use IndexedDB.
      const maxBytes = 8 * 1024 * 1024;
      if (file.size > maxBytes) {
        reject(new Error("Please use an audio file smaller than 8 MB."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const track: UserSoundtrack = {
          mode,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: String(reader.result),
          updatedAt: Date.now(),
        };
        setSoundtracks((current) => ({ ...current, [mode]: track }));
        resolve(track);
      };
      reader.onerror = () => reject(new Error("Could not read this audio file."));
      reader.readAsDataURL(file);
    });
  }, []);

  const removeSoundtrack = useCallback((mode: ForestMode) => {
    setSoundtracks((current) => {
      const next = { ...current };
      delete next[mode];
      return next;
    });
  }, []);

  return { soundtracks, addSoundtrack, removeSoundtrack };
}