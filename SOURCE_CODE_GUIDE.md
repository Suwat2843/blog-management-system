# Blog Management System - Complete Source Code Guide

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env.local file with database URL
# DATABASE_URL="mysql://user:password@localhost:3306/blog_db"
# JWT_SECRET="your-secret-key-here"

# 3. Setup database
pnpm db:push

# 4. Start development server
pnpm dev
```

## File Structure & Key Files

### Frontend (React)

#### `/client/src/pages/Home.tsx`
- Landing page with authentication check
- Shows login/register buttons for unauthenticated users
- Shows blog navigation for authenticated users

#### `/client/src/pages/Register.tsx`
- User registration form
- Validates: username (4-20 chars), email, password (8+ chars)
- Calls `/api/auth/register` endpoint

#### `/client/src/pages/Login.tsx`
- User login form
- Authenticates with email and password
- Calls `/api/auth/login` endpoint
- Sets session cookie on success

#### `/client/src/pages/Blogs.tsx`
- Lists all blog posts
- Search functionality
- Shows author name and creation date
- Click to view blog details

#### `/client/src/pages/BlogDetail.tsx`
- Display single blog post
- Show comments section
- Add/delete comments (authenticated users only)
- Edit/delete buttons (for blog author only)

#### `/client/src/pages/CreateBlog.tsx`
- Form to create new blog post
- Protected route (requires authentication)
- Calls `trpc.blog.create` mutation

#### `/client/src/pages/EditBlog.tsx`
- Form to edit existing blog post
- Only accessible to blog author
- Calls `trpc.blog.update` mutation

#### `/client/src/App.tsx`
- Main application component
- Defines all routes
- Sets up theme provider and error boundary

### Backend (Node.js)

#### `/server/routers.ts`
Main tRPC router with all procedures:

```typescript
// Authentication
trpc.auth.me.useQuery()          // Get current user
trpc.auth.logout.useMutation()   // Logout

// Blog operations
trpc.blog.create.useMutation()   // Create blog
trpc.blog.list.useQuery()        // Get all blogs
trpc.blog.getById.useQuery()     // Get single blog
trpc.blog.search.useQuery()      // Search blogs
trpc.blog.update.useMutation()   // Update blog
trpc.blog.delete.useMutation()   // Delete blog

// Comments
trpc.comment.create.useMutation()      // Add comment
trpc.comment.getByBlogId.useQuery()    // Get comments
trpc.comment.delete.useMutation()      // Delete comment
```

#### `/server/db.ts`
Database query functions:

```typescript
// User queries
createUser(user)                 // Create new user
getUserByEmail(email)            // Find user by email
getUserByUsername(username)      // Find user by username
getUserById(id)                  // Find user by ID

// Blog queries
createBlog(blog)                 // Create blog
getAllBlogs()                    // Get all blogs with authors
getBlogById(id)                  // Get single blog
searchBlogs(query)               // Search by title
updateBlog(id, data)             // Update blog
deleteBlog(id)                   // Delete blog

// Comment queries
createComment(comment)           // Add comment
getCommentsByBlogId(blogId)      // Get comments for blog
deleteComment(id)                // Delete comment
```

#### `/server/_core/oauth.ts`
Authentication endpoints:

```
POST /api/auth/register
- Body: { username, email, password }
- Validates input
- Hashes password with bcryptjs
- Creates user in database

POST /api/auth/login
- Body: { email, password }
- Verifies credentials
- Creates JWT session token
- Sets session cookie

POST /api/auth/logout
- Clears session cookie
```

#### `/server/_core/sdk.ts`
Session management:

```typescript
createSessionToken(userId)       // Create JWT token
verifySession(cookieValue)       // Verify JWT token
getUserFromSession(req)          // Get user from request
```

### Database

#### `/drizzle/schema.ts`
Table definitions:

```typescript
// Users table
users {
  id: int (PK)
  username: varchar(20) UNIQUE
  email: varchar(320) UNIQUE
  passwordHash: varchar(255)
  role: enum('user', 'admin')
  createdAt: timestamp
  updatedAt: timestamp
}

// Blogs table
blogs {
  id: int (PK)
  title: varchar(255)
  content: text
  authorId: int (FK -> users.id)
  createdAt: timestamp
  updatedAt: timestamp
}

