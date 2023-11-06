import { Dashboard } from './types';
import { DASHBOARD_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';

export const api = createApi<Dashboard>({
  namespace: DASHBOARD_NAMESPACE,
});

export default api;
