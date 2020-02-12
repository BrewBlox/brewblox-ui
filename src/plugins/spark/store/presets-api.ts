import { createApi } from '@/plugins/database/api';

import { StoredDataPreset } from '../types';

const api = createApi<StoredDataPreset>('spark-presets');

export default api;
