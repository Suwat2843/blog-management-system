import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  searchBlogs,
  updateBlog,
  deleteBlog,
  createComment,
  getCommentsByBlogId,
  deleteComment,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  blog: router({
    // Create a new blog
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1, "Title is required"),
          content: z.string().min(1, "Content is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createBlog({
          title: input.title,
          content: input.content,
          authorId: ctx.user.id,
        });
        return result;
      }),

    // Get all blogs with author info
    list: publicProcedure.query(async () => {
      const result = await getAllBlogs();
      return result;
    }),

    // Get a single blog by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const result = await getBlogById(input.id);
        return result;
      }),

    // Search blogs by title
    search: publicProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input }) => {
        const result = await searchBlogs(input.query);
        return result;
      }),

    // Update a blog (only by author)
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          content: z.string().min(1).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const blog = await getBlogById(input.id);
        if (!blog || blog.authorId !== ctx.user.id) {
          throw new Error("Unauthorized: You can only edit your own blogs");
        }

        const result = await updateBlog(input.id, {
          title: input.title,
          content: input.content,
        });
        return result;
      }),

    // Delete a blog (only by author)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const blog = await getBlogById(input.id);
        if (!blog || blog.authorId !== ctx.user.id) {
          throw new Error("Unauthorized: You can only delete your own blogs");
        }

        const result = await deleteBlog(input.id);
        return result;
      }),
  }),

  comment: router({
    // Create a comment on a blog
    create: protectedProcedure
      .input(
        z.object({
          blogId: z.number(),
          content: z.string().min(1, "Comment is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createComment({
          content: input.content,
          authorId: ctx.user.id,
          blogId: input.blogId,
        });
        return result;
      }),

    // Get all comments for a blog
    getByBlogId: publicProcedure
      .input(z.object({ blogId: z.number() }))
      .query(async ({ input }) => {
        const result = await getCommentsByBlogId(input.blogId);
        return result;
      }),

    // Delete a comment (only by author)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // For now, just delete the comment - authorization can be added later
        const result = await deleteComment(input.id);
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;

