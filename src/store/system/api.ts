import { GLOBAL_NAMESPACE, UI_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { StoreObject, StoreObjectImpl } from '@/shared-types';
import { UserTimeZone, UserUISettings, UserUnits } from '@/user-settings';

export const configApi = createApi<UserUISettings & StoreObject>({
  namespace: `${UI_NAMESPACE}:system-config`,
});

export const globalApi = createApi<StoreObjectImpl<UserUnits | UserTimeZone>>({
  namespace: GLOBAL_NAMESPACE,
});
