import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';

export const guideRepository = {
  async create(data: {
    guideNumber: string;
    merchandiseId: string;
    documentUrl?: string;
  }) {
    return prisma.guide.create({ data: { id: uuidv4(), ...data } });
  },

  async findByMerchandise(merchandiseId: string) {
    return prisma.guide.findMany({
      where: { merchandiseId },
    });
  },
};
