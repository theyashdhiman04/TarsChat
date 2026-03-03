import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreateDM = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) throw new Error("User not found");

    const allConvos = await ctx.db.query("conversations").collect();
    const existing = allConvos.find(
      (c) =>
        !c.isGroup &&
        c.participants.length === 2 &&
        c.participants.includes(me._id) &&
        c.participants.includes(otherUserId)
    );

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      participants: [me._id, otherUserId],
      isGroup: false,
      lastMessageTime: Date.now(),
    });
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const conversation = await ctx.db.get(conversationId);
    if (!conversation) return null;

    const participants = await Promise.all(
      conversation.participants.map((id) => ctx.db.get(id))
    );

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return {
      ...conversation,
      participants: participants.filter(Boolean),
      me,
    };
  },
});

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];

    const allConvos = await ctx.db
      .query("conversations")
      .order("desc")
      .collect();

    const myConvos = allConvos.filter((c) => c.participants.includes(me._id));

    const enriched = await Promise.all(
      myConvos.map(async (convo) => {
        const participants = await Promise.all(
          convo.participants.map((id) => ctx.db.get(id))
        );

        const readReceipt = await ctx.db
          .query("readReceipts")
          .withIndex("by_conversation_user", (q) =>
            q.eq("conversationId", convo._id).eq("userId", me._id)
          )
          .unique();

        const lastReadTime = readReceipt?.lastReadTime ?? 0;

        const unreadMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", convo._id).gt("_creationTime", lastReadTime)
          )
          .filter((q) => q.neq(q.field("senderId"), me._id))
          .first();
        const hasUnread = !!unreadMessage;

        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", convo._id)
          )
          .collect();

        const unreadCount = messages.filter(
          (m) =>
            m._creationTime > lastReadTime &&
            m.senderId !== me._id &&
            !m.isDeleted
        ).length;

        return {
          ...convo,
          participants: participants.filter(Boolean),
          unreadCount,
          hasUnread,
          me,
        };
      })
    );

    return enriched;
  },
});

export const createGroup = mutation({
  args: {
    memberIds: v.array(v.id("users")),
    groupName: v.string(),
  },
  handler: async (ctx, { memberIds, groupName }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) throw new Error("User not found");

    const allParticipants = Array.from(new Set([me._id, ...memberIds]));

    return await ctx.db.insert("conversations", {
      participants: allParticipants,
      isGroup: true,
      groupName,
      lastMessageTime: Date.now(),
    });
  },
});
