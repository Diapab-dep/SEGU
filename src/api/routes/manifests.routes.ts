/**
 * Rutas de manifiestos
 */
import { Router } from 'express';
import { documentationService } from '../../services/documentation.service';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const { merchandiseIds, pointOfSaleId } = req.body;
    if (!merchandiseIds || !Array.isArray(merchandiseIds) || !pointOfSaleId) {
      return res.status(400).json({ error: 'merchandiseIds (array) y pointOfSaleId son requeridos' });
    }
    const manifest = await documentationService.generateManifest(merchandiseIds, pointOfSaleId);
    res.json(manifest);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
