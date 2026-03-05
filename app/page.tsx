"use client";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import { TarsLogo } from "@/components/TarsLogo";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const enterCtaClass =
    "tars-enter-btn w-full max-w-[20rem] py-3.5 rounded-2xl text-white text-sm font-bold uppercase tracking-[0.18em] inline-flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A7F0A7]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0612]";

  const onVideoTimeUpdate = useCallback((e: SyntheticEvent<HTMLVideoElement>) => {
    // Some browsers briefly flash black when a WebM loops.
    // Jump looping slightly before the end avoids hitting that boundary.
    const v = e.currentTarget;
    if (!Number.isFinite(v.duration) || v.duration <= 0) return;
    if (v.currentTime >= v.duration - 0.12) {
      v.currentTime = 0;
      void v.play().catch(() => { });
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditable =
        tag === "input" ||
        tag === "textarea" ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (isEditable) return;

      e.preventDefault();
      if (isSignedIn) {
        router.push("/chat");
        return;
      }
      clerk.openSignIn({
        afterSignInUrl: "/chat",
        afterSignUpUrl: "/chat",
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clerk, isSignedIn, router]);

  return (
    <div className="w-full min-h-[100dvh] bg-[#0a0612] text-[#ececec] font-sans selection:bg-[#6A2FBC]/30 selection:text-white overflow-x-hidden overflow-y-auto relative">

      {/* Ambient glow - behind video */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-1/2 -left-1/4 w-[60rem] h-[60rem] bg-[#6A2FBC]/12 rounded-full filter blur-[150px] opacity-50" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[50rem] h-[50rem] bg-[#A7F0A7]/08 rounded-full filter blur-[120px] opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(106,47,188,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(106,47,188,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
      </div>

      {/* Top navbar: responsive */}
      <header className="absolute top-0 left-0 right-0 z-50 grid grid-cols-2 sm:grid-cols-3 items-center px-4 sm:px-5 md:px-8 h-16 border-b border-[#2a1f3d]/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="opacity-90">
            <TarsLogo iconSize={28} showText={false} />
          </span>
          <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.2em] text-[#5c5c6e] truncate">
            TarsChat
          </span>
        </div>
        <div className="hidden sm:flex items-center justify-center gap-4 md:gap-6 whitespace-nowrap">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5c5c6e]">Next.js</span>
          <span className="text-[#2a1f3d]">·</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5c5c6e]">Convex</span>
          <span className="text-[#2a1f3d]">·</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5c5c6e]">Clerk</span>
          <span className="text-[#2a1f3d]">·</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5c5c6e]">Tailwind</span>
        </div>
        <div className="flex items-center justify-end gap-3">
          <SignedIn>
            <div className="rounded-full border border-[#6A2FBC]/40 p-0.5 tars-avatar-wrapper">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-7 h-7" }, variables: { colorPrimary: "#6A2FBC" } }} />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8ea0] hover:text-[#A7F0A7] transition-colors px-3 py-1.5 rounded-lg border border-[#2a1f3d] hover:border-[#6A2FBC]/40">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-[#8e8ea0] p-2">
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            )}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-[#0f0a18] border-b border-[#2a1f3d] p-4 z-40">
          <span className="text-[#ececec] text-sm font-medium">TARS</span>
        </div>
      )}

      {/* Full-screen video background - fills viewport, visible behind content */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        <video
          src="/laser.webm"
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onTimeUpdate={onVideoTimeUpdate}
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-[#0a0612]/25" aria-hidden />
      </div>

      {/* Center panel - in flow so small screens can scroll */}
      <div className="relative z-20 flex min-h-[100dvh] items-center justify-center pt-20 pb-10 pointer-events-none">
        <div className="pointer-events-auto w-full px-4 md:px-8 flex justify-center">
          <div className="w-full max-w-5xl animate-in fade-in duration-700">
            <div className="relative rounded-[34px] p-[1px] bg-[linear-gradient(135deg,rgba(167,240,167,0.22)_0%,rgba(255,255,255,0.10)_18%,rgba(106,47,188,0.55)_55%,rgba(167,240,167,0.12)_100%)] shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
              <div className="relative overflow-hidden rounded-[33px] border border-white/10 bg-[radial-gradient(900px_520px_at_15%_0%,rgba(167,240,167,0.10),transparent_55%),radial-gradient(900px_520px_at_85%_15%,rgba(106,47,188,0.20),transparent_55%),linear-gradient(135deg,rgba(10,6,18,0.70),rgba(10,6,18,0.35))] backdrop-blur-2xl">
                {/* subtle scanlines */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(180deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 3px, transparent 7px)",
                  }}
                  aria-hidden
                />

                {/* top edge glow */}
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A7F0A7]/45 to-transparent" aria-hidden />

                <div className="relative grid gap-8 md:grid-cols-[1.35fr_1fr] p-6 md:p-10">
                  {/* left */}
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between gap-4">
                      <TarsLogo iconSize={44} showText={true} />
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8e8ea0]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#A7F0A7] shadow-[0_0_18px_rgba(167,240,167,0.55)]" />
                          Realtime
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.05]">
                        TarsChat.
                      </h1>
                      <p className="text-sm md:text-base text-[#b8b8c8] leading-relaxed max-w-xl">
                        DMs, groups, and live rooms with typing indicators, search, and crisp delivery—powered by Convex and secured with Clerk.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                      <SignedIn>
                        <Link href="/chat" className={`${enterCtaClass} sm:w-auto sm:max-w-none sm:px-7`}>
                          <span className="relative z-10 inline-flex items-center justify-center gap-2">
                            Enter chat
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </span>
                        </Link>
                      </SignedIn>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <button className={`${enterCtaClass} sm:w-auto sm:max-w-none sm:px-7`}>
                            <span className="relative z-10 inline-flex items-center justify-center gap-2">
                              Enter chat
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                              </svg>
                            </span>
                          </button>
                        </SignInButton>
                      </SignedOut>

                      <SignedOut>
                        <Link
                          href="/sign-up"
                          className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/90 hover:bg-white/8 hover:border-white/18 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6A2FBC]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0612]"
                        >
                          Create account
                        </Link>
                      </SignedOut>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#8e8ea0]">DMs</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#8e8ea0]">Groups</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#8e8ea0]">Typing</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#8e8ea0]">Search</span>
                    </div>

                    <div className="text-xs text-[#6f6f86]">
                      Tip: press{" "}
                      <kbd className="rounded-md border border-white/12 bg-black/30 px-2 py-0.5 font-mono text-[11px] text-white/80">
                        Enter
                      </kbd>{" "}
                      to jump in.
                    </div>
                  </div>

                  {/* right */}
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5 md:p-6">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8e8ea0]">Quick start</div>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl border border-[#6A2FBC]/35 bg-[#6A2FBC]/15 p-2 text-[#A7F0A7]">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 104.02 12.17l3.53 3.53a.75.75 0 101.06-1.06l-3.53-3.53A6.75 6.75 0 0010.5 3.75zm-5.25 6.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Search users</p>
                          <p className="text-xs text-[#8e8ea0] leading-relaxed">Find someone and start a DM in seconds.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl border border-[#A7F0A7]/30 bg-[#A7F0A7]/10 p-2 text-[#A7F0A7]">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M7.5 6A3.75 3.75 0 1111.25 9.75 3.754 3.754 0 017.5 6zM2.25 19.5a6.75 6.75 0 0113.5 0 .75.75 0 01-.75.75H3a.75.75 0 01-.75-.75zM17.25 9.75a.75.75 0 01.75-.75H21a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM18 12a.75.75 0 01.75-.75H21a.75.75 0 010 1.5h-2.25A.75.75 0 0118 12z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Make a group</p>
                          <p className="text-xs text-[#8e8ea0] leading-relaxed">Create a space, invite people, and keep it moving.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl border border-white/10 bg-white/5 p-2 text-white/90">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M7.5 8.25a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM7.5 12a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 017.5 12z" />
                            <path fillRule="evenodd" d="M2.25 6A2.25 2.25 0 014.5 3.75h15A2.25 2.25 0 0121.75 6v9A2.25 2.25 0 0119.5 17.25H9.81l-3.28 2.46A.75.75 0 015.25 19.1v-1.85H4.5A2.25 2.25 0 012.25 15V6zM4.5 5.25a.75.75 0 00-.75.75v9c0 .414.336.75.75.75H6a.75.75 0 01.75.75v1.1l2.34-1.755a.75.75 0 01.45-.15h10.96a.75.75 0 00.75-.75V6a.75.75 0 00-.75-.75h-15z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Stay in flow</p>
                          <p className="text-xs text-[#8e8ea0] leading-relaxed">Typing, presence, and realtime updates by default.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-[#6A2FBC]/25 bg-[#6A2FBC]/10 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">Built on</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-[#b8b8c8]">Next.js</span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-[#b8b8c8]">Convex</span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-[#b8b8c8]">Clerk</span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-[#b8b8c8]">Tailwind</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* bottom glow */}
                <div className="pointer-events-none absolute -bottom-24 left-1/2 h-56 w-[44rem] -translate-x-1/2 rounded-full bg-[#6A2FBC]/18 blur-[70px]" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 pb-6 pt-2 text-center">
        <p className="text-[11px] text-[#5c5c6e] tracking-wide">
          Built by{" "}
          <a
            href="https://github.com/theyashdhiman04/TarsChat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8e8ea0] hover:text-[#A7F0A7] transition-colors font-medium"
          >
            TarsChat
          </a>
        </p>
      </footer>
    </div>
  );
}
