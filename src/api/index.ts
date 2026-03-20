import express from 'express';
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
app.use(requestLogger);
app.use(express.json());

app.use('/api/admission', admissionRoutes);
app.use('/api/merchandise-types', merchandiseTypesRoutes);
app.use('/api/users', usersRoutes);
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
