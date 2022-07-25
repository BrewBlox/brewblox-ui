import { UI_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { Widget } from './types';

export const api = createApi<Widget>({
  namespace: `${UI_NAMESPACE}:dashboard-items`,
});

export default api;
