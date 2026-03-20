# Control de versionado - DeprisaCheck

Versión actual: ver `package.json` (backend) y endpoint `GET /api/version`.

## Reglas

| Tipo de cambio | Acción | Ejemplo |
|----------------|--------|---------|
| **Funciones / Backend / API** | Modificar versión completa (major o minor) | `1.0.1` → `1.1.0` o `2.0.0` |
| **Frontend (UI, estilos, componentes)** | Agregar valor después del punto (patch) | `1.0.1` → `1.0.2` |

## Convención semántica

- **MAJOR** (X.0.0): Cambios incompatibles en la API o funcionalidad principal
- **MINOR** (1.X.0): Nuevas funciones, endpoints, compatibles hacia atrás
- **PATCH** (1.0.X): Cambios de frontend, correcciones, ajustes de UI

La versión se expone en el Footer de la aplicación y en `GET /api/version`.
