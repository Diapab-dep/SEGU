import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MERCHANDISE_TYPES = [
  { code: 'ANIMALES_VIVOS', name: 'Animales vivos', requiresChecklist: true },
  { code: 'RESTOS_HUMANOS', name: 'Restos humanos', requiresChecklist: true },
  { code: 'PERECEDEROS', name: 'Perecederos', requiresChecklist: true },
  { code: 'ARMAS', name: 'Armas', requiresChecklist: true },
  { code: 'BATERIAS_LITIO', name: 'Baterías de litio', requiresChecklist: true },
  { code: 'RADIACTIVOS', name: 'Radiactivos y no radiactivos', requiresChecklist: true },
  { code: 'SUSTANCIAS_BIOLOGICAS', name: 'Sustancias biológicas', requiresChecklist: true },
  { code: 'HIELO_SECO', name: 'Hielo seco', requiresChecklist: true },
  { code: 'ESTANDAR', name: 'Mercancía estándar', requiresChecklist: false },
];

async function main() {
  for (const t of MERCHANDISE_TYPES) {
    await prisma.merchandiseTypeCatalog.upsert({
      where: { code: t.code },
      update: { name: t.name, requiresChecklist: t.requiresChecklist },
      create: t,
    });
  }

  // Limpiar restricciones acumuladas por tests anteriores
  await prisma.clientRestriction.deleteMany({ where: { clientId: 'client-1' } });

  const client = await prisma.client.upsert({
    where: { id: 'client-1' },
    update: {},
    create: { id: 'client-1', name: 'Cliente Ejemplo', email: 'cliente@example.com' },
  });

  const posCity = await prisma.pointOfSale.upsert({
    where: { id: 'pos-city-1' },
    update: {},
    create: {
      id: 'pos-city-1',
      name: 'Punto Ciudad 1',
      type: 'city',
      isActive: true,
    },
  });

  const posAto = await prisma.pointOfSale.upsert({
    where: { id: 'pos-ato-1' },
    update: { name: 'ATO Punto 1' },
    create: {
      id: 'pos-ato-1',
      name: 'ATO Punto 1',
      type: 'airport_ato',
      isActive: true,
    },
  });

  // Contraseñas de prueba (bcrypt 10 rounds):
  // asesor_ato → asesor123
  // supervisor → super123
  // admin      → admin123
  await prisma.user.upsert({
    where: { username: 'asesor_ato' },
    update: { role: 'advisor', passwordHash: '$2b$10$oa6x.NAEM/K9XgFKeWw3ROfbKV4vPWH.Ma9jfOl9J0tl.ZJrEkicC' },
    create: {
      username: 'asesor_ato',
      passwordHash: '$2b$10$oa6x.NAEM/K9XgFKeWw3ROfbKV4vPWH.Ma9jfOl9J0tl.ZJrEkicC',
      email: 'asesor@example.com',
      role: 'advisor',
      isDeprisacheckEnabled: true,
      pointOfSaleId: posAto.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'supervisor' },
    update: { passwordHash: '$2b$10$qUdTC8zweodbPzUK/ckedeYHrmncwvpb5V5xZvzrRchR2LULuS3zS' },
    create: {
      username: 'supervisor',
      passwordHash: '$2b$10$qUdTC8zweodbPzUK/ckedeYHrmncwvpb5V5xZvzrRchR2LULuS3zS',
      email: 'supervisor@example.com',
      role: 'supervisor',
    },
  });

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: '$2b$10$kxv9PiIL3mDvG3jhsR8ToeCxtOVzSzzEcXtPL1i8FpCtXl7SFE3Ue' },
    create: {
      username: 'admin',
      passwordHash: '$2b$10$kxv9PiIL3mDvG3jhsR8ToeCxtOVzSzzEcXtPL1i8FpCtXl7SFE3Ue',
      email: 'admin@example.com',
      role: 'admin',
    },
  });

  const typeBaterias = await prisma.merchandiseTypeCatalog.findUnique({
    where: { code: 'BATERIAS_LITIO' },
  });

  if (typeBaterias) {
    const template = await prisma.checklistTemplate.upsert({
      where: { id: 'template-1' },
      update: { pointOfSaleType: 'ato' },
      create: {
        id: 'template-1',
        name: 'Lista Baterías de Litio',
        merchandiseTypeId: typeBaterias.id,
        pointOfSaleType: 'ato',
        isActive: true,
      },
    });

    await prisma.checklistTemplateItem.upsert({
      where: { id: 'item-1' },
      update: {},
      create: { id: 'item-1', templateId: template.id, text: 'Documentación completa', required: true, order: 0 },
    });
    await prisma.checklistTemplateItem.upsert({
      where: { id: 'item-2' },
      update: {},
      create: { id: 'item-2', templateId: template.id, text: 'Embalaje correcto', required: true, order: 1 },
    });
  }

  console.log('Seed completado:', { client, posCity, posAto });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
