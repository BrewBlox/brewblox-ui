import { createApi } from '@/plugins/database/api';
import { Service } from '@/store/services';

const api = createApi<Service>('services');

export default api;
