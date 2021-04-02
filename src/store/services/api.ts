import { UI_NAMESPACE } from '@/helpers/const';
import { createApi } from '@/plugins/database/api';
import { Service } from '@/store/services';

const api = createApi<Service>({
  namespace: `${UI_NAMESPACE}:services`,
});

export default api;
