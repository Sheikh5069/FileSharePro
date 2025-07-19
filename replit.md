# FileShare Pro - Replit Development Guide

## Overview

FileShare Pro is a full-stack file sharing application built with a modern React frontend and Express.js backend. The application allows users to upload, share, and manage files with a clean, professional interface. It features drag-and-drop uploads, file previews, admin dashboard with analytics, and secure file sharing via unique share IDs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Style**: RESTful API endpoints
- **File Handling**: Multer for multipart file uploads
- **Storage**: Local file system with configurable upload directory

### Monorepo Structure
- **Client**: Frontend React application (`/client`)
- **Server**: Backend Express.js application (`/server`)
- **Shared**: Common TypeScript types and schemas (`/shared`)

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Centralized in `/shared/schema.ts`
- **Migration**: Drizzle Kit for schema migrations
- **Storage Implementation**: Pluggable storage interface with in-memory fallback

### File Management System
- **Upload**: Drag-and-drop interface with progress tracking
- **Storage**: Local filesystem with organized directory structure
- **Security**: File type validation and size limits (100MB)
- **Sharing**: Unique share IDs for secure file access

### UI/UX Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **File Preview**: Modal-based previews for images and documents
- **Admin Dashboard**: Analytics and file management interface
- **Dark/Light Mode**: CSS variables for theme switching

## Data Flow

### File Upload Process
1. User selects files via drag-and-drop or file picker
2. Frontend validates file types and sizes
3. Files uploaded via FormData to `/api/upload`
4. Backend processes with Multer, stores to filesystem
5. Database record created with metadata and unique share ID
6. Success response triggers UI refresh

### File Sharing Flow
1. Files accessible via `/file/:shareId` public route
2. Backend validates share ID and increments view counter
3. File metadata displayed with download/preview options
4. Direct download via `/api/download/:shareId`

### Admin Dashboard
1. Statistics aggregated from database (total files, views, downloads)
2. File listing with search and filter capabilities
3. Bulk operations for file management
4. Real-time updates via React Query

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **multer**: File upload middleware
- **nanoid**: Unique ID generation for share links

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight router
- **react-dropzone**: File drag-and-drop functionality
- **date-fns**: Date formatting utilities

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **esbuild**: Server bundling for production

## Deployment Strategy

### Development Mode
- Vite dev server with HMR for frontend
- tsx for running TypeScript backend with hot reload
- Concurrent development with frontend proxy to backend

### Production Build
1. Frontend built with Vite to `/dist/public`
2. Backend bundled with esbuild to `/dist/index.js`
3. Static file serving integrated into Express server
4. Environment variables for database connection

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **PORT**: Server port (defaults to Express default)

### File Storage
- Local filesystem storage in `/uploads` directory
- Configurable upload limits and allowed file types
- Future consideration: Cloud storage integration (S3, etc.)

### Database Setup
- Drizzle migrations in `/migrations` directory
- Schema defined in `/shared/schema.ts`
- Push schema changes with `npm run db:push`

## Development Workflow

### Getting Started
1. Install dependencies: `npm install`
2. Set up database and configure `DATABASE_URL`
3. Run migrations: `npm run db:push`
4. Start development: `npm run dev`

### File Structure
- `/client`: React frontend application
- `/server`: Express.js backend
- `/shared`: Common types and database schema
- `/uploads`: File storage directory (created automatically)
- `/dist`: Production build output

### Key Scripts
- `npm run dev`: Start development servers
- `npm run build`: Build for production
- `npm run start`: Run production server
- `npm run db:push`: Push database schema changes