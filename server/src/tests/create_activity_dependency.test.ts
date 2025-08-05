
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, activitiesTable, activityDependenciesTable } from '../db/schema';
import { type CreateActivityDependencyInput } from '../schema';
import { createActivityDependency } from '../handlers/create_activity_dependency';
import { eq } from 'drizzle-orm';

describe('createActivityDependency', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUser: any;
  let testProject: any;
  let testActivity1: any;
  let testActivity2: any;

  beforeEach(async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com'
      })
      .returning()
      .execute();
    testUser = userResult[0];

    const projectResult = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A test project'
      })
      .returning()
      .execute();
    testProject = projectResult[0];

    const activity1Result = await db.insert(activitiesTable)
      .values({
        project_id: testProject.id,
        name: 'Activity 1',
        description: 'First activity',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-15'),
        status: 'todo'
      })
      .returning()
      .execute();
    testActivity1 = activity1Result[0];

    const activity2Result = await db.insert(activitiesTable)
      .values({
        project_id: testProject.id,
        name: 'Activity 2',
        description: 'Second activity',
        start_date: new Date('2024-01-16'),
        end_date: new Date('2024-01-31'),
        status: 'todo'
      })
      .returning()
      .execute();
    testActivity2 = activity2Result[0];
  });

  it('should create an activity dependency', async () => {
    const testInput: CreateActivityDependencyInput = {
      activity_id: testActivity2.id,
      depends_on_activity_id: testActivity1.id
    };

    const result = await createActivityDependency(testInput);

    // Basic field validation
    expect(result.activity_id).toEqual(testActivity2.id);
    expect(result.depends_on_activity_id).toEqual(testActivity1.id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save dependency to database', async () => {
    const testInput: CreateActivityDependencyInput = {
      activity_id: testActivity2.id,
      depends_on_activity_id: testActivity1.id
    };

    const result = await createActivityDependency(testInput);

    // Query database to verify save
    const dependencies = await db.select()
      .from(activityDependenciesTable)
      .where(eq(activityDependenciesTable.id, result.id))
      .execute();

    expect(dependencies).toHaveLength(1);
    expect(dependencies[0].activity_id).toEqual(testActivity2.id);
    expect(dependencies[0].depends_on_activity_id).toEqual(testActivity1.id);
    expect(dependencies[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent activity', async () => {
    const testInput: CreateActivityDependencyInput = {
      activity_id: 99999,
      depends_on_activity_id: testActivity1.id
    };

    await expect(createActivityDependency(testInput))
      .rejects.toThrow(/activity with id 99999 not found/i);
  });

  it('should throw error for non-existent depends_on_activity', async () => {
    const testInput: CreateActivityDependencyInput = {
      activity_id: testActivity1.id,
      depends_on_activity_id: 99999
    };

    await expect(createActivityDependency(testInput))
      .rejects.toThrow(/activity with id 99999 not found/i);
  });

  it('should prevent self-dependency', async () => {
    const testInput: CreateActivityDependencyInput = {
      activity_id: testActivity1.id,
      depends_on_activity_id: testActivity1.id
    };

    await expect(createActivityDependency(testInput))
      .rejects.toThrow(/activity cannot depend on itself/i);
  });

  it('should allow multiple dependencies for same activity', async () => {
    // Create a third activity
    const activity3Result = await db.insert(activitiesTable)
      .values({
        project_id: testProject.id,
        name: 'Activity 3',
        description: 'Third activity',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-02-15'),
        status: 'todo'
      })
      .returning()
      .execute();
    const testActivity3 = activity3Result[0];

    const input1: CreateActivityDependencyInput = {
      activity_id: testActivity3.id,
      depends_on_activity_id: testActivity1.id
    };

    const input2: CreateActivityDependencyInput = {
      activity_id: testActivity3.id,
      depends_on_activity_id: testActivity2.id
    };

    const result1 = await createActivityDependency(input1);
    const result2 = await createActivityDependency(input2);

    expect(result1.activity_id).toEqual(testActivity3.id);
    expect(result1.depends_on_activity_id).toEqual(testActivity1.id);
    expect(result2.activity_id).toEqual(testActivity3.id);
    expect(result2.depends_on_activity_id).toEqual(testActivity2.id);

    // Verify both dependencies exist in database
    const dependencies = await db.select()
      .from(activityDependenciesTable)
      .where(eq(activityDependenciesTable.activity_id, testActivity3.id))
      .execute();

    expect(dependencies).toHaveLength(2);
  });
});
