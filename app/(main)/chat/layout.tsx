"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/SideBar";
import { usePathname } from "next/navigation";
import { useSyncUser } from "@/hooks/useSyncUser";
import { usePresence } from "@/hooks/usePresence";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useSyncUser();
  usePresence();

  // "Mobile Conversation Mode": URL is /chat/some-id
  // If false, we are in "Index Mode": URL is /chat
  const isMobileConversation = pathname.startsWith("/chat/") && pathname !== "/chat";

  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "24rem",
          "--sidebar-width-icon": "4.5rem",
        } as React.CSSProperties
      }
      className="flex h-[100dvh] w-full overflow-hidden bg-[#0a0612]"
    >
      {/* 
         SIDEBAR CONTAINER
         - Mobile Index: VISIBLE & W-FULL
         - Mobile Chat: HIDDEN
         - Desktop: VISIBLE
      */}
      <div className={`
          ${isMobileConversation ? "hidden md:block" : "w-full md:w-auto"}
          h-full md:flex-shrink-0
      `}>
        <AppSidebar />
      </div>

      {/* 
         MAIN CONTENT (Chat Window)
         - Mobile Index: HIDDEN
         - Mobile Chat: VISIBLE & FLEX-1
         - Desktop: VISIBLE & FLEX-1
      */}
      <SidebarInset className={`
        flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-[#0a0612]
        ${!isMobileConversation ? "hidden md:flex" : "flex"}
      `}>
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}