# Manual de Usuario — DeprisaCheck

**Plataforma de admisión de mercancía en puntos de venta Ciudad y Aeropuerto**

*Versión 1.1.1 — Última actualización: 2026-03-19*

---

## 1. Introducción

DeprisaCheck es la herramienta para gestionar el proceso de admisión de mercancía en puntos de venta ciudad y aeropuerto (ATO). Permite:

- Iniciar admisiones de mercancía
- Diligenciar listas de comprobación para mercancía peligrosa o especial
- Supervisar operaciones con métricas y filtros avanzados
- Gestionar usuarios, puntos de venta, plantillas de checklist y restricciones de clientes

### Roles de usuario

| Rol | Descripción | Módulos disponibles |
|-----|-------------|---------------------|
| **Asesor** | Operador de admisión en punto de venta | Nueva Admisión, DeprisaCheck |
| **Supervisor** | Monitoreo operativo | Panel de Supervisión, Detalle de Admisiones |
| **Administrador** | Gestión completa del sistema | Todos los módulos |

---

## 2. Acceso al sistema

### 2.1 URL de acceso

- **Aplicación:** `http://localhost:5173` (desarrollo) o la URL de producción asignada
- **API:** `http://localhost:3000`

### 2.2 Inicio de sesión

1. Abra la URL de la aplicación en el navegador.
2. En la pantalla de login ingrese:
   - **Usuario:** su nombre de usuario registrado
   - **Contraseña:** su contraseña (mínimo 6 caracteres)
3. Haga clic en **Entrar**.

> **Seguridad:** El sistema valida las credenciales contra la base de datos con contraseñas cifradas (bcrypt). El login tiene límite de 10 intentos por IP cada 15 minutos para prevenir ataques de fuerza bruta. Los usuarios inactivos no pueden iniciar sesión.

### 2.3 Cierre de sesión

Haga clic en **Cerrar sesión** en la barra superior derecha.

---

## 3. Módulos por rol

### 3.1 Rol: Asesor

#### Dashboard

Muestra las tarjetas: **Nueva Admisión** y **DeprisaCheck**.

#### Nueva Admisión

1. Ir a **Nueva Admisión** en el menú o dashboard.
2. Completar el formulario:
   - **ID Cliente:** identificador del cliente (ej.: `client-1`)
   - **Tipo de mercancía:** seleccione de la lista. Los tipos que requieren DeprisaCheck aparecen con la etiqueta *(Requiere DeprisaCheck)*
   - **Punto de venta:** seleccione el punto de venta (lista cargada desde el sistema)
3. Clic en **Iniciar admisión**.

**Resultados posibles:**

| Estado | Descripción |
|--------|-------------|
| `pending` | Admisión registrada, en espera |
| `requires_deprisacheck` | Redirige automáticamente a DeprisaCheck |
| `rejected` | Rechazada por restricción de cliente o tipo |

#### DeprisaCheck — Lista de comprobación

Acceso automático al admitir mercancía peligrosa, o manualmente desde el menú.

1. Si accede manualmente, ingrese el **ID de Mercancía** y seleccione el tipo.
2. Marque los ítems de la lista (los obligatorios llevan `*`).
3. Clic en **Guardar lista** para guardar el progreso.
4. Clic en **Enviar para aceptación** para finalizar.
5. Resultado esperado: mensaje **"Proceso completado."**

---

### 3.2 Rol: Supervisor

#### Dashboard

Muestra la tarjeta **Supervisión**.

#### Panel de Supervisión

1. Ir a **Supervisión** en el menú o dashboard.
2. Ver el panel de **métricas** en la parte superior:
   - Total de admisiones
   - Pendientes
   - En DeprisaCheck
   - Aceptadas
   - Rechazadas

3. Usar la **barra de filtros** para refinar la vista:
   - **Rango de fecha:** Hoy / Esta semana / Rango personalizado
   - **Punto de venta:** filtrar por POS específico
   - **Tipo de mercancía:** filtrar por tipo
   - **Estado:** pendiente / deprisacheck / aceptada / rechazada

