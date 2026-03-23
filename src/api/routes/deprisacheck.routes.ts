/**
 * Rutas DeprisaCheck (ATO)
 * Tareas 4.2.1 a 4.2.5
 */
import { Router } from 'express';
import { deprisacheckService } from '../../services/deprisacheck.service';
import { userRepository } from '../../repositories/user.repository';
import { userService } from '../../services/user.service';
import { merchandiseChecklistRepository } from '../../repositories/merchandise-checklist.repository';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username y password son requeridos' });
    }
    const user = await userRepository.findByUsername(username);
    // Respuesta genérica para no revelar si el usuario existe
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const passwordValid = await userService.verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    if ((user as { isActive?: boolean }).isActive === false) {
      return res.status(403).json({ error: 'Usuario inactivo. Contacte al administrador' });
    }
    if (!user.isDeprisacheckEnabled) {
      return res.status(403).json({ error: 'Usuario no habilitado para DeprisaCheck' });
    }
    res.json({ userId: user.id, isDeprisacheckEnabled: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/checklists/templates', async (req, res) => {
  try {
    const merchandiseTypeId = req.query.merchandiseTypeId as string;
    const pointOfSaleType = req.query.pointOfSaleType as string;
    if (!merchandiseTypeId || !pointOfSaleType) {
      return res.status(400).json({ error: 'merchandiseTypeId y pointOfSaleType son requeridos' });
    }
    const templates = await deprisacheckService.getChecklistTemplates(merchandiseTypeId, pointOfSaleType);
    res.json(templates.map((t: any) => ({ ...t, items: t.ChecklistTemplateItem ?? [] })));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/checklists', async (req, res) => {
  try {
    const { merchandiseId, templateId, responses } = req.body;
    const userId = req.headers['x-user-id'] as string;
    if (!merchandiseId || !templateId || !responses) {
      return res.status(400).json({ error: 'merchandiseId, templateId y responses son requeridos' });
    }
    const checklist = await deprisacheckService.createOrUpdateChecklist(
      merchandiseId,
      templateId,
      userId,
      responses
    );
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/checklists/:checklistId/submit', async (req, res) => {
  try {
    const { checklistId } = req.params;
    const userId = req.headers['x-user-id'] as string;
    const result = await deprisacheckService.submitChecklistForAcceptance(checklistId, userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/checklists/:checklistId', async (req, res) => {
  try {
    const { checklistId } = req.params;
    const checklist = await merchandiseChecklistRepository.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
