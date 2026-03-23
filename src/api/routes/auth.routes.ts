import { Router } from 'express';
import { z } from 'zod';
import { userRepository } from '../../repositories/user.repository';
import { userService } from '../../services/user.service';
import { generateToken } from '../middleware/auth.middleware';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Usuario requerido').max(100),
  password: z.string().min(1, 'Contraseña requerida').max(200),
});

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { username, password } = parsed.data;

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

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      isDeprisacheckEnabled: user.isDeprisacheckEnabled ?? false,
    };

    const token = generateToken(payload);

    res.json({ ...payload, token });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
