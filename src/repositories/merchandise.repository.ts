import { prisma } from '../lib/prisma';
type MerchandiseStatus = 'pending' | 'rejected' | 'requires_deprisacheck' | 'accepted' | 'in_transit';

export const merchandiseRepository = {
  async create(data: {
    clientId: string;
    pointOfSaleId: string;
    merchandiseTypeId: string;
    description?: string;
    classificationCode?: string;
    weight?: number;
    dimensions?: string;
    status?: MerchandiseStatus;
  }) {
    return prisma.merchandise.create({ data });
  },

  async findById(id: string) {
    return prisma.merchandise.findUnique({
      where: { id },
      include: { client: true, pointOfSale: true },
    });
  },

  async updateStatus(id: string, status: MerchandiseStatus, rejectionReason?: string) {
    return prisma.merchandise.update({
      where: { id },
      data: { status, rejectionReason, updatedAt: new Date() },
    });
  },

  async update(id: string, data: Partial<{
    status: MerchandiseStatus;
    rejectionReason: string;
  }>) {
    return prisma.merchandise.update({
      where: { id },
      data,
    });
  },
};
