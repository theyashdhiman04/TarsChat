"use client";

import { TarsLogo } from "@/components/TarsLogo";

export default function ChatIndexPage() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center h-full w-full bg-[#0a0612] relative overflow-hidden text-[#ececec] font-sans">
      
      {/* Ambient grid - match landing */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(106,47,188,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(106,47,188,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)] pointer-events-none" />
      </div>

      <div className="text-center px-6 py-8 max-w-sm z-10 flex flex-col items-center animate-in fade-in duration-500">
        
        <div className="mb-6">
          <TarsLogo iconSize={48} showText={true} />
        </div>

        <p className="text-[10px] font-bold text-[#6A2FBC] uppercase tracking-[0.25em] mb-1">Ready</p>
        <p className="text-[#8e8ea0] text-sm mb-6">Pick a conversation or start a new one.</p>

        <span className="bg-[#1a1228] border border-[#2a1f3d] px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.15em] text-[#5c5c6e]">
          DMs · Groups
        </span>
      </div>
    </div>
  );
}
