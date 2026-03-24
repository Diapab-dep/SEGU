import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';

export const pointOfSaleRepository = {
  async findById(id: string) {
    return prisma.pointOfSale.findUnique({
      where: { id },
      include: { HandlingPermission: true },
    });
  },

  async create(data: { name: string; type: 'city' | 'airport_ato'; baseRestrictions?: string }) {
    return prisma.pointOfSale.create({ data: { id: uuidv4(), updatedAt: new Date(), ...data } });
  },
};
