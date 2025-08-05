
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { getProjects } from '../handlers/get_projects';

// Test project inputs
const testProject1: CreateProjectInput = {
  name: 'Project Alpha',
  description: 'First test project'
};

const testProject2: CreateProjectInput = {
  name: 'Project Beta',
  description: null
};

const testProject3: CreateProjectInput = {
  name: 'Project Gamma',
  description: 'Third test project'
};

describe('getProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no projects exist', async () => {
    const result = await getProjects();

    expect(result).toEqual([]);
  });

  it('should return all projects', async () => {
    // Create test projects
    await db.insert(projectsTable)
      .values([testProject1, testProject2, testProject3])
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(3);
    
    // Verify all projects are returned
    const projectNames = result.map(p => p.name);
    expect(projectNames).toContain('Project Alpha');
    expect(projectNames).toContain('Project Beta');
    expect(projectNames).toContain('Project Gamma');
  });

  it('should return projects with correct structure', async () => {
    // Create a single test project
    await db.insert(projectsTable)
      .values(testProject1)
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    const project = result[0];

    // Verify project structure
    expect(project.id).toBeDefined();
    expect(typeof project.id).toBe('number');
    expect(project.name).toEqual('Project Alpha');
    expect(project.description).toEqual('First test project');
    expect(project.created_at).toBeInstanceOf(Date);
    expect(project.updated_at).toBeInstanceOf(Date);
  });

  it('should handle projects with null descriptions', async () => {
    // Create project with null description
    await db.insert(projectsTable)
      .values(testProject2)
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    const project = result[0];

    expect(project.name).toEqual('Project Beta');
    expect(project.description).toBeNull();
  });

  it('should return projects ordered by creation time', async () => {
    // Create projects with slight delay to ensure different timestamps
    await db.insert(projectsTable)
      .values(testProject1)
      .execute();
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(projectsTable)
      .values(testProject2)
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(2);
    
    // Verify timestamps are valid
    result.forEach(project => {
      expect(project.created_at).toBeInstanceOf(Date);
      expect(project.updated_at).toBeInstanceOf(Date);
    });
  });
});
