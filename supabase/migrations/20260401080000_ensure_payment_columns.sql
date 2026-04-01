ALTER TABLE IF EXISTS calendar_slots 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS receipt_data text;
