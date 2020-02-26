import { createApi } from '@/plugins/database/api';

import { AutomationTemplate } from '../types';


export const templateApi = createApi<AutomationTemplate>('autm-template', true);
