## MODIFIED Requirements

### Requirement: Gestión completa de usuarios desde la UI
El sistema SHALL extender el módulo de usuarios existente para incluir:

1. **Asignación de Punto de Venta**: al crear o editar un usuario, el admin SHALL poder asignar un `pointOfSaleId` desde un selector que obtiene los POS activos de `GET /api/points-of-sale`
2. **Estado activo/inactivo**: el sistema SHALL incluir un campo `isActive: Boolean @default(true)` en el modelo `User`. La UI SHALL mostrar el estado y permitir activar/desactivar sin eliminar el registro
3. **Cambio de contraseña**: el admin SHALL poder cambiar la contraseña de cualquier usuario mediante `PATCH /api/users/:id/password` (cuerpo: `{ newPassword: string }`)
4. **Filtro de usuarios inactivos**: la tabla de usuarios SHALL mostrar todos los usuarios (activos e inactivos) con indicador visual del estado

El endpoint `GET /api/users` SHALL incluir en cada usuario: `id`, `username`, `email`, `role`, `isDeprisacheckEnabled`, `isActive`, `pointOfSale.name` (si tiene asignado).

#### Scenario: Asignar POS a usuario nuevo
- **WHEN** el admin crea un usuario y selecciona un POS del selector
- **THEN** el usuario queda vinculado al POS (`pointOfSaleId`) y el POS aparece en la tabla de usuarios

#### Scenario: Desactivar usuario
- **WHEN** el admin hace clic en "Desactivar" para un usuario activo y confirma
- **THEN** el sistema llama a `PATCH /api/users/:id/status` con `{ isActive: false }`, el usuario queda inactivo y ya no puede iniciar sesión

#### Scenario: Reactivar usuario
- **WHEN** el admin hace clic en "Activar" para un usuario inactivo
- **THEN** el sistema cambia `isActive` a `true` y el usuario puede volver a iniciar sesión

#### Scenario: Cambio de contraseña
- **WHEN** el admin hace clic en "Cambiar contraseña" de un usuario y proporciona la nueva contraseña (mínimo 6 caracteres)
- **THEN** el sistema llama a `PATCH /api/users/:id/password`, actualiza el `passwordHash` y devuelve HTTP 200

#### Scenario: Contraseña muy corta
- **WHEN** el admin intenta cambiar la contraseña con menos de 6 caracteres
- **THEN** el sistema devuelve HTTP 400 con mensaje "La contraseña debe tener al menos 6 caracteres"

#### Scenario: Usuario inactivo intenta iniciar sesión
- **WHEN** un usuario con `isActive: false` intenta hacer login
- **THEN** el sistema devuelve HTTP 403 con mensaje "Usuario inactivo. Contacte al administrador"

## ADDED Requirements

### Requirement: Migración de schema para isActive en User
El sistema SHALL agregar el campo `isActive Boolean @default(true)` al modelo `User` de Prisma y generar la migración correspondiente. Todos los usuarios existentes tendrán `isActive: true` por defecto.

#### Scenario: Migración no afecta usuarios existentes
- **WHEN** se aplica la migración en producción
- **THEN** todos los usuarios existentes mantienen su acceso (isActive = true por defecto)
