const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('deprisa-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options?.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('deprisa-token');
    localStorage.removeItem('deprisa-user');
    window.location.href = '/login';
    throw new Error('Sesión expirada. Inicie sesión nuevamente.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json();
}

export const api = {
  // --- Admisión ---
  getMerchandiseTypes: () => fetchApi<MerchandiseType[]>('/merchandise-types'),
  startAdmission: (data: { merchandiseData: MerchandiseData; pointOfSaleId: string }) =>
    fetchApi<AdmissionResult>('/admission/start', { method: 'POST', body: JSON.stringify(data) }),
  getAdmissionStatus: (id: string) => fetchApi<AdmissionStatus>(`/admission/${id}/status`),
  acceptAdmission: (id: string) =>
    fetchApi<{ merchandiseId: string; status: string }>('/admission/' + id + '/accept', { method: 'POST' }),
  rejectAdmission: (id: string, reason: string) =>
    fetchApi('/admission/' + id + '/reject', { method: 'POST', body: JSON.stringify({ reason }) }),

  // --- Supervisor ---
  getAdmissions: (filters?: AdmissionFilters) => {
    const params = new URLSearchParams();
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.posId) params.set('posId', filters.posId);
    if (filters?.merchandiseTypeId) params.set('merchandiseTypeId', filters.merchandiseTypeId);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    return fetchApi<AdmissionsResponse>(`/admissions?${params}`);
  },
  getMetrics: (filters?: Omit<AdmissionFilters, 'page' | 'limit' | 'status'>) => {
    const params = new URLSearchParams();
    if (filters?.posId) params.set('posId', filters.posId);
    if (filters?.merchandiseTypeId) params.set('merchandiseTypeId', filters.merchandiseTypeId);
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    return fetchApi<Metrics>(`/admissions/metrics?${params}`);
  },
  getAdmissionDetail: (id: string) => fetchApi<AdmissionDetail>(`/admissions/${id}`),

  // --- DeprisaCheck ---
  getChecklistTemplates: (merchandiseTypeId: string, pointOfSaleType: string) =>
    fetchApi<ChecklistTemplate[]>(`/deprisacheck/checklists/templates?merchandiseTypeId=${merchandiseTypeId}&pointOfSaleType=${pointOfSaleType}`),
  createChecklist: (data: { merchandiseId: string; templateId: string; responses: Record<string, string | boolean> }) =>
    fetchApi<{ id: string }>('/deprisacheck/checklists', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'x-user-id': '1' },
    }),
  submitChecklist: (id: string) =>
    fetchApi<{ accepted: boolean }>(`/deprisacheck/checklists/${id}/submit`, { method: 'POST' }),

  // --- Puntos de venta ---
  getPointsOfSale: () => fetchApi<PointOfSale[]>('/points-of-sale'),
  getAllPointsOfSale: () => fetchApi<PointOfSale[]>('/points-of-sale/all'),
  createPointOfSale: (data: { name: string; type: string; baseRestrictions?: string }) =>
    fetchApi<PointOfSale>('/points-of-sale', { method: 'POST', body: JSON.stringify(data) }),
  updatePointOfSale: (id: string, data: Partial<{ name: string; type: string; baseRestrictions: string }>) =>
    fetchApi<PointOfSale>(`/points-of-sale/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  togglePointOfSale: (id: string) =>
    fetchApi<PointOfSale>(`/points-of-sale/${id}/toggle`, { method: 'PATCH' }),

  // --- Plantillas de checklist ---
  getChecklistTemplateList: () => fetchApi<ChecklistTemplateSummary[]>('/checklist-templates'),
  getChecklistTemplateDetail: (id: string) => fetchApi<ChecklistTemplateDetail>(`/checklist-templates/${id}`),
  createChecklistTemplate: (data: { name: string; merchandiseTypeId: string; pointOfSaleType: string; rejectionTemplateId?: string }) =>
    fetchApi<ChecklistTemplateDetail>('/checklist-templates', { method: 'POST', body: JSON.stringify(data) }),
  updateChecklistTemplate: (id: string, data: Partial<{ name: string; merchandiseTypeId: string; pointOfSaleType: string }>) =>
    fetchApi<ChecklistTemplateDetail>(`/checklist-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteChecklistTemplate: (id: string) =>
    fetch(API_BASE + '/checklist-templates/' + id, { method: 'DELETE', headers: getAuthHeader() }).then((r) => (r.ok ? undefined : r.json().then((e) => Promise.reject(new Error(e.error))))),
  toggleChecklistTemplate: (id: string) =>
    fetchApi<ChecklistTemplateDetail>(`/checklist-templates/${id}/toggle`, { method: 'PATCH' }),
  addTemplateItem: (templateId: string, data: { text: string; required: boolean }) =>
    fetchApi<TemplateItem>(`/checklist-templates/${templateId}/items`, { method: 'POST', body: JSON.stringify(data) }),
  updateTemplateItem: (templateId: string, itemId: string, data: Partial<{ text: string; required: boolean; order: number }>) =>
    fetchApi<TemplateItem>(`/checklist-templates/${templateId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplateItem: (templateId: string, itemId: string) =>
    fetch(`${API_BASE}/checklist-templates/${templateId}/items/${itemId}`, { method: 'DELETE', headers: getAuthHeader() }).then((r) => (r.ok ? undefined : r.json().then((e) => Promise.reject(new Error(e.error))))),
  reorderTemplateItems: (templateId: string, items: { id: string; order: number }[]) =>
    fetchApi<{ ok: boolean }>(`/checklist-templates/${templateId}/items/reorder`, { method: 'PUT', body: JSON.stringify({ items }) }),

  // --- Restricciones de clientes ---
  getClients: () => fetchApi<Client[]>('/clients'),
  getClientRestrictions: (clientId: string) => fetchApi<ClientRestriction[]>(`/clients/${clientId}/restrictions`),
  createClientRestriction: (data: { clientId: string; merchandiseTypeId: string; restrictionType: string; pointOfSaleId?: string }) =>
    fetchApi<ClientRestriction>('/client-restrictions', { method: 'POST', body: JSON.stringify(data) }),
  deleteClientRestriction: (id: string) =>
    fetch(`${API_BASE}/client-restrictions/${id}`, { method: 'DELETE', headers: getAuthHeader() }).then((r) => (r.ok ? undefined : r.json().then((e) => Promise.reject(new Error(e.error))))),

  // --- Auditoría ---
  getAuditLogs: (filters?: AuditFilters) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.set('userId', filters.userId);
    if (filters?.action) params.set('action', filters.action);
    if (filters?.entityType) params.set('entityType', filters.entityType);
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.limit) params.set('limit', String(filters.limit));
    return fetchApi<AuditLog[]>(`/audit?${params}`);
  },

  // --- Usuarios ---
  getRoles: () => fetchApi<{ code: string; name: string }[]>('/users/roles'),
  getUsers: () => fetchApi<User[]>('/users'),
  getUser: (id: string) => fetchApi<User>(`/users/${id}`),
  createUser: (data: CreateUserData) =>
    fetchApi<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: Partial<CreateUserData>) =>
    fetchApi<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) =>
    fetch(API_BASE + '/users/' + id, { method: 'DELETE', headers: getAuthHeader() }).then((r) => (r.ok ? undefined : r.json().then((e) => Promise.reject(new Error(e.error))))),
  updateUserStatus: (id: string, isActive: boolean) =>
    fetchApi<{ id: string; username: string; isActive: boolean }>(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
  changeUserPassword: (id: string, newPassword: string) =>
    fetchApi<{ ok: boolean }>(`/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ newPassword }) }),
};

