import { WIDGET_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { Widget } from './types';

export const api = createApi<Widget>({
  namespace: WIDGET_NAMESPACE,
});

export default api;
