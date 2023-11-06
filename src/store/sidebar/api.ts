import { SidebarFolder } from './types';
import { FOLDER_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';

export const api = createApi<SidebarFolder>({
  namespace: FOLDER_NAMESPACE,
});

export default api;
