import { CurrentUser } from '../types/app.types';

const TOKEN_KEY = 'teamtree_token';
const USER_KEY = 'teamtree_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredSession(token: string, user: CurrentUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Checks whether system needs one-time initial admin setup (0 admins exist)
 */
export async function getSetupStatus(): Promise<{ needsSetup: boolean }> {
  try {
    const res = await fetch('/api/setup-status');
    if (!res.ok) throw new Error('Failed to check setup status');
    return await res.json();
  } catch (err) {
    console.error('getSetupStatus error:', err);
    return { needsSetup: false };
  }
}

/**
 * Creates the initial admin account (only succeeds if 0 admins exist)
 */
export async function createFirstAdmin(params: {
  email: string;
  password: string;
}): Promise<{ user: CurrentUser; token: string }> {
  const res = await fetch('/api/auth/setup-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create admin account');
  }

  setStoredSession(data.token, data.user);
  return data;
}

/**
 * Signs in an existing user (Admin or Staff)
 */
export async function signIn(params: {
  email: string;
  password: string;
}): Promise<{ user: CurrentUser; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Sign in failed');
  }

  setStoredSession(data.token, data.user);
  return data;
}

/**
 * Fetches the current authenticated user & role
 */
export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      clearStoredSession();
      return null;
    }

    const data = await res.json();
    setStoredSession(token, data.user);
    return data.user;
  } catch (err) {
    console.error('fetchCurrentUser error:', err);
    return getStoredUser();
  }
}

/**
 * Signs out the current user
 */
export async function signOut(): Promise<void> {
  const token = getStoredToken();
  try {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (err) {
    console.error('Sign out error:', err);
  } finally {
    clearStoredSession();
  }
}
