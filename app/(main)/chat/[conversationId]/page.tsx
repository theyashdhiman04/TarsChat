//lets crate a message/chat box for this conversation ,in here we will same the individuals and also groupsss
//we will send the conversation id ,and depending on it the chat/msg box will render
"use client";

import { use } from "react";
import ChatBox from "@/components/ChatBox";
import { Id } from "@/convex/_generated/dataModel";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);

  // ✅ No h-screen wrapper here — the layout already handles full height.
  // Just fill the parent flex container provided by ChatLayout > SidebarInset > main.
  return (
    <div className="flex-1 h-full min-h-0 flex flex-col overflow-hidden">
      <ChatBox conversationId={conversationId as Id<"conversations">} />
    </div>
  );
}
