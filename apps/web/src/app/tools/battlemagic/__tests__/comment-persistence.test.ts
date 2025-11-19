/**
 * Comment Persistence Tests
 *
 * Tests verifying that user comments are properly persisted to IndexedDB
 * and can be loaded across page reloads.
 */

import { AnalysisDatabase, type DbComment, type CommentType } from '../lib/db/AnalysisDatabase';

describe('Comment Persistence', () => {
  let db: AnalysisDatabase;

  beforeEach(async () => {
    // Create a fresh database instance for each test
    db = new AnalysisDatabase();
    await db.init();
    await db.clear();
  });

  afterEach(async () => {
    // Clean up after each test
    await db.clear();
    db.close();
  });

  it('should save and retrieve a single comment', async () => {
    const comment: DbComment = {
      id: '0x08000100_standard',
      address: 0x08000100,
      text: 'This is a test comment',
      comment_type: 'standard',
      timestamp: Date.now(),
    };

    await db.saveComment(comment);

    const retrieved = await db.getComment(0x08000100, 'standard');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.text).toBe('This is a test comment');
    expect(retrieved?.comment_type).toBe('standard');
  });

  it('should support multiple comment types at the same address', async () => {
    const address = 0x08000200;
    const timestamp = Date.now();

    const comments: DbComment[] = [
      {
        id: `${address}_standard`,
        address,
        text: 'Standard comment',
        comment_type: 'standard',
        timestamp,
      },
      {
        id: `${address}_repeatable`,
        address,
        text: 'Repeatable comment',
        comment_type: 'repeatable',
        timestamp,
      },
      {
        id: `${address}_anterior`,
        address,
        text: 'Anterior comment',
        comment_type: 'anterior',
        timestamp,
      },
      {
        id: `${address}_block`,
        address,
        text: 'Block comment',
        comment_type: 'block',
        timestamp,
      },
    ];

    // Save all comments
    await db.saveComments(comments);

    // Retrieve each comment type
    const standardComment = await db.getComment(address, 'standard');
    const repeatableComment = await db.getComment(address, 'repeatable');
    const anteriorComment = await db.getComment(address, 'anterior');
    const blockComment = await db.getComment(address, 'block');

    expect(standardComment?.text).toBe('Standard comment');
    expect(repeatableComment?.text).toBe('Repeatable comment');
    expect(anteriorComment?.text).toBe('Anterior comment');
    expect(blockComment?.text).toBe('Block comment');
  });

  it('should retrieve all comments at a specific address', async () => {
    const address = 0x08000300;
    const timestamp = Date.now();

    const comments: DbComment[] = [
      {
        id: `${address}_standard`,
        address,
        text: 'Standard comment',
        comment_type: 'standard',
        timestamp,
      },
      {
        id: `${address}_repeatable`,
        address,
        text: 'Repeatable comment',
        comment_type: 'repeatable',
        timestamp,
      },
    ];

    await db.saveComments(comments);

    const allComments = await db.getCommentsAtAddress(address);
    expect(allComments).toHaveLength(2);
    expect(allComments.map(c => c.comment_type)).toContain('standard');
    expect(allComments.map(c => c.comment_type)).toContain('repeatable');
  });

  it('should update existing comment when saving with same address and type', async () => {
    const address = 0x08000400;
    const commentType: CommentType = 'standard';

    // Save initial comment
    const initialComment: DbComment = {
      id: `${address}_${commentType}`,
      address,
      text: 'Initial comment',
      comment_type: commentType,
      timestamp: Date.now(),
    };
    await db.saveComment(initialComment);

    // Update comment
    const updatedComment: DbComment = {
      id: `${address}_${commentType}`,
      address,
      text: 'Updated comment',
      comment_type: commentType,
      timestamp: Date.now(),
    };
    await db.saveComment(updatedComment);

    // Verify update
    const retrieved = await db.getComment(address, commentType);
    expect(retrieved?.text).toBe('Updated comment');

    // Verify only one comment exists
    const allComments = await db.getCommentsAtAddress(address);
    expect(allComments).toHaveLength(1);
  });

  it('should delete specific comment type without affecting others', async () => {
    const address = 0x08000500;
    const timestamp = Date.now();

    const comments: DbComment[] = [
      {
        id: `${address}_standard`,
        address,
        text: 'Standard comment',
        comment_type: 'standard',
        timestamp,
      },
      {
        id: `${address}_repeatable`,
        address,
        text: 'Repeatable comment',
        comment_type: 'repeatable',
        timestamp,
      },
    ];

    await db.saveComments(comments);

    // Delete standard comment
    await db.deleteComment(address, 'standard');

    // Verify standard comment is deleted
    const standardComment = await db.getComment(address, 'standard');
    expect(standardComment).toBeNull();

    // Verify repeatable comment still exists
    const repeatableComment = await db.getComment(address, 'repeatable');
    expect(repeatableComment).not.toBeNull();
    expect(repeatableComment?.text).toBe('Repeatable comment');
  });

  it('should handle comments across multiple addresses', async () => {
    const addresses = [0x08000100, 0x08000200, 0x08000300];
    const timestamp = Date.now();

    const comments: DbComment[] = addresses.map(addr => ({
      id: `${addr}_standard`,
      address: addr,
      text: `Comment at ${addr.toString(16)}`,
      comment_type: 'standard' as CommentType,
      timestamp,
    }));

    await db.saveComments(comments);

    // Verify each comment can be retrieved
    for (const addr of addresses) {
      const comment = await db.getComment(addr, 'standard');
      expect(comment).not.toBeNull();
      expect(comment?.text).toBe(`Comment at ${addr.toString(16)}`);
    }

    // Verify total comment count
    const allComments = await db.getAllComments();
    expect(allComments).toHaveLength(addresses.length);
  });

  it('should persist comments across database close/reopen', async () => {
    const address = 0x08000600;
    const comment: DbComment = {
      id: `${address}_standard`,
      address,
      text: 'Persistent comment',
      comment_type: 'standard',
      timestamp: Date.now(),
    };

    // Save comment
    await db.saveComment(comment);

    // Close database
    db.close();

    // Reopen database
    const db2 = new AnalysisDatabase();
    await db2.init();

    // Verify comment persists
    const retrieved = await db2.getComment(address, 'standard');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.text).toBe('Persistent comment');

    // Clean up
    await db2.clear();
    db2.close();
  });
});
