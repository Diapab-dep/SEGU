import { prisma } from '../lib/prisma';

export const checklistTemplateRepository = {
  async findByMerchandiseTypeAndPointType(merchandiseTypeId: string, pointOfSaleType: string) {
    return prisma.checklistTemplate.findMany({
      where: {
        merchandiseTypeId,
        pointOfSaleType,
        isActive: true,
      },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  },

  async findById(id: string) {
    return prisma.checklistTemplate.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  },
};
