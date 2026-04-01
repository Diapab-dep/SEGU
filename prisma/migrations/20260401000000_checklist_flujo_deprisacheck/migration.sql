-- Migración: ajustes según flujo DeprisaCheck documentado en PDF
-- Fecha: 2026-04-01

-- 1. MerchandiseTypeCatalog: campo category (especial / peligrosa)
ALTER TABLE "MerchandiseTypeCatalog" ADD COLUMN IF NOT EXISTS "category" TEXT;

-- 2. ChecklistTemplateItem: campos para segmento, rechazo automático y ampliación
ALTER TABLE "ChecklistTemplateItem" ADD COLUMN IF NOT EXISTS "segment"         TEXT;
ALTER TABLE "ChecklistTemplateItem" ADD COLUMN IF NOT EXISTS "rejectsOnYes"    BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "ChecklistTemplateItem" ADD COLUMN IF NOT EXISTS "hasExpansion"    BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "ChecklistTemplateItem" ADD COLUMN IF NOT EXISTS "expansionLabel"  TEXT;

-- 3. MerchandiseChecklist: registro de tiempo, guía, email cliente y observaciones
ALTER TABLE "MerchandiseChecklist" ADD COLUMN IF NOT EXISTS "startTime"     TIMESTAMP(3);
ALTER TABLE "MerchandiseChecklist" ADD COLUMN IF NOT EXISTS "endTime"        TIMESTAMP(3);
ALTER TABLE "MerchandiseChecklist" ADD COLUMN IF NOT EXISTS "guideNumber"    TEXT;
ALTER TABLE "MerchandiseChecklist" ADD COLUMN IF NOT EXISTS "clientEmail"    TEXT;
ALTER TABLE "MerchandiseChecklist" ADD COLUMN IF NOT EXISTS "observations"   TEXT;
ALTER TABLE "MerchandiseChecklist" ADD COLUMN IF NOT EXISTS "rejectedItems"  TEXT;

-- 4. Actualizar categorías en tipos existentes
UPDATE "MerchandiseTypeCatalog" SET "category" = 'especial'   WHERE "code" IN ('ANIMALES_VIVOS','RESTOS_HUMANOS','ARMAS','PERECEDEROS');
UPDATE "MerchandiseTypeCatalog" SET "category" = 'peligrosa'  WHERE "code" IN ('BATERIAS_LITIO','HIELO_SECO','RADIACTIVOS','SUSTANCIAS_BIOLOGICAS');

-- 5. Separar NO_RADIACTIVOS de RADIACTIVOS si aún está unificado
-- Renombrar el código genérico 'RADIACTIVOS' a 'RADIACTIVOS' (material radiactivo)
UPDATE "MerchandiseTypeCatalog" SET "name" = 'Radiactivos', "category" = 'peligrosa'
  WHERE "code" = 'RADIACTIVOS';

-- Insertar NO_RADIACTIVOS si no existe
INSERT INTO "MerchandiseTypeCatalog" ("id","code","name","category","requiresChecklist","isActive","createdAt","updatedAt")
  SELECT gen_random_uuid()::text, 'NO_RADIACTIVOS', 'No radiactivos', 'peligrosa', TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM "MerchandiseTypeCatalog" WHERE "code" = 'NO_RADIACTIVOS');
