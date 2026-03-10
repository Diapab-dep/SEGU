/**
 * Servicio DeprisaCheck (ATO) - Listas de comprobación
 * Tareas 3.2.1 a 3.2.5
 */
import { checklistTemplateRepository } from '../repositories/checklist-template.repository';
import { merchandiseChecklistRepository } from '../repositories/merchandise-checklist.repository';
import { merchandiseRepository } from '../repositories/merchandise.repository';
import { validateChecklistCompletion } from '../validators/checklist.validator';
import { documentationService } from './documentation.service';
import { rejectionService } from './rejection.service';

export const deprisacheckService = {
  async getChecklistTemplates(merchandiseTypeId: string, pointOfSaleType: string) {
    return checklistTemplateRepository.findByMerchandiseTypeAndPointType(merchandiseTypeId, pointOfSaleType);
  },

  async createOrUpdateChecklist(
    merchandiseId: string,
    templateId: string,
    userId: string,
    responses: Record<string, string | boolean>
  ) {
    const existing = await merchandiseChecklistRepository.findByMerchandise(merchandiseId);
    const existingForTemplate = existing.find((c) => c.templateId === templateId);

    const responsesStr = JSON.stringify(responses);

    if (existingForTemplate) {
      return merchandiseChecklistRepository.update(existingForTemplate.id, {
        responses: responsesStr,
      });
    }

    return merchandiseChecklistRepository.create({
      merchandiseId,
      templateId,
      completedByUserId: userId,
      responses: responsesStr,
      status: 'pending',
    });
  },

  async submitChecklistForAcceptance(checklistId: string, userId: string) {
    const validation = await validateChecklistCompletion(checklistId);
    const checklist = await merchandiseChecklistRepository.findById(checklistId);
    if (!checklist) throw new Error('Lista no encontrada');

    const { merchandiseId } = checklist;
    const merchandise = await merchandiseRepository.findById(merchandiseId);
    if (!merchandise) throw new Error('Mercancía no encontrada');

    if (!validation.valid) {
      await merchandiseRepository.updateStatus(merchandiseId, 'rejected', 'Lista de comprobación incompleta');
      await merchandiseChecklistRepository.update(checklistId, {
        status: 'rejected',
        completionDate: new Date(),
      });
      return { accepted: false, missingItems: validation.missingItems };
    }

    await merchandiseRepository.updateStatus(merchandiseId, 'accepted');
    await merchandiseChecklistRepository.update(checklistId, {
      status: 'completed',
      completionDate: new Date(),
    });

    await documentationService.archiveDocumentation(merchandiseId, []);

    return { accepted: true };
  },
};
