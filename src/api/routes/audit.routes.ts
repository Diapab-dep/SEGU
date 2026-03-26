import { Router } from 'express';
import { auditService, type AuditAction } from '../../services/audit.service';

const router = Router();

// GET /api/audit — consulta de logs de auditoría (solo admin)
router.get('/', async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId as string | undefined,
      action: req.query.action as AuditAction | undefined,
      entityType: req.query.entityType as string | undefined,
      entityId: req.query.entityId as string | undefined,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
      limit: req.query.limit ? Math.min(500, parseInt(req.query.limit as string)) : 100,
    };
    const logs = await auditService.query(filters);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
