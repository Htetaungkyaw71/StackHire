# StackHire

StackHire is a modern job-board frontend built with React, TypeScript, Vite, and Tailwind CSS. It connects to the separate `job-api` backend and provides job browsing, authentication, recruiter onboarding, job posting, profile management, and application flows.

## Features

- Browse and filter jobs with search, tech stack filters, salary filters, and sorting.
- View job details with HTML descriptions and external apply links.
- Register and log in with role-based access for candidates and recruiters.
- Manage candidate profile, recruiter profile, company profile, and job posts.
- Recruiter dashboard with overview cards, job list, and saved jobs.
- Protected routes with onboarding checks and cookie-based authentication.
- Skeleton loading states and route transitions that feel fast and polished.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui components
- Lucide icons

## Prerequisites

- Node.js 18 or newer
- npm or another compatible package manager
- The `job-api` backend running separately

## Environment Variables

Create a `.env` file in the project root and set:

```bash
VITE_API_URL=http://localhost:3000
```

For production, point `VITE_API_URL` to your deployed backend URL.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

This starts the Vite dev server.

## Production Build

```bash
npm run build
```

## Preview Build

```bash
npm run preview
```

## Testing

```bash
npm run test
```

Run in watch mode with:

```bash
npm run test:watch
```

## Project Structure

- `src/pages` - top-level screens
- `src/components` - shared UI components
- `src/contexts` - auth and app state
- `src/hooks` - reusable hooks
- `src/lib` - API client and shared helpers

## Backend

This frontend expects the backend API from the `job-api` project to be available. Make sure the backend is running and `VITE_API_URL` points to it before using login, registration, job posting, and protected routes.

## Notes

- Authentication uses cookies sent by the browser with `credentials: "include"`.
- Loading states are implemented with skeleton components and a route loading bar.
- The frontend build is currently clean.
