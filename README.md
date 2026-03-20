# DeprisaCheck - Proceso de Admisión de Mercancía

API para el proceso de admisión de mercancía en puntos de venta Ciudad y Aeropuerto (ATO) de DeprisaDocs. Basado en la propuesta OpenSpec y los diagramas de flujo operacionales.

---

## Estado del proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Modelos de datos (Merchandise, Client, User, PointOfSale, etc.) | ✅ Completado |
| 2 | Funciones de validación (isDangerousOrSpecial, restricciones, DeprisaCheck) | ✅ Completado |
| 3 | Servicios de negocio (Admission, DeprisaCheck, Rejection, Documentation) | ✅ Completado |
| 4 | Endpoints API REST | ✅ Completado |
| 5 | Integraciones externas (DeprisaCheck API, Correo, SGD/PDF) | ❌ No implementar |
| 6 | Pruebas de integración y E2E | ✅ Completado |
| 7 | Despliegue y configuración (CI/CD, monitoreo) | ⏳ Parcial |

**Completado:** Fases 1–4, 6 (pruebas integración y E2E), 7.1  
**No implementar:** Fase 5 (DeprisaCheck API, correo, SGD/PDF)  
**Pendiente:** Fase 7.2 (CI/CD, monitoreo)

---

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Base de datos

```bash
# Crear esquema (SQLite)
npm run db:push

# Poblar datos iniciales (cliente, puntos de venta, plantillas)
npm run db:seed
```

## Desarrollo

```bash
npm run dev
```

## Compilar

```bash
npm run build
```

## Ejecutar

```bash
npm start
```

El servidor escucha en `http://localhost:3000` (o el puerto definido en `PORT`).

---

## API Endpoints

### Catálogo de tipos de mercancía

- `GET /api/merchandise-types` — Lista tipos (ANIMALES_VIVOS, RESTOS_HUMANOS, etc.)
- `GET /api/merchandise-types/:id` — Detalle de un tipo

### Admisión

- `POST /api/admission/start` — Iniciar proceso de admisión  
  - Body: `{ merchandiseData: { merchandiseTypeId, clientId, ... }, pointOfSaleId }`  
  - `merchandiseTypeId` es obligatorio (selección explícita del asesor)
  - Retorna: `{ status, merchandiseId, requiresDeprisaCheck?, rejectionReason? }`
- `GET /api/admission/:merchandiseId/status` — Estado actual del proceso
- `POST /api/admission/:merchandiseId/reject` — Rechazar admisión (body: `{ reason, clientEmail? }`)

### DeprisaCheck (ATO)

- `POST /api/deprisacheck/login` — Autenticación y verificación `is_deprisacheck_enabled`
- `GET /api/deprisacheck/checklists/templates` — Query: `merchandiseTypeId`, `pointOfSaleType`
- `POST /api/deprisacheck/checklists` — Crear/actualizar lista (body: `{ merchandiseId, templateId, responses }`)
- `POST /api/deprisacheck/checklists/:id/submit` — Enviar lista para aceptación
- `GET /api/deprisacheck/checklists/:id` — Detalle de lista diligenciada

### Guías y Manifiestos

- `POST /api/guides/generate` — Body: `{ merchandiseId }`
- `POST /api/manifests/generate` — Body: `{ merchandiseIds, pointOfSaleId }`
- `POST /api/operations/deliver` — Body: `{ manifestId }`

### Listas externas

- `POST /api/checklists/receive` — Recepción de listas por webhook (body: `{ merchandiseId, templateId, responses }`)

---

## Tests

```bash
npm test                    # Unitarias + cobertura
npm run test:integration    # Pruebas de integración (requiere DB con seed)
npm run test:e2e            # E2E con Playwright (requiere backend + frontend + DB)
npm run run-all             # Pipeline completo: install, DB, build, unitarias, integración, E2E
```

- **Unitarias:** `isDangerousOrSpecial` y validadores
- **Integración:** Flujos admisión estándar, peligrosa, rechazos, recepción checklist (9 tests)
- **E2E:** Flujo de admisión vía UI. Ejecuta backend y frontend automáticamente; requiere BD accesible (ej. VPN para Azure Postgres)

---

## Variables de entorno

Ver `docs/ENV_VARIABLES.md`.

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | Sí | Conexión BD (ej: `file:./dev.db`) |
| `PORT` | No | Puerto del servidor (default: 3000) |
| `DEPRISACHECK_API_URL` | No | URL API DeprisaCheck externa |
| `SMTP_*` | No | Configuración correo para rechazos |

---

## Estructura del proyecto

```
src/
├── api/           # Rutas Express
├── lib/           # Cliente Prisma
├── repositories/  # Acceso a datos
├── services/      # Lógica de negocio
├── types/
├── validators/    # Validaciones de negocio
└── index.ts
prisma/
├── schema.prisma
└── seed.ts
config/
docs/
```

---

## Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

El frontend corre en **http://localhost:5173** y usa el proxy para comunicarse con la API en el puerto 3000. Asegúrese de que el backend esté corriendo.

---

## Referencias

- `proposal.md` — Propuesta y flujos de negocio (clasificación por selección explícita)
- `tasks.md` — Desglose de tareas de implementación
- `docs/MIGRACION_POWERAPPS.md` — Estrategia de migración Power Apps → Web
- Diagramas de flujo: puntos de venta aeropuerto y ciudad
