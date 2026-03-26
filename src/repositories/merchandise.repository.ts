import { prisma } from '../lib/prisma';
type MerchandiseStatus = 'pending' | 'rejected' | 'requires_deprisacheck' | 'accepted' | 'in_transit';

function generateTrackingId(): string {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rand = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `DC-${d}-${rand}`;
}

export const merchandiseRepository = {
  async create(data: {
    clientId: string;
    pointOfSaleId: string;
    merchandiseTypeId: string;
    createdByUserId?: string;
    description?: string;
    classificationCode?: string;
    weight?: number;
    dimensions?: string;
    status?: MerchandiseStatus;
  }) {
    return prisma.merchandise.create({ data: { id: generateTrackingId(), updatedAt: new Date(), ...data } });
  },

  async findById(id: string) {
    return prisma.merchandise.findUnique({
      where: { id },
      include: { Client: true, PointOfSale: true },
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
