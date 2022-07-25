import { UI_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { Service } from './types';

const api = createApi<Service>({
  namespace: `${UI_NAMESPACE}:services`,
});

export default api;
