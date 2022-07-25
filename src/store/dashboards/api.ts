import { UI_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { Dashboard } from './types';

export const api = createApi<Dashboard>({
  namespace: `${UI_NAMESPACE}:dashboards`,
});

export default api;
