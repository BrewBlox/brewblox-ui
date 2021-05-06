import { createApi } from '@/database/api';
import { UI_NAMESPACE } from '@/utils/const';

import { Widget } from './types';

export const api = createApi<Widget>({
  namespace: `${UI_NAMESPACE}:dashboard-items`,
});

export default api;
