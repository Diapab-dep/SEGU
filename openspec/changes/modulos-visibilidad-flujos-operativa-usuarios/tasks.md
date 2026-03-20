## 1. Migración de Schema y Base

- [x] 1.1 Agregar campo `isActive Boolean @default(true)` al modelo `User` en `prisma/schema.prisma`
- [x] 1.2 Ejecutar `prisma migrate dev --name add-user-isactive` y verificar que todos los usuarios existentes quedan con `isActive: true`
- [x] 1.3 Regenerar cliente Prisma (`prisma generate`) y verificar que compila sin errores

## 2. Backend — Supervisor Dashboard

- [x] 2.1 Crear `src/repositories/supervisor.repository.ts` con métodos `listAdmissions(filters, page, limit)` y `getMetrics(filters)` usando `prisma.merchandise.findMany` con includes de Client, PointOfSale, MerchandiseTypeCatalog y MerchandiseChecklist
- [x] 2.2 Crear `src/api/routes/supervisor.routes.ts` con `GET /api/admissions` (paginado, filtros: posId, merchandiseTypeId, status, from, to) y `GET /api/metrics`
- [x] 2.3 Registrar `supervisorRoutes` en `src/api/index.ts`
- [x] 2.4 Verificar que el endpoint `/api/admissions` devuelve `{ data, total, page, limit }` correctamente

## 3. Backend — Detalle de Admisión

- [x] 3.1 Agregar método `findByIdWithDetails(id)` al repositorio de supervisor (o merchandise) que incluya Client, PointOfSale, MerchandiseTypeCatalog, MerchandiseChecklist con ChecklistTemplate e items
- [x] 3.2 Agregar endpoint `GET /api/admissions/:id` en `supervisor.routes.ts`
- [x] 3.3 Verificar respuesta 404 cuando el id no existe

## 4. Backend — Puntos de Venta

- [x] 4.1 Crear `src/api/routes/points-of-sale.routes.ts` con `GET /api/points-of-sale`, `GET /api/points-of-sale/all`, `POST`, `PUT /:id` y `PATCH /:id/toggle`
- [x] 4.2 Registrar la ruta en `src/api/index.ts`
- [x] 4.3 Verificar que `GET /api/points-of-sale` solo devuelve POS con `isActive: true`

## 5. Backend — Plantillas de Checklist

