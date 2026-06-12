# DevBlog Platform - Full Stack Blogging System

DevBlog is a modern, high-performance, full-stack blogging platform. It is engineered with a premium, responsive SaaS-style layout, utilizing React + TypeScript + Vite on the frontend and Node.js + Express on the backend, with PostgreSQL storage and user authentication handled via Supabase.

---

## Technical Architecture & Design System
- **Frontend**: Single-Page App built on **Vite**, **React**, and **TypeScript**.
- **Design System**: Curated slate/indigo palette, responsive grids, dark mode toggle sync, custom scrollbars, and card hover micro-animations utilizing **Tailwind CSS**.
- **Markdown Editor**: Custom split-screen/tabbed editor container leveraging **Tailwind Typography (`prose`)**, auto-saving, shortcut injection toolbars, dynamic links/images dialog modals, and syntax-highlighted code blocks.
- **Backend API**: Structured **Express** REST API in TypeScript utilizing **Zod** schema validation, CORS settings, ownership-enforcing middleware, custom URL-safe slug generators, and soft-delete endpoints.
- **Database / Auth**: Powered by **Supabase Auth** (email/password) and **PostgreSQL**. Features Row-Level Security (RLS) tables, triggers mapping profiles dynamically, and a custom security admin system.

---

## Directory Structure

```
blog/
├── supabase/                   # Supabase database configurations
│   └── migrations/
│       ├── 20260612000000_schema.sql  # Table structures & RLS policies
│       └── 20260612000001_seed.sql    # Prepulated categories and blogs
├── server/                     # Express REST API (TypeScript)
│   ├── src/
│   │   ├── middleware/         # Auth, error, Zod validation, ownership filters
│   │   ├── routes/             # Posts REST endpoints
│   │   ├── services/           # Supabase connection clients
│   │   └── index.ts            # App entrypoint
│   ├── tsconfig.json
│   └── package.json
├── client/                     # Vite React Frontend (TypeScript)
│   ├── public/                 # Sitemap.xml & Robots.txt SEO files
│   ├── src/
│   │   ├── components/         # Reusable UI cards, navs, markdown editor
│   │   ├── context/            # AuthContext provider using Supabase Auth
│   │   ├── pages/              # Auth, Home feed, Details, Dashboard views
│   │   ├── utils/              # SEO tag injector, dates, reading calculators
│   │   ├── types/              # Unified TypeScript interface models
│   │   └── main.tsx            # Mounting script
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## Database Installation (Supabase Setup)

1. Create a new project on [Supabase](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase Dashboard.
3. Open and run the contents of [supabase/migrations/20260612000000_schema.sql](file:///d:/blog/supabase/migrations/20260612000000_schema.sql) to create the users profiles sync trigger, roles enum types, posts tables, and strict RLS policies.
4. Optional: Run [supabase/migrations/20260612000001_seed.sql](file:///d:/blog/supabase/migrations/20260612000001_seed.sql) to insert mock admin/author accounts and seed posts for categories (Technology, Web Development, Design, etc.).

---

## Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- NPM (v9 or higher)

### 2. Environment Variables Configuration
Copy the `.env.example` configurations in the root directory into the respective subfolders:
- Create `server/.env` with your Supabase Anon and Service Role keys.
- Create `client/.env` with your Supabase Anon key and local API endpoints.

### 3. Server Installation & Start
```bash
cd server
npm install
npm run dev
```
The server REST API will boot on `http://localhost:5000/api`.

### 4. Client Installation & Start
```bash
cd client
npm install
npm run dev
```
The frontend application will spin up on `http://localhost:5173`. Open this URL in your web browser.

---

## Production Builds

### Build Backend Server
```bash
cd server
npm run build
```

### Build Frontend Bundle
```bash
cd client
npm run build
```
This outputs a statically optimized static bundle folder inside `client/dist/` ready to host.
