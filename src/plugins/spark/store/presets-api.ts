import { UI_NAMESPACE } from '@/helpers/const';
import { createApi } from '@/plugins/database/api';

import { StoredDataPreset } from '../types';

const api = createApi<StoredDataPreset>({
  namespace: `${UI_NAMESPACE}:spark-presets`,
});

export default api;
