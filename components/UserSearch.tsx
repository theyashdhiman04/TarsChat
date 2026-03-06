"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Search, X, User, MessageSquare, Ban, Loader2 } from "lucide-react";

interface Props {
  currentUserId?: string;
  onClose: () => void;
  onSelectUser?: (userId: Id<"users">) => void;
}

export default function UserSearch({ onClose }: Props) {
  const [search, setSearch] = useState("");
  const [busyUserId, setBusyUserId] = useState<Id<"users"> | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();
  const getOrCreateDM = useMutation(api.users_conversations.getOrCreateDM);
  const toggleBlockUser = useMutation(api.users.toggleBlockUser);

  const users = useQuery(api.users.listAllUsers, { search: search || undefined });
  const sortedUsers =
    users === undefined
      ? undefined
      : [...users].sort((a, b) => Number(b.canMessage) - Number(a.canMessage));
  const visibleUsers = sortedUsers ?? [];

  const handleSelectUser = async (
    userId: Id<"users">,
    canMessage: boolean,
    isBlockedByMe: boolean,
    hasBlockedMe: boolean
  ) => {
    if (!canMessage) {
      setFeedback(
        hasBlockedMe
          ? "This user has blocked you."
          : isBlockedByMe
            ? "Unblock this user to start chatting."
            : "This user is not available right now."
      );
      return;
    }

    try {
      setFeedback(null);
      const convId = await getOrCreateDM({ otherUserId: userId });
      router.push(`/chat/${convId}`);
      onClose(); 
    } catch (err) {
      console.error(err);
      setFeedback("Unable to open this chat right now.");
    }
  };

  const handleToggleBlock = async (userId: Id<"users">, shouldBlock: boolean) => {
    try {
      setBusyUserId(userId);
      setFeedback(null);
      await toggleBlockUser({ targetUserId: userId, shouldBlock });
      setFeedback(shouldBlock ? "User blocked successfully." : "User unblocked successfully.");
    } catch (err) {
      console.error(err);
      setFeedback("Couldn't update block status.");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#1a1228] h-full text-[#ececec] font-sans relative selection:bg-[#6A2FBC]/20 selection:text-white">
      
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />
      </div>

      <div className="p-4 bg-[#0f0a18] border-b border-[#2a1f3d] shrink-0 z-10">
        <div className="relative group">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username..."
            className="w-full pl-10 pr-10 py-3 bg-[#2a1f3d] text-[#ececec] rounded-xl placeholder:text-[#6b6b7b] border border-[#2a1f3d] focus:border-[#6A2FBC] focus:outline-none transition-all font-bold text-sm"
          />
          
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8e8ea0] group-focus-within:text-[#6A2FBC] transition-colors" />

          {search && (
               <button onClick={() => setSearch("")} className="absolute right-3 top-3 text-[#8e8ea0] hover:text-[#ececec] transition-colors bg-[#2a1f3d] hover:bg-[#343434] rounded-md p-0.5">
                 <X className="w-4 h-4" />
               </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar z-10 scrollbar-thin scrollbar-thumb-[#2a1f3d] scrollbar-track-transparent">
        {feedback && (
          <div className="mx-2 mt-2 rounded-xl border border-[#6A2FBC]/30 bg-[#0f0a18]/90 px-3 py-2 text-[11px] font-bold text-[#A7F0A7]">
            {feedback}
          </div>
        )}

        {users === undefined ? (
          // Glass Skeleton Loading
          <div className="space-y-2 mt-2 px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse bg-[#2a1f3d] border border-[#2a1f3d]">
                <div className="w-10 h-10 bg-[#2a1f3d] rounded-lg shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#2a1f3d] rounded w-1/3"></div>
                  <div className="h-2 bg-[#2a1f3d] rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : visibleUsers.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center pt-16 text-center opacity-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#2a1f3d] rounded-2xl flex items-center justify-center mb-4 border border-[#2a1f3d] transform rotate-3">
              <User className="w-8 h-8 text-[#8e8ea0]" />
            </div>
            <p className="text-[#ececec] font-bold text-sm tracking-widest uppercase">No users found</p>
            <p className="text-[#5c5c6e] text-[11px] font-medium mt-1 max-w-[150px]">
              {search ? `We couldn't find "${search}"` : "Try searching for a friend to chat with."}
            </p>
          </div>
        ) : (
          <div className="space-y-1 mt-2">
            <div className="px-3 py-2 text-[10px] font-bold text-[#8e8ea0] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#6A2FBC]"></span>
                {search ? "Search Results" : "All Users"}
            </div>

            <div className="px-3 pb-2 text-[10px] font-medium text-[#5c5c6e]">
              Blocked users stay visible here so you can unblock them later.
            </div>
            
            {visibleUsers.map((u) => (
              <div
                key={u._id}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#2a1f3d] rounded-xl transition-all text-left group border border-transparent hover:border-[#6A2FBC]/40 relative overflow-hidden"
              >
                <button
                  onClick={() =>
                    handleSelectUser(
                      u._id,
                      u.canMessage,
                      u.isBlockedByMe,
                      u.hasBlockedMe
                    )
                  }
                  disabled={!u.canMessage}
                  className={`flex flex-1 items-center gap-3 text-left transition-all ${
                    u.canMessage ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                  }`}
                >
                  <div className="relative shrink-0">
                    {u.imageUrl ? (
                      <Image
                        src={u.imageUrl}
                        alt={u.name}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover bg-[#2a1f3d] group-hover:ring-2 ring-[#6A2FBC]/40 transition-all"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#6A2FBC] flex items-center justify-center font-black text-sm text-white">
                        {u.name[0]?.toUpperCase()}
                      </div>
                    )}

                    {u.hasUnread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1a1228]" />
                    )}

                    {u.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#6A2FBC] rounded-full border-[3px] border-[#1a1228]"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-gray-200 text-sm truncate group-hover:text-[#A7F0A7] transition-colors">
                        {u.name}
                      </span>
                      {u.isOnline && !u.isBlockedByMe && !u.hasBlockedMe && (
                        <span className="text-[9px] text-[#6A2FBC] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                          Online
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8e8ea0] truncate font-medium group-hover:text-[#ececec] transition-colors">
                      @{u.email?.split("@")[0] || "user"}
                    </p>
                    {(u.isBlockedByMe || u.hasBlockedMe) && (
                      <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${
                        u.hasBlockedMe ? "text-red-400" : "text-[#A7F0A7]"
                      }`}>
                        {u.hasBlockedMe ? "Has blocked you" : "Blocked by you"}
                      </p>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      handleSelectUser(
                        u._id,
                        u.canMessage,
                        u.isBlockedByMe,
                        u.hasBlockedMe
                      )
                    }
                    disabled={!u.canMessage}
                    className={`p-2 rounded-lg border transition-all ${
                      u.canMessage
                        ? "border-[#2a1f3d] text-[#A7F0A7] hover:bg-[#0f0a18] hover:border-[#6A2FBC]/40"
                        : "border-[#2a1f3d] text-[#5c5c6e] cursor-not-allowed"
                    }`}
                    title={u.canMessage ? "Message user" : "Messaging unavailable"}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleBlock(u._id, !u.isBlockedByMe)}
                    disabled={busyUserId === u._id}
                    className={`min-w-[92px] px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                      u.isBlockedByMe
                        ? "border-[#A7F0A7]/30 text-[#A7F0A7] hover:bg-[#A7F0A7]/10"
                        : "border-[#2a1f3d] text-[#ececec] hover:border-red-400/40 hover:text-red-300 hover:bg-red-500/10"
                    } ${busyUserId === u._id ? "cursor-wait opacity-80" : ""}`}
                    title={u.isBlockedByMe ? "Unblock user" : "Block user"}
                  >
                    {busyUserId === u._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Ban className="w-3.5 h-3.5" />
                    )}
                    {u.isBlockedByMe ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}