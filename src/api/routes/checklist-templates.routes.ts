import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/checklist-templates
router.get('/', async (_req, res) => {
  try {
    const templates = await prisma.checklistTemplate.findMany({
      include: {
        MerchandiseTypeCatalog: true,
        _count: { select: { ChecklistTemplateItem: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(
      templates.map((t) => ({
        id: t.id,
        name: t.name,
        merchandiseTypeId: t.merchandiseTypeId,
        merchandiseTypeName: t.MerchandiseTypeCatalog.name,
        pointOfSaleType: t.pointOfSaleType,
        isActive: t.isActive,
        itemCount: t._count.ChecklistTemplateItem,
        createdAt: t.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/checklist-templates/:id
router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: req.params.id },
      include: {
        MerchandiseTypeCatalog: true,
        ChecklistTemplateItem: { orderBy: { order: 'asc' } },
      },
    });
    if (!template) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/checklist-templates
router.post('/', async (req, res) => {
  try {
    const { name, merchandiseTypeId, pointOfSaleType, rejectionTemplateId } = req.body;
    if (!name || !merchandiseTypeId || !pointOfSaleType)
      return res.status(400).json({ error: 'name, merchandiseTypeId y pointOfSaleType son requeridos' });
    const template = await prisma.checklistTemplate.create({
      data: { id: uuidv4(), updatedAt: new Date(), name, merchandiseTypeId, pointOfSaleType, rejectionTemplateId },
    });
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PUT /api/checklist-templates/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, merchandiseTypeId, pointOfSaleType, rejectionTemplateId } = req.body;
    const template = await prisma.checklistTemplate.update({
      where: { id: req.params.id },
      data: { name, merchandiseTypeId, pointOfSaleType, rejectionTemplateId },
    });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE /api/checklist-templates/:id — valida que no tenga checklists asociados
router.delete('/:id', async (req, res) => {
  try {
    const count = await prisma.merchandiseChecklist.count({
      where: { templateId: req.params.id },
    });
    if (count > 0)
      return res.status(409).json({
        error: 'No se puede eliminar una plantilla con checklists completados asociados',
      });
    await prisma.checklistTemplate.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH /api/checklist-templates/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const current = await prisma.checklistTemplate.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ error: 'Plantilla no encontrada' });
    const template = await prisma.checklistTemplate.update({
      where: { id: req.params.id },
      data: { isActive: !current.isActive },
    });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/checklist-templates/:id/items
router.post('/:id/items', async (req, res) => {
  try {
    const { text, required } = req.body;
    if (!text) return res.status(400).json({ error: 'text es requerido' });
    const maxOrder = await prisma.checklistTemplateItem.aggregate({
      where: { templateId: req.params.id },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;
    const item = await prisma.checklistTemplateItem.create({
      data: { id: uuidv4(), templateId: req.params.id, text, required: required ?? false, order },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PUT /api/checklist-templates/:id/items/reorder — transacción
router.put('/:id/items/reorder', async (req, res) => {
  try {
    const items: { id: string; order: number }[] = req.body.items;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items debe ser un array' });
    await prisma.$transaction(
      items.map((item) =>
        prisma.checklistTemplateItem.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PUT /api/checklist-templates/:id/items/:itemId
router.put('/:id/items/:itemId', async (req, res) => {
  try {
    const { text, required, order } = req.body;
    const item = await prisma.checklistTemplateItem.update({
      where: { id: req.params.itemId },
      data: { text, required, order },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE /api/checklist-templates/:id/items/:itemId
router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    await prisma.checklistTemplateItem.delete({ where: { id: req.params.itemId } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
