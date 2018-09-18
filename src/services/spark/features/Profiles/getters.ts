import { RootStore } from '@/store/state';

import { allBlocks, blockById } from '@/services/spark/store/getters';

import { ProfilesBlock } from './state';

export const typeName = 'Profiles';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<ProfilesBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<ProfilesBlock>(store, serviceId, typeName);
