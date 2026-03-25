import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import admissionRoutes from './routes/admission.routes';
import merchandiseTypesRoutes from './routes/merchandise-types.routes';
import usersRoutes from './routes/users.routes';
import deprisacheckRoutes from './routes/deprisacheck.routes';
import guidesRoutes from './routes/guides.routes';
import manifestsRoutes from './routes/manifests.routes';
import operationsRoutes from './routes/operations.routes';
import checklistsRoutes from './routes/checklists.routes';
import supervisorRoutes from './routes/supervisor.routes';
import pointsOfSaleRoutes from './routes/points-of-sale.routes';
import checklistTemplatesRoutes from './routes/checklist-templates.routes';
import clientRestrictionsRoutes from './routes/client-restrictions.routes';
import { requestLogger } from './middleware/request-logger';
import { authenticate } from './middleware/auth.middleware';
import { authorize } from './middleware/authorize';
import { prisma } from '../lib/prisma';

const app = express();

// Security headers (CSP deshabilitado — app corre en HTTP/HTTPS sin dominio propio)
app.use(helmet({ contentSecurityPolicy: false }));

// CORS — permite solo el frontend configurado en env (o localhost en dev)
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Rate limiting para login: máx 10 intentos por IP cada 15 min (desactivado en test)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intente de nuevo en 15 minutos.' },
});

app.use(requestLogger);
app.use(express.json({ limit: '1mb' }));

// Versión de arquitectura: actualizar SOLO cuando cambie la arquitectura base
// (modelos de datos, rutas API, autenticación, infraestructura Docker/DB).
// Cambios de UI, estilos o textos NO deben modificar este valor.
const APP_VERSION = '1.0';
app.get('/api/version', (_, res) => res.json({ version: APP_VERSION }));

// Rutas públicas
app.use('/api/auth', authRoutes);
app.use('/api/deprisacheck/login', loginLimiter);

// Rutas protegidas — requieren JWT válido
app.use('/api/merchandise-types',    authenticate, merchandiseTypesRoutes);
app.use('/api/admission',            authenticate, authorize('advisor', 'admin'), admissionRoutes);
app.use('/api/deprisacheck',         authenticate, authorize('advisor', 'admin'), deprisacheckRoutes);
app.use('/api/admissions',           authenticate, authorize('supervisor', 'admin'), supervisorRoutes);
app.use('/api/users',                authenticate, authorize('admin'), usersRoutes);
app.use('/api/points-of-sale',       authenticate, pointsOfSaleRoutes);
app.use('/api/checklist-templates',  authenticate, checklistTemplatesRoutes);
app.use('/api/guides',               authenticate, authorize('advisor', 'admin'), guidesRoutes);
app.use('/api/manifests',            authenticate, authorize('advisor', 'admin'), manifestsRoutes);
app.use('/api/operations',           authenticate, authorize('advisor', 'admin'), operationsRoutes);
app.use('/api/checklists',           authenticate, checklistsRoutes);
app.use('/api',                      authenticate, authorize('admin'), clientRestrictionsRoutes);

app.get('/health', async (_, res) => {
  const dbOk = await checkDatabase();
  const status = dbOk ? 'ok' : 'degraded';
  const code = dbOk ? 200 : 503;
  res.status(code).json({ status, database: dbOk ? 'connected' : 'error' });
});

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

const path = require('path');

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(staticPath));
  app.get('*', (_, res) => res.sendFile(path.join(staticPath, 'index.html')));
}

export default app;
