import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        isOnline: true,
        lastSeen: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      isOnline: true,
      lastSeen: Date.now(),
      blockedUserIds: [],
    });
  },
});

export const listAllUsers = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, { search }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!me) return [];

    const allUsers = await ctx.db.query("users").collect();
    const myBlockedIds = new Set(me.blockedUserIds ?? []);
    const others = allUsers.filter((u) => u.clerkId !== identity.subject);

    const filtered =
      search && search.trim()
        ? others.filter((u) =>
            u.name.toLowerCase().includes(search.toLowerCase())
          )
        : others;

    const conversations = await ctx.db.query("conversations").collect();
    const now = Date.now();

    const enriched = await Promise.all(
      filtered.map(async (user) => {
        const dm = conversations.find(
          (c) =>
            !c.isGroup &&
            c.participants.length === 2 &&
            c.participants.includes(me._id) &&
            c.participants.includes(user._id)
        );

        const isBlockedByMe = myBlockedIds.has(user._id);
        const hasBlockedMe = (user.blockedUserIds ?? []).includes(me._id);
        const canMessage = !isBlockedByMe && !hasBlockedMe;

        if (!dm) {
          return {
            ...user,
            hasUnread: false,
            isBlockedByMe,
            hasBlockedMe,
            canMessage,
          };
        }

        const readReceipt = await ctx.db
          .query("readReceipts")
          .withIndex("by_conversation_user", (q) =>
            q.eq("conversationId", dm._id).eq("userId", me._id)
          )
          .unique();

        const lastReadTime = readReceipt?.lastReadTime ?? 0;

        const conversationMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", dm._id)
          )
          .collect();

        const unread = conversationMessages.some(
          (message) =>
            message._creationTime > lastReadTime &&
            message.senderId !== me._id &&
            !message.isDeleted &&
            (message.expiresAt === undefined || message.expiresAt > now)
        );

        return {
          ...user,
          hasUnread: !!unread,
          isBlockedByMe,
          hasBlockedMe,
          canMessage,
        };
      })
    );

    return enriched;
  },
});

export const toggleBlockUser = mutation({
  args: {
    targetUserId: v.id("users"),
    shouldBlock: v.boolean(),
  },
  handler: async (ctx, { targetUserId, shouldBlock }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!me) throw new Error("User not found");
    if (me._id === targetUserId) throw new Error("You cannot block yourself");

    const targetUser = await ctx.db.get(targetUserId);
    if (!targetUser) throw new Error("Target user not found");

    const blockedUserIds = new Set(me.blockedUserIds ?? []);
    if (shouldBlock) {
      blockedUserIds.add(targetUserId);
    } else {
      blockedUserIds.delete(targetUserId);
    }

    await ctx.db.patch(me._id, {
      blockedUserIds: Array.from(blockedUserIds),
    });

    return {
      success: true,
      blocked: shouldBlock,
    };
  },
});

export const setPresence = mutation({
  args: { isOnline: v.boolean() },
  handler: async (ctx, { isOnline }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        isOnline,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const syncFromWebhook = internalMutation({
  args: {
    payloadString: v.string(),
    svixId: v.string(),
    svixTimestamp: v.string(),
    svixSignature: v.string(),
  },
  handler: async (ctx, args) => {
    const payload = JSON.parse(args.payloadString);
    const { type, data } = payload;

    if (type === "user.created" || type === "user.updated") {
      const clerkId = data.id;
      const name =
        `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() ||
        data.username ||
        "Unknown";
      const email = data.email_addresses?.[0]?.email_address ?? "";
      const imageUrl = data.image_url;

      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { name, email, imageUrl });
      } else {
        await ctx.db.insert("users", {
          clerkId,
          name,
          email,
          imageUrl,
          isOnline: false,
          lastSeen: Date.now(),
          blockedUserIds: [],
        });
      }
    } else if (type === "user.deleted") {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", data.id))
        .unique();
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    }

    return { success: true };
  },
});
