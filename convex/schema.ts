import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  trains: defineTable({
    trainId: v.string(),
    health: v.union(v.literal("Good"), v.literal("Fair"), v.literal("Poor")),
    safetyStatus: v.union(v.literal("Cleared"), v.literal("Pending"), v.literal("Failed")),
    timetable: v.union(v.literal("On-Time"), v.literal("Delayed"), v.literal("Cancelled")),
    crewAvailable: v.boolean(),
    depotPosition: v.string(),
    coordinationStatus: v.union(v.literal("Coordinated"), v.literal("Pending"), v.literal("Issues")),
    finalResult: v.union(v.literal("Ready"), v.literal("Standby"), v.literal("Maintenance")),
    lastUpdated: v.number(),
    aiRecommendation: v.optional(v.string()),
    mileage: v.optional(v.number()),
    lastMaintenance: v.optional(v.number()),
  }).index("by_train_id", ["trainId"]),

  departments: defineTable({
    name: v.string(),
    description: v.string(),
    isActive: v.boolean(),
  }),

  documents: defineTable({
    departmentId: v.id("departments"),
    trainId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    storageId: v.id("_storage"),
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
    processed: v.boolean(),
    aiExtractedData: v.optional(v.object({
      health: v.optional(v.string()),
      safety: v.optional(v.string()),
      crew: v.optional(v.boolean()),
      maintenance: v.optional(v.string()),
      notes: v.optional(v.string()),
      confidence: v.optional(v.number()),
    })),
    fullContent: v.optional(v.string()),
    summary: v.optional(v.string()),
    recommendations: v.optional(v.string()),
  }).index("by_department", ["departmentId"])
    .index("by_train", ["trainId"])
    .index("by_processed", ["processed"]),

  aiProcessingLogs: defineTable({
    documentId: v.id("documents"),
    trainId: v.string(),
    processingStatus: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    extractedData: v.optional(v.string()),
    recommendations: v.optional(v.string()),
    processedAt: v.number(),
  }).index("by_train", ["trainId"])
    .index("by_status", ["processingStatus"])
    .index("by_document", ["documentId"]),

  reports: defineTable({
    reportType: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    generatedBy: v.id("users"),
    generatedAt: v.number(),
    reportData: v.string(),
    storageId: v.optional(v.id("_storage")),
  }).index("by_type", ["reportType"])
    .index("by_date", ["generatedAt"]),

  adminUsers: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("operator")),
    department: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_user", ["userId"])
    .index("by_role", ["role"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
