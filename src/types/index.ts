/**
 * Tipos y enums para el proceso de admisión de mercancía DeprisaDocs
 */

export type MerchandiseStatus = 'pending' | 'rejected' | 'requires_deprisacheck' | 'accepted' | 'in_transit';
export type PointOfSaleType = 'city' | 'airport_ato';

/** Selección explícita del asesor: ID del tipo en el catálogo (MerchandiseTypeCatalog) */
export interface MerchandiseData {
  clientId: string;
  merchandiseTypeId: string;  // Obligatorio: tipo seleccionado del catálogo
  description?: string;
  classificationCode?: string;
  weight?: number;
  dimensions?: string;
}

export interface StartAdmissionRequest {
  merchandiseData: MerchandiseData;
  pointOfSaleId: string;
}

export interface StartAdmissionResult {
  status: MerchandiseStatus | 'requires_deprisacheck';
  merchandiseId: string;
  requiresDeprisacheck?: boolean;
  rejectionReason?: string;
}

export interface ChecklistResponse {
  itemId: string;
  value: string | boolean;
}

export interface Document {
  name: string;
  content: Buffer | string;
  mimeType: string;
}