// --- Interfaces ---

export interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  isDeprisacheckEnabled: boolean;
  isActive: boolean;
  pointOfSaleId?: string;
  pointOfSale?: { id: string; name: string };
}

export interface CreateUserData {
  username: string;
  password?: string;
  email?: string;
  role: string;
  isDeprisacheckEnabled?: boolean;
  pointOfSaleId?: string;
}

export interface MerchandiseType {
  id: string;
  code: string;
  name: string;
  requiresChecklist: boolean;
}

export interface MerchandiseData {
  clientId: string;
  merchandiseTypeId: string;
  description?: string;
  weight?: number;
  dimensions?: string;
}

export interface AdmissionResult {
  status: string;
  merchandiseId: string;
  merchandiseTypeId?: string;
  requiresDeprisacheck?: boolean;
  rejectionReason?: string;
}

export interface AdmissionStatus {
  merchandiseId: string;
  status: string;
  rejectionReason?: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: TemplateItem[];
}

export interface TemplateItem {
  id: string;
  text: string;
  required: boolean;
  order: number;
}

export interface PointOfSale {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  baseRestrictions?: string;
}

export interface ChecklistTemplateSummary {
  id: string;
  name: string;
  merchandiseTypeId: string;
  merchandiseTypeName: string;
  pointOfSaleType: string;
  isActive: boolean;
  itemCount: number;
}

export interface ChecklistTemplateDetail {
  id: string;
  name: string;
  merchandiseTypeId: string;
  pointOfSaleType: string;
  isActive: boolean;
  MerchandiseTypeCatalog: { id: string; name: string };
  ChecklistTemplateItem: TemplateItem[];
}

export interface Client {
  id: string;
  name: string;
  email?: string;
}

export interface ClientRestriction {
  id: string;
  clientId: string;
  merchandiseTypeId: string;
  restrictionType: string;
  pointOfSaleId?: string;
  isActive: boolean;
  Client?: { id: string; name: string };
}

export interface AdmissionFilters {
  page?: number;
  limit?: number;
  posId?: string;
  merchandiseTypeId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface AdmissionSummary {
  id: string;
  createdAt: string;
  status: string;
  rejectionReason?: string;
  client: { id: string; name: string };
  merchandiseType: { id: string; name: string };
  pointOfSale: { id: string; name: string };
  checklist?: { id: string; status: string } | null;
}

export interface AdmissionsResponse {
  data: AdmissionSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface Metrics {
  total: number;
  pending: number;
  requiresDeprisacheck: number;
  accepted: number;
  rejected: number;
}

export interface AuditLog {
  id: string;
  userId?: string;
  username?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export interface AdmissionDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  rejectionReason?: string;
  description?: string;
  weight?: number;
  dimensions?: string;
  client: { id: string; name: string; email?: string };
  merchandiseType: { id: string; code: string; name: string; requiresChecklist: boolean };
  pointOfSale: { id: string; name: string; type: string };
  checklist?: {
    id: string;
    status: string;
    completionDate?: string;
    completedByUserId?: string;
    responses: Record<string, unknown>;
    template: {
      id: string;
      name: string;
      items: TemplateItem[];
    };
  } | null;
}
