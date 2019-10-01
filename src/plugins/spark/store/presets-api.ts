import { generate } from '@/helpers/database-api';

import { StoredDataPreset } from '../types';

const api = generate<StoredDataPreset>('spark-presets');

export default api;
