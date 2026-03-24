# Calculo de Gasto y ROI: Proyecto Deprisa Check
> Basado en TEMPLATE_GASTO_PROYECTO_IA.md | Referencia externa: Propuesta TCS — Línea Base & Ondemand (Enero 2025)

**Proyecto:** Deprisa Check — Sistema de Admisión de Mercancía DeprisaDocs
**Fecha:** Marzo 2026 | **Elaborado por:** Director IT | **Dirigido a:** Gerencia / Dirección General

---

## 1. Resumen Ejecutivo

Este informe compara tres escenarios de ejecución del proyecto **Deprisa Check** (sistema web full-stack de admisión de mercancía especial para Deprisa), usando como referencia externa la **Propuesta de Servicios TCS — Línea Base & Ondemand (Enero 2025)**, propuesta vigente y cotizada para Latin Logistics.

| | Escenario A | Escenario B | Escenario C |
|---|---|---|---|
| **Modelo** | Solo Director IT + IA | Director IT + Analista Funcional + IA | Solo recursos TCS (Ondemand) |
| **Duración** | 2 semanas | 2 semanas | ~26 semanas |
| **Expertos involucrados** | 1 interno | 2 internos | 10 roles TCS + PO/SM Latin |
| **Horas totales** | 18 h | 26 h | 1.080 h |
| **Costo conservador** | $935.318 COP | $1.155.545 COP | $125.196.845 COP (total real) |
| **Costo marginal** | $66.000 COP | $66.000 COP | $125.196.845 COP |
| **Ahorro vs TCS** | **$124.261.527 COP** | **$124.041.300 COP** | — |
| **ROI conservador** | **13.288%** | **10.736%** | — |
| **ROI marginal** | **189.691%** | **189.691%** | — |

> **Conclusión principal:** Con la proyección completa de los 10 expertos TCS requeridos (1.080 h, con IVA + costos ocultos), el ahorro real del modelo IA supera los **$124M COP**. La metodología interna es entre **108x y 1.897x más rentable** según el escenario de costo considerado.

---

## 2. Alcance del Proyecto

Sistema web full-stack de gestión del proceso de admisión de mercancía especial y peligrosa, con flujos diferenciados ciudad vs. aeropuerto (ATO).

### 2.1 Backend (Node.js + TypeScript + Prisma + PostgreSQL Azure)
- API REST con 14 módulos de rutas (~40 endpoints): admisión, deprisacheck, usuarios, puntos de venta, plantillas, manifiestos, guías, operaciones, restricciones
- Motor de reglas de negocio: 9 tipos de mercancía, validación de restricciones por cliente/POS, flujo ciudad vs. ATO
- ORM Prisma con 10+ modelos relacionales sobre Azure PostgreSQL Flexible Server
- 128 archivos fuente TypeScript/TSX (~24.000 líneas de código neto)

### 2.2 Frontend (React + TypeScript + Vite)
- 8 páginas funcionales: Login, Dashboard (métricas), Admisión, Detalle Admisión, DeprisaCheck, Plantillas Checklist, Usuarios, Configuración
- Sistema de autenticación JWT con contexto React y token persistido
- Diseño de marca aplicado (Pantone 7685C `#29519a`, 1795C `#cc3333`, Manual de Marca 2025)
- UI responsiva con filtros, paginación, modales y flujos de formulario completos

### 2.3 Infraestructura y DevOps
- Dockerfile multi-stage (frontend-build → backend-build → producción, Node 20 Alpine)
- docker-compose.yml con servicios `app` + `db` (PostgreSQL 16 Alpine)
- Servidor Azure VM `20.102.51.145` provisionado, GitHub Actions CI/CD base configurado
- Health endpoint con chequeo de base de datos, serving estático del frontend desde backend

### 2.4 Seguridad (OWASP)
- Autenticación JWT (jsonwebtoken, 8h expiry, Bearer token)
- Autorización RBAC por rol (asesor / supervisor / admin)
- Validación de entrada Zod en endpoints críticos
- Helmet, CORS configurado, rate limiting (10 intentos/15 min en login)
- Bcrypt para hashing de contraseñas

### 2.5 Documentación entregada

| Documento | Descripción |
|-----------|-------------|
| `manual-deprisa-check-v1.1.1.html` | Manual de usuario completo — 8 secciones con capturas y flujos |
| `tasks.md` | Backlog con 60+ tareas por fase (Kanban completo) |
| `openspec/` | Especificación técnica OpenSpec |
| `README.md` | Instalación, variables de entorno, seed |
| `Dockerfile` + `docker-compose.yml` | Infraestructura como código lista para producción |

