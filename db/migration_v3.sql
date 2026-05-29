-- Add payment_proof column to orders table for transaction proof images
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof text;
