"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";
import { Send, Smile, Paperclip, ChevronLeft, MoreVertical, Phone } from "lucide-react";
import  {formatTimestamp}  from "../libs/utils";

const REACTIONS = ["😂", "🫡", "❤️", "💀", "😮", "😢", "😍"];

interface Props {
  conversationId: Id<"conversations">;
}

export default function ChatWindow({ conversationId }: Props) {
  const { user } = useUser();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessages, setShowNewMessages] = useState(false);

  
  // Refs
  const prevMessageCountRef = useRef(0);
  const initialLoadRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Convex Hooks
  const conversation = useQuery(api.users_conversations.getConversation, { conversationId });
  const messages = useQuery(api.messages.listMessages, { conversationId });
  const typingUsers = useQuery(api.messages.getTypingUsers, { conversationId });

  const sendMessage = useMutation(api.messages.sendMessage);

  const setTyping = useMutation(api.messages.setTyping);
  const markAsRead = useMutation(api.messages.markAsRead);

  const currentUser = conversation?.me;

  // --- Logic: Scroll & Message Handling ---
  const scrollToBottom = useCallback((smooth = true) => {
    if (!scrollContainerRef.current || !messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ 
      behavior: smooth ? "smooth" : "auto" 
    });
    setShowNewMessages(false);
  }, []);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 150;
    setIsAtBottom(atBottom);
    if (atBottom) setShowNewMessages(false);
  };

  useEffect(() =>{
    markAsRead({ conversationId }).catch(() => {});


    if (messages) {
      markAsRead({ conversationId }).catch(() => {});
      const count = messages.length;
      const prevCount = prevMessageCountRef.current;

      if (initialLoadRef.current && count > 0) {
        setTimeout(() => scrollToBottom(false), 50);
        initialLoadRef.current = false;
      } else if (count > prevCount) {
        if (isAtBottom) {
          setTimeout(() => scrollToBottom(true), 100);
        } else {
          setTimeout(() => setShowNewMessages(true), 0);
        }
      }
      prevMessageCountRef.current = count;
    }
  }, [messages, conversationId, markAsRead, isAtBottom, scrollToBottom,]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  setTyping({ conversationId, isTyping: false }).catch(() => {});

    setInput("");
    setSendError(null);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      await sendMessage({ conversationId, content });
      setTimeout(() => scrollToBottom(true), 10);
    } catch {
      setSendError("Failed to send.");
      setInput(content);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
    }
    // the settyping mutation get activated when user typess
    setTyping({ conversationId, isTyping: true }).catch(() => {});
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
       setTyping({ conversationId, isTyping: false }).catch(() => {});
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Logic: Header Info ---
  const getHeaderInfo = () => {
    if (!conversation) return { name: "Loading...", subtitle: "", avatar: null, isOnline: false };
    if (conversation.isGroup) {
      return {
        name: conversation.groupName ?? "Group",
        subtitle: `${conversation.participants.length} members`,
        avatar: null,
        isOnline: false,
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const other = (conversation.participants as any[]).find((p) => p?.clerkId !== user?.id);
    return {
      name: other?.name ?? "Unknown",
      subtitle: other?.isOnline ? "Online" : "Offline",
      avatar: other,
      isOnline: other?.isOnline ?? false,
    };
  };

  const { name, subtitle, avatar, isOnline } = getHeaderInfo();

  return (
    // FIX: Main Container uses w-full and flex-col to fill space correctly next to sidebar
    <div className="flex flex-col h-full w-full bg-[#1a1228] text-[#ececec] font-sans relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(106,47,188,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(106,47,188,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)] pointer-events-none" />
      </div>

      {/* --- HEADER (minimal) --- */}
      <div className="flex items-center gap-3 px-3 sm:px-4 md:px-5 h-14 bg-[#1a1228]/80 backdrop-blur-sm border-b border-[#2a1f3d]/60 z-20 shrink-0 relative">
        <button
          onClick={() => router.push("/chat")}
          className="md:hidden p-2 text-[#8e8ea0] hover:text-[#ececec] transition-transform hover:-translate-x-1"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="relative shrink-0 cursor-pointer group">
          <div className="p-0.5 rounded-full border border-[#6A2FBC]/40 group-hover:border-[#A7F0A7]/50 transition-colors">
            {avatar?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                    src={avatar.imageUrl} 
                    alt={name} 
                    className="w-9 h-9 rounded-full object-cover" 
                />
            ) : (
                <div className="w-9 h-9 rounded-full bg-[#6A2FBC] text-white flex items-center justify-center font-bold text-sm shrink-0">
                   {name.charAt(0).toUpperCase()}
                </div>
            )}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#A7F0A7] rounded-full border-2 border-[#1a1228]"></div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
             <h3 className="font-bold text-[#ececec] text-sm truncate tracking-tight group-hover:text-[#A7F0A7] transition-colors">
               {name}
             </h3>
             {conversation?.isGroup && (
                <span className="bg-[#6A2FBC]/15 border border-[#6A2FBC]/40 text-[#A7F0A7] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
                  GROUP
                </span>
             )}
          </div>
          <span className="text-[10px] font-bold text-[#8e8ea0] tracking-wider uppercase truncate">
            {subtitle}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[#8e8ea0]">
            <button className="p-1.5 hover:bg-[#2a1f3d] rounded-lg hover:text-[#A7F0A7] transition-colors">
                <Phone className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-[#2a1f3d] rounded-lg hover:text-[#A7F0A7] transition-colors">
                <MoreVertical className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* --- MESSAGES AREA --- */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 space-y-6 scroll-smooth z-10 relative scrollbar-thin scrollbar-thumb-[#2a1f3d] scrollbar-track-transparent"
      >
        {messages === undefined ? (
          // Skeleton
          <div className="space-y-8 mt-6 px-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse opacity-30">
                <div className="w-9 h-9 bg-[#2a1f3d] rounded-full shrink-0"></div>
                <div className="space-y-2 w-full pt-1">
                   <div className="h-3 bg-[#2a1f3d] rounded w-24"></div>
                   <div className="h-10 bg-[#2a1f3d]/50 rounded-lg w-1/2 border border-[#2a1f3d]"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full pb-20 text-center opacity-0 animate-in fade-in zoom-in-95 duration-700 fill-mode-forwards">
             <div className="w-16 h-16 bg-[#1a1228] rounded-2xl flex items-center justify-center border border-[#2a1f3d] mb-4 transform hover:rotate-3 transition-transform">
                <div className="w-8 h-8 bg-[#6A2FBC] rounded-lg flex items-center justify-center">
                    <span className="text-lg">👋</span>
                </div>
             </div>
             <p className="text-[10px] font-bold text-[#6A2FBC] uppercase tracking-[0.2em] mb-1">Start</p>
             <p className="text-xs text-[#8e8ea0] max-w-[180px]">
                Say hello to <span className="text-[#A7F0A7] font-medium">{name}</span>.
             </p>
          </div>
        ) : (
          <>
            {/* Message List */}
            {messages.filter(Boolean).map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              const showDateDivider =
                !prevMsg ||
                new Date(msg._creationTime).toDateString() !== new Date(prevMsg._creationTime).toDateString();
              
              const messageData = { ...msg, sender: msg.sender ?? undefined };

              return (
                <div key={msg._id} className="group">
                  {showDateDivider && (
                    <div className="relative flex items-center justify-center my-12">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#2a1f3d]"></div>
                      </div>
                      <span className="relative bg-[#1a1228] px-3 py-1 rounded-full border border-[#2a1f3d] text-[9px] font-bold text-[#5c5c6e] uppercase tracking-widest z-10">
                        {formatTimestamp(msg._creationTime)}
                      </span>
                    </div>
                  )}
                  
                  <MessageItem
                    data={messageData}
                    isSender={msg.senderId === currentUser?._id}
                    reactionOptions={REACTIONS}
                    viewerId={currentUser?._id}
                  />
                </div>
              );
            })}
            {/* extra feature typing indicator */}
            {/* Typing Indicator */}
            {typingUsers && typingUsers.length > 0 && (
              <div className="pl-4 py-2 animate-in fade-in slide-in-from-left-2 duration-300">
                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                 <TypingIndicator users={typingUsers as any[]} />
              </div>
            )}
            
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} className="h-px w-full" />
          </>
        )}
      </div>
{/* extra feature when new messsage comes notification to do downnn */}
      {/* --- FLOATING NOTIFICATION --- */}
      {showNewMessages && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
           <button
             onClick={() => scrollToBottom(true)}
             className="flex items-center gap-2 bg-[#1a1228] text-[#A7F0A7] px-3 py-1.5 rounded-lg border border-[#6A2FBC]/40 hover:scale-105 transition-all text-[9px] font-bold uppercase tracking-[0.15em] animate-bounce"
           >
             New Messages ↓
           </button>
        </div>
      )}

      {/* --- INPUT AREA --- */}
     
     {/* --- INPUT AREA --- */}
<div className="shrink-0 z-20 p-3 sm:p-4 pt-1 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[#1a1228] via-[#1a1228] to-transparent">
        <div className="relative bg-[#0f0a18] border border-[#2a1f3d] rounded-xl flex items-end px-3 py-2 transition-all focus-within:border-[#6A2FBC]/60 focus-within:ring-1 focus-within:ring-[#6A2FBC]/20">
          
          <button className="p-1.5 text-[#8e8ea0] hover:text-[#A7F0A7] hover:bg-[#2a1f3d]/50 rounded-lg transition-all mr-1 shrink-0">
             <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${conversation?.isGroup ? 'Group' : name.split(' ')[0]}...`}
            rows={1}
            className="flex-1 bg-transparent text-[#ececec] placeholder-[#6b6b7b] focus:outline-none resize-none max-h-[150px] custom-scrollbar leading-relaxed py-2 font-medium text-sm"
            style={{ minHeight: '24px' }}
          />
          
          <div className="flex items-center gap-1 ml-2 mb-0.5 shrink-0">
             <button className="text-[#8e8ea0] hover:text-[#A7F0A7] transition-colors hidden sm:block p-1.5 hover:bg-[#2a1f3d]/50 rounded-lg">
               <Smile className="w-5 h-5" />
             </button>
             
             <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`
                  p-2 transition-all shrink-0 rounded-lg flex items-center justify-center
                  ${input.trim() 
                  ? 'bg-[#6A2FBC] hover:bg-[#7B3FE8] text-white border border-[#A7F0A7]/20' 
                  : 'bg-[#2a1f3d] text-[#5c5c6e] cursor-not-allowed'}
                `}
                >
                <Send className="w-4 h-4 ml-0.5" />
             </button>
          </div>
          
           {/* Error Overlay */}
            {sendError && (
                <div className="absolute -top-10 right-0 bg-red-500/90 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl font-bold backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                    {sendError}
                </div>
            )}
        </div>
      </div>
    </div>
  );

}