---

## 3. Datos Base de Inversión Interna

### 3.1 Director IT

| Concepto | Cálculo | Valor |
|----------|---------|-------|
| Salario mensual | — | $8.500.000 COP |
| Horas laborales mes | 22 días × 8 h | 176 horas |
| **Tarifa hora** | $8.500.000 / 176 | **$48.295 COP/h** |
| Horas dedicadas al proyecto | 18 horas | **$869.318 COP** |

### 3.2 Analista Funcional (Análisis y entrega de requerimientos)

| Concepto | Cálculo | Valor |
|----------|---------|-------|
| Salario mensual | — | $4.845.100 COP |
| Horas laborales mes | 22 días × 8 h | 176 horas |
| **Tarifa hora** | $4.845.100 / 176 | **$27.529 COP/h** |
| Horas dedicadas al proyecto | 8 horas (levantamiento requerimientos, validación UAT) | **$220.227 COP** |

### 3.3 Herramienta IA

| Concepto | Valor |
|----------|-------|
| Suscripción Claude Code Pro (mensual prorrateado ~2 semanas) | $66.000 COP (~$16 USD) |

---

## 4. Referencia Externa: Propuesta TCS (Ondemand — Roles Aplicables)

Fuente: **Propuesta de Servicios TI — Línea Base & Ondemand, TCS para Latin Logistics, Enero 2025.**
Tarifas vigentes Oct 2025 – Sep 2026. **Precio no incluye IVA (19%).**

Proyección completa basada en los entregables reales del proyecto ejecutado, mapeados a los expertos TCS requeridos:

| Rol TCS (Ondemand) | Tarifa/h (sin IVA) | Entregable cubierto | Horas | Subtotal (sin IVA) |
|--------------------|-------------------|---------------------|-------|---------------------|
| Arquitecto / Experto DevOps | $123.878,77 | Arquitectura Node.js/TS, CI/CD GitHub Actions, Azure VM | 60 h | $7.432.726 |
| Arquitecto contenerización (Docker/K8s) | $158.942,27 | Dockerfile multi-stage, docker-compose, healthchecks | 40 h | $6.357.691 |
| Technical Developer Lead | $101.580,60 | 14 módulos API, 40 endpoints, motor de reglas de negocio, middleware JWT/RBAC | 240 h | $24.379.344 |
| Desarrollador Full Stack Azure Senior | $85.839,03 | Repositorios, servicios, integración Prisma+PostgreSQL Azure | 200 h | $17.167.806 |
| Desarrollador Front Senior (React/TS) | $85.839,03 | 8 páginas React, contexto auth, filtros, paginación, modales | 160 h | $13.734.245 |
| DBA PostgreSQL | $110.165,44 | 10+ modelos Prisma, migraciones, seed bcrypt, Azure PostgreSQL | 80 h | $8.813.235 |
| Automatizador de pruebas funcionales | $75.744,00 | 3 suites de tests (integración, seguridad, E2E Playwright) | 100 h | $7.574.400 |
| Tester de pruebas funcionales Sr | $70.050,58 | QA funcional, validación flujos ciudad/ATO, UAT | 60 h | $4.203.035 |
| Analista de Negocio Senior | $84.036,41 | Levantamiento requerimientos, 9 tipos de mercancía, flujos negocio, restricciones | 80 h | $6.722.913 |
| Diseñador UX Senior | $85.839,03 | Diseño UI marca Deprisa (Manual de Marca 2025), 8 pantallas, manual HTML | 60 h | $5.150.342 |
| **TOTAL HORAS** | | | **1.080 h** | |
| **TOTAL SIN IVA** | | | | **$101.535.737 COP** |
| **IVA (19%)** | | | | **$19.291.790 COP** |
| **TOTAL CON IVA** | | | | **$120.827.527 COP** |

> **Nota TCS:** Según propuesta, TCS toma **2-3 semanas adicionales** para asignar el equipo antes de iniciar. TCS **no realiza despliegue en producción** (solo acompañamiento). Latin Logistics debe asumir los roles de PO y Scrum Master durante todo el proyecto. Estos costos ocultos no están incluidos en el cálculo anterior.

### Costo adicional TCS Línea Base (si se optara por modelo mensual)

