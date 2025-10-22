import { eq, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, blogs, comments, InsertBlog, InsertComment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as Record<string, unknown>)[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Blog queries
export async function createBlog(blog: InsertBlog) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(blogs).values(blog);
  return result;
}

export async function getAllBlogs() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      content: blogs.content,
      authorId: blogs.authorId,
      createdAt: blogs.createdAt,
      updatedAt: blogs.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      },
    })
    .from(blogs)
    .leftJoin(users, eq(blogs.authorId, users.id))
    .orderBy(desc(blogs.createdAt));

  return result;
}

export async function getBlogById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      content: blogs.content,
      authorId: blogs.authorId,
      createdAt: blogs.createdAt,
      updatedAt: blogs.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      },
    })
    .from(blogs)
    .leftJoin(users, eq(blogs.authorId, users.id))
    .where(eq(blogs.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function searchBlogs(query: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      content: blogs.content,
      authorId: blogs.authorId,
      createdAt: blogs.createdAt,
      updatedAt: blogs.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      },
    })
    .from(blogs)
    .leftJoin(users, eq(blogs.authorId, users.id))
    .where(like(blogs.title, `%${query}%`))
    .orderBy(desc(blogs.createdAt));

  return result;
}

export async function updateBlog(id: number, data: Partial<InsertBlog>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.update(blogs).set(data).where(eq(blogs.id, id));
  return result;
}

export async function deleteBlog(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.delete(blogs).where(eq(blogs.id, id));
  return result;
}

// Comment queries
export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(comments).values(comment);
  return result;
}

export async function getCommentsByBlogId(blogId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select({
      id: comments.id,
      content: comments.content,
      authorId: comments.authorId,
      blogId: comments.blogId,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      },
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.blogId, blogId))
    .orderBy(desc(comments.createdAt));

  return result;
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.delete(comments).where(eq(comments.id, id));
  return result;
}

