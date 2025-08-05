
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, activitiesTable, activityAssignmentsTable } from '../db/schema';
import { getActivityAssignments } from '../handlers/get_activity_assignments';

describe('getActivityAssignments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return activity assignments for a specific activity', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com'
      })
      .returning()
      .execute();
    const user = userResult[0];

    // Create test project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A test project'
      })
      .returning()
      .execute();
    const project = projectResult[0];

    // Create test activity
    const activityResult = await db.insert(activitiesTable)
      .values({
        project_id: project.id,
        name: 'Test Activity',
        description: 'A test activity',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-15'),
        status: 'todo'
      })
      .returning()
      .execute();
    const activity = activityResult[0];

    // Create activity assignment
    const assignmentResult = await db.insert(activityAssignmentsTable)
      .values({
        activity_id: activity.id,
        user_id: user.id
      })
      .returning()
      .execute();
    const assignment = assignmentResult[0];

    const result = await getActivityAssignments(activity.id);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(assignment.id);
    expect(result[0].activity_id).toEqual(activity.id);
    expect(result[0].user_id).toEqual(user.id);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return multiple assignments for the same activity', async () => {
    // Create test users
    const user1Result = await db.insert(usersTable)
      .values({
        name: 'User One',
        email: 'user1@example.com'
      })
      .returning()
      .execute();
    const user1 = user1Result[0];

    const user2Result = await db.insert(usersTable)
      .values({
        name: 'User Two',
        email: 'user2@example.com'
      })
      .returning()
      .execute();
    const user2 = user2Result[0];

    // Create test project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A test project'
      })
      .returning()
      .execute();
    const project = projectResult[0];

    // Create test activity
    const activityResult = await db.insert(activitiesTable)
      .values({
        project_id: project.id,
        name: 'Test Activity',
        description: 'A test activity',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-15'),
        status: 'todo'
      })
      .returning()
      .execute();
    const activity = activityResult[0];

    // Create multiple assignments
    await db.insert(activityAssignmentsTable)
      .values([
        {
          activity_id: activity.id,
          user_id: user1.id
        },
        {
          activity_id: activity.id,
          user_id: user2.id
        }
      ])
      .execute();

    const result = await getActivityAssignments(activity.id);

    expect(result).toHaveLength(2);
    expect(result[0].activity_id).toEqual(activity.id);
    expect(result[1].activity_id).toEqual(activity.id);
    
    const userIds = result.map(r => r.user_id).sort();
    expect(userIds).toEqual([user1.id, user2.id].sort());
  });

  it('should return empty array when activity has no assignments', async () => {
    // Create test project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A test project'
      })
      .returning()
      .execute();
    const project = projectResult[0];

    // Create test activity without assignments
    const activityResult = await db.insert(activitiesTable)
      .values({
        project_id: project.id,
        name: 'Test Activity',
        description: 'A test activity',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-15'),
        status: 'todo'
      })
      .returning()
      .execute();
    const activity = activityResult[0];

    const result = await getActivityAssignments(activity.id);

    expect(result).toHaveLength(0);
  });

  it('should return empty array for non-existent activity', async () => {
    const result = await getActivityAssignments(999);

    expect(result).toHaveLength(0);
  });

  it('should only return assignments for the specified activity', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com'
      })
      .returning()
      .execute();
    const user = userResult[0];

    // Create test project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A test project'
      })
      .returning()
      .execute();
    const project = projectResult[0];

    // Create two activities
    const activity1Result = await db.insert(activitiesTable)
      .values({
        project_id: project.id,
        name: 'Activity 1',
        description: 'First activity',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-15'),
        status: 'todo'
      })
      .returning()
      .execute();
    const activity1 = activity1Result[0];

    const activity2Result = await db.insert(activitiesTable)
      .values({
        project_id: project.id,
        name: 'Activity 2',
        description: 'Second activity',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-02-15'),
        status: 'todo'
      })
      .returning()
      .execute();
    const activity2 = activity2Result[0];

    // Create assignments for both activities
    await db.insert(activityAssignmentsTable)
      .values([
        {
          activity_id: activity1.id,
          user_id: user.id
        },
        {
          activity_id: activity2.id,
          user_id: user.id
        }
      ])
      .execute();

    const result = await getActivityAssignments(activity1.id);

    expect(result).toHaveLength(1);
    expect(result[0].activity_id).toEqual(activity1.id);
  });
});
