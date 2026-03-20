## ADDED Requirements

### Requirement: CRUD de plantillas de checklist
El sistema SHALL exponer los siguientes endpoints, accesibles solo para el rol `admin`:
- `GET /api/checklist-templates` — lista todas las plantillas con su tipo de mercancía, tipo de POS y conteo de items
- `GET /api/checklist-templates/:id` — detalle de una plantilla con todos sus items ordenados por `order`
- `POST /api/checklist-templates` — crea una plantilla (campos: `name`, `merchandiseTypeId`, `pointOfSaleType`, `rejectionTemplateId?`)
- `PUT /api/checklist-templates/:id` — actualiza campos de la plantilla
- `DELETE /api/checklist-templates/:id` — elimina una plantilla (solo si no tiene checklists completados asociados)
- `PATCH /api/checklist-templates/:id/toggle` — activa o desactiva la plantilla (`isActive`)

#### Scenario: Crear plantilla exitosamente
- **WHEN** el admin envía `POST /api/checklist-templates` con `name`, `merchandiseTypeId` válido y `pointOfSaleType` (`city` o `ato`)
- **THEN** el sistema crea la plantilla y devuelve el objeto creado con HTTP 201

#### Scenario: Eliminar plantilla con checklists asociados
- **WHEN** el admin intenta `DELETE /api/checklist-templates/:id` y existen `MerchandiseChecklist` que referencian esa plantilla
- **THEN** el sistema devuelve HTTP 409 con mensaje "No se puede eliminar una plantilla con checklists completados asociados"

#### Scenario: Desactivar plantilla
- **WHEN** el admin llama a `PATCH /api/checklist-templates/:id/toggle` sobre una plantilla activa
- **THEN** el sistema cambia `isActive` a `false` y la plantilla deja de ser seleccionada en nuevos flujos de admisión

---

### Requirement: CRUD de items de plantilla
El sistema SHALL exponer los siguientes endpoints para gestionar preguntas dentro de una plantilla:
- `POST /api/checklist-templates/:id/items` — agrega un item (campos: `text`, `required`, `order`)
- `PUT /api/checklist-templates/:id/items/:itemId` — edita texto, requerido u orden de un item
- `DELETE /api/checklist-templates/:id/items/:itemId` — elimina un item
- `PUT /api/checklist-templates/:id/items/reorder` — actualiza el orden de todos los items (recibe array `[{ id, order }]`) en una transacción

#### Scenario: Agregar pregunta a plantilla
- **WHEN** el admin envía `POST /api/checklist-templates/:id/items` con `text` y `required`
- **THEN** el sistema crea el item y lo asigna al final (`order` = max actual + 1)

#### Scenario: Reordenar preguntas
- **WHEN** el admin envía `PUT /api/checklist-templates/:id/items/reorder` con el nuevo orden
- **THEN** el sistema actualiza todos los campos `order` en una única transacción Prisma

#### Scenario: Eliminar pregunta con respuestas existentes
- **WHEN** el admin elimina un item que ya tiene respuestas en checklists completados
- **THEN** el sistema permite la eliminación (las respuestas históricas se mantienen como JSON en `MerchandiseChecklist.responses`)

---

### Requirement: Página de gestión de plantillas en el frontend
El sistema SHALL mostrar en `/checklist-templates` (solo rol `admin`) una página con:
1. Lista de plantillas con nombre, tipo de mercancía, tipo de POS, estado (activo/inactivo) y número de preguntas
2. Botón "Nueva plantilla" que abre un formulario modal
3. Al seleccionar una plantilla: panel lateral o subpágina con lista de sus items ordenados
4. Cada item SHALL mostrar: texto, si es requerido, y botones Editar / Eliminar / ↑↓ (reordenar)
5. Botón "Agregar pregunta" dentro de la plantilla seleccionada
6. Botón Activar/Desactivar por plantilla

#### Scenario: Ver lista de plantillas
- **WHEN** el admin navega a `/checklist-templates`
- **THEN** el sistema muestra todas las plantillas agrupadas por tipo de mercancía

#### Scenario: Crear nueva plantilla y agregar preguntas
- **WHEN** el admin crea una plantilla y luego agrega preguntas una a una
- **THEN** cada pregunta aparece al final de la lista y el orden se refleja en el flujo de DeprisaCheck para nuevas admisiones
