import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Initialize sample train data
export const initializeTrains = mutation({
  args: {},
  handler: async (ctx) => {
    const existingTrains = await ctx.db.query("trains").collect();
    if (existingTrains.length > 0) return;

    const sampleTrains = [
      {
        trainId: "KMRL-001",
        health: "Good" as const,
        safetyStatus: "Cleared" as const,
        timetable: "On-Time" as const,
        crewAvailable: true,
        depotPosition: "Depot-A-Bay-1",
        coordinationStatus: "Coordinated" as const,
        finalResult: "Ready" as const,
        lastUpdated: Date.now(),
        mileage: 45000,
        lastMaintenance: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
      {
        trainId: "KMRL-002",
        health: "Fair" as const,
        safetyStatus: "Pending" as const,
        timetable: "On-Time" as const,
        crewAvailable: true,
        depotPosition: "Depot-A-Bay-2",
        coordinationStatus: "Pending" as const,
        finalResult: "Standby" as const,
        lastUpdated: Date.now(),
        mileage: 52000,
        lastMaintenance: Date.now() - 14 * 24 * 60 * 60 * 1000,
      },
      {
        trainId: "KMRL-003",
        health: "Poor" as const,
        safetyStatus: "Failed" as const,
        timetable: "Cancelled" as const,
        crewAvailable: false,
        depotPosition: "Depot-B-Maintenance",
        coordinationStatus: "Issues" as const,
        finalResult: "Maintenance" as const,
        lastUpdated: Date.now(),
        mileage: 48000,
        lastMaintenance: Date.now() - 21 * 24 * 60 * 60 * 1000,
      },
      {
        trainId: "KMRL-004",
        health: "Good" as const,
        safetyStatus: "Cleared" as const,
        timetable: "On-Time" as const,
        crewAvailable: true,
        depotPosition: "Depot-B-Bay-1",
        coordinationStatus: "Coordinated" as const,
        finalResult: "Ready" as const,
        lastUpdated: Date.now(),
        mileage: 41000,
        lastMaintenance: Date.now() - 5 * 24 * 60 * 60 * 1000,
      },
      {
        trainId: "KMRL-005",
        health: "Good" as const,
        safetyStatus: "Cleared" as const,
        timetable: "Delayed" as const,
        crewAvailable: true,
        depotPosition: "Depot-A-Bay-3",
        coordinationStatus: "Coordinated" as const,
        finalResult: "Standby" as const,
        lastUpdated: Date.now(),
        mileage: 39000,
        lastMaintenance: Date.now() - 3 * 24 * 60 * 60 * 1000,
      },
    ];

    for (const train of sampleTrains) {
      await ctx.db.insert("trains", train);
    }
  },
});

export const getAllTrains = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!adminUser || !adminUser.isActive) return null;

    return await ctx.db.query("trains").order("desc").collect();
  },
});

export const updateTrainStatus = mutation({
  args: {
    trainId: v.string(),
    updates: v.object({
      health: v.optional(v.union(v.literal("Good"), v.literal("Fair"), v.literal("Poor"))),
      safetyStatus: v.optional(v.union(v.literal("Cleared"), v.literal("Pending"), v.literal("Failed"))),
      timetable: v.optional(v.union(v.literal("On-Time"), v.literal("Delayed"), v.literal("Cancelled"))),
      crewAvailable: v.optional(v.boolean()),
      coordinationStatus: v.optional(v.union(v.literal("Coordinated"), v.literal("Pending"), v.literal("Issues"))),
      finalResult: v.optional(v.union(v.literal("Ready"), v.literal("Standby"), v.literal("Maintenance"))),
      aiRecommendation: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const train = await ctx.db
      .query("trains")
      .withIndex("by_train_id", (q) => q.eq("trainId", args.trainId))
      .first();

    if (!train) throw new Error("Train not found");

    await ctx.db.patch(train._id, {
      ...args.updates,
      lastUpdated: Date.now(),
    });
  },
});

export const getTrainById = query({
  args: { trainId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trains")
      .withIndex("by_train_id", (q) => q.eq("trainId", args.trainId))
      .first();
  },
});
