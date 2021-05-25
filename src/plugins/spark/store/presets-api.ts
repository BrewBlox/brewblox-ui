import { createApi } from '@/database/api';
import { UI_NAMESPACE } from '@/utils/const';

import { StoredDataPreset } from '../types';

const api = createApi<StoredDataPreset>({
  namespace: `${UI_NAMESPACE}:spark-presets`,
});

export default api;
