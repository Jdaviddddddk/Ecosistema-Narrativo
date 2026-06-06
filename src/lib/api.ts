// En producción (Netlify) usamos rutas relativas — Netlify proxy reenvía al VPS.
// En local apuntamos directo al VPS.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://138.199.196.128:3001');

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Para subir archivos con FormData (sin Content-Type manual)
async function fetchFormData(endpoint: string, formData: FormData) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    // NO pongas Content-Type aquí — el browser lo pone automáticamente con el boundary
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

function fixImageUrls(project: any) {
  const fix = (url: string) => {
    if (!url) return url;
    // Extraer solo el path /uploads/... sin importar qué dominio/IP traiga
    const match = url.match(/(\/uploads\/.+)/);
    if (match) {
      // Producción: ruta relativa → Netlify proxy → VPS
      // Desarrollo: IP directa
      return import.meta.env.PROD ? match[1] : `http://138.199.196.128:3001${match[1]}`;
    }
    return url;
  };
  return {
    ...project,
    thumbnail: fix(project.thumbnail),
    images: (project.images || []).map(fix),
  };
}

// Elimina campos PII del response público de proyectos
function stripPrivateFields(project: any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { authorEmail, authorId, ...safe } = project;
  return safe;
}

export const projectsAPI = {
  list: (filters?: { area?: string; status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.area) params.append('area', filters.area);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    return fetchAPI(`/api/projects?${params}`).then((data: any[]) => data.map(p => stripPrivateFields(fixImageUrls(p))));
  },

  get: (id: string) => fetchAPI(`/api/projects/${id}`).then(p => stripPrivateFields(fixImageUrls(p))),
  
  // Para crear proyecto con archivos (FormData)
  createWithFiles: (formData: FormData) => 
    fetchFormData('/api/projects', formData),
  
  update: (id: string, data: any) => 
    fetchAPI(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: string) => 
    fetchAPI(`/api/projects/${id}`, { method: 'DELETE' }),
    
  react: (id: string, type: string) => 
    fetchAPI(`/api/projects/${id}/react`, { method: 'POST', body: JSON.stringify({ type }) }),
};

export const usersAPI = {
  save: (user: any) =>
    fetchAPI('/api/users', { method: 'POST', body: JSON.stringify(user) }),
  get: (id: string) =>
    fetchAPI(`/api/users/${id}`),
};

export const adminAPI = {
  getProjects: (credential: string) =>
    fetchAPI('/api/admin/projects', { headers: { Authorization: `Bearer ${credential}` } }),
  updateProject: (id: string, data: any, credential: string) =>
    fetchAPI(`/api/admin/projects/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${credential}` } }),
  deleteProject: (id: string, credential: string) =>
    fetchAPI(`/api/admin/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${credential}` } }),
  getComments: (credential: string) =>
    fetchAPI('/api/admin/comments', { headers: { Authorization: `Bearer ${credential}` } }),
  deleteComment: (projectId: string, commentId: string) =>
    fetchAPI(`/api/projects/${projectId}/comments/${commentId}`, { method: 'DELETE' }),
  getUsers: (credential: string) =>
    fetchAPI('/api/admin/users', { headers: { Authorization: `Bearer ${credential}` } }),
  deleteUser: (id: string, credential: string) =>
    fetchAPI(`/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${credential}` } }),
  curateProject: async (project: any) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout
    try {
      const response = await fetch(`${API_URL}/api/curate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
      return response.json();
    } finally {
      clearTimeout(timeout);
    }
  },
};

export const commentsAPI = {
  list: (projectId: string) =>
    fetchAPI(`/api/projects/${projectId}/comments`),
  add: (projectId: string, comment: { authorId: string; authorName: string; authorAvatar: string; text: string; parentId?: string }) =>
    fetchAPI(`/api/projects/${projectId}/comments`, { method: 'POST', body: JSON.stringify(comment) }),
  delete: (projectId: string, commentId: string) =>
    fetchAPI(`/api/projects/${projectId}/comments/${commentId}`, { method: 'DELETE' }),
};