import { DASHBOARD_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { Dashboard } from './types';

export const api = createApi<Dashboard>({
  namespace: DASHBOARD_NAMESPACE,
});

export default api;
