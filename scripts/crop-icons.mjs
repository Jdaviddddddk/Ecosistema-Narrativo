import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const inputPath = 'C:/Users/jhonn/Downloads/icons.jpeg';
const outputDir = path.resolve('public/images/icons');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const meta = await sharp(inputPath).metadata();
const W = meta.width, H = meta.height;
const COLS = 4, ROWS = 3;
const cellW = Math.floor(W / COLS);
const cellH = Math.floor(H / ROWS);
const PAD = Math.floor(cellW * 0.08);

const ICONS = [
  { name: 'icon-inspira',     row: 0, col: 0 },
  { name: 'icon-aprendi',     row: 0, col: 1 },
  { name: 'icon-profesional', row: 0, col: 2 },
  { name: 'icon-proceso',     row: 0, col: 3 },
  { name: 'icon-compartir',   row: 1, col: 0 },
  { name: 'icon-comunidad',   row: 1, col: 1 },
  { name: 'icon-universidad', row: 1, col: 2 },
  { name: 'icon-editar',      row: 1, col: 3 },
  { name: 'icon-publicar',    row: 2, col: 0 },
  { name: 'icon-volver',      row: 2, col: 1 },
  { name: 'icon-guardado',    row: 2, col: 2 },
  { name: 'icon-cerrar',      row: 2, col: 3 },
];

for (const icon of ICONS) {
  const left   = icon.col * cellW + PAD;
  const top    = icon.row * cellH + PAD;
  const width  = cellW - PAD * 2;
  const height = cellH - PAD * 2;
  const outPath = path.join(outputDir, `${icon.name}.png`);
  await sharp(inputPath)
    .extract({ left, top, width, height })
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
  console.log(`✓ ${icon.name}.png`);
}
console.log('✅ Listo →', outputDir);
