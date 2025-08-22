-- Create enums
CREATE TYPE "UserType" AS ENUM ('DONOR', 'DONEE');
CREATE TYPE "PledgeStatus" AS ENUM ('PENDING', 'TASK1_COMPLETE', 'TASK2_COMPLETE', 'COMPLETED');

-- Create users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "type" "UserType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create pledges table
CREATE TABLE "pledges" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "donor_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PledgeStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pledges_pkey" PRIMARY KEY ("id")
);

-- Create donations table
CREATE TABLE "donations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "pledge_id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- Create social_impact_points table
CREATE TABLE "social_impact_points" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "social_impact_points_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "social_impact_points_user_id_key" ON "social_impact_points"("user_id");

-- Add foreign key constraints
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "donations" ADD CONSTRAINT "donations_pledge_id_fkey" FOREIGN KEY ("pledge_id") REFERENCES "pledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "donations" ADD CONSTRAINT "donations_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;