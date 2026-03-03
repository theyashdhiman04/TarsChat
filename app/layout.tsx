
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from '@clerk/nextjs'
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TarsChat — Real-Time Messaging",
  description: "Modern real-time chat with DMs, groups, reactions, and typing indicators. Built with Next.js, Convex, and Clerk.",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#6A2FBC",
    colorBackground: "#0f0a18",
    colorInputBackground: "#1a1228",
    colorInputText: "#ececec",
    colorText: "#ececec",
    colorTextSecondary: "#8e8ea0",
    colorForeground: "#ececec",
    colorMutedForeground: "#b8b8c8",
    colorNeutral: "#8e8ea0",
    borderRadius: "0.75rem",
  },
  elements: {
    userButtonPopoverCard: "bg-[#0f0a18] border border-[#2a1f3d]",
    userButtonPopoverActionButton: "text-[#ececec] hover:bg-[#2a1f3d] hover:text-[#A7F0A7]",
    userButtonPopoverActionButtonIcon: "text-[#A7F0A7]",
    userButtonPopoverFooter: "text-[#8e8ea0]",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>

      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ConvexClientProvider>
          
            <main className="min-h-[100dvh] w-full overflow-x-hidden">{children}</main>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}