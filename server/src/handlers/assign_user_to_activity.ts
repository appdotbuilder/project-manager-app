
import { db } from '../db';
import { activityAssignmentsTable, usersTable, activitiesTable } from '../db/schema';
import { type CreateActivityAssignmentInput, type ActivityAssignment } from '../schema';
import { eq } from 'drizzle-orm';

export const assignUserToActivity = async (input: CreateActivityAssignmentInput): Promise<ActivityAssignment> => {
  try {
    // Verify user exists
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (user.length === 0) {
      throw new Error(`User with id ${input.user_id} not found`);
    }

    // Verify activity exists
    const activity = await db.select()
      .from(activitiesTable)
      .where(eq(activitiesTable.id, input.activity_id))
      .execute();

    if (activity.length === 0) {
      throw new Error(`Activity with id ${input.activity_id} not found`);
    }

    // Insert activity assignment record
    const result = await db.insert(activityAssignmentsTable)
      .values({
        activity_id: input.activity_id,
        user_id: input.user_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Activity assignment failed:', error);
    throw error;
  }
};
