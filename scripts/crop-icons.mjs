import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = 'C:/Users/jhonn/Downloads/icons.jpeg';
const outputDir = path.join(__dirname, '../public/images/icons');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Obtener dimensiones reales
const meta = await sharp(inputPath).metadata();
const W = meta.width;
const H = meta.height;

const COLS = 4;
const ROWS = 3;
const cellW = Math.floor(W / COLS);
const cellH = Math.floor(H / ROWS);
const PAD = Math.floor(cellW * 0.1); // 10% de margen interior

console.log(`Imagen: ${W}x${H} | Celda: ${cellW}x${cellH} | Padding: ${PAD}`);

const ICONS = [
  // fila 1
  { name: 'inspira',      row: 0, col: 0 },
  { name: 'aprendí',      row: 0, col: 1 },
  { name: 'profesional',  row: 0, col: 2 },
  { name: 'proceso',      row: 0, col: 3 },
  // fila 2
  { name: 'compartir',    row: 1, col: 0 },
  { name: 'comunidad',    row: 1, col: 1 },
  { name: 'universidad',  row: 1, col: 2 },
  { name: 'editar',       row: 1, col: 3 },
  // fila 3
  { name: 'publicar',     row: 2, col: 0 },
  { name: 'volver',       row: 2, col: 1 },
  { name: 'guardado',     row: 2, col: 2 },
  { name: 'cerrar',       row: 2, col: 3 },
];

for (const icon of ICONS) {
  const left   = icon.col * cellW + PAD;
  const top    = icon.row * cellH + PAD;
  const width  = cellW - PAD * 2;
  const height = cellH - PAD * 2;
  const outPath = path.join(outputDir, `${icon.name}.png`);

  await sharp(inputPath)
    .extract({ left, top, width, height })
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);

  console.log(`✓ ${icon.name}.png`);
}

console.log(`\n✅ 12 íconos guardados en public/images/icons/`);
