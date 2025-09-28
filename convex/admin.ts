import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const initializeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if admin already exists
    const existingAdmin = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingAdmin) return existingAdmin;

    // Create admin user
    return await ctx.db.insert("adminUsers", {
      userId,
      role: "admin",
      isActive: true,
    });
  },
});

export const checkAdminAccess = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return adminUser && adminUser.isActive ? adminUser : null;
  },
});

export const getAllAdminUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const currentAdmin = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentAdmin || currentAdmin.role !== "admin") return [];

    return await ctx.db.query("adminUsers").collect();
  },
});

export const updateUserRole = mutation({
  args: {
    targetUserId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("operator")),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const currentAdmin = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentAdmin || currentAdmin.role !== "admin") {
      throw new Error("Insufficient permissions");
    }

    const existingUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        role: args.role,
        department: args.department,
      });
    } else {
      await ctx.db.insert("adminUsers", {
        userId: args.targetUserId,
        role: args.role,
        department: args.department,
        isActive: true,
      });
    }
  },
});
