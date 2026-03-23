/**
 * Pruebas de integración - Recepción de lista de comprobación
 * Tarea 6.2.5
 */
import request from 'supertest';
import app from '../../src/api';
import { prisma } from '../../src/lib/prisma';
import { merchandiseRepository } from '../../src/repositories/merchandise.repository';
import { setupIntegrationTests } from '../setup-integration';

beforeAll(async () => {
  await setupIntegrationTests();
}, 15000);

afterAll(async () => {
  await prisma.$disconnect();
});

describe('6.2.5 Flujo recepción de lista de comprobación', () => {
  let merchandiseId: string;
  let templateId: string;

  beforeAll(async () => {
    const typeBaterias = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'BATERIAS_LITIO' } });
    const template = await prisma.checklistTemplate.findFirst({
      where: { merchandiseTypeId: typeBaterias!.id },
    });
    const merch = await merchandiseRepository.create({
      clientId: 'client-sin-restriccion',
      pointOfSaleId: 'pos-ato-1',
      merchandiseTypeId: typeBaterias!.id,
      status: 'requires_deprisacheck',
    });
    merchandiseId = merch.id;
    templateId = template!.id;
  });

  afterAll(async () => {
    await prisma.merchandiseChecklist.deleteMany({ where: { merchandiseId } });
    await prisma.merchandise.delete({ where: { id: merchandiseId } });
  });

  it('POST /api/checklists/receive crea lista y retorna status received', async () => {
    const res = await request(app)
      .post('/api/checklists/receive')
      .send({
        merchandiseId,
        templateId,
        responses: { 'item-1': true, 'item-2': true },
        source: 'test',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('received');
    expect(res.body.id).toBeDefined();
  });

  it('Rechaza si falta merchandiseId o templateId', async () => {
    const res = await request(app)
      .post('/api/checklists/receive')
      .send({
        responses: {},
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('merchandiseId');
  });
});
