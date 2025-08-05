
import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define activity status enum
export const activityStatusEnum = pgEnum('activity_status', ['todo', 'in_progress', 'review', 'done']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Projects table
export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Activities table
export const activitiesTable = pgTable('activities', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id').references(() => projectsTable.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  status: activityStatusEnum('status').notNull().default('todo'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Activity assignments table (many-to-many between activities and users)
export const activityAssignmentsTable = pgTable('activity_assignments', {
  id: serial('id').primaryKey(),
  activity_id: integer('activity_id').references(() => activitiesTable.id).notNull(),
  user_id: integer('user_id').references(() => usersTable.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Activity dependencies table (activities can depend on other activities)
export const activityDependenciesTable = pgTable('activity_dependencies', {
  id: serial('id').primaryKey(),
  activity_id: integer('activity_id').references(() => activitiesTable.id).notNull(),
  depends_on_activity_id: integer('depends_on_activity_id').references(() => activitiesTable.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  activityAssignments: many(activityAssignmentsTable),
}));

export const projectsRelations = relations(projectsTable, ({ many }) => ({
  activities: many(activitiesTable),
}));

export const activitiesRelations = relations(activitiesTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [activitiesTable.project_id],
    references: [projectsTable.id],
  }),
  assignments: many(activityAssignmentsTable),
  dependencies: many(activityDependenciesTable, {
    relationName: 'activityDependencies'
  }),
  dependents: many(activityDependenciesTable, {
    relationName: 'dependentActivities'
  }),
}));

export const activityAssignmentsRelations = relations(activityAssignmentsTable, ({ one }) => ({
  activity: one(activitiesTable, {
    fields: [activityAssignmentsTable.activity_id],
    references: [activitiesTable.id],
  }),
  user: one(usersTable, {
    fields: [activityAssignmentsTable.user_id],
    references: [usersTable.id],
  }),
}));

export const activityDependenciesRelations = relations(activityDependenciesTable, ({ one }) => ({
  activity: one(activitiesTable, {
    fields: [activityDependenciesTable.activity_id],
    references: [activitiesTable.id],
    relationName: 'activityDependencies'
  }),
  dependsOnActivity: one(activitiesTable, {
    fields: [activityDependenciesTable.depends_on_activity_id],
    references: [activitiesTable.id],
    relationName: 'dependentActivities'
  }),
}));

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  projects: projectsTable,
  activities: activitiesTable,
  activityAssignments: activityAssignmentsTable,
  activityDependencies: activityDependenciesTable,
};
