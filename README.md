# DeprisaCheck — Plataforma de Admisión de Mercancía

Plataforma integral para gestionar el proceso de admisión de mercancía en puntos de venta Ciudad y Aeropuerto (ATO) de DeprisaDocs. Incluye control operativo, listas de comprobación, supervisión y gestión administrativa.

**Versión actual:** `1.1.1`

---

## Estado del proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Modelos de datos (Merchandise, Client, User, PointOfSale, etc.) | ✅ Completado |
| 2 | Funciones de validación (isDangerousOrSpecial, restricciones, DeprisaCheck) | ✅ Completado |
| 3 | Servicios de negocio (Admission, DeprisaCheck, Rejection) | ✅ Completado |
| 4 | Endpoints API REST (admisión, supervisor, usuarios, POS, plantillas) | ✅ Completado |
| 5 | Integraciones externas (DeprisaCheck API, Correo, SGD/PDF) | ❌ No implementar |
| 6 | Pruebas de integración y E2E | ✅ Completado |
| 7 | Módulos UI: Supervisor, Gestión Operativa, Usuarios completo | ✅ Completado |
| 8 | Seguridad: bcrypt, helmet, CORS, rate-limiting | ✅ Completado |
| 9 | Despliegue y CI/CD | ⏳ Parcial |

---

## Requisitos

- Node.js 18+
- npm
- PostgreSQL (Azure o local)

## Instalación

```bash
npm install
cd frontend && npm install
```

## Base de datos

```bash
# Aplicar migraciones (PostgreSQL)
npx prisma migrate deploy

# Poblar datos iniciales
npm run db:seed
```

## Desarrollo

```bash
# Backend (puerto 3000)
npm run dev

# Frontend (puerto 5173, en otra terminal)
cd frontend && npm run dev
```

## Compilar

```bash
npm run build
cd frontend && npm run build
```

## Ejecutar en producción

```bash
npm start
```

El servidor escucha en `http://localhost:3000` (o el puerto definido en `PORT`).

---

## API Endpoints

### Seguridad
Todos los endpoints están protegidos por:
- **`helmet`** — headers HTTP de seguridad
- **CORS** — solo orígenes permitidos (`FRONTEND_URL` en env)
- **Rate limiting** — login: máx 10 intentos / 15 min por IP

### Catálogo de tipos de mercancía

- `GET /api/merchandise-types` — Lista tipos
- `GET /api/merchandise-types/:id` — Detalle de un tipo

### Admisión

- `POST /api/admission/start` — Iniciar proceso de admisión
  - Body: `{ merchandiseData: { merchandiseTypeId, clientId }, pointOfSaleId }`
  - Retorna: `{ status, merchandiseId, requiresDeprisacheck?, rejectionReason? }`
- `GET /api/admission/:merchandiseId/status` — Estado actual
- `POST /api/admission/:merchandiseId/reject` — Rechazar (body: `{ reason }`)

### DeprisaCheck (ATO)

- `POST /api/deprisacheck/login` — Autenticación con validación de contraseña bcrypt (rate-limited)
- `GET /api/deprisacheck/checklists/templates` — Query: `merchandiseTypeId`, `pointOfSaleType`
- `POST /api/deprisacheck/checklists` — Crear/actualizar lista
- `POST /api/deprisacheck/checklists/:id/submit` — Enviar lista para aceptación
- `GET /api/deprisacheck/checklists/:id` — Detalle de lista

### Supervisor

- `GET /api/admissions` — Lista paginada con filtros (`posId`, `merchandiseTypeId`, `status`, `from`, `to`, `page`, `limit`)
- `GET /api/admissions/metrics` — Conteos por estado (total, pending, requires_deprisacheck, accepted, rejected)
- `GET /api/admissions/:id` — Detalle completo con checklist y plantilla

### Puntos de Venta

- `GET /api/points-of-sale` — Lista puntos activos
- `GET /api/points-of-sale/all` — Todos incluyendo inactivos (admin)
- `POST /api/points-of-sale` — Crear
- `PUT /api/points-of-sale/:id` — Editar
- `PATCH /api/points-of-sale/:id/toggle` — Activar / Desactivar

### Plantillas de Checklist

