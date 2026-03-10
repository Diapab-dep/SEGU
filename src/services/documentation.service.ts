/**
 * Servicio de documentación y almacenamiento (SGD/storage)
 * Tareas 3.4.1, 3.4.2, 3.4.3, 3.4.4
 */
import { guideRepository } from '../repositories/guide.repository';
import { manifestRepository } from '../repositories/manifest.repository';
import { merchandiseRepository } from '../repositories/merchandise.repository';
import type { Document } from '../types';

const GUIDE_PREFIX = 'GUA';

export const documentationService = {
  async archiveDocumentation(merchandiseId: string, documents: Document[]): Promise<string[]> {
    const urls: string[] = [];
    for (const doc of documents) {
      const url = `storage://${merchandiseId}/${doc.name}`;
      urls.push(url);
    }
    return urls;
  },

  async generateAndPrintGuide(merchandiseId: string): Promise<{ guideNumber: string; documentUrl: string }> {
    const merchandise = await merchandiseRepository.findById(merchandiseId);
    if (!merchandise) throw new Error('Mercancía no encontrada');

    const guideNumber = `${GUIDE_PREFIX}-${Date.now()}`;
    const documentUrl = `storage://guides/${guideNumber}.pdf`;

    await guideRepository.create({
      guideNumber,
      merchandiseId,
      documentUrl,
    });

    return { guideNumber, documentUrl };
  },

  async generateManifest(merchandiseIds: string[], pointOfSaleId: string) {
    const manifestNumber = `MAN-${Date.now()}`;
    const manifest = await manifestRepository.create({
      manifestNumber,
      pointOfSaleId,
      merchandiseIds: JSON.stringify(merchandiseIds),
    });
    return manifest;
  },

  async deliverToOperations(manifestId: string) {
    return manifestRepository.updateStatus(manifestId, 'delivered');
  },
};
