"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
const now = new Date();

// Tipos de mercancía según flujo PDF:
// Especiales: Animales vivos (A-H, 79 preguntas), Restos humanos (A-E, 30), Armas (A-E, 21), Perecederos (A-B, 15+)
// Peligrosas: Baterías litio (A-F, 24), Hielo seco (A-F, 20), No radiactivas (A-D, 50), Radiactivas (A-E, 58), Sustancias biológicas (A-G, 40)
const MERCHANDISE_TYPES = [
  { code: 'ANIMALES_VIVOS',       name: 'Animales vivos',            category: 'especial',  requiresChecklist: true  },
  { code: 'RESTOS_HUMANOS',       name: 'Restos humanos',            category: 'especial',  requiresChecklist: true  },
  { code: 'ARMAS',                name: 'Armas',                     category: 'especial',  requiresChecklist: true  },
  { code: 'PERECEDEROS',          name: 'Perecederos',               category: 'especial',  requiresChecklist: true  },
  { code: 'BATERIAS_LITIO',       name: 'Baterías de litio exceptuadas', category: 'peligrosa', requiresChecklist: true },
  { code: 'HIELO_SECO',           name: 'Hielo seco',                category: 'peligrosa', requiresChecklist: true  },
  { code: 'NO_RADIACTIVOS',       name: 'No radiactivas',            category: 'peligrosa', requiresChecklist: true  },
  { code: 'RADIACTIVOS',          name: 'Radiactivas',               category: 'peligrosa', requiresChecklist: true  },
  { code: 'SUSTANCIAS_BIOLOGICAS',name: 'Sustancias biológicas',     category: 'peligrosa', requiresChecklist: true  },
  { code: 'ESTANDAR',             name: 'Mercancía estándar',        category: null,         requiresChecklist: false },
];

