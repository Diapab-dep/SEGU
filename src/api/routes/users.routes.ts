import { Router } from 'express';
import { userService } from '../../services/user.service';
import { auditService } from '../../services/audit.service';

const router = Router();

router.get('/roles', (_req, res) => {
  res.json(userService.getRoles());
});

router.get('/', async (_req, res) => {
  try {
    const users = await userService.listUsers();
    const sanitized = users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      isDeprisacheckEnabled: u.isDeprisacheckEnabled,
      isActive: (u as { isActive?: boolean }).isActive ?? true,
      pointOfSaleId: u.pointOfSaleId,
      pointOfSale: u.PointOfSale,
    }));
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await userService.getUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isDeprisacheckEnabled: user.isDeprisacheckEnabled,
      pointOfSaleId: user.pointOfSaleId,
      pointOfSale: user.PointOfSale,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, password, email, role, isDeprisacheckEnabled, pointOfSaleId } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'username, password y role son requeridos' });
    }
    const user = await userService.createUser({
      username,
      password,
      email,
      role,
      isDeprisacheckEnabled,
      pointOfSaleId: pointOfSaleId || undefined,
    });
    await auditService.log({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'USER_CREATE',
      entityType: 'User',
      entityId: user.id,
      details: { username: user.username, role: user.role },
    });
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isDeprisacheckEnabled: user.isDeprisacheckEnabled,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { email, role, isDeprisacheckEnabled, pointOfSaleId } = req.body;
    const user = await userService.updateUser(req.params.id, {
      email,
      role,
      isDeprisacheckEnabled,
      pointOfSaleId: pointOfSaleId ?? undefined,
    });
    await auditService.log({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'USER_UPDATE',
      entityType: 'User',
      entityId: user.id,
      details: { email, role, isDeprisacheckEnabled, pointOfSaleId },
    });
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isDeprisacheckEnabled: user.isDeprisacheckEnabled,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    await auditService.log({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'USER_DELETE',
      entityType: 'User',
      entityId: req.params.id,
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH /api/users/:id/status — activar/desactivar
router.patch('/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean')
      return res.status(400).json({ error: 'isActive debe ser boolean' });
    const user = await userService.updateUser(req.params.id, { isActive });
    res.json({ id: user.id, username: user.username, isActive: (user as { isActive?: boolean }).isActive ?? true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH /api/users/:id/password — cambiar contraseña
router.patch('/:id/password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    await userService.changePassword(req.params.id, newPassword);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
