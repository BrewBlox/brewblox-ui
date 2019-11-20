import { generate } from '@/helpers/database-api';

import { BuilderLayout } from '../types';

const api = generate<BuilderLayout>('layouts');

export default api;
