import { prisma } from '../lib/prisma';

export const merchandiseTypeCatalogRepository = {
  async findAll(activeOnly = true) {
    return prisma.merchandiseTypeCatalog.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.merchandiseTypeCatalog.findUnique({
      where: { id },
    });
  },

  async findByCode(code: string) {
    return prisma.merchandiseTypeCatalog.findUnique({
      where: { code },
    });
  },
};
