import { createApi } from '@/plugins/database/api';

import { BuilderLayout } from '../types';

const api = createApi<BuilderLayout>('layouts');

export default api;
