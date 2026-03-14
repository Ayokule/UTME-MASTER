/*
  Warnings:

  - The `license_tier` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LicenseTier" AS ENUM ('TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "license_id" TEXT,
DROP COLUMN "license_tier",
ADD COLUMN     "license_tier" "LicenseTier" NOT NULL DEFAULT 'TRIAL';

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "license_key" TEXT NOT NULL,
    "tier" "LicenseTier" NOT NULL DEFAULT 'TRIAL',
    "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "organization_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "hardware_fingerprint" TEXT,
    "is_activated" BOOLEAN NOT NULL DEFAULT false,
    "activated_at" TIMESTAMP(3),
    "trial_start_date" TIMESTAMP(3),
    "trial_end_date" TIMESTAMP(3),
    "purchase_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "max_students" INTEGER NOT NULL DEFAULT 50,
    "max_questions" INTEGER NOT NULL DEFAULT 500,
    "current_students" INTEGER NOT NULL DEFAULT 0,
    "current_questions" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL DEFAULT '{}',
    "last_renewal_date" TIMESTAMP(3),
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_activations" (
    "id" TEXT NOT NULL,
    "license_id" TEXT NOT NULL,
    "hardware_fingerprint" TEXT NOT NULL,
    "cpu_id" TEXT NOT NULL,
    "motherboard_serial" TEXT NOT NULL,
    "mac_address" TEXT NOT NULL,
    "computer_name" TEXT,
    "os_version" TEXT,
    "ip_address" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "license_activations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "licenses_license_key_key" ON "licenses"("license_key");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_hardware_fingerprint_key" ON "licenses"("hardware_fingerprint");

-- CreateIndex
CREATE INDEX "licenses_license_key_idx" ON "licenses"("license_key");

-- CreateIndex
CREATE INDEX "licenses_status_idx" ON "licenses"("status");

-- CreateIndex
CREATE INDEX "licenses_tier_idx" ON "licenses"("tier");

-- CreateIndex
CREATE INDEX "licenses_hardware_fingerprint_idx" ON "licenses"("hardware_fingerprint");

-- CreateIndex
CREATE INDEX "license_activations_license_id_idx" ON "license_activations"("license_id");

-- CreateIndex
CREATE INDEX "license_activations_hardware_fingerprint_idx" ON "license_activations"("hardware_fingerprint");

-- AddForeignKey
ALTER TABLE "license_activations" ADD CONSTRAINT "license_activations_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
