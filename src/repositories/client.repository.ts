import { prisma } from '../lib/prisma';

export const clientRepository = {
  async findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: { restrictions: { where: { isActive: true } } },
    });
  },

  async create(data: { name: string; email?: string }) {
    return prisma.client.create({ data });
  },
};
