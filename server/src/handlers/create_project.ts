
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type Project } from '../schema';

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  try {
    // Insert project record
    const result = await db.insert(projectsTable)
      .values({
        name: input.name,
        description: input.description
      })
      .returning()
      .execute();

    const project = result[0];
    return {
      ...project,
      // Ensure dates are properly typed
      created_at: project.created_at,
      updated_at: project.updated_at
    };
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
};
