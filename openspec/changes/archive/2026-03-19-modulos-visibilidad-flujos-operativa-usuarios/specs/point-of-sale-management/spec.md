## ADDED Requirements

### Requirement: CRUD de puntos de venta
El sistema SHALL exponer los siguientes endpoints:
- `GET /api/points-of-sale` — lista todos los POS activos (accesible para todos los roles autenticados)
- `GET /api/points-of-sale/all` — lista todos los POS incluyendo inactivos (solo `admin`)
- `POST /api/points-of-sale` — crea un POS (campos: `name`, `type` [`city`|`ato`], `baseRestrictions?`) — solo `admin`
- `PUT /api/points-of-sale/:id` — actualiza un POS — solo `admin`
- `PATCH /api/points-of-sale/:id/toggle` — activa/desactiva un POS — solo `admin`

El endpoint `GET /api/points-of-sale` SHALL reemplazar el array hardcodeado actualmente en `Admission.tsx` y en los filtros del Supervisor.

#### Scenario: Listar POS para el formulario de admisión
- **WHEN** el asesor carga la página de nueva admisión
- **THEN** el sistema obtiene los POS de `GET /api/points-of-sale` y los muestra en el selector

#### Scenario: Crear punto de venta tipo ATO
- **WHEN** el admin envía `POST /api/points-of-sale` con `type: "ato"`
- **THEN** el sistema crea el POS y queda disponible para asignación a usuarios y selección en admisiones

#### Scenario: Desactivar un POS con usuarios asignados
- **WHEN** el admin desactiva un POS que tiene usuarios asignados
- **THEN** el sistema desactiva el POS pero NO modifica la asignación de los usuarios (quedan con el POS inactivo referenciado)

---

### Requirement: Página de gestión de POS en el frontend
El sistema SHALL mostrar en `/points-of-sale` (solo rol `admin`) una página con:
1. Tabla de POS con columnas: Nombre, Tipo (Ciudad/Aeropuerto), Estado (Activo/Inactivo)
2. Botón "Nuevo punto de venta" con formulario modal
3. Acciones por fila: Editar, Activar/Desactivar

#### Scenario: Crear nuevo POS desde la UI
- **WHEN** el admin completa el formulario y confirma
- **THEN** el POS aparece en la lista y queda disponible inmediatamente en el formulario de admisión

---

### Requirement: Eliminación de POS hardcodeados en el frontend
El sistema SHALL obtener la lista de POS dinámicamente desde la API en todos los componentes que la necesiten: `Admission.tsx`, filtros de `Supervisor.tsx`, selector de POS en `Users.tsx`.

#### Scenario: Frontend carga POS desde API
- **WHEN** cualquier componente que necesite la lista de POS se monta
- **THEN** realiza una llamada a `GET /api/points-of-sale` y usa esa lista (no un array hardcodeado)
