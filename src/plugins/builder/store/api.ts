import { LAYOUT_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { BuilderLayout } from '@/plugins/builder/types';

const api = createApi<BuilderLayout>({
  namespace: LAYOUT_NAMESPACE,
});

export default api;