// Comments table
comments {
  id: int (PK)
  content: text
  authorId: int (FK -> users.id)
  blogId: int (FK -> blogs.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Authentication Flow

### Registration
1. User fills form (username, email, password)
2. Frontend validates input
3. POST to `/api/auth/register`
4. Backend validates and hashes password
5. Creates user in database
6. Redirects to login page

### Login
1. User enters email and password
2. POST to `/api/auth/login`
3. Backend verifies credentials
4. Creates JWT session token
5. Sets secure HTTP-only cookie
6. Returns user data
7. Redirects to home page

### Session Management
1. Frontend includes session cookie in requests
2. Backend verifies JWT token
3. Extracts user ID from token
4. Fetches user from database
5. Makes user available in tRPC context

## Blog Operations Flow

### Create Blog
1. User clicks "Create Blog" (requires auth)
2. Fills form (title, content)
3. Calls `trpc.blog.create` mutation
4. Backend validates and creates blog
5. Returns blog data
6. Redirects to blog list

### Read Blogs
1. Frontend calls `trpc.blog.list.useQuery()`
2. Backend fetches all blogs with author info
3. Returns array of blogs
4. Frontend displays in list view

### Update Blog
1. User clicks "Edit" on their blog
2. Fills form with current data
3. Calls `trpc.blog.update` mutation
4. Backend verifies user is author
5. Updates blog in database
6. Redirects to blog detail

### Delete Blog
1. User clicks "Delete" on their blog
2. Confirms action
3. Calls `trpc.blog.delete` mutation
4. Backend verifies user is author
5. Deletes blog from database
6. Redirects to blog list

### Search Blogs
1. User types in search box
2. Frontend calls `trpc.blog.search.useQuery()`
3. Backend searches blogs by title
4. Returns matching blogs
5. Frontend displays results

## Comments Flow

### Add Comment
1. User types comment on blog detail page
2. Calls `trpc.comment.create` mutation
3. Backend creates comment
4. Frontend refetches comments
5. New comment appears in list

### View Comments
1. Blog detail page loads
2. Calls `trpc.comment.getByBlogId.useQuery()`
3. Backend fetches comments with author info
4. Frontend displays in reverse chronological order

### Delete Comment
1. User clicks delete on their comment
2. Confirms action
3. Calls `trpc.comment.delete` mutation
4. Backend deletes comment
5. Frontend refetches comments

## Key Technologies

- **React 19**: Frontend framework
- **Tailwind CSS 4**: Styling
- **shadcn/ui**: UI components
- **tRPC**: Type-safe RPC framework
- **Express**: Web server
- **Drizzle ORM**: Database ORM
- **MySQL/TiDB**: Database
- **bcryptjs**: Password hashing
- **JWT**: Session tokens

## Environment Variables

```env
DATABASE_URL          # MySQL connection string
JWT_SECRET           # Secret for JWT signing
VITE_APP_ID          # App identifier
VITE_APP_TITLE       # App display name
VITE_APP_LOGO        # App logo URL
OAUTH_SERVER_URL     # OAuth server (not used in custom auth)
VITE_OAUTH_PORTAL_URL # OAuth portal (not used in custom auth)
```

## Common Tasks

### Add a New Field to Users
1. Edit `/drizzle/schema.ts` - add field to users table
2. Run `pnpm db:push` - generate and apply migration
3. Update `/server/db.ts` - if needed for queries
4. Update `/client/src/pages/` - if UI needs to change

### Add a New API Endpoint
1. Create database query in `/server/db.ts`
2. Add tRPC procedure in `/server/routers.ts`
3. Call from frontend using `trpc.*.useQuery/useMutation()`

### Protect a Route
1. Use `protectedProcedure` instead of `publicProcedure` in routers.ts
2. Frontend checks `useAuth().isAuthenticated` before showing page
3. Redirect to login if not authenticated

### Add Validation
1. Use Zod schema in tRPC input
2. Frontend validates before submission
3. Backend validates in procedure

## Debugging

### Check Database
```bash
# View migrations
ls drizzle/migrations/

# Check schema
cat drizzle/schema.ts
```

### Check Logs
- Frontend: Browser console (F12)
- Backend: Terminal where `pnpm dev` is running

### Common Issues

**"Cannot find module 'bcryptjs'"**
```bash
pnpm add bcryptjs
```

**"Database connection error"**
- Check DATABASE_URL in .env.local
- Ensure MySQL is running
- Verify credentials

**"Session validation failed"**
- Check JWT_SECRET is set
- Verify session cookie is being sent
- Check token expiration

**"User not found"**
- Verify user exists in database
- Check session token is valid
- Try logging in again

## Performance Tips

1. Use optimistic updates for better UX
2. Implement pagination for large blog lists
3. Cache blog data when possible
4. Use database indexes on frequently queried fields
5. Minimize re-renders with React.memo

## Security Considerations

1. Passwords are hashed with bcryptjs (10 rounds)
2. Session tokens are JWT-based with expiration
3. Cookies are HTTP-only (not accessible from JS)
4. CSRF protection through same-site cookies
5. SQL injection prevented by Drizzle ORM
6. XSS prevention through React's built-in escaping

## Deployment Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure DATABASE_URL for production
- [ ] Set NODE_ENV=production
- [ ] Run `pnpm build`
- [ ] Run `pnpm db:push` on production database
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS if needed
- [ ] Set up monitoring/logging
- [ ] Backup database regularly

---

For more help, check SETUP.md or the individual file comments.
