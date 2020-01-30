import { createApi } from '@/plugins/database/api';
import { UIPlugin } from '@/store/plugins';

const api = createApi<UIPlugin>('plugins');

export default api;
