/**
 * Rutas de operaciones
 */
import { Router } from 'express';
import { documentationService } from '../../services/documentation.service';

const router = Router();

router.post('/deliver', async (req, res) => {
  try {
    const { manifestId } = req.body;
    if (!manifestId) {
      return res.status(400).json({ error: 'manifestId es requerido' });
    }
    const manifest = await documentationService.deliverToOperations(manifestId);
    res.json(manifest);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
