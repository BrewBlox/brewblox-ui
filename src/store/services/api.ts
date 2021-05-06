import { createApi } from '@/database/api';
import { Service } from '@/store/services';
import { UI_NAMESPACE } from '@/utils/const';

const api = createApi<Service>({
  namespace: `${UI_NAMESPACE}:services`,
});

export default api;
