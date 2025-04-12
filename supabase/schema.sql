
-- Create tables

-- Users table extension to store additional user data
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "phone" TEXT,
  "default_hourly_rate" NUMERIC(10, 2),
  "default_working_hours" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS "events" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "date" DATE NOT NULL,
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  "is_recurring" BOOLEAN DEFAULT false,
  "recurrence_type" TEXT,
  "tags" TEXT[],
  "is_paid" BOOLEAN DEFAULT false,
  "hourly_rate" NUMERIC(10, 2),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS "expenses" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "category" TEXT NOT NULL,
  "amount" NUMERIC(10, 2) NOT NULL,
  "description" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget settings table
CREATE TABLE IF NOT EXISTS "budget_settings" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "income" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "savings_goal" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "categories" TEXT[] DEFAULT '{}',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "budget_settings" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read/update their own data
CREATE POLICY "Users can view own data" ON "users"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON "users"
  FOR UPDATE USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Users can view own events" ON "events"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON "events"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON "events"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON "events"
  FOR DELETE USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON "expenses"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON "expenses"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON "expenses"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON "expenses"
  FOR DELETE USING (auth.uid() = user_id);

-- Budget settings policies
CREATE POLICY "Users can view own budget settings" ON "budget_settings"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget settings" ON "budget_settings"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget settings" ON "budget_settings"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget settings" ON "budget_settings"
  FOR DELETE USING (auth.uid() = user_id);
