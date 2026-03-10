/**
 * Servicio de recepción de listas de comprobación externas
 * Tareas 3.5.1, 3.5.2
 */
import { prisma } from '../lib/prisma';

export interface ReceivedChecklistData {
  externalId?: string;
  merchandiseId?: string;
  templateId?: string;
  responses: Record<string, string | boolean>;
  source?: string;
}

export const checklistReceiveService = {
  async receiveChecklist(externalData: ReceivedChecklistData) {
    if (!externalData.responses || typeof externalData.responses !== 'object') {
      throw new Error('Formato de lista de comprobación inválido');
    }
    if (!externalData.merchandiseId || !externalData.templateId) {
      throw new Error('merchandiseId y templateId son requeridos');
    }

    const record = await prisma.merchandiseChecklist.create({
      data: {
        merchandiseId: externalData.merchandiseId,
        templateId: externalData.templateId,
        responses: JSON.stringify(externalData.responses),
        status: 'pending',
      },
    });

    return { id: record.id, status: 'received' };
  },
};
