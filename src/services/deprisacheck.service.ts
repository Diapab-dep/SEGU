/**
 * Servicio DeprisaCheck (ATO) - Listas de comprobación
 * Tareas 3.2.1 a 3.2.5
 * Ajustado según flujo PDF:
 *  - startTime al crear lista
 *  - endTime al enviar
 *  - rejectsOnYes: preguntas que al contestar "Sí" causan rechazo automático
 *  - Numerales causales de rechazo listados automáticamente
 *  - Email de rechazo al cliente
 */
import { checklistTemplateRepository } from '../repositories/checklist-template.repository';
import { merchandiseChecklistRepository } from '../repositories/merchandise-checklist.repository';
import { merchandiseRepository } from '../repositories/merchandise.repository';
import { validateChecklistCompletion } from '../validators/checklist.validator';
import { documentationService } from './documentation.service';
import { rejectionService } from './rejection.service';
import { auditService } from './audit.service';

export const deprisacheckService = {
  async getChecklistTemplates(merchandiseTypeId: string, pointOfSaleType: string) {
    return checklistTemplateRepository.findByMerchandiseTypeAndPointType(merchandiseTypeId, pointOfSaleType);
  },

  async createOrUpdateChecklist(
    merchandiseId: string,
    templateId: string,
    userId: string,
    responses: Record<string, string | boolean>,
    options?: { guideNumber?: string }
  ) {
    const existing = await merchandiseChecklistRepository.findByMerchandise(merchandiseId);
    const existingForTemplate = existing.find((c) => c.templateId === templateId);
    const responsesStr = JSON.stringify(responses);

    if (existingForTemplate) {
      const updated = await merchandiseChecklistRepository.update(existingForTemplate.id, {
        responses: responsesStr,
        ...(options?.guideNumber ? { guideNumber: options.guideNumber } : {}),
      });
      await auditService.log({
        userId,
        action: 'CHECKLIST_CREATE',
        entityType: 'MerchandiseChecklist',
        entityId: existingForTemplate.id,
        details: { merchandiseId, templateId, updated: true },
      });
      return updated;
    }

    const checklist = await merchandiseChecklistRepository.create({
      merchandiseId,
      templateId,
      completedByUserId: userId,
      responses: responsesStr,
      status: 'pending',
      guideNumber: options?.guideNumber,
      startTime: new Date(),
    });
    await auditService.log({
      userId,
      action: 'CHECKLIST_CREATE',
      entityType: 'MerchandiseChecklist',
      entityId: checklist.id,
      details: { merchandiseId, templateId },
    });
    return checklist;
  },

  async submitChecklistForAcceptance(
    checklistId: string,
    userId: string,
    options?: { clientEmail?: string; observations?: string }
  ) {
    const checklist = await merchandiseChecklistRepository.findById(checklistId);
    if (!checklist) throw new Error('Lista no encontrada');

    const { merchandiseId } = checklist;
    const merchandise = await merchandiseRepository.findById(merchandiseId);
    if (!merchandise) throw new Error('Mercancía no encontrada');

    // Validar completitud (todos los items requeridos respondidos)
    const validation = await validateChecklistCompletion(checklistId);

    // Detectar preguntas rejectsOnYes que fueron respondidas "Sí" (valor 'true' o true)
    const responses: Record<string, string | boolean> = JSON.parse(checklist.responses as string);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const templateItems: any[] = checklist.ChecklistTemplate?.ChecklistTemplateItem ?? [];
    const autoRejectedItems = templateItems
      .filter((item) => item.rejectsOnYes && (responses[item.id] === true || responses[item.id] === 'true'))
      .map((item) => String(item.order));

    const isRejected = !validation.valid || autoRejectedItems.length > 0;

    if (isRejected) {
      const allRejectedNumerals = [...autoRejectedItems];
      const rejectedItemsStr = allRejectedNumerals.join(', ');

      await merchandiseRepository.updateStatus(merchandiseId, 'rejected', 'Lista de comprobación rechazada');
      await merchandiseChecklistRepository.update(checklistId, {
        status: 'rejected',
        completionDate: new Date(),
        endTime: new Date(),
        rejectedItems: rejectedItemsStr,
        clientEmail: options?.clientEmail,
        observations: options?.observations,
      });

      await auditService.log({
        userId,
        action: 'CHECKLIST_REJECT',
        entityType: 'MerchandiseChecklist',
        entityId: checklistId,
        details: {
          merchandiseId,
          missingItems: validation.missingItems,
          autoRejectedItems,
        },
      });

      // Enviar email de rechazo si se proporcionó correo del cliente
      let emailSent = false;
      if (options?.clientEmail) {
        const result = await rejectionService.sendRejectionEmail({
          clientEmail: options.clientEmail,
          checklistId,
          rejectedItemNumbers: allRejectedNumerals,
          observations: options.observations,
        });
        emailSent = result.sent;
      }

      return {
        accepted: false,
        missingItems: validation.missingItems,
        rejectedByItems: autoRejectedItems,
        rejectedItemNumbers: allRejectedNumerals,
        emailSent,
      };
    }

    // Aceptado
    await merchandiseRepository.updateStatus(merchandiseId, 'accepted');
    await merchandiseChecklistRepository.update(checklistId, {
      status: 'completed',
      completionDate: new Date(),
      endTime: new Date(),
    });

    await auditService.log({
      userId,
      action: 'CHECKLIST_SUBMIT',
      entityType: 'MerchandiseChecklist',
      entityId: checklistId,
      details: { merchandiseId, accepted: true },
    });

    await documentationService.archiveDocumentation(merchandiseId, []);

    return { accepted: true };
  },
};
