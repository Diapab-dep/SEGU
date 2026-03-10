/**
 * Rutas de listas de comprobación (recepción externa)
 * Tareas 4.4.1, 4.4.2
 */
import { Router } from 'express';
import { checklistReceiveService } from '../../services/checklist-receive.service';

const router = Router();

/**
 * POST /api/checklists/receive
 * Contrato de entrada:
 * {
 *   merchandiseId?: string,
 *   templateId?: string,
 *   responses: Record<string, string | boolean>,
 *   externalId?: string,
 *   source?: string
 * }
 */
router.post('/receive', async (req, res) => {
  try {
    const data = req.body;
    const result = await checklistReceiveService.receiveChecklist(data);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
