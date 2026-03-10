import { clientRestrictionRepository } from '../repositories/client-restriction.repository';
import { pointOfSaleRepository } from '../repositories/point-of-sale.repository';
type MerchandiseType = 'standard' | 'dangerous' | 'special';

/**
 * Verifica si existe restricción de cliente o base para el tipo de mercancía.
 * Tareas 2.2.1, 2.2.2, 2.2.3
 */
export async function hasClientOrBaseRestriction(
  clientId: string,
  merchandiseTypeId: string,
  pointOfSaleId: string
): Promise<boolean> {
  const [clientRestrictions, pointOfSale] = await Promise.all([
    clientRestrictionRepository.findByClientAndMerchandise(clientId, merchandiseTypeId, pointOfSaleId),
    pointOfSaleRepository.findById(pointOfSaleId),
  ]);

  if (clientRestrictions.length > 0) return true;

  if (pointOfSale?.baseRestrictions) {
    const restrictionIds = pointOfSale.baseRestrictions.split(',').filter(Boolean);
    if (restrictionIds.length > 0) return true;
  }

  return false;
}
