import { Service } from './types';
import { SERVICE_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';

const api = createApi<Service>({
  namespace: SERVICE_NAMESPACE,
});

export default api;
