/**
 * Script para cargar CSVs de POWER a PostgreSQL
 * Ejecutar: npx ts-node scripts/load-csvs.ts [ruta-carpeta-csv]
 * Ejemplo: npx ts-node scripts/load-csvs.ts ./POWER
 */
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CSV_FOLDER = process.argv[2] || path.join(__dirname, '..', 'POWER');

function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      cell += c;
    } else if (c === ',') {
      current.push(cell.trim());
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && content[i + 1] === '\n') i++;
      current.push(cell.trim());
      if (current.some((x) => x)) rows.push(current);
      current = [];
      cell = '';
    } else {
      cell += c;
    }
  }
  if (cell || current.length) {
    current.push(cell.trim());
    rows.push(current);
  }
  return rows;
}

function toNum(s: string): number | null {
  if (!s || s === 'N/A' || s === 'na' || s === '') return null;
  const n = parseFloat(s.replace(/,/g, '.'));
  return isNaN(n) ? null : n;
}

function toBool(s: string): boolean | null {
  if (!s || s === 'N/A') return null;
  const l = s.toLowerCase();
  if (l === 'sí' || l === 'si' || l === 'yes') return true;
  if (l === 'no') return false;
  return null;
}

function toDate(s: string): Date | null {
  if (!s || s === 'N/A') return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

async function loadAnimalesVivosDetalle() {
  const file = path.join(CSV_FOLDER, 'Animales vivos - Detalle.csv');
  if (!fs.existsSync(file)) {
    console.log('No existe:', file);
    return 0;
  }
  const raw = fs.readFileSync(file, 'utf-8');
  const rows = parseCSV(raw);
  if (rows.length < 2) return 0;

  const headers = rows[0];
  let count = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const numGuia = (r[0] || '').replace(/"/g, '').trim();
    if (!numGuia || numGuia === '0000000' || numGuia === '123456789') continue;

    let guia = await prisma.guia.findUnique({ where: { numero_guia: numGuia } });
    if (!guia) {
      guia = await prisma.guia.create({
        data: { numero_guia: numGuia, tipo_mercancia_id: 1 },
      });
    }

    const numBulto = (r[1] || '1').replace(/"/g, '').trim();
    let bulto = await prisma.guia_bulto.findFirst({
      where: { guia_id: guia.id, numero_bulto: numBulto },
    });
    if (!bulto) {
      bulto = await prisma.guia_bulto.create({
        data: { guia_id: guia.id, numero_bulto: numBulto },
      });
    }

    await prisma.detalle_animales_vivos.create({
      data: {
        guia_bulto_id: bulto.id,
        numero_requisito: toNum(r[2]),
        cantidad_animales: toNum(r[3]),
        clase_animal: r[4] || null,
        nombre_comun: r[5] || null,
        nombre_cientifico: r[6] || null,
        cites_apendice: r[7] || null,
        raza: r[8] || null,
        edad_meses: toNum(r[9]),
        tiene_condicion: toBool(r[10]),
        descripcion_condicion: r[11] || null,
        proposito_transporte: r[12] || null,
        peso_neto_kg: toNum(r[13]),
        peso_bruto_kg: toNum(r[14]),
        sexo: r[15] || null,
      },
    });
    count++;
  }
  return count;
}

async function loadBateriasDetalle() {
  const file = path.join(CSV_FOLDER, 'Baterías - Detalle.csv');
  if (!fs.existsSync(file)) return 0;

  const raw = fs.readFileSync(file, 'utf-8');
  const rows = parseCSV(raw);
  if (rows.length < 2) return 0;

  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const numGuia = (r[0] || '').replace(/"/g, '').trim();
    if (!numGuia || numGuia === '0000000') continue;

    let guia = await prisma.guia.findUnique({ where: { numero_guia: numGuia } });
    if (!guia) {
      guia = await prisma.guia.create({
        data: { numero_guia: numGuia, tipo_mercancia_id: 2 },
      });
    }

    const numBulto = (r[1] || '1').replace(/"/g, '').trim();
    let bulto = await prisma.guia_bulto.findFirst({
      where: { guia_id: guia.id, numero_bulto: numBulto },
    });
    if (!bulto) {
      bulto = await prisma.guia_bulto.create({
        data: { guia_id: guia.id, numero_bulto: numBulto },
      });
    }

    await prisma.detalle_baterias.create({
      data: {
        guia_bulto_id: bulto.id,
        numero_onu: r[2] || null,
        nombre_expedicion: r[3] || null,
        detalle_naturaleza: r[4] || null,
        cantidad_baterias_bulto: toNum(r[5]),
        tipo_embalaje: r[6] || null,
        peso_neto_kg: toNum(r[7]),
        peso_bruto_kg: toNum(r[8]),
        instruccion_embalaje: r[9] || null,
        fecha_hora_envio_detalle: toDate(r[10]),
      },
    });
    count++;
  }
  return count;
}

async function loadHieloSecoDetalle() {
  const file = path.join(CSV_FOLDER, 'Hielo seco - Detalle.csv');
  if (!fs.existsSync(file)) return 0;

  const raw = fs.readFileSync(file, 'utf-8');
  const rows = parseCSV(raw);
  if (rows.length < 2) return 0;

  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const numGuia = (r[0] || '').replace(/"/g, '').trim();
    if (!numGuia || numGuia === '0000000') continue;

    let guia = await prisma.guia.findUnique({ where: { numero_guia: numGuia } });
    if (!guia) {
      guia = await prisma.guia.create({
        data: { numero_guia: numGuia, tipo_mercancia_id: 4 },
      });
    }

    const numBulto = (r[1] || '1').replace(/"/g, '').trim();
    let bulto = await prisma.guia_bulto.findFirst({
      where: { guia_id: guia.id, numero_bulto: numBulto },
    });
    if (!bulto) {
      bulto = await prisma.guia_bulto.create({
        data: { guia_id: guia.id, numero_bulto: numBulto },
      });
    }

    await prisma.detalle_hielo_seco.create({
      data: {
        guia_bulto_id: bulto.id,
        tipo_embalaje: r[2] || null,
        detalle_naturaleza: r[3] || null,
        peso_neto_hielo_kg: toNum(r[4]),
        peso_bruto_bulto_kg: toNum(r[5]),
      },
    });
    count++;
  }
  return count;
}

async function main() {
  console.log('Carpeta CSV:', CSV_FOLDER);
  if (!fs.existsSync(CSV_FOLDER)) {
    console.error('No existe la carpeta:', CSV_FOLDER);
    process.exit(1);
  }

  const c1 = await loadAnimalesVivosDetalle();
  console.log('Animales vivos detalle:', c1, 'filas');

  const c2 = await loadBateriasDetalle();
  console.log('Baterías detalle:', c2, 'filas');

  const c3 = await loadHieloSecoDetalle();
  console.log('Hielo seco detalle:', c3, 'filas');

  console.log('Total cargado:', c1 + c2 + c3);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
