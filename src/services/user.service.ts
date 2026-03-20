import { userRepository, ROLES, type UserRole } from '../repositories/user.repository';

export { ROLES };
export type { UserRole };

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

  async createUser(data: {
    username: string;
    password: string;
    email?: string;
    role: UserRole;
    isDeprisacheckEnabled?: boolean;
    pointOfSaleId?: string;
  }) {
    const passwordHash = Buffer.from(data.password).toString('base64'); // simplificado; usar bcrypt en prod
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
    const passwordHash = Buffer.from(newPassword).toString('base64');
    return userRepository.updatePassword(id, passwordHash);
  },

  async deleteUser(id: string) {
    return userRepository.delete(id);
  },
};
