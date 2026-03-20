import bcrypt from 'bcrypt';
import { userRepository, ROLES, type UserRole } from '../repositories/user.repository';

export { ROLES };
export type { UserRole };

const BCRYPT_ROUNDS = 10;

export const userService = {
  getRoles() {
    return ROLES.map((code) => ({
      code,
      name: code === 'advisor' ? 'Asesor' : code === 'supervisor' ? 'Supervisor' : 'Administrador',
    }));
  },

  async listUsers() {
    return userRepository.findAll();
  },

  async getUser(id: string) {
    return userRepository.findById(id);
  },

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    // Soporte de migración: hashes base64 legacy (longitud < 30 y sin $2b$)
    if (!hash.startsWith('$2b$') && !hash.startsWith('$2a$')) {
      const legacy = Buffer.from(hash, 'base64').toString('utf8');
      return legacy === plain;
    }
    return bcrypt.compare(plain, hash);
  },

  async createUser(data: {
    username: string;
    password: string;
    email?: string;
    role: UserRole;
    isDeprisacheckEnabled?: boolean;
    pointOfSaleId?: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    return userRepository.create({
      username: data.username,
      passwordHash,
      email: data.email,
      role: data.role,
      isDeprisacheckEnabled: data.isDeprisacheckEnabled ?? false,
      pointOfSaleId: data.pointOfSaleId,
    });
  },

  async updateUser(
    id: string,
    data: Partial<{
      email: string;
      role: UserRole;
      isDeprisacheckEnabled: boolean;
      isActive: boolean;
      pointOfSaleId: string | null;
    }>
  ) {
    return userRepository.update(id, data);
  },

  async changePassword(id: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    return userRepository.updatePassword(id, passwordHash);
  },

  async deleteUser(id: string) {
    // Soft delete: desactiva en vez de eliminar para preservar historial
    return userRepository.update(id, { isActive: false });
  },
};
