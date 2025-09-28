import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

export const uploadDocument = mutation({
  args: {
    departmentId: v.id("departments"),
    trainId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const documentId = await ctx.db.insert("documents", {
      departmentId: args.departmentId,
      trainId: args.trainId,
      fileName: args.fileName,
      fileType: args.fileType,
      storageId: args.storageId,
      uploadedBy: userId,
      uploadedAt: Date.now(),
      processed: false,
    });

    // Create initial processing log
    await ctx.db.insert("aiProcessingLogs", {
      documentId,
      trainId: args.trainId,
      processingStatus: "pending",
      processedAt: Date.now(),
    });

    // Trigger AI processing
    await ctx.scheduler.runAfter(2000, internal.ai.processDocument, {
      documentId,
    });

    return documentId;
  },
});

export const getDocumentsByTrain = query({
  args: { trainId: v.string() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_train", (q) => q.eq("trainId", args.trainId))
      .order("desc")
      .collect();

    // Get department names
    const documentsWithDepartments = await Promise.all(
      documents.map(async (doc) => {
        const department = await ctx.db.get(doc.departmentId);
        return {
          ...doc,
          departmentName: department?.name || "Unknown",
        };
      })
    );

    return documentsWithDepartments;
  },
});

export const getDocumentsByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
      .order("desc")
      .collect();
  },
});

export const getRecentDocuments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const documents = await ctx.db.query("documents").order("desc").take(20);
    
    // Get department names and processing status
    const documentsWithDetails = await Promise.all(
      documents.map(async (doc) => {
        const department = await ctx.db.get(doc.departmentId);
        const processingLog = await ctx.db
          .query("aiProcessingLogs")
          .withIndex("by_document", (q) => q.eq("documentId", doc._id))
          .first();
        
        return {
          ...doc,
          departmentName: department?.name || "Unknown",
          processingStatus: processingLog?.processingStatus || "pending",
        };
      })
    );

    return documentsWithDetails;
  },
});

export const getDocumentUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getDocumentDetails = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const document = await ctx.db.get(args.documentId);
    if (!document) return null;

    const department = await ctx.db.get(document.departmentId);
    const processingLog = await ctx.db
      .query("aiProcessingLogs")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .first();

    return {
      ...document,
      departmentName: department?.name || "Unknown",
      processingStatus: processingLog?.processingStatus || "pending",
    };
  },
});

export const getProcessingLogs = query({
  args: { trainId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.trainId) {
      return await ctx.db
        .query("aiProcessingLogs")
        .withIndex("by_train", (q) => q.eq("trainId", args.trainId!))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("aiProcessingLogs").order("desc").take(50);
  },
});
