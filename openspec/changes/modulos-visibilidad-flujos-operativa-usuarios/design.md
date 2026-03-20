## Context

DeprisaCheck es una aplicación Express/TypeScript + React/Vite + PostgreSQL/Prisma que reemplaza un sistema PowerApps/SharePoint para la admisión de mercancías de DeprisaDocs. El flujo de admisión y DeprisaCheck (checklists) están completos. El schema de Prisma ya contiene todos los modelos necesarios (`Merchandise`, `MerchandiseChecklist`, `ChecklistTemplate`, `ChecklistTemplateItem`, `PointOfSale`, `ClientRestriction`, `User`). La autenticación es demo (header `x-user-id` opcional). No hay datos históricos a migrar (los CSVs de PowerApps quedan como archivo).

Estado actual de las páginas clave:
- `Supervisor.tsx` — vacía, solo texto placeholder
- `Users.tsx` — CRUD básico existente, sin asignación de POS ni estado activo/inactivo
- No existen páginas de gestión operativa

## Goals / Non-Goals

**Goals:**
- Habilitar al supervisor para ver métricas y admisiones sin intervención técnica
- Habilitar al admin para gestionar plantillas, POS y restricciones desde la UI
- Completar el módulo de usuarios con funciones faltantes
- Todos los cambios deben ser aditivos: no romper el flujo de admisión existente

**Non-Goals:**
- Autenticación JWT (fuera de scope, se mantiene header x-user-id)
- Migración de datos históricos de PowerApps
- Cambios al schema de Prisma (el modelo ya es suficiente)
- Exportación a PDF/Excel (fase futura)
- Notificaciones en tiempo real / WebSockets

## Decisions

### D1: Todos los nuevos endpoints en routers Express separados

**Decisión:** Crear archivos de rutas nuevos por dominio (`supervisor.routes.ts`, `checklist-templates.routes.ts`, `points-of-sale.routes.ts`, `client-restrictions.routes.ts`) y registrarlos en `src/api/index.ts`.

**Alternativa descartada:** Agregar los endpoints a routers existentes (ej. `admission.routes.ts`). Se descarta porque mezclaría responsabilidades y dificultaría el mantenimiento.

**Rationale:** El patrón ya existe en el proyecto. Cada router tiene su propio archivo y se registra en `index.ts`.

---

### D2: Métricas calculadas en el servidor, no en el cliente

**Decisión:** `GET /api/metrics` devuelve los agregados pre-calculados con `prisma.merchandise.groupBy()` y `prisma.merchandise.count()`.

**Alternativa descartada:** Traer todos los registros al frontend y calcular allí. Se descarta por rendimiento y porque el volumen de datos puede crecer.

**Rationale:** Las queries de agregación en Prisma son eficientes y evitan transferir datos innecesarios.

---

### D3: Paginación simple con offset/limit en listado de admisiones

**Decisión:** `GET /api/admissions?page=1&limit=20&posId=...&typeId=...&from=...&to=...&status=...`

**Alternativa descartada:** Cursor-based pagination. Más compleja de implementar y no necesaria para los volúmenes esperados.

**Rationale:** El supervisor filtra por día/semana habitualmente, el resultado es acotado. Offset/limit es suficiente.

---

### D4: Reordenamiento de items de plantilla por campo `order` (entero)

**Decisión:** El frontend envía el array de items con su nuevo orden y el backend actualiza todos los `order` en una transacción.

**Alternativa descartada:** Drag-and-drop con linked list (prev/next). Más complejo, no aporta valor en este contexto.

**Rationale:** El modelo `ChecklistTemplateItem` ya tiene el campo `order: Int`. La UI puede mostrar botones arriba/abajo o drag simple.

---

### D5: Soft delete para usuarios (campo `isActive`)

**Decisión:** El schema `User` ya tiene `isDeprisacheckEnabled`. Agregar `isActive: Boolean @default(true)` al modelo. El endpoint `PATCH /api/users/:id/status` solo cambia este flag. El login y los filtros de listado respetan este campo.

**Alternativa descartada:** Eliminación física. Se descarta porque el historial de admisiones referencia `completedByUserId` y borrar el usuario rompería esa trazabilidad.

**Rationale:** Preserva integridad referencial y permite reactivar usuarios si es necesario.

> **Nota:** Este es el único cambio de schema requerido. Requiere una migración de Prisma (`prisma migrate dev`).

---

### D6: POS cargados desde API en el frontend (no hardcodeados)

**Decisión:** El cliente React llama a `GET /api/points-of-sale` al cargar las páginas que necesiten el listado (Admission, Users, filtros del Supervisor). Se cachea en el componente con `useEffect`.

**Alternativa descartada:** Mantener el array hardcodeado y solo agregar la UI de gestión. Se descarta porque los POS deben ser la fuente de verdad de la BD.

**Rationale:** Elimina la deuda técnica del hardcoding actual y hace que el CRUD de POS tenga efecto real en la aplicación.

---

### D7: Acceso por rol en el frontend con guard de navegación

**Decisión:** Las nuevas rutas de gestión operativa (`/checklist-templates`, `/points-of-sale`, `/client-restrictions`) solo son accesibles con `role === 'admin'`. El panel supervisor (`/supervisor`) es accesible para `admin` y `supervisor`. Se implementa con `Navigate` de React Router (patrón ya usado en `Users.tsx`).

**Rationale:** Patrón existente, consistente con el resto de la aplicación.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| El campo `isActive` en `User` requiere migración de Prisma | Ejecutar `prisma migrate dev` en el proceso de deploy. Es aditivo (default `true`), no rompe datos existentes. |
| El listado de admisiones puede crecer y paginar lento sin índices | Los campos `createdAt`, `status`, `pointOfSaleId`, `merchandiseTypeId` en `Merchandise` son candidatos a índice. Agregar en la migración si el volumen lo justifica. |
| El frontend actualmente hardcodea POS en varios lugares | Requiere auditar y reemplazar todos los puntos hardcodeados al implementar `point-of-sale-management`. Riesgo de dejar alguno sin actualizar. |
| Cambio de contraseña sin JWT real | La contraseña se actualiza por el admin sin verificación del usuario actual. Aceptable en el contexto demo actual; deberá revisarse cuando se implemente JWT. |

## Migration Plan

1. Aplicar migración Prisma: `prisma migrate dev --name add-user-isactive`
2. Agregar nuevos routers al backend (aditivo, sin breaking changes)
3. Actualizar `api/client.ts` del frontend con los nuevos métodos
4. Implementar páginas nuevas y modificar las existentes
5. Reemplazar POS hardcodeados en `Admission.tsx` y cualquier otro componente
6. Verificar con `npm run build` que no hay errores de TypeScript

**Rollback:** Como todos los cambios de backend son aditivos y el único cambio de schema tiene `@default(true)`, revertir es seguro. El único riesgo es si se eliminan POS desde la nueva UI que el flujo de admisión necesite — documentar en el manual de usuario.

## Open Questions

- ¿El supervisor necesita exportar el listado de admisiones (Excel/CSV)? → Postergado para fase siguiente.
- ¿Las restricciones de cliente deben poderse importar en bulk desde CSV? → Postergado.
- ¿Se necesita auditoría de quién modificó una plantilla? → No en esta fase.