- [x] 5.1 Crear `src/api/routes/checklist-templates.routes.ts` con CRUD de plantillas: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/toggle`
- [x] 5.2 Agregar endpoints de items: `POST /:id/items`, `PUT /:id/items/:itemId`, `DELETE /:id/items/:itemId`, `PUT /:id/items/reorder`
- [x] 5.3 Implementar la lógica de reordenamiento en una transacción Prisma (`prisma.$transaction`)
- [x] 5.4 Implementar validación en DELETE de plantilla: rechazar con 409 si tiene `MerchandiseChecklist` asociados
- [x] 5.5 Registrar la ruta en `src/api/index.ts`

## 6. Backend — Restricciones de Clientes

- [x] 6.1 Crear `src/api/routes/client-restrictions.routes.ts` con `GET /api/clients`, `GET /api/clients/:id/restrictions`, `POST /api/client-restrictions`, `DELETE /api/client-restrictions/:id`
- [x] 6.2 Implementar validación de duplicados (409) en POST
- [x] 6.3 Implementar soft delete en DELETE (marcar `isActive: false`, no eliminar el registro)
- [x] 6.4 Registrar la ruta en `src/api/index.ts`

## 7. Backend — Usuarios (extensión)

- [x] 7.1 Actualizar `GET /api/users` para incluir `isActive` y `pointOfSale.name` en la respuesta
- [x] 7.2 Agregar endpoint `PATCH /api/users/:id/status` (body: `{ isActive: boolean }`) en `users.routes.ts`
- [x] 7.3 Agregar endpoint `PATCH /api/users/:id/password` (body: `{ newPassword: string }`) con validación mínimo 6 caracteres
- [x] 7.4 Actualizar `POST /api/deprisacheck/login` para rechazar con 403 usuarios con `isActive: false`
- [x] 7.5 Actualizar `PUT /api/users/:id` para permitir actualizar `pointOfSaleId`

## 8. Frontend — Cliente API

- [x] 8.1 Agregar métodos al `api/client.ts` del frontend: `getAdmissions(filters)`, `getMetrics(filters)`, `getAdmissionDetail(id)`, `getPointsOfSale()`, `createPointOfSale(data)`, `updatePointOfSale(id, data)`, `togglePointOfSale(id)`, `getChecklistTemplates()`, `getChecklistTemplate(id)`, `createChecklistTemplate(data)`, `updateChecklistTemplate(id, data)`, `deleteChecklistTemplate(id)`, `toggleChecklistTemplate(id)`, `addTemplateItem(templateId, data)`, `updateTemplateItem(templateId, itemId, data)`, `deleteTemplateItem(templateId, itemId)`, `reorderTemplateItems(templateId, items)`, `getClients()`, `getClientRestrictions(clientId)`, `createClientRestriction(data)`, `deleteClientRestriction(id)`, `updateUserStatus(id, isActive)`, `changeUserPassword(id, newPassword)`

## 9. Frontend — Panel Supervisor

- [x] 9.1 Reescribir `frontend/src/pages/Supervisor.tsx` con tarjetas de métricas (Total, Pendientes, Aceptadas, Rechazadas)
- [x] 9.2 Agregar controles de filtro: selector POS (desde API), selector tipo de mercancía, selector rango (Hoy / Esta semana / Rango personalizado)
- [x] 9.3 Agregar tabla de admisiones con columnas: Fecha/Hora, Cliente, Tipo, POS, Estado y filas clickeables
- [x] 9.4 Implementar guard de rol: redirigir a `/` si `role === 'asesor'`

## 10. Frontend — Detalle de Admisión

- [x] 10.1 Crear `frontend/src/pages/AdmissionDetail.tsx` con cabecera (cliente, POS, tipo, fecha)
- [x] 10.2 Implementar indicador visual del flujo de estados (pendiente → deprisacheck → aceptado/rechazado)
- [x] 10.3 Mostrar razón de rechazo si aplica
- [x] 10.4 Mostrar checklist colapsable con preguntas y respuestas si existe
- [x] 10.5 Agregar ruta `/admissions/:id` en `App.tsx`

## 11. Frontend — Gestión de Puntos de Venta

- [x] 11.1 Crear `frontend/src/pages/PointsOfSale.tsx` con tabla y formulario modal (nombre, tipo)
- [x] 11.2 Implementar acciones: Crear, Editar, Activar/Desactivar
- [x] 11.3 Agregar ruta `/points-of-sale` en `App.tsx` (solo admin)
- [x] 11.4 Agregar card "Puntos de Venta" en `Dashboard.tsx` para rol admin

## 12. Frontend — Gestión de Plantillas de Checklist

- [x] 12.1 Crear `frontend/src/pages/ChecklistTemplates.tsx` con lista de plantillas agrupadas por tipo de mercancía
- [x] 12.2 Implementar panel de items: lista ordenada con botones Editar / Eliminar / reordenar (↑↓)
- [x] 12.3 Implementar formulario de nueva plantilla (modal) y nueva pregunta
- [x] 12.4 Agregar ruta `/checklist-templates` en `App.tsx` (solo admin)
- [x] 12.5 Agregar card "Plantillas de Checklist" en `Dashboard.tsx` para rol admin

## 13. Frontend — Gestión de Restricciones

- [x] 13.1 Crear `frontend/src/pages/ClientRestrictions.tsx` con selector de cliente y lista de restricciones
- [x] 13.2 Implementar agregar y eliminar restricción con confirmación
- [x] 13.3 Agregar ruta `/client-restrictions` en `App.tsx` (solo admin)
- [x] 13.4 Agregar card "Restricciones de Clientes" en `Dashboard.tsx` para rol admin

## 14. Frontend — Módulo de Usuarios (extensión)

- [x] 14.1 Actualizar `Users.tsx`: agregar selector de POS en el formulario de crear/editar (obtiene POS de API)
- [x] 14.2 Agregar columna "POS asignado" y columna "Estado" en la tabla de usuarios
- [x] 14.3 Agregar botón "Activar/Desactivar" por usuario con confirmación
- [x] 14.4 Agregar botón "Cambiar contraseña" con modal de nueva contraseña (mínimo 6 caracteres)

## 15. Frontend — Eliminar POS Hardcodeados

- [x] 15.1 Actualizar `Admission.tsx` para cargar POS desde `GET /api/points-of-sale` en lugar del array estático
- [x] 15.2 Verificar y actualizar cualquier otro componente con POS hardcodeados (buscar en todo el frontend con grep)

## 16. Verificación Final

- [x] 16.1 Ejecutar `npm run build` y corregir errores de TypeScript
- [x] 16.2 Verificar flujo completo de admisión existente (no debe romperse)
- [x] 16.3 Verificar que el panel supervisor muestra datos reales de admisiones creadas en el flujo
- [x] 16.4 Actualizar `VERSIONING.md` a versión `1.1.0` (cambio MINOR: nuevas capacidades de backend/API)
