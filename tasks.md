# Tareas de Implementación: Proceso de Admisión de Mercancía DeprisaDocs

Desglose atómico de la implementación basado en los flujos de Ciudad y Aeropuerto.

---

## Fase 1: Modelos de Datos

### 1.0 Catálogo de Tipos (MerchandiseTypeCatalog)

- [x] **Tarea 1.0.1**: Definir entidad `MerchandiseTypeCatalog` con tipos: ANIMALES_VIVOS, RESTOS_HUMANOS, PERECEDEROS, ARMAS, BATERIAS_LITIO, RADIACTIVOS, SUSTANCIAS_BIOLOGICAS, HIELO_SECO, ESTANDAR
- [x] **Tarea 1.0.2**: Campo `requiresChecklist` por tipo

### 1.1 Modelo Merchandise (Mercancía)

- [x] **Tarea 1.1.1**: Definir entidad `Merchandise` con `merchandiseTypeId` (selección explícita), `status`, etc.
- [x] **Tarea 1.1.2**: Crear migración/esquema de base de datos para `Merchandise`
- [x] **Tarea 1.1.3**: Implementar repositorio/DAO para `Merchandise` (CRUD básico)

### 1.2 Modelo Client (Cliente)

- [x] **Tarea 1.2.1**: Definir entidad `Client` con atributos: `id`, `name`, `email`, `restriction_ids` (relación a restricciones), `created_at`, `updated_at`
- [x] **Tarea 1.2.2**: Crear migración/esquema para `Client`
- [x] **Tarea 1.2.3**: Implementar repositorio para `Client`

### 1.3 Modelo ClientRestriction (Restricciones de Cliente)

- [x] **Tarea 1.3.1**: Definir entidad `ClientRestriction` con atributos: `id`, `client_id`, `merchandise_type`, `restriction_type`, `point_of_sale_id` (opcional), `is_active`, `created_at`, `updated_at`
- [x] **Tarea 1.3.2**: Crear migración para `ClientRestriction`
- [x] **Tarea 1.3.3**: Implementar repositorio para `ClientRestriction`

### 1.4 Modelo User (Usuario)

- [x] **Tarea 1.4.1**: Definir entidad `User` con atributos: `id`, `username`, `password_hash`, `email`, `role` (enum), `is_deprisacheck_enabled` (boolean), `point_of_sale_id`, `created_at`, `updated_at`
- [x] **Tarea 1.4.2**: Crear migración para `User`
- [x] **Tarea 1.4.3**: Implementar repositorio para `User`

### 1.5 Modelo PointOfSale (Punto de Venta)

- [x] **Tarea 1.5.1**: Definir entidad `PointOfSale` con atributos: `id`, `name`, `type` (enum: `city`, `airport_ato`), `base_restriction_ids` (opcional), `is_active`, `created_at`, `updated_at`
- [x] **Tarea 1.5.2**: Crear migración para `PointOfSale`
- [x] **Tarea 1.5.3**: Implementar repositorio para `PointOfSale`

### 1.6 Modelo ChecklistTemplate (Plantilla de Lista de Comprobación)

- [x] **Tarea 1.6.1**: Definir entidad `ChecklistTemplate` con atributos: `id`, `name`, `merchandise_type`, `point_of_sale_type` (ciudad/ato), `items` (JSON/relación: array de `{ id, text, required, order }`), `rejection_template_id` (opcional, para envío en rechazo), `is_active`, `created_at`, `updated_at`
- [x] **Tarea 1.6.2**: Crear migración para `ChecklistTemplate` y `ChecklistTemplateItem`
- [x] **Tarea 1.6.3**: Implementar repositorio para `ChecklistTemplate`

### 1.7 Modelo MerchandiseChecklist (Lista de Comprobación Diligenciada)

- [x] **Tarea 1.7.1**: Definir entidad `MerchandiseChecklist` con atributos: `id`, `merchandise_id`, `template_id`, `completed_by_user_id`, `responses` (JSON: `{ item_id, value }`), `status` (enum: `pending`, `completed`, `rejected`), `completion_date`, `created_at`, `updated_at`
- [x] **Tarea 1.7.2**: Crear migración para `MerchandiseChecklist`
- [x] **Tarea 1.7.3**: Implementar repositorio para `MerchandiseChecklist`

### 1.8 Modelo Guide (Guía)

- [x] **Tarea 1.8.1**: Definir entidad `Guide` con atributos: `id`, `guide_number`, `merchandise_id`, `print_date`, `document_url`, `created_at`
- [x] **Tarea 1.8.2**: Crear migración para `Guide`
- [x] **Tarea 1.8.3**: Implementar repositorio para `Guide`

### 1.9 Modelo Manifest (Manifiesto)

