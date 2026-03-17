-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'UTME Master',
    "siteDescription" TEXT NOT NULL DEFAULT 'Professional UTME Examination System',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maxUploadSize" INTEGER NOT NULL DEFAULT 5,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos',
    "enableTwoFactor" BOOLEAN NOT NULL DEFAULT true,
    "passwordMinLength" INTEGER NOT NULL DEFAULT 8,
    "passwordExpiry" INTEGER NOT NULL DEFAULT 90,
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "lockoutDuration" INTEGER NOT NULL DEFAULT 15,
    "enableAuditLog" BOOLEAN NOT NULL DEFAULT true,
    "enableNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smtpHost" TEXT NOT NULL DEFAULT 'smtp.gmail.com',
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpUsername" TEXT NOT NULL DEFAULT '',
    "smtpPassword" TEXT NOT NULL DEFAULT '',
    "fromEmail" TEXT NOT NULL DEFAULT 'noreply@utmemaster.com',
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
