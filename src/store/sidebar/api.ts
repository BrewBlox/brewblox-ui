import { SIDEBAR_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { SidebarDirectory } from './types';

export const api = createApi<SidebarDirectory>({
  namespace: SIDEBAR_NAMESPACE,
});

export default api;
