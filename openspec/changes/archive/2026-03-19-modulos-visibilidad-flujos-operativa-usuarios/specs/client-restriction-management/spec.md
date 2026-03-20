## ADDED Requirements

### Requirement: Endpoints de gestión de restricciones por cliente
El sistema SHALL exponer los siguientes endpoints (solo rol `admin`):
- `GET /api/clients` — lista clientes con nombre e id
- `GET /api/clients/:id/restrictions` — lista las restricciones activas de un cliente con tipo de mercancía y tipo de restricción
- `POST /api/client-restrictions` — crea una restricción (campos: `clientId`, `merchandiseTypeId`, `restrictionType`, `pointOfSaleId?`)
- `DELETE /api/client-restrictions/:id` — elimina (desactiva) una restricción

#### Scenario: Ver restricciones de un cliente
- **WHEN** el admin llama a `GET /api/clients/:id/restrictions`
- **THEN** el sistema devuelve todas las restricciones activas (`isActive: true`) del cliente con el nombre del tipo de mercancía

#### Scenario: Agregar restricción a cliente
- **WHEN** el admin envía `POST /api/client-restrictions` con `clientId` y `merchandiseTypeId` válidos
- **THEN** el sistema crea la restricción activa y el flujo de admisión la respeta desde ese momento

#### Scenario: Eliminar restricción
- **WHEN** el admin llama a `DELETE /api/client-restrictions/:id`
- **THEN** el sistema marca la restricción como `isActive: false` (soft delete) y el cliente puede volver a admitir ese tipo de mercancía

#### Scenario: Restricción duplicada
- **WHEN** el admin intenta crear una restricción para un `clientId` + `merchandiseTypeId` que ya existe y está activa
- **THEN** el sistema devuelve HTTP 409 con mensaje "El cliente ya tiene esta restricción activa"

---

### Requirement: Página de gestión de restricciones en el frontend
El sistema SHALL mostrar en `/client-restrictions` (solo rol `admin`) una página con:
1. Selector de cliente (búsqueda por nombre)
2. Al seleccionar un cliente: lista de sus restricciones activas (tipo de mercancía, tipo de restricción)
3. Botón "Agregar restricción" con selector de tipo de mercancía
4. Botón "Eliminar" por restricción con confirmación

#### Scenario: Agregar restricción desde la UI
- **WHEN** el admin selecciona un cliente, elige un tipo de mercancía y confirma
- **THEN** la restricción aparece en la lista y el sistema la aplica en futuros procesos de admisión para ese cliente

#### Scenario: Cliente sin restricciones
- **WHEN** el admin selecciona un cliente que no tiene restricciones
- **THEN** el sistema muestra mensaje "Este cliente no tiene restricciones activas" con opción de agregar
