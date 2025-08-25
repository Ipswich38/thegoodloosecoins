-- The Good Loose Coins - Supabase Database Schema (Fixed Version)
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserType') THEN
        CREATE TYPE "UserType" AS ENUM ('DONOR', 'DONEE');
    END IF;
END
$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PledgeStatus') THEN
        CREATE TYPE "PledgeStatus" AS ENUM ('PENDING', 'TASK1_COMPLETE', 'TASK2_COMPLETE', 'COMPLETED');
    END IF;
END
$$;

-- Drop existing tables if they have issues (be careful - this deletes data!)
DROP TABLE IF EXISTS "social_impact_points" CASCADE;
DROP TABLE IF EXISTS "donations" CASCADE;
DROP TABLE IF EXISTS "pledges" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Users table with proper UUID default
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" TEXT NOT NULL,
    "email" TEXT,
    "type" "UserType" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Pledges table
CREATE TABLE "pledges" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "donor_id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amount_sent" DOUBLE PRECISION DEFAULT 0,
    "completion_percentage" DOUBLE PRECISION DEFAULT 0,
    "status" "PledgeStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "pledges_pkey" PRIMARY KEY ("id")
);

-- Donations table
CREATE TABLE "donations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "pledge_id" UUID NOT NULL,
    "beneficiary_id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- Social Impact Points table
CREATE TABLE "social_impact_points" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "social_impact_points_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "social_impact_points_user_id_key" ON "social_impact_points"("user_id");

-- Add foreign key constraints
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_donor_id_fkey" 
FOREIGN KEY ("donor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "donations" ADD CONSTRAINT "donations_pledge_id_fkey" 
FOREIGN KEY ("pledge_id") REFERENCES "pledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "donations" ADD CONSTRAINT "donations_beneficiary_id_fkey" 
FOREIGN KEY ("beneficiary_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "social_impact_points" ADD CONSTRAINT "social_impact_points_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pledges_updated_at BEFORE UPDATE ON "pledges"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON "donations"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_impact_points_updated_at BEFORE UPDATE ON "social_impact_points"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert test users with proper UUIDs
INSERT INTO "users" ("username", "email", "type") VALUES
    ('testdonor', 'donor@test.com', 'DONOR'),
    ('testdonee', 'donee@test.com', 'DONEE'),
    ('admin', 'admin@test.com', 'DONOR');

-- Create initial social impact points records for users
INSERT INTO "social_impact_points" ("user_id", "points")
SELECT "id", 0 FROM "users";