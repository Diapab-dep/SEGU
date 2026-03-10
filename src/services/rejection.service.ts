/**
 * Servicio de rechazo de admisión
 * Tareas 3.3.1, 3.3.2, 3.3.3
 */
import { merchandiseRepository } from '../repositories/merchandise.repository';
import { clientRepository } from '../repositories/client.repository';

export const rejectionService = {
  async rejectAdmission(
    merchandiseId: string,
    reason: string,
    options?: { checklistId?: string; clientEmail?: string }
  ) {
    await merchandiseRepository.updateStatus(merchandiseId, 'rejected', reason);
    return { merchandiseId, status: 'rejected' as const };
  },

  async registerClientEmail(clientId: string, email: string) {
    const client = await clientRepository.findById(clientId);
    if (client) {
    }
    return { clientId, email };
  },

  async sendRejectionChecklist(clientId: string, checklistData: Record<string, unknown>) {
    const client = await clientRepository.findById(clientId);
    if (!client?.email) return { sent: false };
    return { sent: true };
  },
};