4. La tabla muestra las admisiones con fecha, cliente, tipo, POS y estado.
5. Haga clic en cualquier fila para ver el **Detalle de Admisión**.

#### Detalle de Admisión

Muestra:
- Información del cliente y punto de venta
- Tipo de mercancía
- **Indicador de flujo visual** del estado: Pendiente → DeprisaCheck → Aceptada/Rechazada
- Razón de rechazo (si aplica), resaltada en rojo
- Checklist completado con todas las respuestas (si aplica)

> El supervisor puede **ver pero no modificar** admisiones.

---

### 3.3 Rol: Administrador

El administrador tiene acceso a todos los módulos anteriores más:

#### Usuarios

1. Ir a **Usuarios** en el menú o dashboard.
2. Ver tabla con: Usuario, Email, Rol, POS asignado, DeprisaCheck, Estado, Acciones.

**Crear usuario:**
1. Clic en **Nuevo usuario**.
2. Completar: usuario, contraseña (mín. 6 chars), email, rol, punto de venta, habilitado DeprisaCheck.
3. Clic en **Crear**.

**Editar usuario:**
1. Clic en **Editar** en la fila del usuario.
2. Modificar campos (excepto nombre de usuario).
3. Clic en **Guardar**.

**Activar / Desactivar usuario:**
- Clic en **Desactivar** o **Activar** en la columna de acciones.
- Los usuarios desactivados no pueden iniciar sesión.
- El historial de admisiones del usuario se conserva.

**Cambiar contraseña:**
1. Clic en **Cambiar contraseña** en la fila del usuario.
2. Ingresar la nueva contraseña (mín. 6 caracteres).
3. Clic en **Guardar**.

#### Puntos de Venta

1. Ir a **Puntos de Venta** en el dashboard.
2. Ver tabla con nombre, tipo (Ciudad / Aeropuerto ATO) y estado.

**Crear punto de venta:**
1. Clic en **Nuevo punto de venta**.
2. Ingresar nombre y seleccionar tipo.
3. Clic en **Crear**.

**Editar / Activar / Desactivar:**
- Use los botones de acción en cada fila.
- Solo los puntos activos aparecen en el formulario de admisión.

#### Plantillas de Checklist

1. Ir a **Plantillas de Checklist** en el dashboard.
2. Panel izquierdo: lista de plantillas agrupadas por tipo de mercancía.
3. Panel derecho: ítems de la plantilla seleccionada.

**Crear plantilla:**
1. Clic en **Nueva plantilla**.
2. Seleccionar tipo de mercancía y tipo de POS.
3. Ingresar nombre y clic en **Crear**.

**Gestionar ítems:**
- **Agregar ítem:** escribir el texto del ítem y marcar si es obligatorio, luego clic en **Agregar**.
- **Editar ítem:** clic en el ícono de editar en la fila del ítem.
- **Eliminar ítem:** clic en el ícono de eliminar.
- **Reordenar:** usar los botones ↑ ↓ para cambiar el orden de los ítems.

**Activar / Desactivar plantilla:**
- Solo las plantillas activas se cargan durante el proceso de DeprisaCheck.

> **Nota:** No se puede eliminar una plantilla que tenga checklists completados asociados.

#### Restricciones de Clientes

1. Ir a **Restricciones de Clientes** en el dashboard.
2. Panel izquierdo: buscar y seleccionar un cliente.
3. Panel derecho: ver y gestionar los tipos de mercancía restringidos.

**Agregar restricción:**
1. Seleccionar cliente en el panel izquierdo.
2. En el panel derecho, seleccionar el tipo de mercancía a restringir.
3. Clic en **Agregar restricción**.

**Eliminar restricción:**
- Clic en el ícono de eliminar en la fila de la restricción.

---

## 4. Datos de prueba (seed)

Tras `npm run db:seed` se dispone de:

| Tipo | ID / Código | Descripción |
|------|-------------|-------------|
| Cliente | `client-1` | Cliente Ejemplo |
| Punto de venta | `pos-city-1` | Punto Ciudad 1 (city) |
| Punto de venta | `pos-ato-1` | Punto ATO 1 (ato) |
| Tipos de mercancía | 9 tipos | Animales vivos, Baterías de litio, Hielo seco, Mercancía estándar, etc. |

