import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
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
import { prisma } from '../lib/prisma';

const app = express();

// Security headers
app.use(helmet());

// CORS — permite solo el frontend configurado en env (o localhost en dev)
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Rate limiting para login: máx 10 intentos por IP cada 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intente de nuevo en 15 minutos.' },
});

app.use(requestLogger);
app.use(express.json({ limit: '1mb' }));

app.use('/api/admission', admissionRoutes);
app.use('/api/merchandise-types', merchandiseTypesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/deprisacheck/login', loginLimiter);
app.use('/api/deprisacheck', deprisacheckRoutes);
app.use('/api/guides', guidesRoutes);
app.use('/api/manifests', manifestsRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/checklists', checklistsRoutes);
app.use('/api/admissions', supervisorRoutes);
app.use('/api/points-of-sale', pointsOfSaleRoutes);
app.use('/api/checklist-templates', checklistTemplatesRoutes);
app.use('/api', clientRestrictionsRoutes);

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
const pkg = require(path.join(__dirname, '../../package.json'));
app.get('/api/version', (_, res) => res.json({ version: pkg.version }));

export default app;
