import { generate } from '@/helpers/database-api';
import { UIPlugin } from '@/store/plugins';

const api = generate<UIPlugin>('plugins');

export default api;
