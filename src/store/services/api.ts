import { generate } from '@/helpers/database-api';
import { Service } from '@/store/services';

const api = generate<Service>('services');

export default api;
