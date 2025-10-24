import { eq, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, blogs, comments, InsertBlog, InsertComment } from "../drizzle/schema";

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

// User queries
export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(users).values(user);
  return result;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
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
        username: users.username,
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
        username: users.username,
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
        username: users.username,
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
        username: users.username,
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

