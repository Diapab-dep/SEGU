import { prisma } from '../lib/prisma';

export const ROLES = ['advisor', 'supervisor', 'admin'] as const;
export type UserRole = (typeof ROLES)[number];

export const userRepository = {
  async findAll() {
    return prisma.user.findMany({
      include: { pointOfSale: true },
      orderBy: { username: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { pointOfSale: true },
    });
  },

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      include: { pointOfSale: true },
    });
  },

  async create(data: {
    username: string;
    passwordHash: string;
    email?: string;
    role: string;
    isDeprisacheckEnabled?: boolean;
    pointOfSaleId?: string;
  }) {
    return prisma.user.create({ data });
  },

  async update(
    id: string,
    data: Partial<{
      email: string;
      role: string;
      isDeprisacheckEnabled: boolean;
      pointOfSaleId: string | null;
    }>
  ) {
    return prisma.user.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  async countDeprisaCheckEnabledByPointOfSale(pointOfSaleId: string) {
    return prisma.user.count({
      where: {
        pointOfSaleId,
        isDeprisacheckEnabled: true,
      },
    });
  },
};
