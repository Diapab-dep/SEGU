# Manual de Usuario — DeprisaCheck

**Plataforma de admisión de mercancía en puntos de venta Ciudad y Aeropuerto**

*Documento para validar el funcionamiento de la aplicación*

---

## 1. Introducción

DeprisaCheck es la herramienta para gestionar el proceso de admisión de mercancía en puntos de venta ciudad y aeropuerto (ATO). Permite:

- Iniciar admisiones de mercancía
- Diligenciar listas de comprobación para mercancía peligrosa o especial (DeprisaCheck)
- Supervisar operaciones (supervisor/admin)
- Gestionar usuarios (solo administrador)

### Roles de usuario

| Rol | Descripción | Módulos disponibles |
|-----|-------------|---------------------|
| **Asesor** | Operador de admisión | Nueva Admisión, DeprisaCheck |
| **Supervisor** | Monitoreo operativo | Supervisión |
| **Administrador** | Gestión completa | Supervisión, Usuarios |

---

## 2. Acceso al sistema

### 2.1 URL de acceso

- **Aplicación:** `http://localhost:5173`
- **API:** `http://localhost:3005` (según configuración)

### 2.2 Inicio de sesión

1. Abra la URL de la aplicación en el navegador.
2. En la pantalla de login:
   - **Usuario:** ingrese cualquier nombre (ej.: `asesor`, `admin`, `supervisor`)
   - **Rol:** seleccione el rol con el que desea probar:
     - Asesor
     - Supervisor
     - Administrador
3. Haga clic en **Entrar**.

> **Nota:** La aplicación no valida credenciales contra base de datos en esta versión. El rol seleccionado determina los módulos visibles.

---

## 3. Validación por rol

### 3.1 Rol: Asesor

#### Dashboard

- Debe mostrar: **Nueva Admisión** y **DeprisaCheck**.
- Menú lateral: Inicio, Admisión, DeprisaCheck.

#### Prueba: Nueva Admisión (mercancía estándar)

1. Ir a **Nueva Admisión**.
2. Completar:
   - **ID Cliente:** `client-1`
   - **Tipo de mercancía:** Mercancía estándar
   - **Punto de venta:** Punto Ciudad 1 (city) o Punto ATO 1 (airport_ato)
3. Clic en **Iniciar admisión**.
4. **Resultado esperado:** Estado `pending`, ID de mercancía mostrado.

#### Prueba: Nueva Admisión (mercancía peligrosa — DeprisaCheck)

1. Ir a **Nueva Admisión**.
2. Completar:
   - **ID Cliente:** `client-1`
   - **Tipo de mercancía:** Baterías de litio (Requiere DeprisaCheck)
   - **Punto de venta:** Punto ATO 1
3. Clic en **Iniciar admisión**.
4. **Resultado esperado:** Redirección automática a **DeprisaCheck** con la mercancía creada.

#### Prueba: DeprisaCheck — Lista de comprobación

1. Acceder desde el flujo anterior (mercancía peligrosa) o desde **DeprisaCheck** con parámetros en URL.
2. Verificar que se muestre el nombre de la plantilla (ej.: Lista Baterías de Litio).
3. Marcar los ítems obligatorios (con asterisco *).
4. Clic en **Guardar lista**.
5. Clic en **Enviar para aceptación**.
6. **Resultado esperado:** Mensaje "Proceso completado.".

#### Casos de rechazo (validación)

- **Sin tipo de mercancía:** el formulario no debe enviar (validación HTML5).
- **Restricciones de cliente/punto de venta:** la API puede devolver rechazo con mensaje.

---

### 3.2 Rol: Supervisor

#### Dashboard

- Debe mostrar: **Supervisión**.
- Menú lateral: Inicio, Supervisión.

#### Prueba: Panel de Supervisión

1. Ir a **Supervisión**.
2. **Resultado esperado:** Pantalla de bienvenida y mensaje de funcionalidad en desarrollo (listado de admisiones pendiente).

