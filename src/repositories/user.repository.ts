import { prisma } from '../lib/prisma';

export const userRepository = {
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

  async countDeprisaCheckEnabledByPointOfSale(pointOfSaleId: string) {
    return prisma.user.count({
      where: {
        pointOfSaleId,
        isDeprisacheckEnabled: true,
      },
    });
  },
};
