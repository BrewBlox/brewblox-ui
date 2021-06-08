import { UI_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';

import { StoredDataPreset } from '../types';

const api = createApi<StoredDataPreset>({
  namespace: `${UI_NAMESPACE}:spark-presets`,
});

export default api;
