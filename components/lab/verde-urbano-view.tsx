"use client";

// Verde Urbano — responsive shell around the interactive app.
//
// Two presentations, chosen purely by CSS media queries in verde-urbano.css:
//   • FRAMED  — wide/tall screens show the app inside a stylised phone bezel on
//     a soft gradient backdrop (the showcase look).
//   • NATIVE  — narrow screens or an installed standalone PWA drop the bezel and
//     fake chrome; the app fills the viewport edge-to-edge and respects the
//     device safe-areas, so an installed instance feels like a real native app.
//
// It also wires the PWA install affordances: it captures `beforeinstallprompt`
// (Android / desktop Chrome) to offer an in-app Install button, and shows an
// "add to Home screen" hint on iOS-style touch browsers.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { VerdeUrbanoApp, type Locale } from "./verde-urbano-app";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const CH = {
  it: { back: "Fosforonero", title: "Verde Urbano · demo", lang: "EN", install: "Installa", hint: "Aggiungi alla schermata Home per usarla come app.", dismiss: "Chiudi" },
  en: { back: "Fosforonero", title: "Verde Urbano · demo", lang: "IT", install: "Install", hint: "Add it to your Home screen to use it as an app.", dismiss: "Dismiss" },
} as const;

// Browser-environment flag read through useSyncExternalStore: SSR-safe (server
// snapshot is always false) and avoids setState-in-effect cascading renders.
function useMediaFlag(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function VerdeUrbanoView({ locale }: { locale: Locale }) {
  const isIT = locale === "it";
  const t = CH[locale];
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const coarse = useMediaFlag("(pointer: coarse)");
  const standalone = useMediaFlag("(display-mode: standalone)");
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hintClosed, setHintClosed] = useState(false);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvt(null);
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const homeUrl = isIT ? "/" : "/en";
  const otherUrl = isIT ? "/en/lab/verde-urbano" : "/lab/verde-urbano";

  const doInstall = async () => {
    if (!installEvt) return;
    try {
      await installEvt.prompt();
      await installEvt.userChoice;
    } catch {
      /* ignore */
    }
    setInstallEvt(null);
  };

  const showHint = coarse && !standalone && !installEvt && !hintClosed;

  // Auto-dismiss the install hint so it never lingers over the app chrome.
  useEffect(() => {
    if (!showHint) return;
    const id = window.setTimeout(() => setHintClosed(true), 10000);
    return () => window.clearTimeout(id);
  }, [showHint]);

  return (
    <div className="vu-stage">
      <div className="vu-bg" aria-hidden>
        <span className="b1" />
        <span className="b2" />
      </div>

      <div className="vu-chrome" role="navigation" aria-label="Verde Urbano">
        <Link href={homeUrl} className="vu-chrome-link" aria-label={t.back}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.back}
        </Link>
        <span className="vu-chrome-title">{t.title}</span>
        {installEvt ? (
          <button type="button" className="vu-chrome-link vu-chrome-lang" onClick={doInstall}>
            {t.install}
          </button>
        ) : (
          <Link href={otherUrl} className="vu-chrome-link vu-chrome-lang">
            {t.lang}
          </Link>
        )}
      </div>

      <div className="vu-device">
        <div className="vu-screen">
          <div className="vu-statusbar" aria-hidden>
            <span className="vu-time">9:41</span>
            <span className="vu-icons">
              <svg width={18} height={12} viewBox="0 0 18 12" fill="none">
                <rect x="0" y="7" width="3" height="5" rx="1" fill="currentColor" />
                <rect x="5" y="4.5" width="3" height="7.5" rx="1" fill="currentColor" />
                <rect x="10" y="2" width="3" height="10" rx="1" fill="currentColor" />
                <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" opacity=".35" />
              </svg>
              <svg width={17} height={12} viewBox="0 0 17 12" fill="none">
                <path d="M8.5 3.2c2.1 0 4 .8 5.4 2.1l1.6-1.7C13.7 1.9 11.2 1 8.5 1S3.3 1.9 1.5 3.6l1.6 1.7C4.5 4 6.4 3.2 8.5 3.2Z" fill="currentColor" />
                <path d="M8.5 6.6c1.1 0 2.1.4 2.9 1.1l1.6-1.7C11.8 4.9 10.2 4.3 8.5 4.3 6.8 4.3 5.2 4.9 4 6l1.6 1.7c.8-.7 1.8-1.1 2.9-1.1Z" fill="currentColor" />
                <circle cx="8.5" cy="10" r="1.6" fill="currentColor" />
              </svg>
              <svg width={26} height={13} viewBox="0 0 26 13" fill="none">
                <rect x="1" y="1" width="21" height="11" rx="3" stroke="currentColor" strokeWidth="1.2" opacity=".5" />
                <rect x="3" y="3" width="16" height="7" rx="1.5" fill="currentColor" />
                <rect x="23.4" y="4.5" width="2" height="4" rx="1" fill="currentColor" opacity=".5" />
              </svg>
            </span>
          </div>
          <div className="vu-notch" aria-hidden />

          <VerdeUrbanoApp locale={locale} scrollRef={scrollRef} />

          <div className="vu-homeindicator" aria-hidden />
        </div>
      </div>

      {showHint && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            // Sit clear of the bottom tab bar (~66px + safe area) so it never
            // overlaps or blocks the nav on the screens that show it.
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 92px)",
            transform: "translateX(-50%)",
            zIndex: 95,
            // Click-through: only the dismiss button is interactive, so the
            // toast can never intercept taps meant for the app underneath.
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            maxWidth: "calc(100% - 28px)",
            padding: "10px 12px 10px 16px",
            borderRadius: 30,
            background: "rgba(22,50,31,.94)",
            color: "#fff",
            fontFamily: "var(--vu-font-text, system-ui, sans-serif)",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 12px 30px rgba(20,51,30,.3)",
            animation: "vu-toastIn .35s ease both",
          }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 16V4M12 4 8 8M12 4l4 4" stroke="#34B85A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="#7FD79A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ lineHeight: 1.3 }}>{t.hint}</span>
          <button
            type="button"
            onClick={() => setHintClosed(true)}
            aria-label={t.dismiss}
            style={{ flex: "none", width: 26, height: 26, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.14)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", pointerEvents: "auto" }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
