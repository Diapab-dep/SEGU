import { merchandiseTypeCatalogRepository } from '../repositories/merchandise-type-catalog.repository';
import { doesMerchandiseTypeRequireChecklist } from './merchandise.validator';

jest.mock('../repositories/merchandise-type-catalog.repository');

describe('doesMerchandiseTypeRequireChecklist', () => {
  it('retorna true cuando el tipo requiere checklist', async () => {
    (merchandiseTypeCatalogRepository.findById as jest.Mock).mockResolvedValue({
      id: '1',
      requiresChecklist: true,
    });
    expect(await doesMerchandiseTypeRequireChecklist('1')).toBe(true);
  });

  it('retorna false cuando el tipo no requiere checklist', async () => {
    (merchandiseTypeCatalogRepository.findById as jest.Mock).mockResolvedValue({
      id: '1',
      requiresChecklist: false,
    });
    expect(await doesMerchandiseTypeRequireChecklist('1')).toBe(false);
  });

  it('retorna false cuando el tipo no existe', async () => {
    (merchandiseTypeCatalogRepository.findById as jest.Mock).mockResolvedValue(null);
    expect(await doesMerchandiseTypeRequireChecklist('invalid')).toBe(false);
  });
});
