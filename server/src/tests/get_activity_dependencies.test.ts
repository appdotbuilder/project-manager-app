
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable, activitiesTable, activityDependenciesTable } from '../db/schema';
import { getActivityDependencies } from '../handlers/get_activity_dependencies';

describe('getActivityDependencies', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return dependencies for an activity', async () => {
    // Create project
    const project = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A project for testing'
      })
      .returning()
      .execute();

    // Create activities
    const activities = await db.insert(activitiesTable)
      .values([
        {
          project_id: project[0].id,
          name: 'Activity 1',
          description: 'First activity',
          start_date: new Date('2024-01-01'),
          end_date: new Date('2024-01-05'),
          status: 'todo'
        },
        {
          project_id: project[0].id,
          name: 'Activity 2',
          description: 'Second activity',
          start_date: new Date('2024-01-06'),
          end_date: new Date('2024-01-10'),
          status: 'todo'
        },
        {
          project_id: project[0].id,
          name: 'Activity 3',
          description: 'Third activity',
          start_date: new Date('2024-01-11'),
          end_date: new Date('2024-01-15'),
          status: 'todo'
        }
      ])
      .returning()
      .execute();

    // Create dependencies: Activity 2 depends on Activity 1, Activity 3 depends on Activity 1 and 2
    await db.insert(activityDependenciesTable)
      .values([
        {
          activity_id: activities[1].id, // Activity 2
          depends_on_activity_id: activities[0].id // depends on Activity 1
        },
        {
          activity_id: activities[2].id, // Activity 3
          depends_on_activity_id: activities[0].id // depends on Activity 1
        },
        {
          activity_id: activities[2].id, // Activity 3
          depends_on_activity_id: activities[1].id // depends on Activity 2
        }
      ])
      .execute();

    // Test getting dependencies for Activity 3 (should have 2 dependencies)
    const dependencies = await getActivityDependencies(activities[2].id);

    expect(dependencies).toHaveLength(2);
    expect(dependencies[0].activity_id).toEqual(activities[2].id);
    expect(dependencies[0].depends_on_activity_id).toEqual(activities[0].id);
    expect(dependencies[0].id).toBeDefined();
    expect(dependencies[0].created_at).toBeInstanceOf(Date);

    expect(dependencies[1].activity_id).toEqual(activities[2].id);
    expect(dependencies[1].depends_on_activity_id).toEqual(activities[1].id);
    expect(dependencies[1].id).toBeDefined();
    expect(dependencies[1].created_at).toBeInstanceOf(Date);
  });

  it('should return empty array when activity has no dependencies', async () => {
    // Create project
    const project = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A project for testing'
      })
      .returning()
      .execute();

    // Create activity
    const activity = await db.insert(activitiesTable)
      .values({
        project_id: project[0].id,
        name: 'Independent Activity',
        description: 'Activity with no dependencies',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-05'),
        status: 'todo'
      })
      .returning()
      .execute();

    const dependencies = await getActivityDependencies(activity[0].id);

    expect(dependencies).toHaveLength(0);
  });

  it('should return empty array for non-existent activity', async () => {
    const dependencies = await getActivityDependencies(999);

    expect(dependencies).toHaveLength(0);
  });

  it('should only return dependencies for the specified activity', async () => {
    // Create project
    const project = await db.insert(projectsTable)
      .values({
        name: 'Test Project',
        description: 'A project for testing'
      })
      .returning()
      .execute();

    // Create activities
    const activities = await db.insert(activitiesTable)
      .values([
        {
          project_id: project[0].id,
          name: 'Activity 1',
          description: 'First activity',
          start_date: new Date('2024-01-01'),
          end_date: new Date('2024-01-05'),
          status: 'todo'
        },
        {
          project_id: project[0].id,
          name: 'Activity 2',
          description: 'Second activity',
          start_date: new Date('2024-01-06'),
          end_date: new Date('2024-01-10'),
          status: 'todo'
        }
      ])
      .returning()
      .execute();

    // Create dependencies for both activities
    await db.insert(activityDependenciesTable)
      .values([
        {
          activity_id: activities[0].id, // Activity 1
          depends_on_activity_id: activities[1].id // depends on Activity 2
        },
        {
          activity_id: activities[1].id, // Activity 2
          depends_on_activity_id: activities[0].id // depends on Activity 1
        }
      ])
      .execute();

    // Test getting dependencies for Activity 1 only
    const dependencies = await getActivityDependencies(activities[0].id);

    expect(dependencies).toHaveLength(1);
    expect(dependencies[0].activity_id).toEqual(activities[0].id);
    expect(dependencies[0].depends_on_activity_id).toEqual(activities[1].id);
  });
});
