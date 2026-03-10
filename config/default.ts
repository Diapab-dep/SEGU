/**
 * Configuración por entorno - Tarea 7.1.1
 */
export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
  deprisacheck: {
    url: process.env.DEPRISACHECK_API_URL,
    apiKey: process.env.DEPRISACHECK_API_KEY,
    mockMode: process.env.DEPRISACHECK_MOCK === 'true',
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};
