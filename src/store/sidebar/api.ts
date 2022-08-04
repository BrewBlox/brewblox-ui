import { FOLDER_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { SidebarFolder } from './types';

export const api = createApi<SidebarFolder>({
  namespace: FOLDER_NAMESPACE,
});

export default api;
