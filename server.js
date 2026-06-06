import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3001;

app.use('/api/projects', (req, res, next) => {
  if (req.method === 'GET') return next();
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Límite de publicaciones alcanzado.' }
  })(req, res, next);
});

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' }
}));

app.use(cors({
  origin: 'https://nexonarrative.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const uploadsDir = '/var/www/nexo-uploads';
const dbFile = '/var/www/nexo-api/projects.json';
const usersFile = '/var/www/nexo-api/users.json';
const commentsFile = '/var/www/nexo-api/comments.json';

[uploadsDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
[dbFile, usersFile, commentsFile].forEach(f => { if (!fs.existsSync(f)) fs.writeFileSync(f, '[]', 'utf8'); });

const readJSON = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; } };
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, ['image/jpeg','image/png','image/webp','image/gif','application/pdf'].includes(file.mimetype));
  }
});

async function processImage(buffer, filename) {
  const outName = filename + '.webp';
  const outPath = path.join(uploadsDir, outName);
  await sharp(buffer).resize(1600, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 83 }).toFile(outPath);
  return `/uploads/${outName}`;
}

const projectSchema = z.object({
  title: z.string().min(1), author: z.string(), authorId: z.string(),
  authorEmail: z.string().email(), semester: z.string(), subject: z.string(),
  area: z.string(), status: z.string(), visibility: z.string(),
  originStory: z.string().optional(), tools: z.array(z.string()).optional(),
  format: z.string().optional(), fullLink: z.string().optional(),
  learnings: z.string().optional(), recognitions: z.string().optional(),
  process: z.array(z.string()).optional(), collections: z.array(z.string()).optional(),
  relatedProjects: z.array(z.string()).optional(), prototypeLink: z.string().optional().nullable(),
  productionStatus: z.string().optional(),
});

const ADMIN_EMAILS = ['jdarenas@universidadmayor.edu.co'];
const GOOGLE_CLIENT_ID = '786954818285-utp39amnvl790u6rch5ut60gejfn8hc5.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

async function isAdmin(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  const token = auth.slice(7);
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const email = ticket.getPayload()?.email;
    if (!ADMIN_EMAILS.includes(email)) return res.status(403).json({ error: 'No autorizado' });
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

function stripPII(project) {
  const { authorEmail, authorId, ...safe } = project;
  return safe;
}

// ── HEALTH ──
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── PROJECTS ──
app.get('/api/projects', (req, res) => {
  let result = readJSON(dbFile);
  const { area, search, limit, offset } = req.query;
  if (area) result = result.filter(p => p.area === area);
  result = result.filter(p => p.status === "Publicado");
  if (search) result = result.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.toLowerCase().includes(search.toLowerCase())
  );
  const off = parseInt(offset) || 0;
  const lim = parseInt(limit) || 100;
  res.json(result.slice(off, off + lim).map(stripPII));
});

app.get('/api/projects/:id', (req, res) => {
  const project = readJSON(dbFile).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'No encontrado' });
  res.json(stripPII(project));
});

