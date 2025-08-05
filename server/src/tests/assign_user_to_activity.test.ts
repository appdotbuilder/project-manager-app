
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, activitiesTable, activityAssignmentsTable } from '../db/schema';
import { type CreateActivityAssignmentInput } from '../schema';
import { assignUserToActivity } from '../handlers/assign_user_to_activity';
import { eq } from 'drizzle-orm';

describe('assignUserToActivity', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should assign a user to an activity', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'John Doe',
        email: 'john@example.com'
      })
      .returning()
      .execute();
    const user = userResult[0];

    // Create prerequisite project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A project for testing'
      })
      .returning()
      .execute();
    const project = projectResult[0];

    // Create prerequisite activity
    const activityResult = await db.insert(activitiesTable)
      .values({
        project_id: project.id,
        name: 'Test Activity',
        description: 'An activity for testing',
        start_date: new Date(),
        end_date: new Date(),
        status: 'todo'
      })
      .returning()
      .execute();
    const activity = activityResult[0];

    const testInput: CreateActivityAssignmentInput = {
      activity_id: activity.id,
      user_id: user.id
    };

    const result = await assignUserToActivity(testInput);

    // Basic field validation
    expect(result.activity_id).toEqual(activity.id);
    expect(result.user_id).toEqual(user.id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save assignment to database', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Jane Smith',
        email: 'jane@example.com'
      })
      .returning()
      .execute();
    const user = userResult[0];

    // Create prerequisite project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Project Alpha',
        description: 'Alpha project'
      })
      .returning()
      .execute();
    const project = projectResult[0];

    // Create prerequisite activity
    const activityResult = await db.insert(activitiesTable)
      .values({
        project_id: project.id,
        name: 'Alpha Activity',
        description: 'Activity for Alpha',
        start_date: new Date(),
        end_date: new Date(),
        status: 'in_progress'
      })
      .returning()
      .execute();
    const activity = activityResult[0];

    const testInput: CreateActivityAssignmentInput = {
      activity_id: activity.id,
      user_id: user.id
    };

    const result = await assignUserToActivity(testInput);

    // Query database to verify assignment was saved
    const assignments = await db.select()
      .from(activityAssignmentsTable)
      .where(eq(activityAssignmentsTable.id, result.id))
      .execute();

    expect(assignments).toHaveLength(1);
    expect(assignments[0].activity_id).toEqual(activity.id);
    expect(assignments[0].user_id).toEqual(user.id);
    expect(assignments[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent user', async () => {
    // Create prerequisite project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A project for testing'
      })
      .returning()
      .execute();
    const project = projectResult[0];

    // Create prerequisite activity
    const activityResult = await db.insert(activitiesTable)
      .values({
        project_id: project.id,
        name: 'Test Activity',
        description: 'An activity for testing',
        start_date: new Date(),
        end_date: new Date(),
        status: 'todo'
      })
      .returning()
      .execute();
    const activity = activityResult[0];

    const testInput: CreateActivityAssignmentInput = {
      activity_id: activity.id,
      user_id: 9999 // Non-existent user ID
    };

    await expect(assignUserToActivity(testInput)).rejects.toThrow(/user with id 9999 not found/i);
  });

  it('should throw error for non-existent activity', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Bob Wilson',
        email: 'bob@example.com'
      })
      .returning()
      .execute();
    const user = userResult[0];

    const testInput: CreateActivityAssignmentInput = {
      activity_id: 9999, // Non-existent activity ID
      user_id: user.id
    };

    await expect(assignUserToActivity(testInput)).rejects.toThrow(/activity with id 9999 not found/i);
  });
});
