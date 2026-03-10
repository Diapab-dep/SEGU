import { prisma } from '../lib/prisma';

export const pointOfSaleRepository = {
  async findById(id: string) {
    return prisma.pointOfSale.findUnique({
      where: { id },
      include: { handlingPerms: true },
    });
  },

  async create(data: { name: string; type: 'city' | 'airport_ato'; baseRestrictions?: string }) {
    return prisma.pointOfSale.create({ data });
  },
};
