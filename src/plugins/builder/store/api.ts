import { createApi } from '@/database/api';
import { BuilderLayout } from '@/plugins/builder/types';
import { UI_NAMESPACE } from '@/utils/const';

const api = createApi<BuilderLayout>({
  namespace: `${UI_NAMESPACE}:layouts`,
});

export default api;
