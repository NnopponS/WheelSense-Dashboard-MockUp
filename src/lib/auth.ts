export type AuthRole = 'user' | 'admin';

export interface AuthUser {
  username: string;
  password: string;
  role: AuthRole;
  firstName?: string;
  lastName?: string;
  age?: number;
  conditions?: string;
  phone?: string;
  citizenId?: string;
}

const USERS_KEY = 'wheelsense-auth-users';
import { remoteGet, remotePut } from './remote';
export const ADMIN_CODE = 'WS-ADMIN-2025';

export function loadUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as AuthUser[]) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: AuthUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
  // Fire-and-forget remote mirror
  remotePut('/users', users);
}

export function signup(
  username: string,
  password: string,
  adminCode?: string,
  profile?: { firstName?: string; lastName?: string; age?: number; conditions?: string; phone?: string; citizenId?: string }
): { ok: boolean; message?: string; user?: AuthUser } {
  const users = loadUsers();
  // Try to hydrate from remote if local empty
  if (users.length === 0) {
    // Note: async hydration
    remoteGet<AuthUser[]>('/users').then((remote) => {
      if (remote && Array.isArray(remote)) {
        saveUsers(remote);
      }
    });
  }
  if (users.some((u) => u.username === username)) {
    return { ok: false, message: 'Username already exists' };
  }
  const role: AuthRole = adminCode && adminCode === ADMIN_CODE ? 'admin' : 'user';
  const user: AuthUser = {
    username,
    password,
    role,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    age: profile?.age,
    conditions: profile?.conditions,
    phone: profile?.phone,
    citizenId: profile?.citizenId,
  };
  users.push(user);
  saveUsers(users);
  return { ok: true, user };
}

export function login(username: string, password: string): { ok: boolean; message?: string; user?: AuthUser } {
  const users = loadUsers();
  const found = users.find((u) => u.username === username && u.password === password);
  if (!found) return { ok: false, message: 'Invalid credentials' };
  return { ok: true, user: found };
}


