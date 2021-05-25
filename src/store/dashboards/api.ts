import { createApi } from '@/database/api';
import { UI_NAMESPACE } from '@/utils/const';

import { Dashboard } from './types';

export const api = createApi<Dashboard>({
  namespace: `${UI_NAMESPACE}:dashboards`,
});

export default api;
