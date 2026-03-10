/**
 * Servicio de Admisión - Flujo principal
 * Tareas 3.1.1 a 3.1.6
 */
import { merchandiseRepository } from '../repositories/merchandise.repository';
import { pointOfSaleRepository } from '../repositories/point-of-sale.repository';
import {
  doesMerchandiseTypeRequireChecklist,
  hasClientOrBaseRestriction,
  hasDeprisaCheckEnabledUsers,
  isHandlingPermitted,
} from '../validators';
import { rejectionService } from './rejection.service';
import type { MerchandiseData } from '../types';

export interface StartAdmissionResult {
  status: string;
  merchandiseId: string;
  requiresDeprisacheck?: boolean;
  rejectionReason?: string;
}

export const admissionService = {
  async startAdmission(
    merchandiseData: MerchandiseData,
    pointOfSaleId: string,
    userId?: string
  ): Promise<StartAdmissionResult> {
    const pointOfSale = await pointOfSaleRepository.findById(pointOfSaleId);
    if (!pointOfSale) throw new Error('Punto de venta no encontrado');

    const merchandise = await merchandiseRepository.create({
      clientId: merchandiseData.clientId,
      pointOfSaleId,
      merchandiseTypeId: merchandiseData.merchandiseTypeId,
      description: merchandiseData.description,
      classificationCode: merchandiseData.classificationCode,
      weight: merchandiseData.weight,
      dimensions: merchandiseData.dimensions,
      status: 'pending',
    });

    const requiresChecklist = await doesMerchandiseTypeRequireChecklist(merchandiseData.merchandiseTypeId);

    if (!requiresChecklist) {
      return {
        status: 'pending',
        merchandiseId: merchandise.id,
        requiresDeprisacheck: false,
      };
    }

    if (pointOfSale.type === 'airport_ato') {
      const hasRestriction = await hasClientOrBaseRestriction(
        merchandiseData.clientId,
        merchandiseData.merchandiseTypeId,
        pointOfSaleId
      );
      if (hasRestriction) {
        await rejectionService.rejectAdmission(merchandise.id, 'Restricción cliente o base');
        return {
          status: 'rejected',
          merchandiseId: merchandise.id,
          rejectionReason: 'Restricción cliente o base',
        };
      }

      const hasUsers = await hasDeprisaCheckEnabledUsers(pointOfSaleId);
      if (!hasUsers) {
        await rejectionService.rejectAdmission(merchandise.id, 'No hay usuarios habilitados para DeprisaCheck');
        return {
          status: 'rejected',
          merchandiseId: merchandise.id,
          rejectionReason: 'No hay usuarios habilitados para DeprisaCheck',
        };
      }

      await merchandiseRepository.updateStatus(merchandise.id, 'requires_deprisacheck');

      return {
        status: 'requires_deprisacheck',
        merchandiseId: merchandise.id,
        requiresDeprisacheck: true,
      };
    }

    if (pointOfSale.type === 'city') {
      const permitted = await isHandlingPermitted(
        pointOfSaleId,
        merchandiseData.merchandiseTypeId
      );
      if (!permitted) {
        await rejectionService.rejectAdmission(merchandise.id, 'Manejo no permitido');
        return {
          status: 'rejected',
          merchandiseId: merchandise.id,
          rejectionReason: 'Manejo no permitido',
        };
      }

      return {
        status: 'pending',
        merchandiseId: merchandise.id,
        requiresDeprisacheck: false,
      };
    }

    return {
      status: 'pending',
      merchandiseId: merchandise.id,
    };
  },
};
