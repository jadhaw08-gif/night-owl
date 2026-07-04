import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, ExternalLink, Copy, Check, X, Globe, Cloud, Terminal, QrCode } from "lucide-react";
import { Owl } from "./Shared";

interface Props {
  onClose: () => void;
  play: (sound: any) => void;
}

export function GetApkModal({ onClose, play }: Props) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [apkUrl, setApkUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const localCommands = `npm run build\nnpx cap add android\ncd android && ./gradlew assembleDebug`;
  const currentUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);
  const qrTarget = apkUrl.trim() || currentUrl;

  useEffect(() => {
    if (!qrTarget) return;
    QRCode.toDataURL(qrTarget, {
      width: 260,
      margin: 2,
      color: {
        dark: "#0b0f2a",
        light: "#fef3c7",
      },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [qrTarget]);

  const copyToClipboard = () => {
    play("tick");
    navigator.clipboard.writeText(localCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const copyQrLink = () => {
    play("tick");
    navigator.clipboard.writeText(qrTarget);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md anim-bounce-in">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border-2 border-indigo-500 bg-gradient-to-b from-indigo-950 via-purple-950 to-[#0b0f2a] shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-800/80 px-6 py-4 bg-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-300 text-indigo-950 font-black shadow-md">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Get Night OWL APK</h2>
              <p className="text-xs text-indigo-200">3 simple ways to install on Android 📲</p>
            </div>
          </div>
          <button
            onClick={() => { play("tick"); onClose(); }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-900/60 text-indigo-300 hover:bg-indigo-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Hero Mascot */}
          <div className="flex items-center gap-4 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-4">
            <Owl size={70} mood="excited" onClick={() => play("hoot")} />
            <div className="flex-1 text-xs leading-relaxed text-indigo-100">
              <p className="font-black text-yellow-300 text-sm mb-0.5">Hoot hoot! Want the .apk?</p>
              Since web browsers can't compile native Android Java directly, choose your favorite method below to get your ready-to-install APK!
            </div>
          </div>

          {/* QR Code Direct Install */}
          <div className="rounded-2xl border-2 border-yellow-300/50 bg-yellow-300/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-300 text-indigo-950 font-bold">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-yellow-300">Scan QR on your phone</h3>
                <p className="mt-1 text-xs text-indigo-200">
                  If Night OWL is deployed online, scan this QR to open it on your phone. If you already have an APK download link, paste it below and the QR will download that APK directly.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-yellow-100 p-3 text-indigo-950 shadow-lg">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="Night OWL QR code" className="h-36 w-36 rounded-xl" />
                    ) : (
                      <div className="flex h-36 w-36 items-center justify-center rounded-xl bg-yellow-200 text-xs font-black">
                        Creating QR...
                      </div>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {apkUrl.trim() ? "APK link QR" : "App link QR"}
                    </span>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-yellow-300">
                      Optional direct APK URL
                    </label>
                    <input
                      value={apkUrl}
                      onChange={(e) => setApkUrl(e.target.value)}
                      placeholder="https://example.com/night-owl.apk"
                      className="w-full rounded-xl border border-indigo-600 bg-indigo-950/80 px-3 py-2 text-xs font-semibold text-white placeholder:text-indigo-300/50 focus:border-yellow-300 focus:outline-none"
                    />
                    <p className="break-all rounded-xl bg-black/30 p-2 text-[10px] text-indigo-200">
                      QR points to: <span className="font-mono text-yellow-300">{qrTarget || "No URL"}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={copyQrLink}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white hover:bg-indigo-500"
                      >
                        {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedLink ? "Copied" : "Copy QR link"}
                      </button>
                      {qrTarget && (
                        <a
                          href={qrTarget}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => play("pop")}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-yellow-300 px-3 py-2 text-xs font-black text-indigo-950 hover:bg-yellow-200"
                        >
                          Open link <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-indigo-300">
                  Important: A QR code can only open an existing online link. For direct APK download, first upload the APK to Google Drive, Dropbox, GitHub Releases, or your website, then paste that direct link here.
                </p>
              </div>
            </div>
          </div>

          {/* Method 1: PWABuilder (Easiest) */}
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-emerald-300">Method 1: Instant Web Converter</h3>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-300 border border-emerald-500/40">
                    No install
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-1">
                  Turn your live PWA link into a signed APK in 30 seconds using Microsoft's free tool:
                </p>
                <ol className="mt-2 space-y-1 text-xs text-indigo-100 pl-4 list-decimal">
                  <li>Deploy this project (e.g. drag <code className="text-yellow-300">dist/</code> folder to <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-yellow-300 underline font-bold">Netlify Drop</a>)</li>
                  <li>Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-bold">PWABuilder.com</a> and paste your link</li>
                  <li>Click <strong className="text-white">Package for Android</strong> → Download your APK!</li>
                </ol>
                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => play("pop")}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-indigo-950 shadow hover:bg-emerald-400 transition-colors"
                >
                  Open PWABuilder.com <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Method 2: GitHub Actions (Automated) */}
          <div className="rounded-2xl border border-indigo-700 bg-indigo-900/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white font-bold">
                <Cloud className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-yellow-300">Method 2: GitHub Cloud Builder</h3>
                  <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 text-[9px] font-black uppercase text-indigo-200 border border-indigo-500">
                    Included
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-1">
                  We already added <code className="text-yellow-300 font-mono">.github/workflows/build-apk.yml</code> to this project!
                </p>
                <ol className="mt-2 space-y-1 text-xs text-indigo-100 pl-4 list-decimal">
                  <li>Push this repository to your GitHub account</li>
                  <li>Go to your repository's <strong className="text-yellow-300">Actions</strong> tab</li>
                  <li>Click <strong className="text-white">Build Android APK</strong> → Download <code className="text-yellow-300">app-debug.apk</code> artifact!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Method 3: Local Terminal */}
          <div className="rounded-2xl border border-purple-700 bg-purple-900/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">
                <Terminal className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-purple-300">Method 3: Build on your PC</h3>
                <p className="text-xs text-indigo-200 mt-1">
                  If you have Node.js and Java JDK installed on your computer, run these 3 lines in your project folder:
                </p>
                <div className="relative mt-2 overflow-hidden rounded-xl bg-black/60 p-3 font-mono text-xs text-yellow-300 border border-purple-500/30">
                  <pre className="whitespace-pre-wrap">{localCommands}</pre>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-purple-600/80 px-2 py-1 text-[10px] font-bold text-white hover:bg-purple-500 transition-colors"
                  >
                    {copiedCmd ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
                    {copiedCmd ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-indigo-300/80">
                  Your built APK will appear at:<br />
                  <code className="text-white font-mono text-[10px]">android/app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-indigo-800/80 p-4 bg-indigo-950/80 flex justify-end">
          <button
            onClick={() => { play("pop"); onClose(); }}
            className="btn-chunky btn-moon py-2 px-6 text-xs"
          >
            Got it, Hoot! 🦉
          </button>
        </div>
      </div>
    </div>
  );
}
