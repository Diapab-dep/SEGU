import { prisma } from '../lib/prisma';

export const manifestRepository = {
  async create(data: {
    manifestNumber: string;
    pointOfSaleId: string;
    merchandiseIds: string;
  }) {
    return prisma.manifest.create({ data });
  },

  async findById(id: string) {
    return prisma.manifest.findUnique({
      where: { id },
      include: { PointOfSale: true },
    });
  },

  async updateStatus(id: string, status: 'generated' | 'delivered') {
    return prisma.manifest.update({
      where: { id },
      data: {
        status,
        deliveryDate: status === 'delivered' ? new Date() : undefined,
      },
    });
  },
};
