
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  created_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Project schema
export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Activity status enum
export const activityStatusEnum = z.enum(['todo', 'in_progress', 'review', 'done']);
export type ActivityStatus = z.infer<typeof activityStatusEnum>;

// Activity schema
export const activitySchema = z.object({
  id: z.number(),
  project_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  status: activityStatusEnum,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Activity = z.infer<typeof activitySchema>;

// Activity assignment schema
export const activityAssignmentSchema = z.object({
  id: z.number(),
  activity_id: z.number(),
  user_id: z.number(),
  created_at: z.coerce.date()
});

export type ActivityAssignment = z.infer<typeof activityAssignmentSchema>;

// Activity dependency schema
export const activityDependencySchema = z.object({
  id: z.number(),
  activity_id: z.number(),
  depends_on_activity_id: z.number(),
  created_at: z.coerce.date()
});

export type ActivityDependency = z.infer<typeof activityDependencySchema>;

// Input schemas for creating entities
export const createUserInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createProjectInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable()
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const createActivityInputSchema = z.object({
  project_id: z.number(),
  name: z.string().min(1),
  description: z.string().nullable(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  status: activityStatusEnum.default('todo')
});

export type CreateActivityInput = z.infer<typeof createActivityInputSchema>;

export const createActivityAssignmentInputSchema = z.object({
  activity_id: z.number(),
  user_id: z.number()
});

export type CreateActivityAssignmentInput = z.infer<typeof createActivityAssignmentInputSchema>;

export const createActivityDependencyInputSchema = z.object({
  activity_id: z.number(),
  depends_on_activity_id: z.number()
});

export type CreateActivityDependencyInput = z.infer<typeof createActivityDependencyInputSchema>;

// Update schemas
export const updateProjectInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

export const updateActivityInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  status: activityStatusEnum.optional()
});

export type UpdateActivityInput = z.infer<typeof updateActivityInputSchema>;

export const updateActivityStatusInputSchema = z.object({
  id: z.number(),
  status: activityStatusEnum
});

export type UpdateActivityStatusInput = z.infer<typeof updateActivityStatusInputSchema>;

// Query schemas
export const getProjectActivitiesInputSchema = z.object({
  project_id: z.number()
});

export type GetProjectActivitiesInput = z.infer<typeof getProjectActivitiesInputSchema>;
