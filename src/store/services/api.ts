import { SERVICE_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { Service } from './types';

const api = createApi<Service>({
  namespace: SERVICE_NAMESPACE,
});

export default api;
