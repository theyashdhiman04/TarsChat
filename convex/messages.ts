import { v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const MESSAGE_TTL_MS = 24 * 60 * 60 * 1000;

function isMessageExpired(message: { expiresAt?: number }, now: number) {
  return message.expiresAt !== undefined && message.expiresAt <= now;
}

async function getCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const me = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!me) throw new Error("User not found");
  return me;
}

async function assertConversationAvailable(
  ctx: MutationCtx,
  conversationId: Id<"conversations">,
  me: Awaited<ReturnType<typeof getCurrentUser>>
) {
  const conversation = await ctx.db.get(conversationId);
  if (!conversation) throw new Error("Conversation not found");
  if (!conversation.participants.includes(me._id)) {
    throw new Error("You do not have access to this conversation");
  }

  if (!conversation.isGroup) {
    const otherUserId = conversation.participants.find((id: string) => id !== me._id);
    if (otherUserId) {
      const otherUser = await ctx.db.get(otherUserId);
      const isBlockedByMe = (me.blockedUserIds ?? []).includes(otherUserId);
      const hasBlockedMe = !!otherUser && (otherUser.blockedUserIds ?? []).includes(me._id);

      if (isBlockedByMe) {
        throw new Error("Unblock this user to send messages");
      }

      if (hasBlockedMe) {
        throw new Error("This user is not available for messaging");
      }
    }
  }

  return conversation;
}

async function getCurrentQueryUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    imageMimeType: v.optional(v.string()),
  },
  handler: async (ctx, { conversationId, content, imageStorageId, imageMimeType }) => {
    const me = await getCurrentUser(ctx);
    const conversation = await assertConversationAvailable(ctx, conversationId, me);
    const now = Date.now();

    if (content.trim().length === 0 && !imageStorageId) {
      throw new Error("Message is empty");
    }

    const msgId = await ctx.db.insert("messages", {
      conversationId,
      senderId: me._id,
      content,
      imageStorageId,
      imageMimeType,
      expiresAt: conversation.disappearingMessages24h ? now + MESSAGE_TTL_MS : undefined,
      isDeleted: false,
      reactions: [],
    });

    await ctx.db.patch(conversationId, {
      lastMessageTime: now,
      lastMessagePreview: (imageStorageId ? "📷 Image" : content).slice(0, 100),
    });

    return msgId;
  },
});

export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const me = await getCurrentQueryUser(ctx);
    if (!me) return [];

    const conversation = await ctx.db.get(conversationId);
    if (!conversation || !conversation.participants.includes(me._id)) {
      return [];
    }

    const now = Date.now();
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversationId)
      )
      .order("asc")
      .collect();
    const visibleMessages = messages.filter((msg) => !isMessageExpired(msg, now));

    const enriched = await Promise.all(
      visibleMessages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        const imageUrl = msg.imageStorageId
          ? await ctx.storage.getUrl(msg.imageStorageId)
          : null;
        return { ...msg, sender, imageUrl };
      })
    );

    return enriched;
  },
});

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, { conversationId, isTyping }) => {
    let me;
    try {
      me = await getCurrentUser(ctx);
      await assertConversationAvailable(ctx, conversationId, me);
    } catch {
      return;
    }

    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", conversationId).eq("userId", me._id)
      )
      .unique();

    if (isTyping) {
      if (existing) {
        await ctx.db.patch(existing._id, { lastTyped: Date.now() });
      } else {
        await ctx.db.insert("typingIndicators", {
          conversationId,
          userId: me._id,
          lastTyped: Date.now(),
        });
      }
    } else {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    }
  },
});

export const getTypingUsers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const twoSecondsAgo = Date.now() - 2000;
    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversationId)
      )
      .collect();

    const activeTypers = indicators.filter(
      (i) => i.lastTyped > twoSecondsAgo && i.userId !== me?._id
    );

    const users = await Promise.all(
      activeTypers.map((i) => ctx.db.get(i.userId))
    );

    return users.filter(Boolean);
  },
});

export const markAsRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return;

    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", conversationId).eq("userId", me._id)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastReadTime: Date.now() });
    } else {
      await ctx.db.insert("readReceipts", {
        conversationId,
        userId: me._id,
        lastReadTime: Date.now(),
      });
    }
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, { messageId, emoji }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) throw new Error("User not found");

    const msg = await ctx.db.get(messageId);
    if (!msg) throw new Error("Message not found");
    if (isMessageExpired(msg, Date.now())) {
      throw new Error("Message has expired");
    }

    const reactions = msg.reactions ?? [];
    const existing = reactions.find((r) => r.emoji === emoji);

    let newReactions;
    if (existing) {
      const hasReacted = existing.userIds.includes(me._id);
      if (hasReacted) {
        const newUserIds = existing.userIds.filter((id) => id !== me._id);
        if (newUserIds.length === 0) {
          newReactions = reactions.filter((r) => r.emoji !== emoji);
        } else {
          newReactions = reactions.map((r) =>
            r.emoji === emoji ? { ...r, userIds: newUserIds } : r
          );
        }
      } else {
        newReactions = reactions.map((r) =>
          r.emoji === emoji
            ? { ...r, userIds: [...r.userIds, me._id] }
            : r
        );
      }
    } else {
      newReactions = [...reactions, { emoji, userIds: [me._id] }];
    }

    await ctx.db.patch(messageId, { reactions: newReactions });
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) throw new Error("User not found");

    const msg = await ctx.db.get(messageId);
    if (!msg) throw new Error("Message not found");
    if (isMessageExpired(msg, Date.now())) {
      throw new Error("Message has expired");
    }
    if (msg.senderId !== me._id) throw new Error("Not your message");

    await ctx.db.patch(messageId, { isDeleted: true });
  },
});
