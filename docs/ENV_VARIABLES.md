# Variables de Entorno - DeprisaCheck

## Requeridas

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a base de datos (ej: `file:./dev.db` para SQLite) |

## Opcionales

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | 3000 |
| `NODE_ENV` | Entorno (development, production) | development |
| `DEPRISACHECK_API_URL` | URL de API DeprisaCheck externa | - |
| `DEPRISACHECK_API_KEY` | API Key para DeprisaCheck | - |
| `DEPRISACHECK_MOCK` | Modo mock si no hay DeprisaCheck | false |
| `SMTP_HOST` | Host SMTP para correo | - |
| `SMTP_PORT` | Puerto SMTP | 587 |
| `SMTP_USER` | Usuario SMTP | - |
| `SMTP_PASS` | Contraseña SMTP | - |
