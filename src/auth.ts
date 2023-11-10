import { AxiosError, AxiosResponse } from 'axios';
import { http } from '@/utils/http';
import { HOST } from './const';

export interface LoginArgs {
  username: string;
  password: string;
}

export async function authRefresh(): Promise<boolean> {
  try {
    await http.get(`${HOST}/auth/refresh`);
    return true;
  } catch (e) {
    const err = e as AxiosError;
    const status = err.response?.status;
    if (status === 401 || status === 405) {
      return false;
    }
    throw e;
  }
}

export async function authLogin(args: LoginArgs): Promise<void> {
  await http.post<LoginArgs, AxiosResponse<string>>(`${HOST}/auth/login`, args);
}
