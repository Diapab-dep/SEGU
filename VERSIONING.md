# Control de Versiones — DeprisaCheck

Versión actual: `1.1.1` — ver `package.json` o `GET /api/version`.

---

## Reglas de versioning

| Tipo de cambio | Acción | Ejemplo |
|----------------|--------|---------|
| **Cambios incompatibles en API o flujo principal** | MAJOR | `1.x.x` → `2.0.0` |
| **Nuevas funciones o endpoints compatibles** | MINOR | `1.0.x` → `1.1.0` |
| **Correcciones, seguridad, ajustes de UI/docs** | PATCH | `1.1.0` → `1.1.1` |

La versión se expone en el Footer de la aplicación y en `GET /api/version`.

---

## Changelog

### v1.1.1 — 2026-03-19 — Seguridad

**Backend**
- `bcrypt` con 10 rounds reemplaza Base64 para hashing de contraseñas
- Validación de contraseña en login (antes el endpoint autenticaba sin verificar)
- `helmet` — headers HTTP de seguridad (CSP, HSTS, X-Frame-Options, etc.)
- `cors` — solo orígenes permitidos (`FRONTEND_URL` + `localhost:5173`)
- `express-rate-limit` — login: máx 10 intentos por IP cada 15 minutos
- `deleteUser` cambiado a soft delete (`isActive: false`) para preservar historial
- Soporte de migración automática: usuarios con contraseña legacy Base64 se validan en el login sin acción manual
- `nodemailer` actualizado a `8.0.3` (vulnerabilidad alta parcheada)

**Documentación**
- README completamente reescrito: incluye todos los módulos v1.1.0, tabla de seguridad, roles y permisos
- Manual de usuario actualizado: refleja autenticación real, todos los módulos nuevos (Supervisor, POS, Plantillas, Restricciones, Usuarios completo), checklist de validación extendido, solución de problemas actualizada
- VERSIONING.md — changelog completo

---

### v1.1.0 — 2026-03-19 — Módulos Visibilidad, Gestión Operativa y Usuarios

**Backend — nuevos endpoints**
- `GET /api/admissions` — lista paginada con filtros (POS, tipo, estado, fechas)
- `GET /api/admissions/metrics` — agregados por estado
- `GET /api/admissions/:id` — detalle completo con checklist
- `GET|POST|PUT|PATCH /api/points-of-sale` — CRUD puntos de venta con toggle activo
- `GET|POST|PUT|DELETE|PATCH /api/checklist-templates` — CRUD plantillas + ítems + reordenar
- `GET /api/clients`, `GET /api/clients/:id/restrictions` — consulta clientes y restricciones
- `POST|DELETE /api/client-restrictions` — gestión de restricciones por cliente
- `PATCH /api/users/:id/status` — activar/desactivar usuario (soft delete)
- `PATCH /api/users/:id/password` — cambio de contraseña desde admin
- Campo `isActive` en modelo `User` (migración: `ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true`)

**Frontend — nuevas páginas**
- `Supervisor.tsx` — panel de métricas + filtros + tabla paginada de admisiones
- `AdmissionDetail.tsx` — detalle de admisión con FlowIndicator visual
- `PointsOfSale.tsx` — CRUD puntos de venta con modal
- `ChecklistTemplates.tsx` — gestión de plantillas e ítems con reordenamiento ↑↓
- `ClientRestrictions.tsx` — gestión de restricciones por cliente
- `Users.tsx` — extendido con POS, activar/desactivar, cambio de contraseña
- `Admission.tsx` — POS cargado desde API (eliminado hardcoding)
- `Dashboard.tsx` — 3 nuevas tarjetas admin + card supervisor visible para admin

**CSS**
- `.metrics-grid`, `.metric-card`, `.filters-bar`, `.status-badge` (por estado), `.pagination`, `.detail-card`, `.detail-grid`, `.flow-indicator`, `.rejection-reason`

---

### v1.0.3 — 2026-03-18 — Proyecto base DeprisaCheck

**Backend**
- Modelos Prisma: Merchandise, Client, User, PointOfSale, MerchandiseTypeCatalog, ChecklistTemplate, ChecklistTemplateItem, MerchandiseChecklist, Guide, Manifest, ClientRestriction
- Servicios: Admission, DeprisaCheck, Rejection, Guide, Manifest
- API: admission, deprisacheck, users, merchandise-types, checklists, guides, manifests, operations
- Pruebas de integración (9 tests) y E2E con Playwright

**Frontend**
- Login, Dashboard, Admission, DeprisaCheck, Supervisor (placeholder), Users
- AuthContext con roles: asesor, supervisor, admin
- Layout, Footer con versión

---

## Próximos pasos recomendados

| Prioridad | Tarea |
|-----------|-------|
| P1 | Autenticación con JWT (reemplazar `x-user-id` header) |
| P1 | Middleware de autorización por rol en todos los endpoints |
| P2 | Migración transparente de contraseñas legacy a bcrypt al primer login |
| P2 | CI/CD pipeline (GitHub Actions ya configurado en `.github/`) |
| P3 | Monitoreo y alertas en producción |
