import { UI_NAMESPACE } from '@/helpers/const';
import { createApi } from '@/plugins/database/api';

import { Dashboard, Widget } from './types';

export const dashboardApi = createApi<Dashboard>({
  namespace: `${UI_NAMESPACE}:dashboards`,
});

export const widgetApi = createApi<Widget>({
  namespace: `${UI_NAMESPACE}:dashboard-items`,
});
