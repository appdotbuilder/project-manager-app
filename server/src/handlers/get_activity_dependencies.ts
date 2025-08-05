
import { db } from '../db';
import { activityDependenciesTable } from '../db/schema';
import { type ActivityDependency } from '../schema';
import { eq } from 'drizzle-orm';

export const getActivityDependencies = async (activityId: number): Promise<ActivityDependency[]> => {
  try {
    const results = await db.select()
      .from(activityDependenciesTable)
      .where(eq(activityDependenciesTable.activity_id, activityId))
      .execute();

    return results;
  } catch (error) {
    console.error('Get activity dependencies failed:', error);
    throw error;
  }
};
