import { generate } from '@/helpers/database-api';

import { Dashboard, DashboardItem } from './types';

export const dashboardApi = generate<Dashboard>('dashboards');
export const itemApi = generate<DashboardItem>('dashboard-items');
