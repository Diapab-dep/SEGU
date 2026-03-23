import { Router } from 'express';
import { userRepository } from '../../repositories/user.repository';
import { userService } from '../../services/user.service';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const user = await userRepository.findByUsername(username);
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

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      isDeprisacheckEnabled: user.isDeprisacheckEnabled,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