- [x] **Tarea 1.9.1**: Definir entidad `Manifest` con atributos: `id`, `manifest_number`, `point_of_sale_id`, `merchandise_ids` (array/relación), `status` (enum: `generated`, `delivered`), `creation_date`, `delivery_date`, `created_at`, `updated_at`
- [x] **Tarea 1.9.2**: Crear migración para `Manifest`
- [x] **Tarea 1.9.3**: Implementar repositorio para `Manifest`

---

## Fase 2: Funciones de Validación

### 2.1 Validación de Mercancía Peligrosa/Especial

- [x] **Tarea 2.1.1**: Implementar `doesMerchandiseTypeRequireChecklist(merchandiseTypeId)` basado en catálogo (selección explícita, no IATA/IMO)
- [x] **Tarea 2.1.3**: Escribir tests unitarios para `isDangerousOrSpecial`

### 2.2 Validación de Restricciones (Cliente/Base)

- [x] **Tarea 2.2.1**: Implementar `hasClientOrBaseRestriction(clientId: string, merchandiseType: string, pointOfSaleId: string): Promise<boolean>`
- [x] **Tarea 2.2.2**: Consultar `ClientRestriction` por `client_id` y `merchandise_type`
- [x] **Tarea 2.2.3**: Consultar restricciones de base/punto de venta asociadas a `point_of_sale_id`
- [x] **Tarea 2.2.4**: Escribir tests unitarios para `hasClientOrBaseRestriction`

### 2.3 Validación de Manejo Permitido (Ciudad)

- [x] **Tarea 2.3.1**: Implementar `isHandlingPermitted(pointOfSaleId: string, merchandiseType: string): Promise<boolean>`
- [x] **Tarea 2.3.2**: Consultar licencias/permisos del punto de venta para el tipo de mercancía (DeprisaCheck o tabla de permisos)
- [x] **Tarea 2.3.3**: Escribir tests unitarios para `isHandlingPermitted`

### 2.4 Validación de Usuarios DeprisaCheck (ATO)

- [x] **Tarea 2.4.1**: Implementar `hasDeprisaCheckEnabledUsers(pointOfSaleId: string): Promise<boolean>`
- [x] **Tarea 2.4.2**: Consultar usuarios con `is_deprisacheck_enabled = true` para el punto de venta
- [x] **Tarea 2.4.3**: Implementar `isUserDeprisaCheckEnabled(userId: string): Promise<boolean>`
- [x] **Tarea 2.4.4**: Escribir tests unitarios para validaciones de usuarios DeprisaCheck

### 2.5 Validación de Completitud de Lista de Comprobación

- [x] **Tarea 2.5.1**: Implementar `validateChecklistCompletion(checklistId: string): Promise<{ valid: boolean, missingItems: string[] }>`
- [x] **Tarea 2.5.2**: Comparar `responses` de `MerchandiseChecklist` con `ChecklistTemplate.items` requeridos
- [x] **Tarea 2.5.3**: Escribir tests unitarios para `validateChecklistCompletion`

---

## Fase 3: Servicios de Negocio

### 3.1 Servicio de Admisión (Flujo Principal)

- [x] **Tarea 3.1.1**: Crear `AdmissionService` con método `startAdmission(merchandiseData, pointOfSaleId, userId)`
- [x] **Tarea 3.1.2**: Implementar rama para mercancía estándar: llamar subproceso `PR. Admisión puntos de venta` (servicio o integración existente)
- [x] **Tarea 3.1.3**: Implementar rama para mercancía peligrosa en **Aeropuerto**: validar restricciones → validar usuarios DeprisaCheck → retornar estado `requires_deprisacheck` o `rejected`
- [x] **Tarea 3.1.4**: Implementar rama para mercancía peligrosa en **Ciudad**: validar `isHandlingPermitted` → ejecutar lógica de proceso PR_DPSG04_018 o retornar `rejected`
- [x] **Tarea 3.1.5**: Persistir estado de `Merchandise` en cada paso (pending, rejected, requires_deprisacheck, accepted)
- [x] **Tarea 3.1.6**: Escribir tests de integración para `AdmissionService`

### 3.2 Servicio DeprisaCheck (ATO)

- [x] **Tarea 3.2.1**: Crear `DeprisaCheckService` con método `getChecklistTemplates(merchandiseType, pointOfSaleType)`
- [x] **Tarea 3.2.2**: Implementar `createOrUpdateChecklist(merchandiseId, templateId, userId, responses)`
- [x] **Tarea 3.2.3**: Implementar `submitChecklistForAcceptance(checklistId, userId)` que llame a `validateChecklistCompletion` y actualice `Merchandise.status`
- [x] **Tarea 3.2.4**: Integrar con archivo de documentación al aceptar (llamada a `archiveDocumentation`)
- [x] **Tarea 3.2.5**: Escribir tests de integración para `DeprisaCheckService`

