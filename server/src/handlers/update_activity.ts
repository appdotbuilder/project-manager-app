
import { db } from '../db';
import { activitiesTable } from '../db/schema';
import { type UpdateActivityInput, type Activity } from '../schema';
import { eq } from 'drizzle-orm';

export const updateActivity = async (input: UpdateActivityInput): Promise<Activity> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    
    if (input.start_date !== undefined) {
      updateData.start_date = input.start_date;
    }
    
    if (input.end_date !== undefined) {
      updateData.end_date = input.end_date;
    }
    
    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update the activity record
    const result = await db.update(activitiesTable)
      .set(updateData)
      .where(eq(activitiesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Activity with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Activity update failed:', error);
    throw error;
  }
};
