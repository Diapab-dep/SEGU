import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../lib/prisma';

const router = Router();

// GET /api/clients
router.get('/clients', async (_req, res) => {
  try {
    const clients = await prisma.client.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/clients/:id/restrictions
router.get('/clients/:id/restrictions', async (req, res) => {
  try {
    const restrictions = await prisma.clientRestriction.findMany({
      where: { clientId: req.params.id, isActive: true },
      include: { Client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(restrictions);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/client-restrictions
router.post('/client-restrictions', async (req, res) => {
  try {
    const { clientId, merchandiseTypeId, restrictionType, pointOfSaleId } = req.body;
    if (!clientId || !merchandiseTypeId || !restrictionType)
      return res.status(400).json({ error: 'clientId, merchandiseTypeId y restrictionType son requeridos' });

    const existing = await prisma.clientRestriction.findFirst({
      where: { clientId, merchandiseTypeId, isActive: true },
    });
    if (existing) return res.status(409).json({ error: 'El cliente ya tiene esta restricción activa' });

    const restriction = await prisma.clientRestriction.create({
      data: { id: uuidv4(), updatedAt: new Date(), clientId, merchandiseTypeId, restrictionType, pointOfSaleId, isActive: true },
    });
    res.status(201).json(restriction);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE /api/client-restrictions/:id — soft delete
router.delete('/client-restrictions/:id', async (req, res) => {
  try {
    await prisma.clientRestriction.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
