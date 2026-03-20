import { Router } from 'express';
import { supervisorRepository } from '../../repositories/supervisor.repository';

const router = Router();

// GET /api/admissions — lista paginada con filtros
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const filters = {
      posId: req.query.posId as string | undefined,
      merchandiseTypeId: req.query.merchandiseTypeId as string | undefined,
      status: req.query.status as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    };
    const result = await supervisorRepository.listAdmissions(filters, page, limit);
    const data = result.data.map((m) => ({
      id: m.id,
      createdAt: m.createdAt,
      status: m.status,
      rejectionReason: m.rejectionReason,
      client: { id: m.Client.id, name: m.Client.name },
      merchandiseType: { id: m.MerchandiseTypeCatalog.id, name: m.MerchandiseTypeCatalog.name },
      pointOfSale: { id: m.PointOfSale.id, name: m.PointOfSale.name },
      checklist: m.MerchandiseChecklist[0]
        ? { id: m.MerchandiseChecklist[0].id, status: m.MerchandiseChecklist[0].status }
        : null,
    }));
    res.json({ data, total: result.total, page: result.page, limit: result.limit });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/admissions/metrics — agregados
router.get('/metrics', async (req, res) => {
  try {
    const filters = {
      posId: req.query.posId as string | undefined,
      merchandiseTypeId: req.query.merchandiseTypeId as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    };
    const metrics = await supervisorRepository.getMetrics(filters);
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/admissions/:id — detalle completo
router.get('/:id', async (req, res) => {
  try {
    const admission = await supervisorRepository.findByIdWithDetails(req.params.id);
    if (!admission) return res.status(404).json({ error: 'Admisión no encontrada' });
    const checklist = admission.MerchandiseChecklist[0];
    res.json({
      id: admission.id,
      createdAt: admission.createdAt,
      updatedAt: admission.updatedAt,
      status: admission.status,
      rejectionReason: admission.rejectionReason,
      description: admission.description,
      weight: admission.weight,
      dimensions: admission.dimensions,
      client: { id: admission.Client.id, name: admission.Client.name, email: admission.Client.email },
      merchandiseType: {
        id: admission.MerchandiseTypeCatalog.id,
        code: admission.MerchandiseTypeCatalog.code,
        name: admission.MerchandiseTypeCatalog.name,
        requiresChecklist: admission.MerchandiseTypeCatalog.requiresChecklist,
      },
      pointOfSale: {
        id: admission.PointOfSale.id,
        name: admission.PointOfSale.name,
        type: admission.PointOfSale.type,
      },
      checklist: checklist
        ? {
            id: checklist.id,
            status: checklist.status,
            completionDate: checklist.completionDate,
            completedByUserId: checklist.completedByUserId,
            responses: JSON.parse(checklist.responses),
            template: {
              id: checklist.ChecklistTemplate.id,
              name: checklist.ChecklistTemplate.name,
              items: checklist.ChecklistTemplate.ChecklistTemplateItem.map((item) => ({
                id: item.id,
                text: item.text,
                required: item.required,
                order: item.order,
              })),
            },
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
