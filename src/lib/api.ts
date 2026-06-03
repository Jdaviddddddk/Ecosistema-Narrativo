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
  const fix = (url: string) =>
    url && url.startsWith('/uploads/') ? `${API_URL}${url}` : url;
  // API_URL es "" en producción, así que /uploads/... ya es una ruta relativa válida
  return {
    ...project,
    thumbnail: fix(project.thumbnail),
    images: (project.images || []).map(fix),
  };
}

export const projectsAPI = {
  list: (filters?: { area?: string; status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.area) params.append('area', filters.area);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    return fetchAPI(`/api/projects?${params}`).then((data: any[]) => data.map(fixImageUrls));
  },

  get: (id: string) => fetchAPI(`/api/projects/${id}`).then(fixImageUrls),
  
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

const ADMIN_EMAIL = 'jdarenas@universidadmayor.edu.co';
const adminHeaders = { 'x-admin-email': ADMIN_EMAIL };

export const adminAPI = {
  getProjects: () => fetchAPI('/api/admin/projects', { headers: adminHeaders }),
  updateProject: (id: string, data: any) =>
    fetchAPI(`/api/admin/projects/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: adminHeaders }),
  deleteProject: (id: string) =>
    fetchAPI(`/api/admin/projects/${id}`, { method: 'DELETE', headers: adminHeaders }),
  getComments: () => fetchAPI('/api/admin/comments', { headers: adminHeaders }),
  deleteComment: (projectId: string, commentId: string) =>
    fetchAPI(`/api/projects/${projectId}/comments/${commentId}`, { method: 'DELETE' }),
  getUsers: () => fetchAPI('/api/admin/users', { headers: adminHeaders }),
  deleteUser: (id: string) =>
    fetchAPI(`/api/admin/users/${id}`, { method: 'DELETE', headers: adminHeaders }),
  curateProject: (project: any) =>
    fetchAPI('/api/curate', { method: 'POST', body: JSON.stringify({ project }) }),
};

export const commentsAPI = {
  list: (projectId: string) =>
    fetchAPI(`/api/projects/${projectId}/comments`),
  add: (projectId: string, comment: { authorId: string; authorName: string; authorAvatar: string; text: string; parentId?: string }) =>
    fetchAPI(`/api/projects/${projectId}/comments`, { method: 'POST', body: JSON.stringify(comment) }),
  delete: (projectId: string, commentId: string) =>
    fetchAPI(`/api/projects/${projectId}/comments/${commentId}`, { method: 'DELETE' }),
};