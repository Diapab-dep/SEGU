/**
 * Rutas de admisión de mercancía
 * Tareas 4.1.1, 4.1.2, 4.1.3
 */
import { Router } from 'express';
import { admissionService } from '../../services/admission.service';
import { rejectionService } from '../../services/rejection.service';
import { merchandiseRepository } from '../../repositories/merchandise.repository';

const router = Router();

router.post('/start', async (req, res) => {
  try {
    const { merchandiseData, pointOfSaleId } = req.body;
    const userId = req.headers['x-user-id'] as string | undefined;
    if (!merchandiseData || !pointOfSaleId) {
      return res.status(400).json({ error: 'merchandiseData y pointOfSaleId son requeridos' });
    }
    if (!merchandiseData.clientId) {
      return res.status(400).json({ error: 'merchandiseData.clientId es requerido' });
    }
    if (!merchandiseData.merchandiseTypeId) {
      return res.status(400).json({ error: 'merchandiseData.merchandiseTypeId es obligatorio (selección del tipo de mercancía)' });
    }
    const result = await admissionService.startAdmission(merchandiseData, pointOfSaleId, userId);
    res.json(result);
  } catch (err) {
    const msg = (err as Error).message;
    const status = msg.includes('Cliente no encontrado') || msg.includes('cliente es requerido') ? 400 : 500;
    res.status(status).json({ error: msg });
  }
});

router.get('/:merchandiseId/status', async (req, res) => {
  try {
    const { merchandiseId } = req.params;
    const merchandise = await merchandiseRepository.findById(merchandiseId);
    if (!merchandise) {
      return res.status(404).json({ error: 'Mercancía no encontrada' });
    }
    res.json({
      merchandiseId: merchandise.id,
      status: merchandise.status,
      rejectionReason: merchandise.rejectionReason,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/:merchandiseId/reject', async (req, res) => {
  try {
    const { merchandiseId } = req.params;
    const { reason, clientEmail } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'reason es requerido' });
    }
    await rejectionService.rejectAdmission(merchandiseId, reason, { clientEmail });
    res.json({ merchandiseId, status: 'rejected' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
