import { GLOBAL_NAMESPACE, UI_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { StoreObject, StoreObjectImpl } from '@/shared-types';

import { SystemConfig, UserTimeZone, UserUnits } from './types';

export const configApi = createApi<SystemConfig & StoreObject>({
  namespace: `${UI_NAMESPACE}:system-config`,
});

export const globalApi = createApi<StoreObjectImpl<UserUnits | UserTimeZone>>({
  namespace: GLOBAL_NAMESPACE,
});
