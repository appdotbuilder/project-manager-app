
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { activitiesTable, projectsTable } from '../db/schema';
import { type CreateActivityInput } from '../schema';
import { createActivity } from '../handlers/create_activity';
import { eq } from 'drizzle-orm';

describe('createActivity', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an activity', async () => {
    // Create prerequisite project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A project for testing'
      })
      .returning()
      .execute();

    const project = projectResult[0];

    const testInput: CreateActivityInput = {
      project_id: project.id,
      name: 'Test Activity',
      description: 'An activity for testing',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31'),
      status: 'todo'
    };

    const result = await createActivity(testInput);

    // Basic field validation
    expect(result.project_id).toEqual(project.id);
    expect(result.name).toEqual('Test Activity');
    expect(result.description).toEqual('An activity for testing');
    expect(result.start_date).toEqual(new Date('2024-01-01'));
    expect(result.end_date).toEqual(new Date('2024-01-31'));
    expect(result.status).toEqual('todo');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save activity to database', async () => {
    // Create prerequisite project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A project for testing'
      })
      .returning()
      .execute();

    const project = projectResult[0];

    const testInput: CreateActivityInput = {
      project_id: project.id,
      name: 'Test Activity',
      description: 'An activity for testing',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31'),
      status: 'in_progress'
    };

    const result = await createActivity(testInput);

    // Query database to verify activity was saved
    const activities = await db.select()
      .from(activitiesTable)
      .where(eq(activitiesTable.id, result.id))
      .execute();

    expect(activities).toHaveLength(1);
    expect(activities[0].project_id).toEqual(project.id);
    expect(activities[0].name).toEqual('Test Activity');
    expect(activities[0].description).toEqual('An activity for testing');
    expect(activities[0].start_date).toEqual(new Date('2024-01-01'));
    expect(activities[0].end_date).toEqual(new Date('2024-01-31'));
    expect(activities[0].status).toEqual('in_progress');
    expect(activities[0].created_at).toBeInstanceOf(Date);
    expect(activities[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null description', async () => {
    // Create prerequisite project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A project for testing'
      })
      .returning()
      .execute();

    const project = projectResult[0];

    const testInput: CreateActivityInput = {
      project_id: project.id,
      name: 'Test Activity',
      description: null,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31'),
      status: 'todo'
    };

    const result = await createActivity(testInput);

    expect(result.description).toBeNull();
    expect(result.name).toEqual('Test Activity');
  });

  it('should throw error for non-existent project', async () => {
    const testInput: CreateActivityInput = {
      project_id: 999, // Non-existent project ID
      name: 'Test Activity',
      description: 'An activity for testing',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31'),
      status: 'todo'
    };

    await expect(createActivity(testInput)).rejects.toThrow(/project with id 999 does not exist/i);
  });

  it('should use default status when not specified', async () => {
    // Create prerequisite project
    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A project for testing'
      })
      .returning()
      .execute();

    const project = projectResult[0];

    const testInput: CreateActivityInput = {
      project_id: project.id,
      name: 'Test Activity',
      description: 'An activity for testing',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31'),
      status: 'todo' // Default status from Zod schema
    };

    const result = await createActivity(testInput);

    expect(result.status).toEqual('todo');
  });
});
