# Estrategia de Migración: Power Apps → Aplicación Web

## Contexto

DeprisaCheck está actualmente en Power Apps con listas de comprobación por tipo de mercancía:
- ANIMALES VIVOS
- RESTOS HUMANOS
- PERECEDEROS
- ARMAS
- BATERÍAS DE LITIO
- RADIACTIVOS Y NO RADIACTIVOS
- SUSTANCIAS BIOLÓGICAS
- HIELO SECO

La clasificación de mercancía peligrosa/especial **no** se determina por códigos IATA/IMO, sino por la selección explícita del asesor del tipo de mercancía.

## Fases de Migración

| Fase | Acción | Estado |
|------|--------|--------|
| 1 | API backend con catálogo de tipos y validaciones | ✅ Completada |
| 2 | Exportar listas de Power Apps (SharePoint/Dataverse) | Pendiente |
| 3 | Importar plantillas a `ChecklistTemplate` y `ChecklistTemplateItem` | Pendiente |
| 4 | Desarrollar app web (React/Vue) que consuma la API | Pendiente |
| 5 | (Opcional) Power Apps consume API temporalmente | Pendiente |
| 6 | Retirar Power Apps | Pendiente |

## Catálogo de Tipos

El endpoint `GET /api/merchandise-types` devuelve el catálogo para que el asesor seleccione el tipo al iniciar la admisión. Cada tipo indica `requiresChecklist`.

## Flujo de Admisión Actualizado

1. Asesor consulta `GET /api/merchandise-types`
2. Asesor selecciona `merchandiseTypeId`
3. `POST /api/admission/start` con `{ merchandiseData: { merchandiseTypeId, ... } }`
4. Si el tipo tiene `requiresChecklist` → flujo DeprisaCheck
