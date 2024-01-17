import { StoreObject, StoreObjectImpl } from 'brewblox-proto/ts';
import { GLOBAL_NAMESPACE, SYSTEM_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { UserTimeZone, UserUISettings, UserUnits } from '@/user-settings';

export const configApi = createApi<UserUISettings & StoreObject>({
  namespace: SYSTEM_NAMESPACE,
});

export const globalApi = createApi<StoreObjectImpl<UserUnits | UserTimeZone>>({
  namespace: GLOBAL_NAMESPACE,
});
