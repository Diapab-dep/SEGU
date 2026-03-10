import { prisma } from '../lib/prisma';

export const merchandiseChecklistRepository = {
  async create(data: {
    merchandiseId: string;
    templateId: string;
    completedByUserId?: string;
    responses: string;
    status?: 'pending' | 'completed' | 'rejected';
  }) {
    return prisma.merchandiseChecklist.create({ data });
  },

  async findById(id: string) {
    return prisma.merchandiseChecklist.findUnique({
      where: { id },
      include: { merchandise: true, template: { include: { items: true } } },
    });
  },

  async findByMerchandise(merchandiseId: string) {
    return prisma.merchandiseChecklist.findMany({
      where: { merchandiseId },
      include: { template: { include: { items: true } } },
    });
  },

  async update(id: string, data: { responses?: string; status?: string; completionDate?: Date; completedByUserId?: string }) {
    return prisma.merchandiseChecklist.update({
      where: { id },
      data,
    });
  },
};
