
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type CreateProjectInput } from '../schema';
import { updateProject } from '../handlers/update_project';
import { eq } from 'drizzle-orm';

// Test input for creating initial project
const createTestInput: CreateProjectInput = {
  name: 'Original Project',
  description: 'Original description'
};

describe('updateProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update project name only', async () => {
    // Create initial project
    const createResult = await db.insert(projectsTable)
      .values({
        name: createTestInput.name,
        description: createTestInput.description
      })
      .returning()
      .execute();

    const originalProject = createResult[0];

    // Update only name
    const updateInput: UpdateProjectInput = {
      id: originalProject.id,
      name: 'Updated Project Name'
    };

    const result = await updateProject(updateInput);

    expect(result.id).toEqual(originalProject.id);
    expect(result.name).toEqual('Updated Project Name');
    expect(result.description).toEqual('Original description');
    expect(result.created_at).toEqual(originalProject.created_at);
    expect(result.updated_at).not.toEqual(originalProject.updated_at);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update project description only', async () => {
    // Create initial project
    const createResult = await db.insert(projectsTable)
      .values({
        name: createTestInput.name,
        description: createTestInput.description
      })
      .returning()
      .execute();

    const originalProject = createResult[0];

    // Update only description
    const updateInput: UpdateProjectInput = {
      id: originalProject.id,
      description: 'Updated description'
    };

    const result = await updateProject(updateInput);

    expect(result.id).toEqual(originalProject.id);
    expect(result.name).toEqual('Original Project');
    expect(result.description).toEqual('Updated description');
    expect(result.created_at).toEqual(originalProject.created_at);
    expect(result.updated_at).not.toEqual(originalProject.updated_at);
  });

  it('should update both name and description', async () => {
    // Create initial project
    const createResult = await db.insert(projectsTable)
      .values({
        name: createTestInput.name,
        description: createTestInput.description
      })
      .returning()
      .execute();

    const originalProject = createResult[0];

    // Update both fields
    const updateInput: UpdateProjectInput = {
      id: originalProject.id,
      name: 'Completely New Name',
      description: 'Completely new description'
    };

    const result = await updateProject(updateInput);

    expect(result.id).toEqual(originalProject.id);
    expect(result.name).toEqual('Completely New Name');
    expect(result.description).toEqual('Completely new description');
    expect(result.created_at).toEqual(originalProject.created_at);
    expect(result.updated_at).not.toEqual(originalProject.updated_at);
  });

  it('should set description to null', async () => {
    // Create initial project
    const createResult = await db.insert(projectsTable)
      .values({
        name: createTestInput.name,
        description: createTestInput.description
      })
      .returning()
      .execute();

    const originalProject = createResult[0];

    // Update description to null
    const updateInput: UpdateProjectInput = {
      id: originalProject.id,
      description: null
    };

    const result = await updateProject(updateInput);

    expect(result.id).toEqual(originalProject.id);
    expect(result.name).toEqual('Original Project');
    expect(result.description).toBeNull();
    expect(result.created_at).toEqual(originalProject.created_at);
    expect(result.updated_at).not.toEqual(originalProject.updated_at);
  });

  it('should save updated project to database', async () => {
    // Create initial project
    const createResult = await db.insert(projectsTable)
      .values({
        name: createTestInput.name,
        description: createTestInput.description
      })
      .returning()
      .execute();

    const originalProject = createResult[0];

    // Update project
    const updateInput: UpdateProjectInput = {
      id: originalProject.id,
      name: 'Database Updated Name'
    };

    await updateProject(updateInput);

    // Verify in database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, originalProject.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].name).toEqual('Database Updated Name');
    expect(projects[0].description).toEqual('Original description');
    expect(projects[0].updated_at).not.toEqual(originalProject.updated_at);
  });

  it('should throw error for non-existent project', async () => {
    const updateInput: UpdateProjectInput = {
      id: 999999,
      name: 'Non-existent Project'
    };

    await expect(updateProject(updateInput)).rejects.toThrow(/Project with ID 999999 not found/i);
  });

  it('should update only updated_at when no fields provided', async () => {
    // Create initial project
    const createResult = await db.insert(projectsTable)
      .values({
        name: createTestInput.name,
        description: createTestInput.description
      })
      .returning()
      .execute();

    const originalProject = createResult[0];

    // Update with only id (no other fields)
    const updateInput: UpdateProjectInput = {
      id: originalProject.id
    };

    const result = await updateProject(updateInput);

    expect(result.id).toEqual(originalProject.id);
    expect(result.name).toEqual('Original Project');
    expect(result.description).toEqual('Original description');
    expect(result.created_at).toEqual(originalProject.created_at);
    expect(result.updated_at).not.toEqual(originalProject.updated_at);
  });
});
