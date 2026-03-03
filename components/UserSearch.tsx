"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Search, X, User, MessageSquare } from "lucide-react";

interface Props {
  currentUserId?: string;
  onClose: () => void;
  onSelectUser?: (userId: Id<"users">) => void;
}

export default function UserSearch({ onClose }: Props) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const getOrCreateDM = useMutation(api.users_conversations.getOrCreateDM);

  const users = useQuery(api.users.listAllUsers, { search: search || undefined });
  //here now i have the hasread prop and will use it to get the notification 

  const handleSelectUser = async (userId: Id<"users">) => {
    try {
      const convId = await getOrCreateDM({ otherUserId: userId });
      router.push(`/chat/${convId}`);
      onClose(); 
    } catch (err) {
      console.error(err);
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
        ) : users.length === 0 ? (
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
            {/* Header for results */}
            <div className="px-3 py-2 text-[10px] font-bold text-[#8e8ea0] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#6A2FBC]"></span>
                {search ? "Search Results" : "All Users"}
            </div>
            
            {users.map((u) => (
              <button
                key={u._id}
                onClick={() => handleSelectUser(u._id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#2a1f3d] rounded-xl transition-all text-left group border border-transparent hover:border-[#6A2FBC]/40 relative overflow-hidden"
              >
                
                {/* Avatar */}
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

                  {/* 🔴 Unread Notification (Top Right) */}
                  {u.hasUnread && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1a1228]" />
                  )}

                  {/* Status Dot */}
                  {u.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#6A2FBC] rounded-full border-[3px] border-[#1a1228]"></div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-200 text-sm truncate group-hover:text-[#A7F0A7] transition-colors">
                        {u.name}
                    </span>
                    {u.isOnline && (
                        <span className="text-[9px] text-[#6A2FBC] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                            Online
                        </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8e8ea0] truncate font-medium group-hover:text-[#ececec] transition-colors">
                    @{u.email?.split('@')[0] || "user"}
                  </p>
                </div>

                {/* Hover Arrow Icon */}
                <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <MessageSquare className="w-4 h-4 text-[#A7F0A7]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}