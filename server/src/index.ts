
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  createProjectInputSchema,
  updateProjectInputSchema,
  createActivityInputSchema,
  updateActivityInputSchema,
  updateActivityStatusInputSchema,
  createActivityAssignmentInputSchema,
  createActivityDependencyInputSchema,
  getProjectActivitiesInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUsers } from './handlers/get_users';
import { createProject } from './handlers/create_project';
import { getProjects } from './handlers/get_projects';
import { updateProject } from './handlers/update_project';
import { createActivity } from './handlers/create_activity';
import { getProjectActivities } from './handlers/get_project_activities';
import { updateActivity } from './handlers/update_activity';
import { updateActivityStatus } from './handlers/update_activity_status';
import { assignUserToActivity } from './handlers/assign_user_to_activity';
import { createActivityDependency } from './handlers/create_activity_dependency';
import { getActivityAssignments } from './handlers/get_activity_assignments';
import { getActivityDependencies } from './handlers/get_activity_dependencies';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  getUsers: publicProcedure
    .query(() => getUsers()),

  // Project management
  createProject: publicProcedure
    .input(createProjectInputSchema)
    .mutation(({ input }) => createProject(input)),
  
  getProjects: publicProcedure
    .query(() => getProjects()),
  
  updateProject: publicProcedure
    .input(updateProjectInputSchema)
    .mutation(({ input }) => updateProject(input)),

  // Activity management
  createActivity: publicProcedure
    .input(createActivityInputSchema)
    .mutation(({ input }) => createActivity(input)),
  
  getProjectActivities: publicProcedure
    .input(getProjectActivitiesInputSchema)
    .query(({ input }) => getProjectActivities(input)),
  
  updateActivity: publicProcedure
    .input(updateActivityInputSchema)
    .mutation(({ input }) => updateActivity(input)),
  
  updateActivityStatus: publicProcedure
    .input(updateActivityStatusInputSchema)
    .mutation(({ input }) => updateActivityStatus(input)),

  // Activity assignments
  assignUserToActivity: publicProcedure
    .input(createActivityAssignmentInputSchema)
    .mutation(({ input }) => assignUserToActivity(input)),
  
  getActivityAssignments: publicProcedure
    .input(z.object({ activityId: z.number() }))
    .query(({ input }) => getActivityAssignments(input.activityId)),

  // Activity dependencies
  createActivityDependency: publicProcedure
    .input(createActivityDependencyInputSchema)
    .mutation(({ input }) => createActivityDependency(input)),
  
  getActivityDependencies: publicProcedure
    .input(z.object({ activityId: z.number() }))
    .query(({ input }) => getActivityDependencies(input.activityId)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
