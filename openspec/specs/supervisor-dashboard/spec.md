## ADDED Requirements

### Requirement: Métricas agregadas de admisiones
El sistema SHALL exponer un endpoint `GET /api/metrics` que devuelva conteos de admisiones agrupados por estado (`pending`, `requires_deprisacheck`, `accepted`, `rejected`) y opcionalmente filtrados por `posId`, `merchandiseTypeId`, `from` y `to` (fechas ISO).

#### Scenario: Métricas del día sin filtros
- **WHEN** el supervisor llama a `GET /api/metrics?from=<hoy>&to=<hoy>`
- **THEN** el sistema devuelve `{ total, pending, requiresDeprisacheck, accepted, rejected }` con los conteos correctos para el día

#### Scenario: Métricas filtradas por POS
- **WHEN** el supervisor llama a `GET /api/metrics?posId=<id>`
- **THEN** el sistema devuelve solo los conteos de admisiones del punto de venta indicado

---

### Requirement: Listado paginado de admisiones
El sistema SHALL exponer un endpoint `GET /api/admissions` con parámetros opcionales `page` (default 1), `limit` (default 20), `posId`, `merchandiseTypeId`, `status`, `from`, `to`. La respuesta SHALL incluir `{ data: Admission[], total, page, limit }`.

Cada ítem de `data` SHALL contener: `id`, `createdAt`, `status`, `rejectionReason`, `client.name`, `merchandiseType.name`, `pointOfSale.name`, `completedByUser.username` (si aplica).

#### Scenario: Listado sin filtros
- **WHEN** el supervisor llama a `GET /api/admissions`
- **THEN** el sistema devuelve las 20 admisiones más recientes ordenadas por `createdAt DESC`

#### Scenario: Filtro por estado
- **WHEN** el supervisor llama a `GET /api/admissions?status=rejected`
- **THEN** el sistema devuelve solo admisiones con `status = rejected`

#### Scenario: Filtro por rango de fechas
- **WHEN** el supervisor llama a `GET /api/admissions?from=2026-03-01&to=2026-03-19`
- **THEN** el sistema devuelve solo admisiones cuyo `createdAt` está dentro del rango inclusivo

#### Scenario: Paginación
- **WHEN** el supervisor llama a `GET /api/admissions?page=2&limit=10`
- **THEN** el sistema devuelve los registros 11-20 y el campo `total` refleja el total sin paginar

---

### Requirement: Panel de supervisión en el frontend
El sistema SHALL mostrar en `/supervisor` un panel con:
1. Tarjetas de métricas (Total, Pendientes, Aceptadas, Rechazadas)
2. Controles de filtro: selector de POS, selector de tipo de mercancía, selector de rango (Hoy / Esta semana / Rango personalizado)
3. Tabla de admisiones con columnas: Fecha/Hora, Cliente, Tipo de mercancía, POS, Estado
4. Cada fila SHALL ser clickeable para navegar al detalle de la admisión

El panel SHALL ser accesible para roles `admin` y `supervisor`. El rol `asesor` SHALL ser redirigido.

#### Scenario: Carga inicial del panel
- **WHEN** el supervisor navega a `/supervisor`
- **THEN** el sistema carga métricas y admisiones del día actual y las muestra sin intervención del usuario

#### Scenario: Aplicar filtro por POS
- **WHEN** el supervisor selecciona un POS del dropdown y hace clic en "Filtrar"
- **THEN** la tabla y las tarjetas de métricas se actualizan para mostrar solo datos del POS seleccionado

#### Scenario: Acceso no autorizado
- **WHEN** un usuario con rol `asesor` navega a `/supervisor`
- **THEN** el sistema lo redirige a `/`
