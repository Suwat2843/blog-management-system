-- PostgreSQL Setup Script for Blog Management System
-- Run this script on your PostgreSQL database

-- Create database (if not exists)
-- CREATE DATABASE blog_db;

-- Connect to the database
-- \c blog_db;

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    authorId INTEGER NOT NULL REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    authorId INTEGER NOT NULL REFERENCES users(id),
    blogId INTEGER NOT NULL REFERENCES blogs(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(authorId);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(createdAt);
CREATE INDEX IF NOT EXISTS idx_comments_blog_id ON comments(blogId);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(authorId);

-- Insert sample data (optional)
INSERT INTO users (username, email, passwordHash, role) VALUES 
('admin', 'admin@example.com', '$2a$10$example.hash.here', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
