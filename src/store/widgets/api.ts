import { Widget } from './types';
import { WIDGET_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';

export const api = createApi<Widget>({
  namespace: WIDGET_NAMESPACE,
});

export default api;
