# Blog Management System - Setup Guide

## Prerequisites
- Node.js 18+ (recommended: 22.13.0)
- pnpm (recommended) or npm
- MySQL/TiDB database

## Installation Steps

### 1. Install Dependencies
```bash
cd blog-management-system
pnpm install
# or
npm install
```

### 2. Setup Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/blog_db"

# JWT Secret (generate a random string)
JWT_SECRET="your-secret-key-here-min-32-chars"

# OAuth (can be left as is for custom auth)
VITE_APP_ID="blog-app"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# App Configuration
VITE_APP_TITLE="Blog Management System"
VITE_APP_LOGO="https://example.com/logo.png"

# Owner Info (optional)
OWNER_NAME="Admin"
OWNER_OPEN_ID="admin"

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=""
VITE_ANALYTICS_WEBSITE_ID=""

# Built-in APIs (optional)
BUILT_IN_FORGE_API_URL=""
BUILT_IN_FORGE_API_KEY=""
```

### 3. Setup Database
```bash
# Generate and apply migrations
pnpm db:push
```

### 4. Start Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
blog-management-system/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Blogs.tsx
│   │   │   ├── BlogDetail.tsx
│   │   │   ├── CreateBlog.tsx
│   │   │   └── EditBlog.tsx
│   │   ├── components/    # Reusable components
│   │   ├── lib/          # Utilities (tRPC client)
│   │   └── App.tsx       # Main app with routing
│   └── index.html
├── server/                # Node.js Backend
│   ├── routers.ts        # tRPC procedures
│   ├── db.ts             # Database queries
│   ├── _core/
│   │   ├── oauth.ts      # Auth routes (Register/Login)
│   │   ├── sdk.ts        # Session management
│   │   └── index.ts      # Server entry point
├── drizzle/              # Database Schema
│   ├── schema.ts         # Table definitions
│   └── migrations/       # Migration files
├── shared/               # Shared types and constants
└── package.json
```

## Features

### Authentication
- **Register**: Username (4-20 chars), Email, Password (8+ chars)
- **Login**: Email + Password authentication
- **Session**: JWT-based session management

### Blog Management
- **Create**: Write new blog posts
- **Read**: View all blogs with search functionality
- **Update**: Edit your own blogs
- **Delete**: Delete your own blogs

### Comments (Optional)
- Add comments to blog posts
- Delete your own comments

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### tRPC Procedures
- `trpc.blog.create` - Create blog
- `trpc.blog.list` - Get all blogs
- `trpc.blog.getById` - Get single blog
- `trpc.blog.search` - Search blogs
- `trpc.blog.update` - Update blog
- `trpc.blog.delete` - Delete blog
- `trpc.comment.create` - Add comment
- `trpc.comment.getByBlogId` - Get comments
- `trpc.comment.delete` - Delete comment

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Database migrations
pnpm db:push        # Apply migrations
pnpm db:generate    # Generate migrations

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(320) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Blogs Table
```sql
CREATE TABLE blogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  authorId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id)
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content TEXT NOT NULL,
  authorId INT NOT NULL,
  blogId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id),
  FOREIGN KEY (blogId) REFERENCES blogs(id)
);
```

## Testing the Application

### 1. Register a New User
- Go to `/register`
- Fill in username (4-20 chars), email, password (8+ chars)
- Click "สมัครสมาชิก"

### 2. Login
- Go to `/login`
- Enter email and password
- Click "เข้าสู่ระบบ"

### 3. Create a Blog
- Click "เขียนบทความใหม่"
- Fill in title and content
- Click "เผยแพร่บทความ"

### 4. View Blogs
- Go to "/blogs" to see all blogs
- Use search to find specific blogs
- Click on a blog to view details

### 5. Add Comments
- On blog detail page, scroll to comments section
- Write a comment and click "ส่งความเห็น"

### 6. Edit/Delete Blog
- On your own blog detail page
- Click "แก้ไข" to edit or "ลบ" to delete

## Troubleshooting

### Database Connection Error
- Check `DATABASE_URL` in `.env.local`
- Ensure MySQL/TiDB server is running
- Verify database credentials

### Port Already in Use
- Change port in `server/_core/index.ts`
- Or kill process using port 3000: `lsof -ti:3000 | xargs kill -9`

### bcryptjs Module Not Found
```bash
pnpm add bcryptjs
```

### TypeScript Errors
```bash
pnpm type-check
# or
npx tsc --noEmit
```

## Production Deployment

1. Build the project:
```bash
pnpm build
```

2. Set environment variables in production

3. Run migrations:
```bash
pnpm db:push
```

4. Start the server:
```bash
pnpm start
```

## Support

For issues or questions, check the following:
- Database connection settings
- Environment variables
- Node.js version compatibility
- Port availability

---

Happy blogging! 🚀