### 3.3 Servicio de Rechazo

- [x] **Tarea 3.3.1**: Implementar `rejectAdmission(merchandiseId, reason, checklistId?)` que actualice estado a `rejected`
- [x] **Tarea 3.3.2**: Para rechazo post-DeprisaCheck: implementar `registerClientEmail(clientId, email)` y `sendRejectionChecklist(clientId, checklistData)`
- [x] **Tarea 3.3.3**: Integrar servicio de correo para envío de lista de comprobación de rechazo
- [x] **Tarea 3.3.4**: Escribir tests para flujo de rechazo

### 3.4 Servicio de Documentación y Operaciones

- [x] **Tarea 3.4.1**: Implementar `archiveDocumentation(merchandiseId, documents: Document[])` (integración con SGD o almacenamiento)
- [x] **Tarea 3.4.2**: Implementar `generateAndPrintGuide(merchandiseId)` → crear `Guide`, generar PDF/impresión
- [x] **Tarea 3.4.3**: Implementar `generateManifest(merchandiseIds, pointOfSaleId)` → crear `Manifest`
- [x] **Tarea 3.4.4**: Implementar `deliverToOperations(manifestId)` → actualizar estado del manifiesto y notificar
- [x] **Tarea 3.4.5**: Escribir tests para flujo de documentación

### 3.5 Servicio de Recepción de Lista de Comprobación

- [x] **Tarea 3.5.1**: Implementar `receiveChecklist(externalData)` para procesar listas recibidas por API/webhook
- [x] **Tarea 3.5.2**: Validar formato y persistir en base de datos de listas
- [x] **Tarea 3.5.3**: Escribir tests para `receiveChecklist`

---

## Fase 4: Endpoints de API

### 4.1 Admisión de Mercancía

- [x] **Tarea 4.1.1**: Crear `POST /api/admission/start` — body: `{ merchandiseData, pointOfSaleId }`, responde con `{ status, merchandiseId, requiresDeprisaCheck?, rejectionReason? }`
- [x] **Tarea 4.1.2**: Crear `GET /api/admission/{merchandiseId}/status` — retorna estado actual del proceso
- [x] **Tarea 4.1.3**: Crear `POST /api/admission/{merchandiseId}/reject` — body: `{ reason, clientEmail? }` (para rechazos tempranos)

### 4.2 DeprisaCheck (ATO)

- [x] **Tarea 4.2.1**: Crear `POST /api/deprisacheck/login` — autenticación y verificación `is_deprisacheck_enabled`
- [x] **Tarea 4.2.2**: Crear `GET /api/deprisacheck/checklists/templates` — query: `merchandiseType`, retorna plantillas disponibles
- [x] **Tarea 4.2.3**: Crear `POST /api/deprisacheck/checklists` — body: `{ merchandiseId, templateId, responses }`, crea/actualiza `MerchandiseChecklist`
- [x] **Tarea 4.2.4**: Crear `POST /api/deprisacheck/checklists/{checklistId}/submit` — envía lista y ejecuta proceso de aceptación
- [x] **Tarea 4.2.5**: Crear `GET /api/deprisacheck/checklists/{checklistId}` — detalle de lista diligenciada

### 4.3 Guías y Manifiestos

- [x] **Tarea 4.3.1**: Crear `POST /api/guides/generate` — body: `{ merchandiseId }`, retorna URL o datos de guía
- [x] **Tarea 4.3.2**: Crear `POST /api/manifests/generate` — body: `{ merchandiseIds }`, crea manifiesto
- [x] **Tarea 4.3.3**: Crear `POST /api/operations/deliver` — body: `{ manifestId }`, entrega a operaciones

### 4.4 Listas de Comprobación (Recepción Externa)

- [x] **Tarea 4.4.1**: Crear `POST /api/checklists/receive` — webhook/API para recepción de listas externas
- [x] **Tarea 4.4.2**: Documentar contrato de la API (schema de entrada)

---

## Fase 5: Integraciones Externas

> **Nota:** No se implementan integraciones externas. La información proviene exclusivamente de la base de datos.

### 5.1 Integración DeprisaCheck — No aplica
- La clasificación, restricciones y permisos se obtienen de la BD (MerchandiseTypeCatalog, ClientRestriction, HandlingPermission).

### 5.2 Integración Servicio de Correo — No implementar

### 5.3 Integración SGD / Gestión Documental — No implementar

---

## Fase 6: Pruebas y Calidad

### 6.1 Pruebas Unitarias

- [x] **Tarea 6.1.1**: Cobertura mínima del 80% para funciones de validación
- [x] **Tarea 6.1.2**: Cobertura para servicios de negocio con mocks de repositorios

### 6.2 Pruebas de Integración

