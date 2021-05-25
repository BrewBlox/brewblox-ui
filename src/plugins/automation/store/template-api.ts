import { createApi } from '@/database/api';
import { UI_NAMESPACE } from '@/utils/const';

import { AutomationTemplate } from '../types';

export const templateApi = createApi<AutomationTemplate>({
  namespace: `${UI_NAMESPACE}:autm-template`,
  parsed: true,
});

export default templateApi;
