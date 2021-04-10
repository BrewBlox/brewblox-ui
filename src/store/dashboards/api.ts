import { createApi } from '@/plugins/database/api';
import { UI_NAMESPACE } from '@/utils/const';

import { Dashboard, Widget } from './types';

export const dashboardApi = createApi<Dashboard>({
  namespace: `${UI_NAMESPACE}:dashboards`,
});

export const widgetApi = createApi<Widget>({
  namespace: `${UI_NAMESPACE}:dashboard-items`,
});