async function main() {
  // 1. Tipos de mercancía
  for (const t of MERCHANDISE_TYPES) {
    await prisma.merchandiseTypeCatalog.upsert({
      where: { code: t.code },
      update: { name: t.name, category: t.category, requiresChecklist: t.requiresChecklist, updatedAt: now },
      create: { id: (0, uuid_1.v4)(), updatedAt: now, ...t },
    });
  }

  // 2. Puntos de venta
  const posCity = await prisma.pointOfSale.upsert({
    where: { id: 'pos-city-1' },
    update: { updatedAt: now },
    create: { id: 'pos-city-1', name: 'Punto Ciudad 1', type: 'city', isActive: true, updatedAt: now },
  });

  const posAto = await prisma.pointOfSale.upsert({
    where: { id: 'pos-ato-1' },
    update: { name: 'ATO Punto 1', updatedAt: now },
    create: { id: 'pos-ato-1', name: 'ATO Punto 1', type: 'airport_ato', isActive: true, updatedAt: now },
  });

  // 3. Usuarios de prueba
  // Contraseñas: asesor_ato → asesor123 | supervisor → super123 | admin → admin123
  await prisma.user.upsert({
    where: { username: 'asesor_ato' },
    update: { role: 'advisor', passwordHash: '$2b$10$oa6x.NAEM/K9XgFKeWw3ROfbKV4vPWH.Ma9jfOl9J0tl.ZJrEkicC', updatedAt: now },
    create: {
      id: (0, uuid_1.v4)(), updatedAt: now,
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
    update: { passwordHash: '$2b$10$qUdTC8zweodbPzUK/ckedeYHrmncwvpb5V5xZvzrRchR2LULuS3zS', updatedAt: now },
    create: {
      id: (0, uuid_1.v4)(), updatedAt: now,
      username: 'supervisor',
      passwordHash: '$2b$10$qUdTC8zweodbPzUK/ckedeYHrmncwvpb5V5xZvzrRchR2LULuS3zS',
      email: 'supervisor@example.com',
      role: 'supervisor',
    },
  });

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: '$2b$10$kxv9PiIL3mDvG3jhsR8ToeCxtOVzSzzEcXtPL1i8FpCtXl7SFE3Ue', updatedAt: now },
    create: {
      id: (0, uuid_1.v4)(), updatedAt: now,
      username: 'admin',
      passwordHash: '$2b$10$kxv9PiIL3mDvG3jhsR8ToeCxtOVzSzzEcXtPL1i8FpCtXl7SFE3Ue',
      email: 'admin@example.com',
      role: 'admin',
    },
  });

  // 4. Cliente de ejemplo
  await prisma.clientRestriction.deleteMany({ where: { clientId: 'client-1' } });
  const client = await prisma.client.upsert({
    where: { id: 'client-1' },
    update: { updatedAt: now },
    create: { id: 'client-1', name: 'Cliente Ejemplo', email: 'cliente@example.com', updatedAt: now },
  });

  // 5. Plantillas de lista de comprobación
  // ------------------------------------------------------------------
  // ANIMALES VIVOS — 8 segmentos (A-H), requiere ventana "información del envío"
  // ------------------------------------------------------------------
  const typeAnimales = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'ANIMALES_VIVOS' } });
  if (typeAnimales) {
    const tpl = await prisma.checklistTemplate.upsert({
      where: { id: 'tpl-animales-vivos' },
      update: { updatedAt: now },
      create: {
        id: 'tpl-animales-vivos', updatedAt: now,
        name: 'Lista de comprobación para la aceptación de animales vivos',
        merchandiseTypeId: typeAnimales.id,
        pointOfSaleType: 'ato',
        isActive: true,
      },
    });

    const animalesItems = [
      // SEGMENTO A: TIPO DE ENVÍO
      { id: 'av-a-1', segment: 'A', order: 1,  rejectsOnYes: false, required: true,
        text: '¿El envío contiene algún animal que se encuentra descrito en la lista CITES, apéndice I y no cuenta con los permisos necesarios?' },
      { id: 'av-a-2', segment: 'A', order: 2,  rejectsOnYes: true,  required: true,
        text: '¿El envío contiene restos de animales o trofeos de caza?' },
      { id: 'av-a-3', segment: 'A', order: 3,  rejectsOnYes: true,  required: true,
        text: '¿El propósito del transporte del animal es para pruebas, investigaciones y experimentos en laboratorios?' },
      { id: 'av-a-4', segment: 'A', order: 4,  rejectsOnYes: true,  required: true,
        text: '¿El envío contiene algún animal que está sedado, se le haya suministrado tranquilizantes o que tenga algún problema de salud que no le permita su transporte aéreo?' },
      { id: 'av-a-5', segment: 'A', order: 5,  rejectsOnYes: true,  required: true,
        text: '¿El envío contiene primates con fines de explotación o negociación entre asociaciones de mascotas, personas individuales o empresas que deseen comercializar este tipo de animales vivos?' },
      { id: 'av-a-6', segment: 'A', order: 6,  rejectsOnYes: true,  required: true,
        text: '¿El envío contiene alguna raza que sea considerada braquiocefálica por Deprisa? Incluye cruces o derivaciones que provengan de estas razas' },
      // SEGMENTO B: ACEPTACIÓN GENERAL
      { id: 'av-b-1', segment: 'B', order: 7,  rejectsOnYes: false, required: true,
        text: '¿Se verificó con el área de operaciones de la base si es posible realizar el transporte y entrega de los animales vivos en el(los) vuelo(s) objetivo(s)? Aplica también para transportes con tránsitos.' },
      { id: 'av-b-2', segment: 'B', order: 8,  rejectsOnYes: false, required: true,
        text: '¿Se han hecho arreglos previos y/o se verificó con el aeropuerto de destino si es posible su entrega?' },
      { id: 'av-b-3', segment: 'B', order: 9,  rejectsOnYes: false, required: true,
        text: 'A la hora del proceso de aceptación ¿Validó si la aeronave del vuelo objetivo cuenta con compartimientos de carga ventilados? No aplica para peces que viajan con oxígeno en sus contenedores.' },
      { id: 'av-b-4', segment: 'B', order: 10, rejectsOnYes: false, required: true,
        text: 'A la hora del proceso de aceptación y para transportes con tránsito ¿Validó con la base correspondiente si la aeronave del vuelo desde el aeropuerto de tránsito a destino cuenta con compartimientos de carga ventilados? No aplica para peces que viajan con oxígeno en sus contenedores.' },
      { id: 'av-b-5', segment: 'B', order: 11, rejectsOnYes: false, required: true,
        text: '¿Cumple el envío con las reglamentaciones vigentes en las estaciones de tránsito? Aplica principalmente para conexiones internacionales.' },
      { id: 'av-b-6', segment: 'B', order: 12, rejectsOnYes: false, required: true,
        text: 'Cuando corresponda, ¿se han cumplido las excepciones del operador/gobierno?' },
      { id: 'av-b-7', segment: 'B', order: 13, rejectsOnYes: false, required: true,
        text: 'Si el propósito del transporte es comercial ¿El cliente presentó la factura comercial del animal vivo?' },
      // SEGMENTO C: DOCUMENTACIÓN
      { id: 'av-c-1', segment: 'C', order: 14, rejectsOnYes: false, required: true,
        text: '¿El cliente presentó la documentación requerida para el transporte del animal (certificado sanitario, permiso CITES si aplica, etc.)?' },
      { id: 'av-c-2', segment: 'C', order: 15, rejectsOnYes: false, required: true,
        text: '¿La documentación presentada se encuentra vigente y corresponde al animal que va a ser transportado?' },
      // SEGMENTO D: CONTENEDOR
      { id: 'av-d-1', segment: 'D', order: 16, rejectsOnYes: false, required: true,
        text: '¿El contenedor cumple con los requisitos de la IATA para el transporte del tipo de animal?' },
      { id: 'av-d-2', segment: 'D', order: 17, rejectsOnYes: false, required: true,
        text: '¿El contenedor está en buenas condiciones (sin roturas, sin daños que comprometan la seguridad del animal)?' },
      { id: 'av-d-3', segment: 'D', order: 18, rejectsOnYes: false, required: true,
        text: '¿El contenedor tiene ventilación adecuada según las especificaciones de la IATA?' },
      { id: 'av-d-4', segment: 'D', order: 19, rejectsOnYes: false, required: true,
        text: '¿El animal tiene espacio suficiente para ponerse de pie, darse vuelta y acostarse en posición natural?' },
      // SEGMENTO E: ESTADO DEL ANIMAL
      { id: 'av-e-1', segment: 'E', order: 20, rejectsOnYes: false, required: true,
        text: '¿El animal presenta buen estado de salud visible?' },
      { id: 'av-e-2', segment: 'E', order: 21, rejectsOnYes: true,  required: true,
        text: '¿El animal presenta signos de estrés severo, agitación extrema o dificultad respiratoria?' },
      { id: 'av-e-3', segment: 'E', order: 22, rejectsOnYes: false, required: true,
        text: '¿El animal cuenta con agua disponible en el contenedor para el viaje?' },
      // SEGMENTO F: ALIMENTACIÓN Y ABREVADO
      { id: 'av-f-1', segment: 'F', order: 23, rejectsOnYes: false, required: true,
        text: 'Si se requiere/aplica que el(los) animal(es) deban ser alimentados/abrevados en ruta, ¿el expedidor ha hecho arreglos con el operador? (Solo aplica para cuando la duración total de la suma de los vuelos es superior a 3 horas)' },
      { id: 'av-f-2', segment: 'F', order: 24, rejectsOnYes: false, required: true,
        text: 'En el caso de que se suministre alimentos y/o bebidas para el transporte del animal, ¿se fijó al contenedor las instrucciones especiales de alimentación y abrevado, adicionalmente, se anexo una copia a la documentación que acompaña el embarque?' },
      // SEGMENTO G: ETIQUETADO
      { id: 'av-g-1', segment: 'G', order: 25, rejectsOnYes: false, required: true,
        text: '¿El contenedor tiene la etiqueta "Este lado hacia arriba" (This Way Up)?' },
      { id: 'av-g-2', segment: 'G', order: 26, rejectsOnYes: false, required: true,
        text: '¿El contenedor tiene la etiqueta de "Animales Vivos"?' },
      { id: 'av-g-3', segment: 'G', order: 27, rejectsOnYes: false, required: true,
        text: '¿El contenedor está correctamente identificado con el nombre del propietario y datos de contacto?' },
      // SEGMENTO H: CIERRE Y VERIFICACIÓN FINAL
      { id: 'av-h-1', segment: 'H', order: 28, rejectsOnYes: false, required: true,
        text: '¿Se verificó que el contenedor esté correctamente cerrado y asegurado para el transporte?' },
      { id: 'av-h-2', segment: 'H', order: 29, rejectsOnYes: false, required: true,
        text: '¿Se ha diligenciado completamente por lo menos una copia? Una copia firmada debe ser archivada por Deprisa.' },
    ];

    for (const item of animalesItems) {
      await prisma.checklistTemplateItem.upsert({
        where: { id: item.id },
        update: { text: item.text, segment: item.segment, order: item.order, rejectsOnYes: item.rejectsOnYes, required: item.required },
        create: { id: item.id, templateId: tpl.id, text: item.text, segment: item.segment, order: item.order, rejectsOnYes: item.rejectsOnYes, required: item.required },
      });
    }
  }

  // ------------------------------------------------------------------
  // BATERÍAS DE LITIO — 6 segmentos (A-F), 24 preguntas
  // ------------------------------------------------------------------
  const typeBaterias = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'BATERIAS_LITIO' } });
  if (typeBaterias) {
    const tpl = await prisma.checklistTemplate.upsert({
      where: { id: 'tpl-baterias-litio' },
      update: { updatedAt: now },
      create: {
        id: 'tpl-baterias-litio', updatedAt: now,
        name: 'Lista de comprobación para la aceptación de baterías de litio y sodio Sección II PI966, PI967, PI969, PI970, PI977, PI978',
        merchandiseTypeId: typeBaterias.id,
        pointOfSaleType: 'ato',
        isActive: true,
      },
    });

    const bateriasItems = [
      // SEGMENTO A: INFORMACIÓN DEL REMITENTE
      { id: 'bat-a-1', segment: 'A', order: 1,  rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿El envío cuenta con la declaración del expedidor de mercancías peligrosas?' },
      { id: 'bat-a-2', segment: 'A', order: 2,  rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿La declaración del expedidor está correctamente diligenciada y firmada?' },
      // SEGMENTO B: IDENTIFICACIÓN Y CLASIFICACIÓN
      { id: 'bat-b-1', segment: 'B', order: 3,  rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿El número ONU (UN) indicado en la documentación corresponde al tipo de batería declarada?' },
      { id: 'bat-b-2', segment: 'B', order: 4,  rejectsOnYes: true,  hasExpansion: false, required: true,
        text: '¿Las baterías están clasificadas como peligrosas Sección I (PI965, PI968, PI971)? (Estas NO son aceptadas)' },
      // SEGMENTO C: EMBALAJE INTERIOR
      { id: 'bat-c-1', segment: 'C', order: 5,  rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿Cada batería o celda está embalada individualmente para prevenir cortocircuitos?' },
      { id: 'bat-c-2', segment: 'C', order: 6,  rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿El embalaje interior cumple con los requisitos de la instrucción de embalaje aplicable?' },
      { id: 'bat-c-3', segment: 'C', order: 7,  rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿El contenido de litio por celda/batería no supera los límites permitidos para Sección II?' },
      // SEGMENTO D: SOBREMBALAJE
      { id: 'bat-d-1', segment: 'D', order: 8,  rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿El embalaje exterior cumple con los requisitos aplicables establecidos por la instrucción de embalaje correspondiente?' },
      { id: 'bat-d-2', segment: 'D', order: 9,  rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿Cada bulto marcado de manera duradera y legible con la marca de batería (Ver figura 7.1C DGR IATA)?' },
      { id: 'bat-d-3', segment: 'D', order: 10, rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿El sobrembalaje marcado con la palabra "SOBREMBALAJE"?' },
      { id: 'bat-d-4', segment: 'D', order: 11, rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿El sobrembalaje tiene la marca de batería y es visible?' },
      { id: 'bat-d-5', segment: 'D', order: 12, rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿Los bultos están asegurados dentro del sobreembalaje?' },
      // SEGMENTO E: GENERALES
      { id: 'bat-e-1', segment: 'E', order: 13, rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿El envío cumple con las disposiciones especiales aplicables?' },
      { id: 'bat-e-2', segment: 'E', order: 14, rejectsOnYes: false, hasExpansion: true,  required: true,
        expansionLabel: 'Ampliación - Variaciones de estado y operadores',
        text: '¿El envío cumple con las variaciones de estados y operadores?' },
      // SEGMENTO F: CANTIDAD LÍMITE
      { id: 'bat-f-1', segment: 'F', order: 15, rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿La cantidad neta por bulto no excede los límites establecidos en la instrucción de embalaje aplicable?' },
      { id: 'bat-f-2', segment: 'F', order: 16, rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿El peso bruto del bulto no supera el límite establecido?' },
      { id: 'bat-f-3', segment: 'F', order: 17, rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿El número de bultos está dentro de los límites por vuelo/aeronave?' },
      { id: 'bat-f-4', segment: 'F', order: 18, rejectsOnYes: false, hasExpansion: false, required: true,
        text: '¿El bulto cumple con el embalaje exterior descrito en la instrucción de embalaje?' },
    ];

    for (const item of bateriasItems) {
      await prisma.checklistTemplateItem.upsert({
        where: { id: item.id },
        update: { text: item.text, segment: item.segment, order: item.order, rejectsOnYes: item.rejectsOnYes, hasExpansion: item.hasExpansion, expansionLabel: item.expansionLabel ?? null, required: item.required },
        create: { id: item.id, templateId: tpl.id, text: item.text, segment: item.segment, order: item.order, rejectsOnYes: item.rejectsOnYes, hasExpansion: item.hasExpansion, expansionLabel: item.expansionLabel ?? null, required: item.required },
      });
    }
  }

  // ------------------------------------------------------------------
  // PERECEDEROS — 2 segmentos (A-B)
  // ------------------------------------------------------------------
  const typePerec = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'PERECEDEROS' } });
  if (typePerec) {
    const tpl = await prisma.checklistTemplate.upsert({
      where: { id: 'tpl-perecederos' },
      update: { updatedAt: now },
      create: {
        id: 'tpl-perecederos', updatedAt: now,
        name: 'Lista de comprobación para la aceptación de perecederos',
        merchandiseTypeId: typePerec.id,
        pointOfSaleType: 'ato',
        isActive: true,
      },
    });

    const perecItems = [
      // SEGMENTO A: INFORMACIÓN DEL EMBARQUE
      { id: 'per-a-1', segment: 'A', order: 1,  rejectsOnYes: false, required: true,
        text: '¿El tipo de perecedero declarado corresponde a lo que se está presentando para transporte?' },
      { id: 'per-a-2', segment: 'A', order: 2,  rejectsOnYes: false, required: true,
        text: '¿El embalaje del perecedero es adecuado para el transporte aéreo y mantiene la cadena de frío si es necesario?' },
      { id: 'per-a-3', segment: 'A', order: 3,  rejectsOnYes: false, required: true,
        text: '¿El perecedero cumple con las condiciones fitosanitarias y/o zoosanitarias requeridas?' },
      // SEGMENTO B: GUÍA AÉREA
      { id: 'per-b-1', segment: 'B', order: 4,  rejectsOnYes: false, required: true,
        text: '¿La(s) guía(s) relacionada(s) corresponde(n) al mismo remitente y destino?' },
      { id: 'per-b-2', segment: 'B', order: 5,  rejectsOnYes: false, required: true,
        text: '¿Se verificaron las condiciones del envío conforme a los lineamientos de aceptación?' },
    ];

    for (const item of perecItems) {
      await prisma.checklistTemplateItem.upsert({
        where: { id: item.id },
        update: { text: item.text, segment: item.segment, order: item.order, rejectsOnYes: item.rejectsOnYes, required: item.required },
        create: { id: item.id, templateId: tpl.id, text: item.text, segment: item.segment, order: item.order, rejectsOnYes: item.rejectsOnYes, required: item.required },
      });
    }
  }

  console.log('Seed completado correctamente');
  console.log('Tipos de mercancía cargados:', MERCHANDISE_TYPES.map(t => t.code).join(', '));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
