# Local Run Guide

This guide walks you through setting up and launching the Blogging Platform locally on your system.

---

## Step 1: Database Setup (Supabase)

The platform requires a connection to a Supabase PostgreSQL instance.

1. **Sign Up / Sign In**: Go to [Supabase](https://supabase.com) and create a free account.
2. **New Project**: Click **New Project**, select an organization, choose a database name, region, and set a strong database password. Click **Create new project**.
3. **Database Migration**:
   - Once your project starts, click **SQL Editor** on the left-hand navigation menu.
   - Click **New query**.
   - Copy the SQL schema from [schema.sql](file:///d:/blog/supabase/migrations/20260612000000_schema.sql) and paste it into the editor. Click **Run**.
   - This creates user enums, posts tables, triggers, and Row Level Security policies.
4. **Seed Database**:
   - Create another **New query** in the SQL Editor.
   - Copy the SQL mock seed from [seed.sql](file:///d:/blog/supabase/migrations/20260612000001_seed.sql) and paste it into the editor. Click **Run**.
   - This seeds test users and initial blog posts.
5. **Disable Email Confirmations (For Easy Testing)**:
   - In the Supabase sidebar, go to **Authentication** -> **Providers** -> **Email**.
   - Turn **OFF** the "Confirm email" toggle. Click **Save**. This allows new users to register and sign in immediately without email confirmation.

---

## Step 2: Set Environment Variables

You need to copy keys from the Supabase Project Dashboard into the project configurations.

### 1. Get Supabase Credentials
Go to your Supabase Project Settings -> **API**:
- Copy the **Project URL**.
- Copy the **anon public** key (Anon Key).
- Copy the **service_role** key (Service Role Key - found under secret keys).

### 2. Configure Backend Server
Create a file named `.env` inside the `server/` directory and populate it:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Put your actual keys here:
SUPABASE_URL=https://your-supabase-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Configure Frontend Client
Create a file named `.env` inside the `client/` directory and populate it:
```env
# Put your actual keys here:
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Server Endpoint
VITE_API_URL=http://localhost:5000/api
```

---

## Step 3: Run the Application

You need two terminal windows open: one for the backend server and one for the frontend client.

### Terminal 1: Launch Backend Server
```bash
cd server
npm install
npm run dev
```
You should see:
`[Server] Blogging Platform REST API running in development mode on http://localhost:5000`

### Terminal 2: Launch Frontend Client
```bash
cd client
npm install
npm run dev
```
You should see output directing you to open:
`http://localhost:5173`

---

## Step 4: Staged Test Accounts

You can test the features immediately using the pre-seeded credentials:

### 1. Administrator Account
- **Email**: `admin@blog.com`
- **Password**: `Password123`
- **Privileges**: Can view/create/edit all posts, status toggling, and force-delete any post from the system.

### 2. Standard Author Account
- **Email**: `author@blog.com`
- **Password**: `Password123`
- **Privileges**: Can view all posts, and create, edit, or soft-delete *only their own* posts.
