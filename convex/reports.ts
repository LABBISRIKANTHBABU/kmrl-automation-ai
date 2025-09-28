import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const generateDailyReport = action({
  args: {},
  handler: async (ctx): Promise<{ reportId: any; reportData: any }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get all trains data
    const trains = await ctx.runQuery(api.trains.getAllTrains);
    if (!trains) throw new Error("No access to train data");

    // Generate report data
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalTrains: trains.length,
      readyTrains: trains.filter((t: any) => t.finalResult === "Ready").length,
      standbyTrains: trains.filter((t: any) => t.finalResult === "Standby").length,
      maintenanceTrains: trains.filter((t: any) => t.finalResult === "Maintenance").length,
      healthStats: {
        good: trains.filter((t: any) => t.health === "Good").length,
        fair: trains.filter((t: any) => t.health === "Fair").length,
        poor: trains.filter((t: any) => t.health === "Poor").length,
      },
      safetyStats: {
        cleared: trains.filter((t: any) => t.safetyStatus === "Cleared").length,
        pending: trains.filter((t: any) => t.safetyStatus === "Pending").length,
        failed: trains.filter((t: any) => t.safetyStatus === "Failed").length,
      },
      trains: trains.map((train: any) => ({
        trainId: train.trainId,
        finalResult: train.finalResult,
        health: train.health,
        safetyStatus: train.safetyStatus,
        crewAvailable: train.crewAvailable,
        depotPosition: train.depotPosition,
        aiRecommendation: train.aiRecommendation || "No AI recommendation",
      })),
    };

    // Save report to database
    const reportId = await ctx.runMutation(api.reports.saveReport, {
      reportType: "daily",
      reportData: JSON.stringify(reportData),
    });

    return { reportId, reportData };
  },
});

export const saveReport = mutation({
  args: {
    reportType: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    reportData: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("reports", {
      reportType: args.reportType,
      generatedBy: userId,
      generatedAt: Date.now(),
      reportData: args.reportData,
    });
  },
});

export const getReports = query({
  args: { reportType: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.reportType) {
      return await ctx.db
        .query("reports")
        .withIndex("by_type", (q) => q.eq("reportType", args.reportType!))
        .order("desc")
        .take(20);
    }

    return await ctx.db.query("reports").order("desc").take(20);
  },
});

export const getReportById = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(args.reportId);
  },
});