app.post('/api/projects', upload.fields([{ name: 'images', maxCount: 20 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
  try {
    const projectData = JSON.parse(req.body.data || '{}');
    const validated = projectSchema.parse({ ...projectData, status: "En revisión" });
    const imageFiles = req.files?.images || [];
    const pdfFiles = req.files?.pdf || [];
    const unique = Date.now();
    const imageUrls = await Promise.all(imageFiles.map((f, i) => processImage(f.buffer, `${unique}-${i}`)));
    let pdfUrl = null;
    if (pdfFiles[0]) {
      const pdfName = `${unique}-doc.pdf`;
      fs.writeFileSync(path.join(uploadsDir, pdfName), pdfFiles[0].buffer);
      pdfUrl = `/uploads/${pdfName}`;
    }
    const project = { id: unique.toString(), ...validated, images: imageUrls, thumbnail: imageUrls[0] || '', pdfFile: pdfUrl, reactions: { inspires: 0, learned: 0, professional: 0, inProgress: 0 }, createdAt: new Date().toISOString() };
    const projects = readJSON(dbFile);
    projects.unshift(project);
    writeJSON(dbFile, projects);
    res.status(201).json(project);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.put('/api/projects/:id', (req, res) => {
  const projects = readJSON(dbFile);
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  projects[idx] = { ...projects[idx], ...req.body };
  writeJSON(dbFile, projects);
  res.json(projects[idx]);
});

app.delete('/api/projects/:id', (req, res) => {
  writeJSON(dbFile, readJSON(dbFile).filter(p => p.id !== req.params.id));
  res.json({ ok: true });
});

app.post('/api/projects/:id/react', (req, res) => {
  const projects = readJSON(dbFile);
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'No encontrado' });
  const valid = ['inspires','learned','professional','inProgress'];
  const type = req.body.type;
  if (!valid.includes(type)) return res.status(400).json({ error: 'Tipo inválido' });
  if (!project.reactions) project.reactions = { inspires:0, learned:0, professional:0, inProgress:0 };
  project.reactions[type] = Math.max(0, (project.reactions[type] || 0) + 1);
  writeJSON(dbFile, projects);
  res.json(project.reactions);
});

// ── COMMENTS ──
app.get('/api/projects/:id/comments', (req, res) => {
  const all = readJSON(commentsFile);
  res.json(all.filter(c => c.projectId === req.params.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post('/api/projects/:id/comments', (req, res) => {
  const { authorId, authorName, authorAvatar, text } = req.body;
  if (!text?.trim() || text.trim().length < 5) return res.status(400).json({ error: 'Comentario muy corto' });
  const comment = { id: Date.now().toString(), projectId: req.params.id, authorId, authorName, authorAvatar, text: text.trim(), createdAt: new Date().toISOString() };
  const all = readJSON(commentsFile);
  all.push(comment);
  writeJSON(commentsFile, all);
  res.status(201).json(comment);
});

app.delete('/api/projects/:id/comments/:commentId', (req, res) => {
  writeJSON(commentsFile, readJSON(commentsFile).filter(c => !(c.id === req.params.commentId && c.projectId === req.params.id)));
  res.json({ ok: true });
});

// ── USERS ──
app.post('/api/users', (req, res) => {
  const users = readJSON(usersFile);
  const idx = users.findIndex(u => u.id === req.body.id);
  const userData = { ...req.body, updatedAt: new Date().toISOString() };
  if (idx >= 0) users[idx] = userData; else users.push(userData);
  writeJSON(usersFile, users);
  res.json(userData);
});

app.get('/api/users/:id', (req, res) => {
  const user = readJSON(usersFile).find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
});

app.use('/uploads', express.static(uploadsDir));

// ── ADMIN ENDPOINTS ──
app.get('/api/admin/projects', isAdmin, (req, res) => res.json(readJSON(dbFile)));
app.put('/api/admin/projects/:id', isAdmin, (req, res) => {
  const projects = readJSON(dbFile);
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  projects[idx] = { ...projects[idx], ...req.body };
  writeJSON(dbFile, projects);
  res.json(projects[idx]);
});
app.delete('/api/admin/projects/:id', isAdmin, (req, res) => {
  writeJSON(dbFile, readJSON(dbFile).filter(p => p.id !== req.params.id));
  res.json({ ok: true });
});
app.get('/api/admin/comments', isAdmin, (req, res) => res.json(readJSON(commentsFile)));
app.get('/api/admin/users', isAdmin, (req, res) => res.json(readJSON(usersFile)));
app.delete('/api/admin/users/:id', isAdmin, (req, res) => {
  writeJSON(usersFile, readJSON(usersFile).filter(u => u.id !== req.params.id));
  res.json({ ok: true });
});

// ── CURADURÍA IA ──
app.post('/api/curate', async (req, res) => {
  try {
    const { project } = req.body;
    if (!project) return res.status(400).json({ error: 'Falta el proyecto' });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const msg = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Eres curador de un ecosistema universitario de diseño (DDM - Universidad Mayor, Colombia).
Analiza este proyecto y responde ÚNICAMENTE con JSON válido, sin texto adicional:
{
  "puntaje": <número 1-10>,
  "calidadGeneral": "<Excelente|Bueno|Regular|Insuficiente>",
  "categoríaSugerida": "<una de: Diseño análogo|Diseño de interfaces|Diseño web|Fotografía|Cortometraje|Largometraje|Diseño de experiencias|Diseño tipográfico|Diseño de marca|Investigación|Motion Graphics|Animación|Ilustración digital|Diseño editorial|Diseño de empaque|Señalética|Diseño sonoro|Realidad extendida (XR)>",
  "visibilidadSugerida": "<Público|Solo comunidad|Privado>",
  "aprobacion": "<publicar|revisar|rechazar>",
  "etiquetas": ["tag1", "tag2", "tag3"],
  "resumen": "<una oración describiendo el proyecto>",
  "fortalezas": ["fortaleza1", "fortaleza2"],
  "observaciones": ["observacion1", "observacion2"],
  "sugerencias": ["mejora1", "mejora2"]
}

Proyecto a analizar:
Título: ${project.title}
Área: ${project.area}
Autor: ${project.author}
Materia: ${project.subject}
Historia de origen: ${project.originStory || 'No especificada'}
Herramientas: ${(project.tools || []).join(', ')}
Aprendizajes: ${project.learnings || 'No especificados'}
Proceso: ${(project.process || []).join(' → ')}`,
      }],
    });

    const text = msg.content[0].text;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Claude no devolvió JSON válido');
    const analysis = JSON.parse(match[0]);
    res.json({ analysis });
  } catch (err) {
    console.error('Error en curaduría:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NEXO API en http://0.0.0.0:${PORT}`);
});
