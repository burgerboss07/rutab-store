-- Add address column to profiles table for customer saved addresses
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
