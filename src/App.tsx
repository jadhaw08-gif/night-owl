import { useEffect, useState } from "react";
import { Confetti } from "./components/Shared";
import { Onboarding } from "./components/Onboarding";
import { Home } from "./components/Home";
import { Chat } from "./components/Chat";
import { CallScreen } from "./components/Call";
import { GamePlay } from "./components/Games";
import { useAppState } from "./hooks/useAppState";
import { useOwlSounds } from "./hooks/useOwlSounds";
import { useForestAmbience } from "./hooks/useForestAmbience";
import type { AmbienceContext } from "./hooks/useForestAmbience";
import { useUserSoundtracks } from "./hooks/useUserSoundtracks";
import { GetApkModal } from "./components/GetApkModal";
import { ForestScene } from "./components/ForestScene";
import type { ForestMode } from "./components/ForestScene";

export default function App() {
  const s = useAppState();
  const { play, muted, setMuted } = useOwlSounds();
  const [mounted, setMounted] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [forestMode, setForestMode] = useState<ForestMode>("fireflies");
  const { soundtracks, addSoundtrack, removeSoundtrack } = useUserSoundtracks();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Register simple service worker for PWA installability
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const swCode = `self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', () => {});`;
      const blob = new Blob([swCode], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      navigator.serviceWorker.register(url).catch(() => {});
    }
  }, []);

  const activeChat = s.state.chats.find((c) => c.id === s.activeChatId) ?? null;
  const activeContact = activeChat ? s.contactById(activeChat.contactId) ?? null : null;
  const activeMessages = activeChat ? s.messagesByChat(activeChat.id) : [];

  const screen = s.screen;
  const isOnboarding = ["splash", "welcome", "phone", "otp", "profile"].includes(screen);
  const ambienceContext: AmbienceContext = showApkModal
    ? "apk"
    : isOnboarding
    ? "onboarding"
    : screen === "chat"
    ? "chat"
    : screen === "call"
    ? "call"
    : screen === "game-play"
    ? "game"
    : s.tab === "calls"
    ? "home-calls"
    : s.tab === "games"
    ? "home-games"
    : s.tab === "me"
    ? "home-profile"
    : "home-chats";
  useForestAmbience(forestMode, muted, ambienceContext, soundtracks);

  return (
    <div className="relative mx-auto flex h-screen w-full max-w-2xl flex-col overflow-hidden bg-[#0b0f2a] shadow-2xl md:my-0">
      <Confetti active={s.confetti} />
      <div key={mounted ? "mounted" : "mounting"} className="relative h-full w-full overflow-hidden">
        <ForestScene mode={forestMode} setMode={setForestMode} play={play} />

        {/* Mute toggle */}
        <button
          onClick={() => setMuted(!muted)}
          className="absolute top-3 right-3 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-950/80 text-yellow-300 shadow-lg ring-1 ring-yellow-300/30 backdrop-blur hover:scale-110 transition-transform"
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>

        {isOnboarding && (
          <Onboarding
            screen={screen as any}
            setScreen={s.setScreen}
            setPhone={s.setPhone}
            completeOtp={s.completeOtp}
            completeProfile={s.completeProfile}
            phone={s.state.phone}
            play={play}
          />
        )}
        {screen === "home" && (
          <Home
            tab={s.tab}
            setTab={s.setTab}
            chats={s.state.chats}
            contacts={s.state.contacts}
            contactById={s.contactById}
            messagesByChat={s.messagesByChat}
            profile={s.state.profile}
            openChat={(id) => { play("pop"); s.openChat(id); }}
            startCall={(id, type) => { play("hoot"); s.startCall(id, type); }}
            setActiveGame={s.setActiveGame}
            setScreen={s.setScreen}
            resetApp={s.resetApp}
            typingIn={s.typingIn}
            play={play}
            muted={muted}
            setMuted={setMuted}
            onShowApk={() => setShowApkModal(true)}
            forestMode={forestMode}
            setForestMode={setForestMode}
            soundtracks={soundtracks}
            addSoundtrack={addSoundtrack}
            removeSoundtrack={removeSoundtrack}
          />
        )}
        {screen === "chat" && activeContact && (
          <Chat
            contact={activeContact}
            messages={activeMessages}
            onSend={s.sendMessage}
            onBack={() => { play("tick"); s.setScreen("home"); }}
            onCall={(type) => { play("hoot"); s.startCall(activeContact.id, type); }}
            typing={s.typingIn === activeChat?.id}
            play={play}
          />
        )}
        {screen === "call" && s.activeCall && (
          <CallScreen
            call={s.activeCall}
            contact={s.contactById(s.activeCall.contactId)!}
            onEnd={() => { play("tick"); s.endCall(); }}
            play={play}
          />
        )}
        {screen === "game-play" && s.activeGame && (
          <GamePlay game={s.activeGame} onBack={() => { play("tick"); s.setScreen("home"); }} play={play} />
        )}

        {/* APK Download Modal */}
        {showApkModal && (
          <GetApkModal
            onClose={() => setShowApkModal(false)}
            play={play}
          />
        )}
      </div>
    </div>
  );
}
