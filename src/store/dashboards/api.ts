import { createApi } from '@/plugins/database/api';

import { Dashboard, Widget } from './types';

export const dashboardApi = createApi<Dashboard>('dashboards');
export const widgetApi = createApi<Widget>('dashboard-items');
