import { UI_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { BuilderLayout } from '@/plugins/builder/types';

const api = createApi<BuilderLayout>({
  namespace: `${UI_NAMESPACE}:layouts`,
});

export default api;
