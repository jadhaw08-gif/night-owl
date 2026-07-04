export interface LicensedAudioTrack {
  mode: "calm" | "windy" | "rain" | "fireflies" | "aurora";
  title: string;
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  localCandidates: string[];
}

export const LICENSED_AUDIO_TRACKS: Record<string, LicensedAudioTrack> = {
  calm: {
    mode: "calm",
    title: "forest wind blow snow of tree trickle like rain stick cool mono.flac",
    author: "kyles",
    sourceUrl: "https://freesound.org/people/kyles/sounds/452094/",
    license: "Creative Commons 0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    localCandidates: [
      "/audio/calm.flac",
      "/audio/calm.mp3",
      "/audio/calm.ogg",
      "/audio/452094__kyles__forest-wind-blow-snow-of-tree-trickle-like-rain-stick-cool-mono.flac",
    ],
  },
};