-- SQL Migration to create profiles table and enable secure read/write policies
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/sxmvfoepgrezfdjwyliy/sql/new

-- 1. Create public.profiles table referencing auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies to govern secure client-side access
-- Users can read only their own profile; admins/managers can read all
CREATE POLICY "Allow individual or admin read" ON public.profiles 
  FOR SELECT USING (
    auth.uid() = id 
    OR auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager')
    )
  );

-- Allows client-side registration script to insert newly created profiles
CREATE POLICY "Allow individual insert" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allows users to modify only their own profile details
CREATE POLICY "Allow individual update" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);
