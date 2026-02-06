-- FinGenie: Seed data for testing
-- Replace 'YOUR_USER_UUID' with an actual user UUID from auth.users after signing up.

-- Usage:
--   1. Sign up in the app to create your user account
--   2. Find your user UUID: SELECT id FROM auth.users WHERE email = 'your@email.com';
--   3. Replace YOUR_USER_UUID below with that UUID
--   4. Run this SQL in the Supabase SQL Editor

DO $$
DECLARE
  uid uuid := 'YOUR_USER_UUID';
BEGIN

INSERT INTO public.expenses (user_id, date, description, amount, category) VALUES
  (uid, '2024-01-05', 'Grocery shopping',     75.50,  'Food'),
  (uid, '2024-01-10', 'Electric bill',         95.00,  'Utilities'),
  (uid, '2024-01-15', 'Rent payment',        1500.00,  'Housing'),
  (uid, '2024-01-18', 'Coffee shop',            4.25,  'Food'),
  (uid, '2024-01-22', 'Bus pass',              65.00,  'Transport'),
  (uid, '2024-01-28', 'Dinner with friends',  120.00,  'Social'),
  (uid, '2024-02-01', 'Rent payment',        1500.00,  'Housing'),
  (uid, '2024-02-03', 'Grocery shopping',      82.30,  'Food'),
  (uid, '2024-02-07', 'Internet bill',         60.00,  'Utilities'),
  (uid, '2024-02-10', 'Movie tickets',         32.00,  'Entertainment'),
  (uid, '2024-02-14', 'Valentine dinner',      95.00,  'Social'),
  (uid, '2024-02-18', 'Textbooks',            145.00,  'Education'),
  (uid, '2024-02-25', 'Doctor visit copay',    40.00,  'Healthcare'),
  (uid, '2024-03-01', 'Rent payment',        1500.00,  'Housing'),
  (uid, '2024-03-05', 'Grocery shopping',      68.90,  'Food'),
  (uid, '2024-03-10', 'Gas bill',              45.00,  'Utilities'),
  (uid, '2024-03-15', 'Uber rides',            28.50,  'Transport'),
  (uid, '2024-03-20', 'Concert tickets',       75.00,  'Entertainment'),
  (uid, '2024-04-01', 'Rent payment',        1500.00,  'Housing'),
  (uid, '2024-04-08', 'Grocery shopping',      91.20,  'Food'),
  (uid, '2024-04-12', 'Online course',         49.99,  'Education'),
  (uid, '2024-04-18', 'Prescription refill',   25.00,  'Healthcare'),
  (uid, '2024-05-01', 'Rent payment',        1500.00,  'Housing'),
  (uid, '2024-05-10', 'Grocery shopping',      77.60,  'Food'),
  (uid, '2024-06-01', 'Rent payment',        1500.00,  'Housing');

END $$;
