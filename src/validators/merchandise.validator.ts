import { merchandiseTypeCatalogRepository } from '../repositories/merchandise-type-catalog.repository';

/**
 * Evalúa si el tipo de mercancía requiere DeprisaCheck (lista de comprobación).
 * La clasificación es por selección explícita del asesor, no por códigos IATA/IMO.
 * Tipos con requiresChecklist: ANIMALES_VIVOS, RESTOS_HUMANOS, PERECEDEROS, ARMAS,
 * BATERIAS_LITIO, RADIACTIVOS, SUSTANCIAS_BIOLOGICAS, HIELO_SECO
 */
export async function doesMerchandiseTypeRequireChecklist(merchandiseTypeId: string): Promise<boolean> {
  const catalog = await merchandiseTypeCatalogRepository.findById(merchandiseTypeId);
  return catalog?.requiresChecklist ?? false;
}
