
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { getUsers } from '../handlers/get_users';

describe('getUsers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no users exist', async () => {
    const result = await getUsers();
    
    expect(result).toEqual([]);
  });

  it('should return all users', async () => {
    // Create test users
    await db.insert(usersTable)
      .values([
        { name: 'Alice Johnson', email: 'alice@example.com' },
        { name: 'Bob Smith', email: 'bob@example.com' },
        { name: 'Charlie Brown', email: 'charlie@example.com' }
      ])
      .execute();

    const result = await getUsers();

    expect(result).toHaveLength(3);
    
    // Verify user data
    const alice = result.find(user => user.email === 'alice@example.com');
    expect(alice).toBeDefined();
    expect(alice!.name).toEqual('Alice Johnson');
    expect(alice!.id).toBeDefined();
    expect(alice!.created_at).toBeInstanceOf(Date);

    const bob = result.find(user => user.email === 'bob@example.com');
    expect(bob).toBeDefined();
    expect(bob!.name).toEqual('Bob Smith');

    const charlie = result.find(user => user.email === 'charlie@example.com');
    expect(charlie).toBeDefined();
    expect(charlie!.name).toEqual('Charlie Brown');
  });

  it('should return users ordered by creation time', async () => {
    // Create users sequentially to ensure different timestamps
    await db.insert(usersTable)
      .values({ name: 'First User', email: 'first@example.com' })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(usersTable)
      .values({ name: 'Second User', email: 'second@example.com' })
      .execute();

    const result = await getUsers();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First User');
    expect(result[1].name).toEqual('Second User');
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });

  it('should include all required user fields', async () => {
    await db.insert(usersTable)
      .values({ name: 'Test User', email: 'test@example.com' })
      .execute();

    const result = await getUsers();

    expect(result).toHaveLength(1);
    
    const user = result[0];
    expect(user.id).toBeDefined();
    expect(typeof user.id).toBe('number');
    expect(user.name).toEqual('Test User');
    expect(user.email).toEqual('test@example.com');
    expect(user.created_at).toBeInstanceOf(Date);
  });
});
