import { generate } from '@/helpers/database-api';

import { Dashboard, PersistentWidget } from './types';

export const dashboardApi = generate<Dashboard>('dashboards');
export const widgetApi = generate<PersistentWidget>('dashboard-items');
