import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    lastSeen: v.number(),
    isOnline: v.boolean(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    lastMessagePreview: v.optional(v.string()),
  }).index("by_last_message", ["lastMessageTime"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    isDeleted: v.boolean(),
    reactions: v.optional(
      v.array(
        v.object({
          emoji: v.string(),
          userIds: v.array(v.id("users")),
        })
      )
    ),
  }).index("by_conversation", ["conversationId"]),

  readReceipts: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadTime: v.number(),
  })
    .index("by_conversation_user", ["conversationId", "userId"])
    .index("by_user", ["userId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastTyped: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_user", ["conversationId", "userId"]),
});