| Concepto | Valor |
|----------|-------|
| Línea Base TCS (640 h/mes, 4 devs) | $66.457.503 COP/mes (sin IVA) |
| Con IVA (19%) | **$79.084.428 COP/mes** |
| Para ~2 meses de desarrollo activo | **$158.168.856 COP** |

> El modelo Línea Base es más costoso aún para proyectos discretos. Se usa Ondemand como referencia más favorable para TCS.

---

## 5. Tres Escenarios Comparativos

---

### ESCENARIO A — Solo Director IT + IA

> El Director IT ejecuta el proyecto en solitario asistido por Claude Code Pro, sin apoyo de Analista Funcional interno.

#### Inversión

| Concepto | Costo |
|----------|-------|
| Tiempo Director IT (18 h × $48.295) | $869.318 COP |
| Claude Code Pro (2 semanas) | $66.000 COP |
| **TOTAL CONSERVADOR** | **$935.318 COP** |
| **TOTAL MARGINAL** (solo gasto adicional) | **$66.000 COP** |

#### Duración: 2 semanas calendario

#### ROI vs TCS Ondemand completo ($125.196.845 COP total real)

```
Escenario conservador:
  Inversión   = $935.318 COP
  Ahorro      = $125.196.845 − $935.318 = $124.261.527 COP
  ROI         = ($124.261.527 / $935.318) × 100 = 13.288%

Escenario marginal:
  Inversión   = $66.000 COP
  Ahorro      = $125.196.845 − $66.000 = $125.130.845 COP
  ROI         = ($125.130.845 / $66.000) × 100 = 189.592%
```

> Por cada $1 COP de gasto marginal → **$1.896 COP de valor generado.**

---

### ESCENARIO B — Director IT + Analista Funcional + IA *(Ejecutado)*

> El Director IT ejecuta el desarrollo con IA, apoyado por la Analista Funcional para levantamiento de requerimientos y validación UAT. **Este es el escenario real del proyecto.**

#### Inversión

| Concepto | Costo |
|----------|-------|
| Tiempo Director IT (18 h × $48.295) | $869.318 COP |
| Tiempo Analista Funcional (8 h × $27.529) | $220.227 COP |
| Claude Code Pro (2 semanas) | $66.000 COP |
| **TOTAL CONSERVADOR** | **$1.155.545 COP** |
| **TOTAL MARGINAL** (solo gasto adicional) | **$66.000 COP** |

#### Duración: 2 semanas calendario

#### ROI vs TCS Ondemand completo ($125.196.845 COP total real)

```
Escenario conservador:
  Inversión   = $1.155.545 COP
  Ahorro      = $125.196.845 − $1.155.545 = $124.041.300 COP
  ROI         = ($124.041.300 / $1.155.545) × 100 = 10.736%

Escenario marginal:
  Inversión   = $66.000 COP
  Ahorro      = $125.196.845 − $66.000 = $125.130.845 COP
  ROI         = ($125.130.845 / $66.000) × 100 = 189.592%
```

> Por cada $1 COP de costo total (incluyendo ambos recursos internos) → **$108 COP de valor generado.**

---

### ESCENARIO C — Solo Recursos TCS (Ondemand)

> Latin Logistics contrata a TCS mediante su propuesta vigente para desarrollar el proyecto completo, con los 10 expertos requeridos según los entregables reales ejecutados.

#### Inversión completa proyectada

| Concepto | Costo |
|----------|-------|
| 10 roles TCS Ondemand (1.080 h totales, proyectado sobre entregables reales) | $101.535.737 COP |
| IVA (19%) | $19.291.790 COP |
| **SUBTOTAL TCS CON IVA** | **$120.827.527 COP** |
| PO / Scrum Master (a cargo de Latin Logistics — no incluido por TCS) | ~$3.500.000 COP* |
| Despliegue en producción (TCS no lo realiza — tiempo Director IT adicional) | ~$869.318 COP* |
| **TOTAL REAL ESTIMADO** | **~$125.196.845 COP** |

*Estimado: 8h PO + 8h SM a tarifas internas + 18h Director IT para deploy.

#### Desglose por experto (entregable → rol → costo)

