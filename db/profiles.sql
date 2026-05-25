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
-- Allows all users (and your Admin panel) to view public profiles
CREATE POLICY "Allow public read access" ON public.profiles 
  FOR SELECT USING (true);

-- Allows client-side registration script to insert newly created profiles
CREATE POLICY "Allow individual insert" ON public.profiles 
  FOR INSERT WITH CHECK (true);

-- Allows users to modify only their own profile details
CREATE POLICY "Allow individual update" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);
