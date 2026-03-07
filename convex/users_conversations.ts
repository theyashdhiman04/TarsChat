import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

function getBlockedIds(user: { blockedUserIds?: Array<string> | undefined }) {
  return new Set(user.blockedUserIds ?? []);
}

function isUserDoc(user: Doc<"users"> | null): user is Doc<"users"> {
  return user !== null;
}

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
    if (me._id === otherUserId) throw new Error("You cannot message yourself");

    const otherUser = await ctx.db.get(otherUserId);
    if (!otherUser) throw new Error("User not found");

    const isBlockedByMe = getBlockedIds(me).has(otherUserId);
    const hasBlockedMe = getBlockedIds(otherUser).has(me._id);

    if (isBlockedByMe) {
      throw new Error("Unblock this user to start chatting");
    }

    if (hasBlockedMe) {
      throw new Error("This user is not available for messaging");
    }

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
      disappearingMessages24h: false,
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

    const validParticipants = participants.filter(isUserDoc);
    const otherUser = conversation.isGroup
      ? null
      : validParticipants.find((participant) => participant._id !== me?._id) ?? null;
    const isBlockedByMe =
      !!me && !!otherUser && getBlockedIds(me).has(otherUser._id);
    const hasBlockedMe =
      !!me && !!otherUser && getBlockedIds(otherUser).has(me._id);

    return {
      ...conversation,
      disappearingMessages24h: conversation.disappearingMessages24h ?? false,
      participants: validParticipants,
      me,
      otherUser,
      blockState: {
        isBlockedByMe,
        hasBlockedMe,
        canMessage: !isBlockedByMe && !hasBlockedMe,
      },
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
    const now = Date.now();

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

        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", convo._id)
          )
          .collect();

        const unreadMessages = messages.filter(
          (m) =>
            m._creationTime > lastReadTime &&
            m.senderId !== me._id &&
            !m.isDeleted &&
            (m.expiresAt === undefined || m.expiresAt > now)
        );

        return {
          ...convo,
          disappearingMessages24h: convo.disappearingMessages24h ?? false,
          participants: participants.filter(isUserDoc),
          unreadCount: unreadMessages.length,
          hasUnread: unreadMessages.length > 0,
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
    const memberDocs = await Promise.all(
      memberIds.map((memberId) => ctx.db.get(memberId))
    );
    const myBlockedIds = getBlockedIds(me);

    const blockedMember = memberDocs.find(
      (member) =>
        member &&
        (myBlockedIds.has(member._id) || getBlockedIds(member).has(me._id))
    );

    if (blockedMember) {
      throw new Error("Blocked users cannot be added to groups");
    }

    return await ctx.db.insert("conversations", {
      participants: allParticipants,
      isGroup: true,
      groupName,
      disappearingMessages24h: false,
      lastMessageTime: Date.now(),
    });
  },
});

export const setDisappearingMessages = mutation({
  args: {
    conversationId: v.id("conversations"),
    enabled: v.boolean(),
  },
  handler: async (ctx, { conversationId, enabled }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) throw new Error("User not found");

    const conversation = await ctx.db.get(conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (!conversation.participants.includes(me._id)) {
      throw new Error("You do not have access to this conversation");
    }

    await ctx.db.patch(conversationId, {
      disappearingMessages24h: enabled,
    });

    return { success: true, enabled };
  },
});
