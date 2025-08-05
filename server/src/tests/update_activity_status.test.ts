
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, activitiesTable } from '../db/schema';
import { type UpdateActivityStatusInput } from '../schema';
import { updateActivityStatus } from '../handlers/update_activity_status';
import { eq } from 'drizzle-orm';

describe('updateActivityStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: number;
  let testProjectId: number;
  let testActivityId: number;

  beforeEach(async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com'
      })
      .returning()
      .execute();
    testUserId = userResult[0].id;

    // Create prerequisite project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A test project'
      })
      .returning()
      .execute();
    testProjectId = projectResult[0].id;

    // Create test activity
    const activityResult = await db.insert(activitiesTable)
      .values({
        project_id: testProjectId,
        name: 'Test Activity',
        description: 'A test activity',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-31'),
        status: 'todo'
      })
      .returning()
      .execute();
    testActivityId = activityResult[0].id;
  });

  it('should update activity status from todo to in_progress', async () => {
    const input: UpdateActivityStatusInput = {
      id: testActivityId,
      status: 'in_progress'
    };

    const result = await updateActivityStatus(input);

    expect(result.id).toEqual(testActivityId);
    expect(result.status).toEqual('in_progress');
    expect(result.name).toEqual('Test Activity');
    expect(result.project_id).toEqual(testProjectId);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update activity status to done', async () => {
    const input: UpdateActivityStatusInput = {
      id: testActivityId,
      status: 'done'
    };

    const result = await updateActivityStatus(input);

    expect(result.status).toEqual('done');
    expect(result.id).toEqual(testActivityId);
  });

  it('should update the updated_at timestamp', async () => {
    // Get original updated_at
    const originalActivity = await db.select()
      .from(activitiesTable)
      .where(eq(activitiesTable.id, testActivityId))
      .execute();
    const originalUpdatedAt = originalActivity[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateActivityStatusInput = {
      id: testActivityId,
      status: 'review'
    };

    const result = await updateActivityStatus(input);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should save status update to database', async () => {
    const input: UpdateActivityStatusInput = {
      id: testActivityId,
      status: 'in_progress'
    };

    await updateActivityStatus(input);

    // Verify the status was updated in the database
    const activities = await db.select()
      .from(activitiesTable)
      .where(eq(activitiesTable.id, testActivityId))
      .execute();

    expect(activities).toHaveLength(1);
    expect(activities[0].status).toEqual('in_progress');
    expect(activities[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent activity', async () => {
    const input: UpdateActivityStatusInput = {
      id: 99999,
      status: 'done'
    };

    await expect(updateActivityStatus(input)).rejects.toThrow(/not found/i);
  });

  it('should handle all valid status values', async () => {
    const statuses = ['todo', 'in_progress', 'review', 'done'] as const;

    for (const status of statuses) {
      const input: UpdateActivityStatusInput = {
        id: testActivityId,
        status: status
      };

      const result = await updateActivityStatus(input);
      expect(result.status).toEqual(status);
    }
  });
});
