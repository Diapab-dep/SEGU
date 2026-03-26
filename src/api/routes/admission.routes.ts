/**
 * Rutas de admisión de mercancía
 * Tareas 4.1.1, 4.1.2, 4.1.3
 */
import { Router } from 'express';
import { admissionService } from '../../services/admission.service';
import { rejectionService } from '../../services/rejection.service';
import { merchandiseRepository } from '../../repositories/merchandise.repository';
import { auditService } from '../../services/audit.service';

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

router.post('/:merchandiseId/accept', async (req, res) => {
  try {
    const { merchandiseId } = req.params;
    const merchandise = await merchandiseRepository.findById(merchandiseId);
    if (!merchandise) {
      return res.status(404).json({ error: 'Mercancía no encontrada' });
    }
    if (merchandise.status !== 'pending') {
      return res.status(400).json({ error: `Solo se puede aprobar desde estado pending. Estado actual: ${merchandise.status}` });
    }
    const updated = await merchandiseRepository.updateStatus(merchandiseId, 'accepted');
    const userId = req.headers['x-user-id'] as string | undefined;
    await auditService.log({
      userId,
      action: 'ADMISSION_ACCEPT',
      entityType: 'Merchandise',
      entityId: merchandiseId,
    });
    res.json({ merchandiseId: updated.id, status: updated.status });
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
    const userId = req.headers['x-user-id'] as string | undefined;
    await rejectionService.rejectAdmission(merchandiseId, reason, { clientEmail });
    await auditService.log({
      userId,
      action: 'ADMISSION_REJECT',
      entityType: 'Merchandise',
      entityId: merchandiseId,
      details: { reason },
    });
    res.json({ merchandiseId, status: 'rejected' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
