/**
 * Setup para pruebas de integración.
 * Garantiza datos de prueba necesarios. Ejecutar db:seed antes.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setupIntegrationTests() {
  const typeEstandar = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'ESTANDAR' } });
  const typeBaterias = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'BATERIAS_LITIO' } });
  const posCity = await prisma.pointOfSale.findUnique({ where: { id: 'pos-city-1' } });
  const posAto = await prisma.pointOfSale.findUnique({ where: { id: 'pos-ato-1' } });
  const client = await prisma.client.findUnique({ where: { id: 'client-1' } });

  if (!typeEstandar || !typeBaterias || !posCity || !posAto || !client) {
    throw new Error('Ejecutar npm run db:seed antes de las pruebas de integración');
  }

  // POS ATO sin usuarios DeprisaCheck (para 6.2.4)
  await prisma.pointOfSale.upsert({
    where: { id: 'pos-ato-sin-users' },
    update: {},
    create: {
      id: 'pos-ato-sin-users',
      name: 'ATO Sin Usuarios',
      type: 'airport_ato',
      isActive: true,
    },
  });

  // Cliente sin restricciones para flujos de aceptación (6.2.1, 6.2.3)
  await prisma.client.upsert({
    where: { id: 'client-sin-restriccion' },
    update: {},
    create: {
      id: 'client-sin-restriccion',
      name: 'Cliente Sin Restricciones',
      email: 'sin-restriccion@test.com',
    },
  });

  // Restricción cliente para 6.2.4 (rechazo por restricción)
  const restriction = await prisma.clientRestriction.findFirst({
    where: { clientId: 'client-1', merchandiseTypeId: typeBaterias.id, pointOfSaleId: 'pos-ato-1' },
  });
  if (!restriction) {
    await prisma.clientRestriction.create({
      data: {
        clientId: 'client-1',
        merchandiseTypeId: typeBaterias.id,
        restrictionType: 'no_permitido',
        pointOfSaleId: 'pos-ato-1',
        isActive: true,
      },
    });
  }

  // POS Ciudad sin permiso para BATERIAS (rechazo 6.2.2)
  await prisma.pointOfSale.upsert({
    where: { id: 'pos-city-sin-permiso' },
    update: {},
    create: {
      id: 'pos-city-sin-permiso',
      name: 'Ciudad Sin Permiso',
      type: 'city',
      isActive: true,
    },
  });
  const handlingReject = await prisma.handlingPermission.findFirst({
    where: {
      pointOfSaleId: 'pos-city-sin-permiso',
      merchandiseTypeId: typeBaterias.id,
    },
  });
  if (!handlingReject) {
    await prisma.handlingPermission.create({
      data: {
        pointOfSaleId: 'pos-city-sin-permiso',
        merchandiseTypeId: typeBaterias.id,
        isPermitted: false,
      },
    });
  }

  await prisma.$disconnect();
}
