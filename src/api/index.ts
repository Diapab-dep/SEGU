import express from 'express';
import admissionRoutes from './routes/admission.routes';
import merchandiseTypesRoutes from './routes/merchandise-types.routes';
import deprisacheckRoutes from './routes/deprisacheck.routes';
import guidesRoutes from './routes/guides.routes';
import manifestsRoutes from './routes/manifests.routes';
import operationsRoutes from './routes/operations.routes';
import checklistsRoutes from './routes/checklists.routes';

const app = express();
app.use(express.json());

app.use('/api/admission', admissionRoutes);
app.use('/api/merchandise-types', merchandiseTypesRoutes);
app.use('/api/deprisacheck', deprisacheckRoutes);
app.use('/api/guides', guidesRoutes);
app.use('/api/manifests', manifestsRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/checklists', checklistsRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

export default app;
