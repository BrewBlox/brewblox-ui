import { BuilderLayout } from '@/plugins/builder/types';
import { createApi } from '@/plugins/database/api';
import { UI_NAMESPACE } from '@/utils/const';

const api = createApi<BuilderLayout>({
  namespace: `${UI_NAMESPACE}:layouts`,
});

export default api;
