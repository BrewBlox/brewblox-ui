import { http } from '@/utils/http';
import { AxiosError, AxiosResponse } from 'axios';
import { AUTH_TOKEN_KEY, HOST } from './const';

export interface LoginArgs {
  username: string;
  password: string;
}

export async function verifyToken(): Promise<boolean> {
  try {
    await http.get(`${HOST}/auth/verify`);
    return true;
  } catch (e) {
    const err = e as AxiosError;
    if (err.response?.status === 405) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return false;
    }
    throw e;
  }
}

export async function login(args: LoginArgs): Promise<void> {
  http
    .post<LoginArgs, AxiosResponse<string>>(`${HOST}/auth/login`, args)
    .then((resp) => localStorage.setItem(AUTH_TOKEN_KEY, resp.data));
}
