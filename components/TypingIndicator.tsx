"use client";

import Image from "next/image";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users: Array<{ _id: string; name: string; imageUrl?: string }>;
}

export default function TypingIndicator({ users }: Props) {
  if (users.length === 0) return null;

  const names =
    users.length === 1
      ? users[0].name.split(" ")[0]
      : users.length === 2
      ? `${users[0].name.split(" ")[0]} and ${users[1].name.split(" ")[0]}`
      : `${users[0].name.split(" ")[0]} and ${users.length - 1} others`;
    

  return (
    <div className="flex items-center gap-3 mb-4 px-2 animate-fade-in-up">
      {/* Avatar Section */}
      <div className="relative w-8 h-8 shrink-0">
        {users[0]?.imageUrl ? (
          <Image
            src={users[0].imageUrl}
            alt={users[0].name}
            fill
            className="rounded-full object-cover bg-[#2a1f3d]"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-[#6A2FBC] text-white flex items-center justify-center text-xs font-black">
            {users[0]?.name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Typing Bubble & Text */}
      <div className="flex flex-col">
        <div className="bg-[#2a1f3d] rounded-2xl rounded-tl-none px-4 py-3 self-start w-fit border border-[#2a1f3d] relative">
          <div className="flex gap-1 items-center h-2">
            <span className="w-2 h-2 rounded-full bg-[#A7F0A7] animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 rounded-full bg-[#A7F0A7] animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 rounded-full bg-[#A7F0A7] animate-bounce"></span>
          </div>
        </div>
        
        <span className="text-[10px] uppercase font-bold text-[#8e8ea0] mt-1.5 ml-1 tracking-widest">
          {names} {users.length === 1 ? "is" : "are"} typing...
        </span>
      </div>
    </div>
  );
}