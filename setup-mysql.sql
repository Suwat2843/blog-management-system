-- MySQL Setup Script for Blog Management System
-- Run this script on your MySQL database

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS blog_db;
USE blog_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    authorId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (authorId) REFERENCES users(id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    authorId INT NOT NULL,
    blogId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (authorId) REFERENCES users(id),
    FOREIGN KEY (blogId) REFERENCES blogs(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(authorId);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(createdAt);
CREATE INDEX IF NOT EXISTS idx_comments_blog_id ON comments(blogId);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(authorId);

-- Insert sample data (optional)
INSERT INTO users (username, email, passwordHash, role) VALUES 
('admin', 'admin@example.com', '$2a$10$example.hash.here', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Verify tables were created
SHOW TABLES;
