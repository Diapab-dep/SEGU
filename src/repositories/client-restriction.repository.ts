import { prisma } from '../lib/prisma';

export const clientRestrictionRepository = {
  async findByClientAndMerchandise(
    clientId: string,
    merchandiseTypeId: string,
    pointOfSaleId?: string
  ) {
    return prisma.clientRestriction.findMany({
      where: {
        clientId,
        merchandiseTypeId,
        isActive: true,
        ...(pointOfSaleId
          ? { OR: [{ pointOfSaleId: null }, { pointOfSaleId }] }
          : {}),
      },
    });
  },

  async findBaseRestrictions(pointOfSaleId: string, merchandiseTypeId: string) {
    const pointOfSale = await prisma.pointOfSale.findUnique({
      where: { id: pointOfSaleId },
    });
    if (!pointOfSale?.baseRestrictions) return [];
    const ids = pointOfSale.baseRestrictions.split(',').filter(Boolean);
    if (ids.length === 0) return [];
    return prisma.clientRestriction.findMany({
      where: {
        id: { in: ids },
        merchandiseTypeId,
        isActive: true,
      },
    });
  },
};