---

### 3.3 Rol: Administrador

#### Dashboard

- Debe mostrar: **Supervisión** y **Usuarios**.
- Menú lateral: Inicio, Supervisión, Usuarios.

#### Prueba: Módulo de Usuarios

1. Ir a **Usuarios**.
2. Verificar tabla con usuarios existentes (Usuario, Email, Rol, DeprisaCheck, Acciones).

##### Crear usuario

1. Clic en **Nuevo usuario**.
2. Completar:
   - Usuario
   - Contraseña
   - Email
   - Rol (Asesor, Supervisor, Administrador)
   - Habilitado para DeprisaCheck (opcional)
3. Clic en **Crear**.
4. **Resultado esperado:** Usuario nuevo en la tabla.

##### Editar usuario

1. Clic en **Editar** en la fila del usuario.
2. Modificar campos (excepto Usuario).
3. Clic en **Guardar**.
4. **Resultado esperado:** Cambios reflejados en la tabla.

##### Eliminar usuario

1. Clic en **Eliminar**.
2. Confirmar en el cuadro de diálogo.
3. **Resultado esperado:** Usuario eliminado de la tabla.

---

## 4. Datos de prueba (seed)

Tras `npm run db:seed` se dispone de:

| Tipo | ID / Código | Descripción |
|------|-------------|-------------|
| Cliente | `client-1` | Cliente Ejemplo |
| Punto de venta | `pos-city-1` | Punto Ciudad 1 (city) |
| Punto de venta | `pos-ato-1` | Punto ATO 1 (airport_ato) |
| Tipos de mercancía | 9 tipos | Animales vivos, Baterías de litio, Hielo seco, Mercancía estándar, etc. |

**Tipos que requieren DeprisaCheck:** Animales vivos, Restos humanos, Perecederos, Armas, Baterías de litio, Radiactivos, Sustancias biológicas, Hielo seco.

---

## 5. Checklist de validación rápida

| # | Acción | Rol | Resultado esperado |
|---|--------|-----|--------------------|
| 1 | Login con Asesor | — | Acceso a Nueva Admisión y DeprisaCheck |
| 2 | Login con Supervisor | — | Acceso a Supervisión |
| 3 | Login con Administrador | — | Acceso a Supervisión y Usuarios |
| 4 | Admisión mercancía estándar | Asesor | Estado pending, ID mercancía |
| 5 | Admisión baterías litio (ATO) | Asesor | Redirección a DeprisaCheck |
| 6 | Diligenciar y enviar checklist | Asesor | "Proceso completado." |
| 7 | Listar usuarios | Admin | Tabla con usuarios |
| 8 | Crear usuario | Admin | Usuario nuevo en la tabla |
| 9 | Editar usuario | Admin | Cambios guardados |
| 10 | Cerrar sesión | Cualquiera | Redirección a login |

---

## 6. Solución de problemas

| Problema | Posible causa | Acción |
|----------|---------------|--------|
| No cargan tipos de mercancía | API no accesible | Verificar que el backend esté en ejecución (puerto 3005 o 3000) |
| Error de red / API | Proxy incorrecto | Si el backend usa puerto 3005, iniciar frontend con `VITE_API_PORT=3005 npm run dev` |
| Página Usuarios no visible | Rol no es admin | Iniciar sesión con rol Administrador |
| DeprisaCheck sin plantillas | Falta merchandiseTypeId | Iniciar admisión con tipo peligroso y dejar que redirija automáticamente |

---

## 7. Glosario

- **ATO:** Aeropuerto (punto de venta tipo aeropuerto).
- **DeprisaCheck:** Lista de comprobación obligatoria para mercancía peligrosa o especial.
- **Mercancía estándar:** No requiere DeprisaCheck.
- **Mercancía peligrosa/especial:** Requiere DeprisaCheck (ej.: baterías de litio, hielo seco).

---

*Documento generado para validación funcional de DeprisaCheck. Versión de la aplicación: 1.0.3*
