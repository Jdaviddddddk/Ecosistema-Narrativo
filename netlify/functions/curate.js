export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada' }) };
  }

  const { project } = JSON.parse(event.body || '{}');
  if (!project) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Proyecto requerido' }) };
  }

  const DDM_AREAS = [
    "Diseño análogo", "Diseño de interfaces", "Diseño web", "Fotografía",
    "Cortometraje", "Largometraje", "Diseño de experiencias", "Diseño tipográfico",
    "Diseño de marca", "Investigación", "Motion Graphics", "Animación",
    "Ilustración digital", "Diseño editorial", "Diseño de empaque",
    "Señalética", "Diseño sonoro", "Realidad extendida (XR)",
  ];

  const prompt = `Eres el curador del Ecosistema Narrativo Digital de la Universidad Colegio Mayor de Cundinamarca, programa de Diseño Digital y Multimedia (DDM).

Analiza este proyecto estudiantil y responde en JSON estricto:

PROYECTO:
- Título: ${project.title || 'Sin título'}
- Área declarada: ${project.area || 'No especificada'}
- Semestre: ${project.semester || 'No especificado'}
- Materia: ${project.subject || 'No especificada'}
- Historia de origen: ${project.originStory || 'No hay descripción'}
- Herramientas: ${(project.tools || []).join(', ') || 'No especificadas'}
- Estado de producción: ${project.productionStatus || 'No especificado'}
- Formato: ${project.format || 'No especificado'}
- Aprendizajes: ${project.learnings || 'No especificados'}
- Tiene imágenes: ${project.images?.length > 0 ? 'Sí (' + project.images.length + ')' : 'No'}
- Tiene link de prototipo: ${project.prototypeLink ? 'Sí' : 'No'}

CATEGORÍAS DISPONIBLES: ${DDM_AREAS.join(', ')}

Responde ÚNICAMENTE con este JSON (sin markdown, sin explicaciones):
{
  "categoríaSugerida": "una de las categorías disponibles que mejor aplique",
  "categoríaConfianza": "alta|media|baja",
  "calidadGeneral": "excelente|buena|regular|incompleta",
  "puntaje": número del 1 al 10,
  "aprobacion": "publicar|revisar|rechazar",
  "resumen": "1-2 oraciones sobre qué trata el proyecto",
  "fortalezas": ["máx 3 puntos positivos"],
  "observaciones": ["máx 3 sugerencias de mejora o problemas"],
  "visibilidadSugerida": "Público|Solo comunidad|Privado",
  "etiquetas": ["máx 4 etiquetas relevantes para el proyecto"]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Parsear JSON de la respuesta
    const analysis = JSON.parse(text);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al procesar con IA: ' + err.message }),
    };
  }
}
