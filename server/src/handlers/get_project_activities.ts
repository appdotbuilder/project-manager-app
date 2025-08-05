
import { db } from '../db';
import { activitiesTable } from '../db/schema';
import { type GetProjectActivitiesInput, type Activity } from '../schema';
import { eq } from 'drizzle-orm';

export const getProjectActivities = async (input: GetProjectActivitiesInput): Promise<Activity[]> => {
  try {
    const results = await db.select()
      .from(activitiesTable)
      .where(eq(activitiesTable.project_id, input.project_id))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch project activities:', error);
    throw error;
  }
};