- [x] **Tarea 6.2.1**: Flujo completo admisión mercancía estándar (Ciudad y ATO)
- [x] **Tarea 6.2.2**: Flujo completo admisión mercancía peligrosa (Ciudad: manejo permitido/rechazo)
- [x] **Tarea 6.2.3**: Flujo completo admisión mercancía peligrosa (ATO: DeprisaCheck aceptación/rechazo)
- [x] **Tarea 6.2.4**: Flujo de rechazo por restricciones y por usuarios no habilitados
- [x] **Tarea 6.2.5**: Flujo de recepción de lista de comprobación

### 6.3 Pruebas End-to-End

- [x] **Tarea 6.3.1**: Configurar E2E con Playwright
- [x] **Tarea 6.3.2**: E2E para flujo de admisión vía UI

---

## Fase 7: Despliegue y Configuración

### 7.1 Configuración

- [x] **Tarea 7.1.1**: Crear archivo de configuración por entorno (dev, staging, prod)
- [x] **Tarea 7.1.2**: Documentar variables de entorno necesarias
- [x] **Tarea 7.1.3**: Configurar conexiones a bases de datos (DeprisaCheck, listas, etc.)

### 7.2 Despliegue

- [ ] **Tarea 7.2.1**: Configurar pipeline CI/CD (GitHub Actions ya tiene workflow base en `.github/workflows/ci.yml`, falta stage de deploy)
- [ ] **Tarea 7.2.2**: Definir estrategia de despliegue (blue-green, rolling)
- [x] **Tarea 7.2.3**: Configurar monitoreo y logging (pino, pino-http, health con chequeo BD)
- [x] **Tarea 7.2.4**: Crear `Dockerfile` multi-stage (frontend-build → backend-build → producción, Node 20 Alpine)
- [x] **Tarea 7.2.5**: Crear `docker-compose.yml` con servicios `app` + `db` (PostgreSQL 16 Alpine)
- [ ] **Tarea 7.2.6**: Desplegar imagen Docker en servidor Azure `20.102.51.145`
  - Servidor activo (TCP puerto 22 OPEN verificado)
  - Bloqueado desde red local — requiere VPN corporativa o Azure Bastion
  - Repo actualizado en GitHub (`Diapab-dep/PELI`) con todos los cambios v1.2.0
  - Comandos de despliegue documentados (ver sección abajo)
- [ ] **Tarea 7.2.7**: Abrir puerto 3000 en Azure NSG (Inbound rule) para acceso público a la app
- [ ] **Tarea 7.2.8**: Ejecutar `npm run db:seed` en servidor para cargar usuarios de prueba una vez la BD Azure PostgreSQL sea accesible

### 7.3 Base de Datos (Pendiente)

- [ ] **Tarea 7.3.1**: Agregar IP del servidor de despliegue al firewall de Azure PostgreSQL (`az-psgflx-use-qa.postgres.database.azure.com`)
- [ ] **Tarea 7.3.2**: Ejecutar `npx prisma migrate deploy` en producción para aplicar migraciones pendientes
- [ ] **Tarea 7.3.3**: Ejecutar `npm run db:seed` para cargar datos iniciales y usuarios de prueba

### 7.4 Seguridad (P1 — pendiente)

- [ ] **Tarea 7.4.1**: Implementar autenticación JWT — reemplazar header `x-user-id` en todos los endpoints (actualmente sin validación de token)
- [ ] **Tarea 7.4.2**: Agregar middleware de autorización por rol en todos los endpoints (actualmente todos son públicos)
- [ ] **Tarea 7.4.3**: Validar entrada con librería (zod o joi) en endpoints críticos (admisión, usuarios, checklist)

---

## Comandos de Despliegue en Servidor (20.102.51.145)

```bash
# Conectar (requiere VPN o Azure Bastion)
ssh pdiaz@20.102.51.145

# En el servidor:
cd ~ && git clone https://github.com/Diapab-dep/PELI.git deprisacheck || (cd deprisacheck && git pull origin main)
cd ~/deprisacheck

# Configurar .env de producción
cat > .env << 'EOF'
DATABASE_URL=postgresql://adminpsql:PASS@az-psgflx-use-qa.postgres.database.azure.com:5432/postgres?sslmode=require
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://20.102.51.145:3000
EOF

# Migrar BD y cargar seed
docker compose run --rm app npx prisma migrate deploy
docker compose run --rm app npm run db:seed

# Levantar
docker compose up -d --build

# Verificar
curl http://localhost:3000/health
```

---

## Resumen de Dependencias entre Tareas

```
Fase 1 (Modelos) → Fase 2 (Validaciones) → Fase 3 (Servicios) → Fase 4 (API)
                                                      ↑
                                              Fase 5 (Integraciones)
```

Las tareas pueden ejecutarse en paralelo dentro de cada fase cuando no hay dependencias directas entre ellas.
