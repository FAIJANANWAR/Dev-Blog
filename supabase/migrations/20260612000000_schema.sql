-- Create User Roles Enum
CREATE TYPE user_role AS ENUM ('author', 'admin');

-- Create Post Status Enum
CREATE TYPE post_status AS ENUM ('Draft', 'Published');

-- Create Users Table in Public Schema
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'author' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Posts Table in Public Schema
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary VARCHAR(250) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  status post_status DEFAULT 'Draft' NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE, -- Support for soft deletes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on both tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
-- -------------------------------------------------------------

-- Trigger function to automatically sync new users from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'name', 
      split_part(new.email, '@', 1), 
      'Anonymous'
    ),
    new.email,
    COALESCE(
      (new.raw_user_meta_data->>'role')::user_role, 
      'author'::user_role
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function to update updated_at automatically on update
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger binding for posts
CREATE OR REPLACE TRIGGER on_post_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

-- -------------------------------------------------------------
-- USERS TABLE RLS POLICIES
-- -------------------------------------------------------------

CREATE POLICY "Allow public read access to users" 
  ON public.users
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow users to update their own profile" 
  ON public.users
  FOR UPDATE 
  USING (auth.uid() = id);

-- -------------------------------------------------------------
-- POSTS TABLE RLS POLICIES
-- -------------------------------------------------------------

-- SELECT policies
CREATE POLICY "Allow public read access to published posts" 
  ON public.posts
  FOR SELECT 
  USING (status = 'Published' AND deleted_at IS NULL);

CREATE POLICY "Allow users to read their own posts" 
  ON public.posts
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to read all posts" 
  ON public.posts
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- INSERT policies
CREATE POLICY "Allow authenticated users to insert posts" 
  ON public.posts
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policies
CREATE POLICY "Allow users to update their own posts" 
  ON public.posts
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to update any post" 
  ON public.posts
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- DELETE policies (hard deletes, though backend does soft deletes by default)
CREATE POLICY "Allow users to delete their own posts" 
  ON public.posts
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to delete any post" 
  ON public.posts
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
