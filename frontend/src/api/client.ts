const API_BASE = '/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json();
}

export const api = {
  getMerchandiseTypes: () => fetchApi<MerchandiseType[]>('/merchandise-types'),
  startAdmission: (data: { merchandiseData: MerchandiseData; pointOfSaleId: string }) =>
    fetchApi<AdmissionResult>('/admission/start', { method: 'POST', body: JSON.stringify(data) }),
  getAdmissionStatus: (id: string) => fetchApi<AdmissionStatus>(`/admission/${id}/status`),
  rejectAdmission: (id: string, reason: string) =>
    fetchApi('/admission/' + id + '/reject', { method: 'POST', body: JSON.stringify({ reason }) }),
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

  getRoles: () => fetchApi<{ code: string; name: string }[]>('/users/roles'),
  getUsers: () => fetchApi<User[]>('/users'),
  getUser: (id: string) => fetchApi<User>(`/users/${id}`),
  createUser: (data: CreateUserData) =>
    fetchApi<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: Partial<CreateUserData>) =>
    fetchApi<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) =>
    fetch(API_BASE + '/users/' + id, { method: 'DELETE' }).then((r) => (r.ok ? undefined : r.json().then((e) => Promise.reject(new Error(e.error))))),
};

export interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  isDeprisacheckEnabled: boolean;
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
  items: { id: string; text: string; required: boolean; order: number }[];
}
