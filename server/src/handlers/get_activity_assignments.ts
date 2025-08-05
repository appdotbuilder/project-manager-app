
import { db } from '../db';
import { activityAssignmentsTable } from '../db/schema';
import { type ActivityAssignment } from '../schema';
import { eq } from 'drizzle-orm';

export const getActivityAssignments = async (activityId: number): Promise<ActivityAssignment[]> => {
  try {
    const results = await db.select()
      .from(activityAssignmentsTable)
      .where(eq(activityAssignmentsTable.activity_id, activityId))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get activity assignments:', error);
    throw error;
  }
};