**Tipos que requieren DeprisaCheck:** Animales vivos, Restos humanos, Perecederos, Armas, Baterías de litio, Radiactivos, Sustancias biológicas, Hielo seco.

---

## 5. Checklist de validación rápida

| # | Acción | Rol | Resultado esperado |
|---|--------|-----|--------------------|
| 1 | Login con credenciales válidas | Cualquiera | Acceso al dashboard según rol |
| 2 | Login con contraseña incorrecta | Cualquiera | Error "Credenciales inválidas" |
| 3 | Login con usuario inactivo | Cualquiera | Error "Usuario inactivo" |
| 4 | Dashboard Asesor | Asesor | Cards: Nueva Admisión, DeprisaCheck |
| 5 | Dashboard Supervisor | Supervisor | Card: Supervisión |
| 6 | Dashboard Admin | Admin | 6 cards: Admisión, DeprisaCheck, Supervisión, Usuarios, Puntos de Venta, Plantillas, Restricciones |
| 7 | Admisión mercancía estándar | Asesor | Estado `pending`, ID mercancía |
| 8 | Admisión baterías litio (ATO) | Asesor | Redirige a DeprisaCheck |
| 9 | Diligenciar y enviar checklist | Asesor | "Proceso completado." |
| 10 | Panel Supervisión — métricas | Supervisor | Contadores por estado |
| 11 | Filtrar admisiones por POS | Supervisor | Tabla filtrada |
| 12 | Ver detalle de admisión | Supervisor | Flujo visual + datos completos |
| 13 | Crear punto de venta | Admin | Aparece en lista y en formulario de admisión |
| 14 | Crear plantilla + agregar ítems | Admin | Plantilla activa, ítems reordenables |
| 15 | Desactivar usuario | Admin | Usuario no puede iniciar sesión |
| 16 | Cambiar contraseña de usuario | Admin | Login con nueva contraseña exitoso |
| 17 | Cerrar sesión | Cualquiera | Redirección a login |

---

## 6. Solución de problemas

| Problema | Posible causa | Acción |
|----------|---------------|--------|
| "Credenciales inválidas" | Contraseña incorrecta o usuario no existe | Verificar usuario/contraseña. Si es primer acceso, contactar al administrador |
| "Usuario inactivo" | Cuenta desactivada | Contactar al administrador para reactivar |
| "Demasiados intentos" | Rate limit alcanzado (10 intentos/15 min) | Esperar 15 minutos e intentar de nuevo |
| No cargan tipos de mercancía | API no accesible | Verificar que el backend esté corriendo (puerto 3000) |
| No cargan puntos de venta | API no accesible o sin datos | Verificar backend y ejecutar `npm run db:seed` |
| DeprisaCheck sin plantillas | Tipo de mercancía sin plantilla activa | Crear plantilla desde el módulo de Plantillas (Admin) |
| Página no visible por rol | Acceso al módulo con rol incorrecto | Iniciar sesión con el rol adecuado |
| Error CORS al conectar frontend | `FRONTEND_URL` mal configurado | Verificar variable de entorno `FRONTEND_URL` en el backend |

---

## 7. Glosario

- **ATO:** Aeropuerto — tipo de punto de venta aeropuerto.
- **DeprisaCheck:** Lista de comprobación obligatoria para mercancía peligrosa o especial.
- **POS:** Point of Sale — Punto de Venta (ciudad o aeropuerto).
- **Mercancía estándar:** No requiere DeprisaCheck.
- **Mercancía peligrosa/especial:** Requiere DeprisaCheck (ej.: baterías de litio, hielo seco, animales vivos).
- **Soft delete:** Desactivación lógica (el registro no se elimina físicamente; se marca como inactivo para preservar el historial).
- **bcrypt:** Algoritmo de hashing seguro para contraseñas. Las contraseñas nunca se almacenan en texto plano.
- **Rate limiting:** Límite de intentos de login para prevenir ataques automatizados.

---

*Versión de la aplicación: 1.1.1 — DeprisaCheck, Latin Logistics Colombia SAS*
