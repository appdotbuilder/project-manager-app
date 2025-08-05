
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable, activitiesTable } from '../db/schema';
import { type GetProjectActivitiesInput } from '../schema';
import { getProjectActivities } from '../handlers/get_project_activities';

// Test input
const testInput: GetProjectActivitiesInput = {
  project_id: 1
};

describe('getProjectActivities', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when project has no activities', async () => {
    // Create a project without activities
    await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A test project'
      })
      .execute();

    const result = await getProjectActivities(testInput);
    expect(result).toEqual([]);
  });

  it('should return all activities for a specific project', async () => {
    // Create a project
    await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A test project'
      })
      .execute();

    // Create activities for the project
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    await db.insert(activitiesTable)
      .values([
        {
          project_id: 1,
          name: 'Activity 1',
          description: 'First activity',
          start_date: startDate,
          end_date: endDate,
          status: 'todo'
        },
        {
          project_id: 1,
          name: 'Activity 2',
          description: 'Second activity',
          start_date: startDate,
          end_date: endDate,
          status: 'in_progress'
        }
      ])
      .execute();

    const result = await getProjectActivities(testInput);

    expect(result).toHaveLength(2);
    
    // Check first activity
    expect(result[0].name).toEqual('Activity 1');
    expect(result[0].description).toEqual('First activity');
    expect(result[0].project_id).toEqual(1);
    expect(result[0].status).toEqual('todo');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Check second activity
    expect(result[1].name).toEqual('Activity 2');
    expect(result[1].description).toEqual('Second activity');
    expect(result[1].project_id).toEqual(1);
    expect(result[1].status).toEqual('in_progress');
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].updated_at).toBeInstanceOf(Date);
  });

  it('should only return activities for the specified project', async () => {
    // Create two projects
    await db.insert(projectsTable)
      .values([
        {
          name: 'Project 1',
          description: 'First project'
        },
        {
          name: 'Project 2',
          description: 'Second project'
        }
      ])
      .execute();

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    // Create activities for both projects
    await db.insert(activitiesTable)
      .values([
        {
          project_id: 1,
          name: 'Project 1 Activity',
          description: 'Activity for project 1',
          start_date: startDate,
          end_date: endDate,
          status: 'todo'
        },
        {
          project_id: 2,
          name: 'Project 2 Activity',
          description: 'Activity for project 2',
          start_date: startDate,
          end_date: endDate,
          status: 'done'
        }
      ])
      .execute();

    const result = await getProjectActivities({ project_id: 1 });

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Project 1 Activity');
    expect(result[0].project_id).toEqual(1);
  });

  it('should return activities with different statuses', async () => {
    // Create a project
    await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A test project'
      })
      .execute();

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    // Create activities with different statuses
    await db.insert(activitiesTable)
      .values([
        {
          project_id: 1,
          name: 'Todo Activity',
          description: null,
          start_date: startDate,
          end_date: endDate,
          status: 'todo'
        },
        {
          project_id: 1,
          name: 'In Progress Activity',
          description: null,
          start_date: startDate,
          end_date: endDate,
          status: 'in_progress'
        },
        {
          project_id: 1,
          name: 'Review Activity',
          description: null,
          start_date: startDate,
          end_date: endDate,
          status: 'review'
        },
        {
          project_id: 1,
          name: 'Done Activity',
          description: null,
          start_date: startDate,
          end_date: endDate,
          status: 'done'
        }
      ])
      .execute();

    const result = await getProjectActivities(testInput);

    expect(result).toHaveLength(4);
    
    const statuses = result.map(activity => activity.status);
    expect(statuses).toContain('todo');
    expect(statuses).toContain('in_progress');
    expect(statuses).toContain('review');
    expect(statuses).toContain('done');
  });
});
