# Production Deployment Guide

This document provides step-by-step instructions to deploy the DevBlog Blogging Platform to production.

---

## 1. Database & Authentication Setup (Supabase)

1. Sign in to your [Supabase Dashboard](https://supabase.com) and create a new project.
2. Under **Project Settings** -> **API**, grab your:
   - `Project URL`
   - `anon public` API key (Anon Key)
   - `service_role` API key (Service Role Key)
3. Navigate to **SQL Editor** on the left menu:
   - Create a new query.
   - Copy the schema query from [schema.sql](file:///d:/blog/supabase/migrations/20260612000000_schema.sql) and click **Run**.
   - This instantiates database triggers syncing auth users with profiles, tables (`users` and `posts`), enums, and Row Level Security policies.
4. Navigate to **Authentication** -> **Email Templates**:
   - Confirm confirmation mail requirements. (For testing, you can disable email verification under **Auth Providers** -> **Email** -> **Confirm email** toggle to allow immediate signup log-ins).

---

## 2. API Backend Deployment (Render / Railway / Fly.io)

You can deploy the Node.js Express server to a hosting provider. Here, we outline the deployment using **Render** (free-tier friendly):

1. Commit your codebase to a GitHub repository.
2. Sign in to [Render](https://render.com) and click **New** -> **Web Service**.
3. Link your GitHub repository.
4. Set the following build settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
5. Click **Advanced** to add **Environment Variables**:
   - `PORT`: `10000` (Render binds ports dynamically, but defining this is helpful)
   - `NODE_ENV`: `production`
   - `SUPABASE_URL`: *Your Supabase Project URL*
   - `SUPABASE_ANON_KEY`: *Your Supabase Anon Key*
   - `SUPABASE_SERVICE_ROLE_KEY`: *Your Supabase Service Role Key*
   - `CLIENT_URL`: *The URL of your deployed frontend (e.g. `https://your-blog-frontend.vercel.app`)*
6. Deploy the web service. Note the service URL (e.g. `https://blog-api-xyz.onrender.com`).

---

## 3. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)

The React client is built with Vite and can be hosted on **Vercel** as a static site:

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Select your GitHub repository.
4. Set the following build configurations:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add the production keys:
   - `VITE_SUPABASE_URL`: *Your Supabase Project URL*
   - `VITE_SUPABASE_ANON_KEY`: *Your Supabase Anon Key*
   - `VITE_API_URL`: *Your deployed backend API URL (e.g. `https://blog-api-xyz.onrender.com/api`)*
6. Click **Deploy**. Vercel will build the frontend and provide you with a deployment URL.
7. *Note*: Make sure to copy this Vercel deployment URL and update the `CLIENT_URL` environment variable on your Render Express backend settings to allow cross-origin requests (CORS).

---

## 4. Troubleshooting & Post-Setup Verification

- **CORS Issues**: If the frontend console shows CORS preflight errors, ensure the server's `CLIENT_URL` environment variable matches the exact protocol and domain of the frontend Vercel URL (with no trailing slash).
- **User Roles**: When signing up new accounts, their role is set to `author` by default. To make an account an administrator for testing, navigate to your Supabase project dashboard -> **Table Editor** -> `users` table, edit the row for the target user, and change their role to `admin`.
- **Soft-deletes**: Deleting a post on the dashboard marks it as soft-deleted by setting the `deleted_at` timestamp. Under RLS, it disappears from public listings, but remains visible in the database.
