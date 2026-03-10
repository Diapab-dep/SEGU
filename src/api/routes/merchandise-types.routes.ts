/**
 * Rutas para catálogo de tipos de mercancía (MerchandiseTypeCatalog)
 */
import { Router } from 'express';
import { merchandiseTypeCatalogRepository } from '../../repositories/merchandise-type-catalog.repository';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const types = await merchandiseTypeCatalogRepository.findAll();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const type = await merchandiseTypeCatalogRepository.findById(req.params.id);
    if (!type) return res.status(404).json({ error: 'Tipo no encontrado' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
