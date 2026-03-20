## Why

DeprisaCheck migró desde PowerApps/SharePoint a una aplicación web propia, pero el panel de supervisión está vacío, la gestión operativa se hace directamente en base de datos, y el módulo de usuarios está incompleto. Esto impide que supervisores, administradores y asesores operen de forma autónoma sin depender del equipo técnico para tareas del día a día.

## What Changes

- **Nueva capacidad**: Panel de supervisión con métricas en tiempo real y listado filtrable de admisiones
- **Nueva capacidad**: Detalle de admisión con visualización del checklist completado y trazabilidad del flujo de estados
- **Nueva capacidad**: CRUD de plantillas de checklist desde la UI (reemplaza edición directa en BD)
- **Nueva capacidad**: CRUD de puntos de venta desde la UI (reemplaza POS hardcodeados en frontend)
- **Nueva capacidad**: Gestión de restricciones por cliente desde la UI
- **Capacidad modificada**: Módulo de usuarios — agregar asignación de POS, estado activo/inactivo y cambio de contraseña

## Capabilities

### New Capabilities

- `supervisor-dashboard`: Panel de métricas y listado de admisiones con filtros por POS, tipo de mercancía y rango de fechas
- `admission-detail`: Vista de detalle de una admisión incluyendo checklist completado, estados del flujo y trazabilidad
- `checklist-template-management`: CRUD completo de plantillas de checklist y sus items (preguntas) por tipo de mercancía y tipo de POS
- `point-of-sale-management`: CRUD de puntos de venta que reemplaza los valores hardcodeados en el frontend
- `client-restriction-management`: Gestión de restricciones de tipos de mercancía por cliente desde la UI

### Modified Capabilities

- `user-management`: Extensión del módulo existente para incluir asignación de punto de venta, estado activo/inactivo y cambio de contraseña desde el panel admin

## Impact

**Backend — nuevos endpoints:**
- `GET /api/admissions` — listado paginado con filtros (POS, tipo, fechas, estado)
- `GET /api/admissions/:id` — detalle de admisión con checklist asociado
- `GET /api/metrics` — agregados de admisiones (total, por estado, por POS)
- `GET/POST/PUT/DELETE /api/checklist-templates` — CRUD de plantillas
- `GET/POST/PUT/DELETE /api/checklist-templates/:id/items` — CRUD de items de plantilla
- `GET/POST/PUT/DELETE /api/points-of-sale` — CRUD de POS
- `GET/POST/DELETE /api/client-restrictions` — gestión de restricciones
- `PATCH /api/users/:id/password` — cambio de contraseña
- `PATCH /api/users/:id/status` — activar/desactivar usuario

**Frontend — páginas nuevas/modificadas:**
- `Supervisor.tsx` — panel completo con métricas, tabla y filtros
- `AdmissionDetail.tsx` — nueva página de detalle
- `ChecklistTemplates.tsx` — nueva página de gestión de plantillas
- `PointsOfSale.tsx` — nueva página de gestión de POS
- `ClientRestrictions.tsx` — nueva página de restricciones
- `Users.tsx` — extensión del componente existente

**Base de datos:** sin cambios en schema (Prisma ya tiene todos los modelos necesarios)

**Sin impacto en:** flujo de admisión existente, DeprisaCheck checklist flow, autenticación actual (x-user-id header se mantiene)
