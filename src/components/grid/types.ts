import type { Crud } from '@/store/features';

export interface ValidatedWidget {
  id: string;
  component: string;
  crud: Crud;
  error?: string;
}
