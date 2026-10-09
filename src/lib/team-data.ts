import { AppRow, Field, Member, UserRole } from '../types/app.types';
import { getStoredToken } from './auth';

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// =================== APPS ===================

export async function fetchApps(): Promise<AppRow[]> {
  const res = await fetch('/api/apps', { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load apps');
  }
  return res.json();
}

export async function createApp(name: string): Promise<AppRow> {
  const res = await fetch('/api/apps', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create app');
  }
  return res.json();
}

export async function deleteApp(appId: string): Promise<void> {
  const res = await fetch(`/api/apps/${appId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete app');
  }
}

// =================== MEMBERS ===================

export async function fetchMembers(appId: string): Promise<Member[]> {
  const res = await fetch(`/api/members?app_id=${encodeURIComponent(appId)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load members');
  }
  return res.json();
}

export async function createMember(member: {
  app_id: string;
  parent_id: string | null;
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
  app_user_id?: string | null;
  photo_path?: string | null;
  status?: 'active' | 'no_work';
  custom?: Record<string, string>;
}): Promise<Member> {
  const res = await fetch('/api/members', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(member),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add member');
  }
  return res.json();
}

export async function updateMember(
  id: string,
  updates: Partial<Member>
): Promise<Member> {
  const res = await fetch(`/api/members/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update member');
  }
  return res.json();
}

export async function deleteMember(id: string): Promise<void> {
  const res = await fetch(`/api/members/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete member');
  }
}

// =================== CUSTOM FIELDS ===================

export async function fetchCustomFields(): Promise<Field[]> {
  const res = await fetch('/api/custom-fields', { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load custom fields');
  }
  return res.json();
}

export async function createCustomField(field: {
  section: string;
  label: string;
  field_type?: string;
  sort_order?: number;
}): Promise<Field> {
  const res = await fetch('/api/custom-fields', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(field),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create field definition');
  }
  return res.json();
}

export async function updateCustomField(
  id: string,
  updates: Partial<Field>
): Promise<Field> {
  const res = await fetch(`/api/custom-fields/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update field definition');
  }
  return res.json();
}

export async function deleteCustomField(id: string): Promise<void> {
  const res = await fetch(`/api/custom-fields/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete field definition');
  }
}

// =================== STAFF / USERS (ADMIN ONLY) ===================

export async function fetchStaffList(): Promise<UserRole[]> {
  const res = await fetch('/api/staff', { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load staff list');
  }
  return res.json();
}

export async function createStaff(params: {
  email: string;
  password: string;
}): Promise<UserRole> {
  const res = await fetch('/api/staff', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create staff account');
  }
  return res.json();
}

export async function removeStaff(userId: string): Promise<void> {
  const res = await fetch(`/api/staff/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to remove staff account');
  }
}
