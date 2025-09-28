import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const initializeDepartments = mutation({
  args: {},
  handler: async (ctx) => {
    const existingDepts = await ctx.db.query("departments").collect();
    if (existingDepts.length > 0) return;

    const departments = [
      { name: "Rolling Stock", description: "Train health and maintenance records", isActive: true },
      { name: "Safety", description: "Safety inspections and clearances", isActive: true },
      { name: "Operations", description: "Timetables and scheduling", isActive: true },
      { name: "Human Resources", description: "Crew availability and assignments", isActive: true },
      { name: "Engineering", description: "Infrastructure and depot management", isActive: true },
      { name: "Coordination", description: "Inter-department coordination status", isActive: true },
    ];

    for (const dept of departments) {
      await ctx.db.insert("departments", dept);
    }
  },
});

export const getAllDepartments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("departments").filter((q) => q.eq(q.field("isActive"), true)).collect();
  },
});

export const getDepartmentById = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.departmentId);
  },
});