- `GET /api/checklist-templates` — Lista todas (con filtros)
- `GET /api/checklist-templates/:id` — Detalle con ítems
- `POST /api/checklist-templates` — Crear plantilla
- `PUT /api/checklist-templates/:id` — Editar plantilla
- `DELETE /api/checklist-templates/:id` — Eliminar (falla si tiene checklists asociados)
- `PATCH /api/checklist-templates/:id/toggle` — Activar / Desactivar
- `POST /api/checklist-templates/:id/items` — Agregar ítem
- `PUT /api/checklist-templates/:id/items/reorder` — Reordenar ítems
- `PUT /api/checklist-templates/:id/items/:itemId` — Editar ítem
- `DELETE /api/checklist-templates/:id/items/:itemId` — Eliminar ítem

### Clientes y Restricciones

- `GET /api/clients` — Lista clientes
- `GET /api/clients/:id/restrictions` — Restricciones de un cliente
- `POST /api/client-restrictions` — Crear restricción
- `DELETE /api/client-restrictions/:id` — Eliminar (soft delete)

### Usuarios

- `GET /api/users` — Lista usuarios (sin passwordHash)
- `GET /api/users/:id` — Detalle
- `POST /api/users` — Crear (contraseña hasheada con bcrypt)
- `PUT /api/users/:id` — Editar datos
- `PATCH /api/users/:id/status` — Activar / Desactivar (soft delete)
- `PATCH /api/users/:id/password` — Cambiar contraseña (mín. 6 caracteres)

### Sistema

- `GET /health` — Estado del servidor y BD
- `GET /api/version` — Versión de la aplicación

---

## Variables de entorno

| Variable | Requerida | Descripción | Ejemplo |
|----------|-----------|-------------|---------|
| `DATABASE_URL` | Sí | Cadena de conexión PostgreSQL | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `PORT` | No | Puerto del servidor (default: `3000`) | `3000` |
| `NODE_ENV` | No | Entorno (`development` / `production`) | `production` |
| `FRONTEND_URL` | No | URL del frontend para CORS en producción | `https://deprisacheck.empresa.com` |

---

## Seguridad

| Medida | Implementación |
|--------|----------------|
| Hashing de contraseñas | `bcrypt` con 10 rounds. Soporte de migración automática desde hashes legacy |
| Validación de login | Contraseña verificada contra hash almacenado antes de autenticar |
| Headers HTTP seguros | `helmet` — X-Content-Type-Options, X-Frame-Options, CSP, HSTS, etc. |
| CORS restringido | Solo orígenes listados en `FRONTEND_URL` + `localhost:5173` |
| Rate limiting | Login: máx 10 intentos por IP cada 15 minutos |
| Soft delete de usuarios | `isActive: false` — preserva integridad referencial con historial |
| Sin exposición de hash | `passwordHash` excluido de todas las respuestas de la API |

---

## Roles y permisos

| Rol | Dashboard | Admisión | DeprisaCheck | Supervisión | Usuarios | Puntos de Venta | Plantillas | Restricciones |
|-----|-----------|----------|--------------|-------------|----------|-----------------|------------|---------------|
| Asesor | ✅ | ✅ | ✅ | — | — | — | — | — |
| Supervisor | ✅ | — | — | ✅ | — | — | — | — |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Tests

```bash
npm test                    # Unitarias + cobertura
npm run test:integration    # Pruebas de integración (requiere DB con seed)
npm run test:e2e            # E2E con Playwright (requiere backend + frontend + DB)
npm run run-all             # Pipeline completo
```

---

## Estructura del proyecto

```
src/
├── api/
│   ├── middleware/        # requestLogger
│   └── routes/            # admission, deprisacheck, supervisor, users, pos, templates, restrictions
├── lib/                   # Cliente Prisma, logger
├── repositories/          # Acceso a datos por entidad
├── services/              # Lógica de negocio
├── validators/            # Validaciones de negocio
└── index.ts
frontend/
├── src/
│   ├── api/               # Cliente API (api/client.ts)
│   ├── components/        # Layout, Footer
│   ├── context/           # AuthContext
│   └── pages/             # Dashboard, Admission, DeprisaCheck, Supervisor,
│                          # AdmissionDetail, Users, PointsOfSale,
│                          # ChecklistTemplates, ClientRestrictions, Login
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
MANUALES/                  # Manual de usuario y documentos de referencia
POWER/                     # CSVs históricos PowerApps (archivo, no migrar)
```

---

## Referencias

- `MANUALES/MANUAL_DE_USUARIO_DEPRISACHECK.md` — Manual de usuario completo
- `VERSIONING.md` — Control de versiones y changelog
- `POWER/` — Datos históricos de PowerApps (solo referencia)
