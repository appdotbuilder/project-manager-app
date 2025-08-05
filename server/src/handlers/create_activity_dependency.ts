
import { db } from '../db';
import { activityDependenciesTable, activitiesTable } from '../db/schema';
import { type CreateActivityDependencyInput, type ActivityDependency } from '../schema';
import { eq } from 'drizzle-orm';

export const createActivityDependency = async (input: CreateActivityDependencyInput): Promise<ActivityDependency> => {
  try {
    // Verify both activities exist before creating dependency
    const [activity, dependsOnActivity] = await Promise.all([
      db.select()
        .from(activitiesTable)
        .where(eq(activitiesTable.id, input.activity_id))
        .execute(),
      db.select()
        .from(activitiesTable)
        .where(eq(activitiesTable.id, input.depends_on_activity_id))
        .execute()
    ]);

    if (activity.length === 0) {
      throw new Error(`Activity with id ${input.activity_id} not found`);
    }

    if (dependsOnActivity.length === 0) {
      throw new Error(`Activity with id ${input.depends_on_activity_id} not found`);
    }

    // Prevent self-dependency
    if (input.activity_id === input.depends_on_activity_id) {
      throw new Error('Activity cannot depend on itself');
    }

    // Insert activity dependency record
    const result = await db.insert(activityDependenciesTable)
      .values({
        activity_id: input.activity_id,
        depends_on_activity_id: input.depends_on_activity_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Activity dependency creation failed:', error);
    throw error;
  }
};
