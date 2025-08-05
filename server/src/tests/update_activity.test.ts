
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, activitiesTable } from '../db/schema';
import { type UpdateActivityInput } from '../schema';
import { updateActivity } from '../handlers/update_activity';
import { eq } from 'drizzle-orm';

describe('updateActivity', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: number;
  let testProjectId: number;
  let testActivityId: number;

  beforeEach(async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com'
      })
      .returning()
      .execute();
    testUserId = userResult[0].id;

    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A project for testing'
      })
      .returning()
      .execute();
    testProjectId = projectResult[0].id;

    const activityResult = await db.insert(activitiesTable)
      .values({
        project_id: testProjectId,
        name: 'Original Activity',
        description: 'Original description',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-31'),
        status: 'todo'
      })
      .returning()
      .execute();
    testActivityId = activityResult[0].id;
  });

  it('should update activity name', async () => {
    const input: UpdateActivityInput = {
      id: testActivityId,
      name: 'Updated Activity Name'
    };

    const result = await updateActivity(input);

    expect(result.id).toEqual(testActivityId);
    expect(result.name).toEqual('Updated Activity Name');
    expect(result.description).toEqual('Original description'); // Should remain unchanged
    expect(result.status).toEqual('todo'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update activity description', async () => {
    const input: UpdateActivityInput = {
      id: testActivityId,
      description: 'Updated description'
    };

    const result = await updateActivity(input);

    expect(result.id).toEqual(testActivityId);
    expect(result.name).toEqual('Original Activity'); // Should remain unchanged
    expect(result.description).toEqual('Updated description');
    expect(result.status).toEqual('todo'); // Should remain unchanged
  });

  it('should update activity status', async () => {
    const input: UpdateActivityInput = {
      id: testActivityId,
      status: 'in_progress'
    };

    const result = await updateActivity(input);

    expect(result.id).toEqual(testActivityId);
    expect(result.status).toEqual('in_progress');
    expect(result.name).toEqual('Original Activity'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update activity dates', async () => {
    const newStartDate = new Date('2024-02-01');
    const newEndDate = new Date('2024-02-28');

    const input: UpdateActivityInput = {
      id: testActivityId,
      start_date: newStartDate,
      end_date: newEndDate
    };

    const result = await updateActivity(input);

    expect(result.id).toEqual(testActivityId);
    expect(result.start_date).toEqual(newStartDate);
    expect(result.end_date).toEqual(newEndDate);
    expect(result.name).toEqual('Original Activity'); // Should remain unchanged
  });

  it('should update multiple fields at once', async () => {
    const input: UpdateActivityInput = {
      id: testActivityId,
      name: 'Completely Updated Activity',
      description: 'New description',
      status: 'done',
      start_date: new Date('2024-03-01'),
      end_date: new Date('2024-03-31')
    };

    const result = await updateActivity(input);

    expect(result.id).toEqual(testActivityId);
    expect(result.name).toEqual('Completely Updated Activity');
    expect(result.description).toEqual('New description');
    expect(result.status).toEqual('done');
    expect(result.start_date).toEqual(new Date('2024-03-01'));
    expect(result.end_date).toEqual(new Date('2024-03-31'));
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update description to null', async () => {
    const input: UpdateActivityInput = {
      id: testActivityId,
      description: null
    };

    const result = await updateActivity(input);

    expect(result.id).toEqual(testActivityId);
    expect(result.description).toBeNull();
    expect(result.name).toEqual('Original Activity'); // Should remain unchanged
  });

  it('should save updated activity to database', async () => {
    const input: UpdateActivityInput = {
      id: testActivityId,
      name: 'Database Test Activity',
      status: 'review'
    };

    await updateActivity(input);

    // Verify changes were persisted to database
    const activities = await db.select()
      .from(activitiesTable)
      .where(eq(activitiesTable.id, testActivityId))
      .execute();

    expect(activities).toHaveLength(1);
    expect(activities[0].name).toEqual('Database Test Activity');
    expect(activities[0].status).toEqual('review');
    expect(activities[0].description).toEqual('Original description'); // Unchanged
    expect(activities[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update the updated_at timestamp', async () => {
    // Get original timestamp
    const originalActivity = await db.select()
      .from(activitiesTable)
      .where(eq(activitiesTable.id, testActivityId))
      .execute();

    const originalUpdatedAt = originalActivity[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateActivityInput = {
      id: testActivityId,
      name: 'Timestamp Test'
    };

    const result = await updateActivity(input);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error for non-existent activity', async () => {
    const input: UpdateActivityInput = {
      id: 99999,
      name: 'Non-existent Activity'
    };

    await expect(updateActivity(input)).rejects.toThrow(/Activity with id 99999 not found/i);
  });

  it('should handle partial updates correctly', async () => {
    // Update only one field
    const input: UpdateActivityInput = {
      id: testActivityId,
      status: 'in_progress'
    };

    const result = await updateActivity(input);

    // Verify only the specified field was updated
    expect(result.status).toEqual('in_progress');
    expect(result.name).toEqual('Original Activity');
    expect(result.description).toEqual('Original description');
    expect(result.start_date).toEqual(new Date('2024-01-01'));
    expect(result.end_date).toEqual(new Date('2024-01-31'));
  });
});