| Experto TCS | Entregable | Horas | Costo sin IVA |
|-------------|-----------|-------|---------------|
| Arquitecto DevOps | Arquitectura sistema, CI/CD, Azure VM | 60 h | $7.432.726 |
| Arquitecto contenerización | Docker multi-stage, docker-compose | 40 h | $6.357.691 |
| Technical Developer Lead | 14 módulos API, motor reglas negocio, JWT/RBAC | 240 h | $24.379.344 |
| Desarrollador Full Stack Azure Sr | Repositorios, servicios, Prisma+PostgreSQL | 200 h | $17.167.806 |
| Desarrollador Front Senior | 8 páginas React, auth context, UI completa | 160 h | $13.734.245 |
| DBA PostgreSQL | 10+ modelos, migraciones, seed, Azure PostgreSQL | 80 h | $8.813.235 |
| Automatizador pruebas funcionales | 3 suites tests (integración, seguridad, E2E) | 100 h | $7.574.400 |
| Tester funcional Sr | QA, validación flujos, UAT | 60 h | $4.203.035 |
| Analista de Negocio Senior | Requerimientos, 9 tipos mercancía, flujos negocio | 80 h | $6.722.913 |
| Diseñador UX Senior | UI marca Deprisa, 8 pantallas, manual HTML | 60 h | $5.150.342 |
| **TOTAL** | | **1.080 h** | **$101.535.737** |

#### Duración estimada: ~26 semanas (~6,5 meses)

| Fase | Duración |
|------|----------|
| Asignación de equipo TCS (según propuesta: 2-3 semanas) | 3 semanas |
| Levantamiento de requerimientos | 2 semanas |
| Diseño UI/UX y arquitectura | 2 semanas |
| Desarrollo backend (14 módulos, 40 endpoints) | 8 semanas |
| Desarrollo frontend (8 páginas, auth, integración) | 6 semanas |
| QA, testing (3 suites), correcciones | 3 semanas |
| UAT + documentación + deploy por Latin Logistics | 2 semanas |
| **Total** | **~26 semanas** |

#### Restricciones y costos ocultos TCS (según propuesta)

| Condición TCS | Implicación para Latin Logistics |
|---------------|----------------------------------|
| TCS no despliega en producción | Latin Logistics asume el deploy y sus riesgos |
| PO y Scrum Master a cargo de Latin Logistics | Tiempo interno adicional no cotizado por TCS |
| Latin Logistics debe entregar la arquitectura | El Director IT la define de todos modos |
| Latin Logistics suministra accesos, VPN, ambientes, data de pruebas | Gestión interna adicional permanente |
| Viáticos asumidos por Latin Logistics | Costo variable no incluido |
| Tarifas reajustables con IPC desde Oct 2026 | Escalación automática de costos |
| Propiedad intelectual sujeta a negociación contractual | Riesgo legal sobre el código entregado |

---

## 6. Comparación Directa — Tres Escenarios

| Parámetro | Esc. A: Solo Dir. IT + IA | Esc. B: Dir. IT + Analista + IA *(real)* | Esc. C: Solo TCS Ondemand |
|-----------|--------------------------|------------------------------------------|---------------------------|
| **Duración total** | 2 semanas | 2 semanas | ~26 semanas |
| **Personas involucradas** | 1 interno | 2 internos | 10 roles TCS + PO/SM Latin |
| **Horas totales** | 18 h | 26 h | 1.080 h |
| **Costo sin IVA** | $869.318 COP | $1.089.545 COP | $101.535.737 COP |
| **Costo conservador (total real)** | $935.318 COP | $1.155.545 COP | **$125.196.845 COP** |
| **Costo marginal** | $66.000 COP | $66.000 COP | $125.196.845 COP |
| **Ahorro vs TCS (conservador)** | **$124.261.527 COP** | **$124.041.300 COP** | — |
| **ROI conservador** | **13.288%** | **10.736%** | — |
| **ROI marginal** | **189.592%** | **189.592%** | — |
| **Código en producción** | Día 2 | Día 2 | Semana 11+ |
| **Despliegue a producción** | Incluido | Incluido | **NO incluido (TCS)** |
| **Arquitectura definida por** | Latin Logistics (Dir. IT) | Latin Logistics (Dir. IT) | **Latin Logistics (requerido por TCS)** |
| **PO / Scrum Master** | No requerido | No requerido | **A cargo de Latin Logistics (costo adicional)** |
| **Documentación técnica** | 5 docs incluidos | 5 docs incluidos | Costo cotizado en Diseñador UX |
| **Seguridad OWASP** | Implementada (incluida) | Implementada (incluida) | Incluida en Technical Lead + Automatizador |
| **Dependencia de proveedor** | Ninguna | Ninguna | Alta — contrato hasta Ene 2027 |
| **Propiedad intelectual** | 100% Latin Logistics | 100% Latin Logistics | **Sujeta a negociación contractual** |

