"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"; 
import UserSearch from "./UserSearch";
import CreateGroup from "./CreateGroup";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen, MessageSquare, Users, Plus } from "lucide-react";
import { TarsLogo } from "./TarsLogo";

export default function AppSidebar() {
  const { user } = useUser();
  const router = useRouter();
  const { toggleSidebar, open, isMobile } = useSidebar(); // ✅ Get isMobile

  const [showSearch, setShowSearch] = useState(false);
  const [showGroup, setShowGroup] = useState(false);

  const resetViews = () => {
    setShowSearch(false);
    setShowGroup(false);
  };

  // --- Common Content (Used for both Mobile Div and Desktop Sidebar) ---
  const SidebarInnerContent = (
    <>
      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(106,47,188,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(106,47,188,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)] pointer-events-none" />
      </div>

      {/* --- HEADER (minimal) --- */}
      <SidebarHeader className="px-3 py-3 bg-[#0f0a18] border-b border-[#2a1f3d]/60 z-20 h-14 justify-center">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2 cursor-pointer min-w-0">
            <TarsLogo iconSize={28} showText={open || isMobile} />
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <div className="rounded-full border border-[#6A2FBC]/40 p-0.5 tars-avatar-wrapper">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-6 h-6" }, variables: { colorPrimary: "#6A2FBC" } }} />
            </div>
            {open && !isMobile && (
              <button onClick={toggleSidebar} className="text-[#8e8ea0] hover:text-[#A7F0A7] transition-colors p-1.5">
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {!open && !isMobile && (
          <button onClick={toggleSidebar} className="text-[#8e8ea0] hover:text-[#A7F0A7] transition-colors mx-auto mt-2 p-1">
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
      </SidebarHeader>

      {/* --- CONTENT --- */}
      <SidebarContent className="p-4 z-10 overflow-hidden scrollbar-thin scrollbar-thumb-[#2a1f3d] scrollbar-track-transparent">
        {!showSearch && !showGroup && (
          <div className="space-y-3 mb-6">
            <MenuButton label="Direct Messages" icon={<MessageSquare className="w-4 h-4" />} onClick={() => { if (!open && !isMobile) toggleSidebar(); setShowSearch(true); setShowGroup(false); }} isOpen={open || isMobile} />
            <MenuButton label="Groups" icon={<Users className="w-4 h-4" />} onClick={() => { if (!open && !isMobile) toggleSidebar(); setShowGroup(true); setShowSearch(false); }} isOpen={open || isMobile} />
          </div>
        )}

        {(open || isMobile) ? (
            <div className="flex-1 relative h-full">
            {showSearch ? (
                <GlassCard title="Find User" onBack={resetViews}>
                    <UserSearch currentUserId={user?.id} onClose={resetViews} onSelectUser={async (userId: string) => { resetViews(); router.push(`/chat/new?userId=${userId}`); }} />
                </GlassCard>
            ) : showGroup ? (
                <GlassCard title="Create Group" onBack={resetViews}>
                    <CreateGroup currentUserId={user?.id} onClose={resetViews} />
                </GlassCard>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in duration-500">
                    <div className="w-14 h-14 bg-[#1a1228] border border-[#2a1f3d] rounded-xl flex items-center justify-center transform hover:rotate-3 transition-transform">
                         <div className="w-7 h-7 bg-[#6A2FBC] rounded-lg flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                         </div>
                    </div>
                    <div className="px-4">
                        <p className="text-[10px] font-bold text-[#6A2FBC] mb-1 uppercase tracking-[0.2em]">Start</p>
                        <p className="text-[11px] text-[#8e8ea0] max-w-[12rem] mx-auto">Select DMs or Groups above.</p>
                    </div>
                </div>
            )}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
                 <div className="w-1 h-12 bg-gradient-to-b from-transparent via-[#6A2FBC]/50 to-transparent rounded-full"></div>
            </div>
        )}
      </SidebarContent>

      {/* --- FOOTER (minimal) --- */}
      <SidebarFooter className="bg-[#0f0a18] px-3 py-2.5 border-t border-[#2a1f3d]/40 z-20">
        <div className={`flex items-center ${(open || isMobile) ? "justify-between" : "justify-center"} text-[9px] font-bold uppercase tracking-[0.2em] text-[#5c5c6e]`}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A7F0A7] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#A7F0A7]"></span>
          </span>
          {(open || isMobile) && <span>V 1.0</span>}
        </div>
      </SidebarFooter>
      
      {!isMobile && <SidebarRail className="hover:bg-[#6A2FBC]/30 hover:w-[4px] transition-all duration-300" />}
    </>
  );

  // ✅ LOGIC: If Mobile, render a plain DIV (bypassing Sheet logic). If Desktop, render Sidebar component.
  if (isMobile) {
    return (
      <div 
        className="flex flex-col h-full w-full bg-[#0f0a18] text-[#ececec] font-sans border-r border-[#2a1f3d] relative"
      >
        {SidebarInnerContent}
      </div>
    );
  }

  return (
    <Sidebar
      collapsible="icon"
      className="h-full border-none text-[#ececec] font-sans !bg-[#0f0a18]"
      style={{
        "--sidebar": "#0f0a18",
        "--sidebar-foreground": "#ececec",
        "--sidebar-border": "#2a1f3d",
        "--sidebar-accent": "#2a1f3d",
        "--sidebar-accent-foreground": "#ececec",
        backgroundColor: "#0f0a18",
      } as React.CSSProperties}
    >
      {SidebarInnerContent}
    </Sidebar>
  );
}

// --- SUB-COMPONENTS (Keep these unchanged) ---
function MenuButton({ label, icon, onClick, isOpen }: { label: string; icon: React.ReactNode; onClick: () => void; isOpen: boolean }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-300 group ${isOpen ? "justify-start bg-[#1a1228] hover:bg-[#6A2FBC]/10 border border-[#2a1f3d]" : "justify-center hover:bg-[#1a1228]"}`}>
            <div className={`${isOpen ? "text-[#6A2FBC]" : "text-[#8e8ea0]"} group-hover:text-[#6A2FBC] transition-colors`}>{icon}</div>
            {isOpen && (
                <>
                    <span className="text-xs font-bold text-[#ececec] uppercase tracking-widest group-hover:text-[#ececec] transition-colors">{label}</span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                        <svg className="w-4 h-4 text-[#6A2FBC]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </>
            )}
        </button>
    );
}

function GlassCard({ children, title, onBack }: { children: React.ReactNode; title: string; onBack: () => void }) {
    return (
        <div className="bg-[#1a1228] rounded-2xl p-1 h-full flex flex-col border border-[#2a1f3d] overflow-hidden animate-in slide-in-from-left-4 duration-300">
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#2a1f3d] shrink-0 bg-[#0f0a18]">
                <h3 className="text-[10px] font-bold text-[#6A2FBC] uppercase tracking-widest flex items-center gap-2"><span className="w-1 h-3 bg-[#6A2FBC] rounded-full"></span>{title}</h3>
                <button onClick={onBack} className="text-[#8e8ea0] hover:text-[#ececec] hover:bg-[#2a1f3d] rounded-lg p-1.5 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="flex-1 overflow-hidden relative p-1">{children}</div>
        </div>
    );
}