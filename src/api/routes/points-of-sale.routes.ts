import { Router } from 'express';
import { prisma } from '../../lib/prisma';

const router = Router();

// GET /api/points-of-sale — solo activos (todos los roles)
router.get('/', async (_req, res) => {
  try {
    const pos = await prisma.pointOfSale.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(pos);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/points-of-sale/all — todos incluyendo inactivos (admin)
router.get('/all', async (_req, res) => {
  try {
    const pos = await prisma.pointOfSale.findMany({ orderBy: { name: 'asc' } });
    res.json(pos);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/points-of-sale
router.post('/', async (req, res) => {
  try {
    const { name, type, baseRestrictions } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'name y type son requeridos' });
    if (!['city', 'ato'].includes(type)) return res.status(400).json({ error: 'type debe ser city o ato' });
    const pos = await prisma.pointOfSale.create({ data: { name, type, baseRestrictions } });
    res.status(201).json(pos);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PUT /api/points-of-sale/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, type, baseRestrictions } = req.body;
    const pos = await prisma.pointOfSale.update({
      where: { id: req.params.id },
      data: { name, type, baseRestrictions },
    });
    res.json(pos);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH /api/points-of-sale/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const current = await prisma.pointOfSale.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ error: 'Punto de venta no encontrado' });
    const pos = await prisma.pointOfSale.update({
      where: { id: req.params.id },
      data: { isActive: !current.isActive },
    });
    res.json(pos);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
