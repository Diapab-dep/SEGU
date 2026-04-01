import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';

export const merchandiseChecklistRepository = {
  async create(data: {
    merchandiseId: string;
    templateId: string;
    completedByUserId?: string;
    responses: string;
    status?: 'pending' | 'completed' | 'rejected';
    guideNumber?: string;
    startTime?: Date;
  }) {
    return prisma.merchandiseChecklist.create({ data: { id: uuidv4(), updatedAt: new Date(), ...data } });
  },

  async findById(id: string) {
    return prisma.merchandiseChecklist.findUnique({
      where: { id },
      include: { Merchandise: true, ChecklistTemplate: { include: { ChecklistTemplateItem: true } } },
    });
  },

  async findByMerchandise(merchandiseId: string) {
    return prisma.merchandiseChecklist.findMany({
      where: { merchandiseId },
      include: { ChecklistTemplate: { include: { ChecklistTemplateItem: true } } },
    });
  },

  async update(id: string, data: {
    responses?: string;
    status?: string;
    completionDate?: Date;
    completedByUserId?: string;
    approvedByUserId?: string;
    approvedAt?: Date;
    startTime?: Date;
    endTime?: Date;
    guideNumber?: string;
    clientEmail?: string;
    observations?: string;
    rejectedItems?: string;
  }) {
    return prisma.merchandiseChecklist.update({
      where: { id },
      data,
    });
  },
};
