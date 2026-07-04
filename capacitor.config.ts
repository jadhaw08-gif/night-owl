import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nightowl.app",
  appName: "Night OWL",
  webDir: "dist",
  server: {
    // For development with live reload, set this to your local dev server URL:
    // url: "http://192.168.1.X:5173",
    androidScheme: "https",
  },
  backgroundColor: "#0b0f2a",
  android: {
    backgroundColor: "#0b0f2a",
  },
  ios: {
    backgroundColor: "#0b0f2a",
    scheme: "nightowl",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0b0f2a",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0b0f2a",
    },
  },
};

export default config;
