-- Extend owner type enum
ALTER TYPE "OwnerType" ADD VALUE IF NOT EXISTS 'COMPANY';

-- Create owner status enum when missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OwnerStatus') THEN
    CREATE TYPE "OwnerStatus" AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED');
  END IF;
END $$;

-- Create audit actor enum when missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditActorType') THEN
    CREATE TYPE "AuditActorType" AS ENUM ('ADMIN', 'OWNER', 'SYSTEM');
  END IF;
END $$;

-- Owners
ALTER TABLE "owners"
  ADD COLUMN IF NOT EXISTS "status" "OwnerStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "district_label" TEXT,
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "admin_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMP(3);

UPDATE "owners"
SET "status" = 'ACTIVE'
WHERE "is_active" = true
  AND "status" = 'PENDING_REVIEW';

UPDATE "owners"
SET "status" = 'SUSPENDED'
WHERE "is_active" = false
  AND "status" = 'PENDING_REVIEW';

-- Villas
ALTER TABLE "villas"
  ADD COLUMN IF NOT EXISTS "review_requested_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "owner_revision_notes" TEXT;

-- Inquiries
ALTER TABLE "inquiries"
  ADD COLUMN IF NOT EXISTS "owner_seen_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "owner_note" TEXT;

-- Audit logs
ALTER TABLE "audit_logs"
  ADD COLUMN IF NOT EXISTS "actor_type" "AuditActorType" NOT NULL DEFAULT 'SYSTEM';