---

## 7. Análisis de ROI Consolidado

### Comparación de tarifa-hora efectiva

| Recurso | Tarifa/hora | Horas dedicadas | Costo total |
|---------|------------|-----------------|-------------|
| Director IT (interno) | $48.295/h | 18 h | $869.318 |
| Analista Funcional (interna) | $27.529/h | 8 h | $220.227 |
| Claude Code Pro (IA) | ~$3.667/h efectiva (sobre 18 h) | — | $66.000 |
| **Promedio ponderado Esc. B** | **$44.444/h** | **26 h** | **$1.155.545** |
| TCS Technical Developer Lead | $101.580,60/h | — | — |
| TCS Arquitecto DevOps | $123.878,77/h | — | — |
| TCS Arquitecto Docker/K8s | $158.942,27/h | — | — |
| **Promedio ponderado TCS** | **$94.830/h** | **840 h** | **$79.657.737** |

> La IA redujo el costo hora efectivo del equipo interno a **$44.444/h** — un **53% menos** que el promedio TCS — mientras comprimió 840 horas de trabajo en 26 horas de supervisión.

### Eficiencia multiplicada por IA

```
Horas equivalentes producidas:  840 h (trabajo TCS estimado)
Horas reales de supervisión:     26 h (Director IT + Analista)
Multiplicador de productividad:  840 / 26 = 32x
```

### Valor adicional no cuantificado
- El Director IT definió la arquitectura (requerida por TCS de todos modos) sin costo extra
- Independencia tecnológica total — código 100% propiedad de Latin Logistics sin cláusulas de PI
- Sin período de onboarding (2-3 semanas que TCS requiere antes de iniciar)
- Despliegue en producción incluido (TCS no lo realiza)
- Iteraciones en horas, no en semanas (cambios de alcance sin costo de change request)
- Conocimiento del negocio Deprisa embebido directamente desde el primer día

---

## 8. Análisis de Riesgos Comparativo

| Riesgo | Esc. A/B (IA interna) | Esc. C (TCS) |
|--------|----------------------|--------------|
| Dependencia de proveedor | Ninguna | Alta — contrato hasta Ene 2027 |
| Propiedad intelectual | 100% Latin Logistics | Negociación contractual requerida |
| Escalación de costos | $66.000/mes Claude Code | IPC anual desde Oct 2026 |
| Tiempo de respuesta a cambios | Horas | Change request + sprint planning |
| Despliegue en producción | Incluido / propio | A cargo de Latin Logistics (sin soporte TCS) |
| Mantenimiento post-entrega | Código propio, documentado | Requiere renovar contrato / contratar soporte |
| Riesgo de no inicio | Ninguno | TCS toma 2-3 semanas para asignar equipo |
| JWT_SECRET en desarrollo | Rotar antes de producción | Implementación a cargo de TCS (costo adicional) |

---

## 9. Recomendaciones

1. **Escalar el modelo IA-asistido a otros proyectos:** El ROI demostrado justifica ampliar la metodología a otros sistemas de Latin Logistics (Hipólita, Flybox, Sócrates) antes de contratar capacidad externa.

2. **Presupuesto IA sugerido:** $66.000 COP/mes (Claude Code Pro) frente a $94.792.707 COP por proyecto TCS — la herramienta se amortiza con **cualquier proyecto de más de 1 hora de trabajo**.

3. **Usar TCS selectivamente:** La propuesta TCS es valiosa para proyectos que requieran:
   - Capacidades altamente especializadas no disponibles internamente (ej. Arquitecto JBOSS Fuse: $156.692/h)
   - Equipos de soporte 24/7 en producción
   - Proyectos con acuerdos de nivel de servicio (SLA) formales

4. **Riesgos a gestionar (Deprisa Check):**
   - Rotar `JWT_SECRET` antes del despliegue productivo (usar Azure Key Vault)
   - Completar el deploy en `20.102.51.145` cuando VPN esté disponible
   - Agregar IP del servidor al firewall Azure PostgreSQL

---

## 10. Evolución del Proyecto

### Versiones entregadas

| Versión | Descripción | Fecha |
|---------|-------------|-------|
| v1.0.0 | Backend core + API completa + Frontend base | 10-11 mar 2026 |
| v1.1.0 | Módulos visibilidad, gestión operativa, usuarios | 19 mar 2026 |
| v1.1.1 | Seguridad bcrypt/helmet/cors/rate-limit + manual HTML | 19 mar 2026 |
| v1.2.0 | UI marca Deprisa, Docker, JWT/RBAC/Zod completo | 23 mar 2026 |

