
import { db } from '../db';
import { activitiesTable } from '../db/schema';
import { type UpdateActivityStatusInput, type Activity } from '../schema';
import { eq } from 'drizzle-orm';

export const updateActivityStatus = async (input: UpdateActivityStatusInput): Promise<Activity> => {
  try {
    // Update the activity status and updated_at timestamp
    const result = await db.update(activitiesTable)
      .set({
        status: input.status,
        updated_at: new Date()
      })
      .where(eq(activitiesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Activity with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Activity status update failed:', error);
    throw error;
  }
};
