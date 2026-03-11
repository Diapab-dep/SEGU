import { Router } from 'express';
import { userService } from '../../services/user.service';

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
      pointOfSaleId: u.pointOfSaleId,
      pointOfSale: u.pointOfSale,
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
      pointOfSale: user.pointOfSale,
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
      pointOfSaleId,
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
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
