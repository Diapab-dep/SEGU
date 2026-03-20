import { merchandiseChecklistRepository } from '../repositories/merchandise-checklist.repository';

export interface ChecklistValidationResult {
  valid: boolean;
  missingItems: string[];
}

/**
 * Valida que una lista de comprobación tenga todos los ítems requeridos completados.
 * Tareas 2.5.1, 2.5.2
 */
export async function validateChecklistCompletion(checklistId: string): Promise<ChecklistValidationResult> {
  const checklist = await merchandiseChecklistRepository.findById(checklistId);
  if (!checklist) {
    return { valid: false, missingItems: ['checklist_not_found'] };
  }

  const items = checklist.ChecklistTemplate?.ChecklistTemplateItem ?? [];
  const requiredItems = items.filter((i) => i.required);
  const responses = (() => {
    try {
      return JSON.parse(checklist.responses) as Record<string, string | boolean>;
    } catch {
      return {};
    }
  })();

  const missingItems: string[] = [];
  for (const item of requiredItems) {
    const value = responses[item.id];
    if (value === undefined || value === null || value === '') {
      missingItems.push(item.id);
    }
  }

  return {
    valid: missingItems.length === 0,
    missingItems,
  };
}
