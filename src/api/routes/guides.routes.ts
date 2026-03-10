/**
 * Rutas de guías y manifiestos
 * Tareas 4.3.1, 4.3.2, 4.3.3
 */
import { Router } from 'express';
import { documentationService } from '../../services/documentation.service';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const { merchandiseId } = req.body;
    if (!merchandiseId) {
      return res.status(400).json({ error: 'merchandiseId es requerido' });
    }
    const result = await documentationService.generateAndPrintGuide(merchandiseId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
