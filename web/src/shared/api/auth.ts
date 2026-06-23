import { http } from './client';

export interface AuthStatus {
  isLoginAllowed?: boolean;
  isRegisterAllowed?: boolean;
  // The engine may expose other flags; we read defensively.
  [key: string]: unknown;
}

export interface AuthResult {
  accessToken: string;
}

/** Engine capabilities — used to decide between login and first-admin register. */
export async function getAuthStatus(): Promise<AuthStatus> {
  const { data } = await http.get<AuthStatus>('/auth/status');
  return data ?? {};
}

export async function login(username: string, password: string): Promise<AuthResult> {
  const { data } = await http.post<AuthResult>('/auth/login', { username, password });
  return data;
}

export async function register(username: string, password: string): Promise<AuthResult> {
  const { data } = await http.post<AuthResult>('/auth/register', { username, password });
  return data;
}