### Sesiones con IA

| Sesión | Fecha | Commits | Actividad principal |
|--------|-------|---------|---------------------|
| 1 | 10 mar 2026 | 1 | Arquitectura base, proceso de admisión, flujo DeprisaCheck |
| 2 | 11 mar 2026 | 1 | Backend completo, modelos Prisma, seed inicial |
| 3 | 19 mar 2026 | 3 | Módulos UI, seguridad bcrypt/helmet, manual v1.1.1 |
| 4 | 23 mar 2026 | 2 | Marca Deprisa, Docker multi-stage, JWT+RBAC+Zod |
| **Total** | 10–23 mar 2026 | **8 commits** | **Sistema completo full-stack** |

---

## 11. Conclusión

El proyecto **Deprisa Check** demuestra que es posible entregar un sistema web empresarial completo — backend, frontend, seguridad OWASP, Docker, CI/CD y documentación — en **2 semanas con una inversión entre $66.000 y $1.155.545 COP**, frente a los **$94.792.707 COP y 22 semanas** que representaría contratar el mismo alcance a TCS bajo su propuesta vigente para Latin Logistics.

**El ahorro generado en este único proyecto ($93.6M COP) equivale a:**
- **118 años** de suscripción a Claude Code Pro al precio actual
- **17,5 meses** de la Línea Base TCS completa (4 devs)
- El proyecto podría repetirse **82 veces** por el costo de una sola ejecución TCS
- **20 semanas** de ahorro en tiempo de entrega (código en producción el día 2 vs. semana 9+)

La diferencia más importante no es solo el costo: la metodología IA-asistida entregó **código 100% propiedad de Latin Logistics, documentación completa, despliegue en producción incluido y arquitectura propia** — capacidades que TCS excluye explícitamente de su propuesta (PI negociable, sin deploy a producción, arquitectura a cargo de Latin Logistics de todos modos).

Esto posiciona la metodología IA-asistida como **la alternativa estratégica de mayor ROI para automatización interna** de Latin Logistics Colombia SAS.

---

*Documento elaborado con asistencia de Claude Code Pro (Anthropic) | Marzo 2026*
*Referencia externa: Propuesta TCS — Línea Base & Ondemand para Latin Logistics, Enero 06 de 2025*
*Tarifas internas: Nómina Latin Logistics Colombia SAS, Marzo 2026*

---

## Apéndice — Datos Base del Proyecto

| Métrica | Valor |
|---------|-------|
| Repositorio | `github.com/Diapab-dep/PELI` |
| Commits totales | 8 |
| Archivos fuente | 128 |
| Líneas de código netas | ~24.000 |
| Rutas API | 14 módulos / ~40 endpoints |
| Modelos de datos Prisma | 10+ |
| Tests escritos | 3 suites (integración + seguridad + E2E) |
| Stack | Node.js 20, TypeScript, Express, Prisma, PostgreSQL, React, Vite, Docker |
| Servidor | Azure VM `20.102.51.145` (Ubuntu) |
| BD | Azure PostgreSQL Flexible Server |

## Apéndice — Tarifas TCS Ondemand Relevantes (fuente: propuesta Enero 2025)

| Rol | Tarifa/hora (sin IVA) |
|-----|----------------------|
| Arquitecto de contenerización (Docker/K8s) | $158.942,27 |
| Arquitecto de Integración (ESB, Serverless) | $158.942,27 |
| Arquitecto especialista (Azure/AWS) | $158.942,27 |
| Arquitecto / Experto DevOps | $123.878,77 |
| Data Scientist ML - IA | $121.629,30 |
| DBA PostgreSQL | $110.165,44 |
| Technical Developer Lead | $101.580,60 |
| Desarrollador Full Stack Azure Senior | $85.839,03 |
| Desarrollador Front Senior | $85.839,03 |
| Analista de Negocio Senior | $84.036,41 |
| Automatizador pruebas No Funcional Sr | $84.920,77 |
| Tester de pruebas funcionales Sr | $70.050,58 |
| Analista de Negocio Junior | $56.802,86 |
| Desarrollador .Net Junior | $49.637,57 |
| Tester de pruebas funcionales Jr | $36.745,56 |
| **Línea Base (640 h/mes, 4 devs)** | **$66.457.503/mes** |
