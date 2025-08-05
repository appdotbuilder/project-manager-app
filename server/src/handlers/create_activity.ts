
import { db } from '../db';
import { activitiesTable, projectsTable } from '../db/schema';
import { type CreateActivityInput, type Activity } from '../schema';
import { eq } from 'drizzle-orm';

export const createActivity = async (input: CreateActivityInput): Promise<Activity> => {
  try {
    // Verify project exists to prevent foreign key constraint violation
    const project = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, input.project_id))
      .execute();

    if (project.length === 0) {
      throw new Error(`Project with id ${input.project_id} does not exist`);
    }

    // Insert activity record
    const result = await db.insert(activitiesTable)
      .values({
        project_id: input.project_id,
        name: input.name,
        description: input.description,
        start_date: input.start_date,
        end_date: input.end_date,
        status: input.status
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Activity creation failed:', error);
    throw error;
  }
};
