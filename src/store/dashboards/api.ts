import { generate } from '@/helpers/database-api';

import { Dashboard, Widget } from './types';

export const dashboardApi = generate<Dashboard>('dashboards');
export const widgetApi = generate<Widget>('dashboard-items');
