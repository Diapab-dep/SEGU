-- Migration: add_audit_log_and_checklist_fields
-- AuditLog table
CREATE TABLE "AuditLog" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT,
    "username"   TEXT,
    "action"     TEXT NOT NULL,
    "entityType" TEXT,
    "entityId"   TEXT,
    "details"    TEXT,
    "ipAddress"  TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Index for common query patterns
CREATE INDEX "AuditLog_userId_idx"     ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx"     ON "AuditLog"("action");
CREATE INDEX "AuditLog_entityId_idx"   ON "AuditLog"("entityId");
CREATE INDEX "AuditLog_createdAt_idx"  ON "AuditLog"("createdAt");

-- Add createdByUserId to Merchandise
ALTER TABLE "Merchandise" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;

-- Add approval fields to MerchandiseChecklist
ALTER TABLE "MerchandiseChecklist" ADD COLUMN IF NOT EXISTS "approvedByUserId" TEXT;
ALTER TABLE "MerchandiseChecklist" ADD COLUMN IF NOT EXISTS "approvedAt"       TIMESTAMP(3);
