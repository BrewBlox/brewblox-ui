import { UI_NAMESPACE } from '@/helpers/const';
import { createApi } from '@/plugins/database/api';

import { BuilderLayout } from '../types';

const api = createApi<BuilderLayout>({
  namespace: `${UI_NAMESPACE}:layouts`,
});

export default api;
