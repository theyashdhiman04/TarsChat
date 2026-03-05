"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { formatMessageTime } from "../libs/utils";
import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";

interface MessageBubbleProps {
  data: Doc<"messages"> & {
    sender?: {
      name?: string;
      imageUrl?: string;
    };
    imageUrl?: string | null;
  };
  isSender: boolean;
  reactionOptions: string[];
  viewerId?: Id<"users">;
  highlightQuery?: string;
}

export default function MessageBubble({
  data,
  isSender,
  reactionOptions,
  viewerId,
  highlightQuery,
}: MessageBubbleProps) {
  const reactToMessage = useMutation(api.messages.toggleReaction);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const highlightedContent = useMemo(() => {
    const text = data.content ?? "";
    const q = (highlightQuery ?? "").trim();
    if (!q) return text;
    const lower = text.toLowerCase();
    const qLower = q.toLowerCase();
    const parts: Array<string | { match: string }> = [];
    let i = 0;
    while (i < text.length) {
      const idx = lower.indexOf(qLower, i);
      if (idx === -1) {
        parts.push(text.slice(i));
        break;
      }
      if (idx > i) parts.push(text.slice(i, idx));
      parts.push({ match: text.slice(idx, idx + q.length) });
      i = idx + q.length;
    }
    return parts;
  }, [data.content, highlightQuery]);

  const handleCopy = async () => {
    if (data.isDeleted) return;
    const toCopy = data.content?.trim()
      ? data.content
      : data.imageUrl ?? "";
    if (!toCopy) return;
    await navigator.clipboard.writeText(toCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReact = async (emoji: string) => {
    await reactToMessage({ messageId: data._id, emoji });
  };

const handleDelete = async () => {
  if (isDeleting) return;

  const confirmed = window.confirm("Delete this message?");
  if (!confirmed) return;

  try {
    setIsDeleting(true);
    await deleteMessage({ messageId: data._id });
    
  } catch {
   
  } finally {
    setIsDeleting(false);
  }
};

  const activeReactions =
    data.reactions?.filter((r) => r.userIds.length > 0) ?? [];

  return (
    <div
      className={`flex items-end gap-3 mb-4 relative group/message ${
        isSender ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar (Only for Receiver) */}
      {!isSender && (
        <div className="shrink-0 mb-1">
          {data.sender?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.sender.imageUrl}
              alt={data.sender.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-[#2a1f3d]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#6A2FBC] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {data.sender?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>
      )}

      {/* Message Content Wrapper */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${
          isSender ? "items-end" : "items-start"
        }`}
      >
        {/* Sender Name (Only for Receiver) */}
        {!isSender && data.sender?.name && (
          <span className="text-[10px] font-bold text-[#8e8ea0] mb-1 ml-3 uppercase tracking-wider">
            {data.sender.name}
          </span>
        )}

        {/* BUBBLE CONTAINER */}
        <div className="relative group/bubble">
          
          {data.isDeleted ? (
             // --- DELETED STATE ---
            <div
              className={`px-4 py-2.5 rounded-2xl border border-[#2a1f3d] ${
                isSender ? "rounded-br-sm bg-[#2a1f3d]" : "rounded-bl-sm bg-[#1a1228]"
              }`}
            >
              <p className="text-sm text-[#5c5c6e] italic flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                This message was deleted
              </p>
            </div>
          ) : (
             // --- ACTIVE MESSAGE STATE ---
            <div
              className={`px-5 py-3 rounded-2xl transition-all duration-200 ${
                isSender
                  ? "bg-[#6A2FBC]/30 text-[#ececec] rounded-br-sm border border-[#6A2FBC]/40" // User bubble
                  : "bg-transparent text-[#ececec] border border-[#2a1f3d] rounded-bl-sm" // Receiver
              }`}
            >
              {data.imageUrl && (
                <a
                  href={data.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                  title="Open image"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.imageUrl}
                    alt={data.sender?.name ? `${data.sender.name} image` : "Chat image"}
                    className="max-h-[320px] w-auto max-w-full rounded-xl border border-white/10 object-contain bg-black/20"
                    loading="lazy"
                  />
                </a>
              )}

              {Boolean((data.content ?? "").trim()) && (
                <p className={`text-[15px] leading-relaxed whitespace-pre-wrap break-words font-medium ${data.imageUrl ? "mt-2" : ""}`}>
                  {typeof highlightedContent === "string"
                    ? highlightedContent
                    : highlightedContent.map((p, idx) =>
                        typeof p === "string" ? (
                          <span key={idx}>{p}</span>
                        ) : (
                          <span
                            key={idx}
                            className="rounded-sm bg-[#A7F0A7]/18 px-0.5 text-[#ececec] ring-1 ring-[#A7F0A7]/25"
                          >
                            {p.match}
                          </span>
                        )
                      )}
                </p>
              )}
            </div>
          )}

          {/* --- HOVER ACTIONS (Reaction Picker) --- */}
          {!data.isDeleted && (
            <div
              className={`absolute -top-10 hidden sm:group-hover/bubble:flex pb-2 z-30 transition-all ${
                isSender ? "right-0" : "left-0"
              }`}
            >
              <div className="flex items-center gap-0.5 bg-[#1a1228] p-1 rounded-full border border-[#2a1f3d]">
                {reactionOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    className="text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 hover:scale-110 transition-all active:scale-95"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!data.isDeleted && (
            <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 sm:group-hover/bubble:opacity-100 hidden sm:flex items-center gap-1 transition-all duration-200 ${isSender ? "-left-16" : "-right-16"}`}>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center w-8 h-8 bg-[#2a1f3d] text-[#8e8ea0] rounded-full hover:bg-[#6A2FBC]/20 hover:text-[#A7F0A7] transition-all"
                title="Copy message"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              {isSender && (
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-200 rounded-full hover:bg-red-500 hover:text-white transition-all"
                  title="Delete message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* --- EXISTING REACTIONS DISPLAY --- */}
        {activeReactions.length > 0 && (
          <div
            className={`flex flex-wrap gap-1.5 mt-2 ${
              isSender ? "justify-end" : "justify-start"
            }`}
          >
            {activeReactions.map((r) => {
               const iAmReacting = viewerId && r.userIds.includes(viewerId);
               return (
                <button
                    key={r.emoji}
                    onClick={() => handleReact(r.emoji)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-all border ${
                    iAmReacting
                        ? "bg-[#6A2FBC] text-white border-[#6A2FBC]" // Active
                        : "bg-[#2a1f3d] text-[#8e8ea0] border-[#2a1f3d] hover:bg-[#1a1228]" // Inactive
                    }`}
                >
                    <span>{r.emoji}</span>
                    <span>{r.userIds.length}</span>
                </button>
               );
            })}
          </div>
        )}

        {/* --- TIMESTAMP --- */}
        <span className={`text-[10px] font-medium mt-1 text-[#5c5c6e] ${isSender ? "text-right" : "ml-1"}`}>
          {formatMessageTime(data._creationTime)}
        </span>
      </div>
    </div>
  );
}