import { RootStore } from '@/store/state';

import { allBlocksFromService, blockById } from '@/store/blocks/getters';

import { ProfilesBlock } from './state';

export const typeName = 'Profiles';

export const getById = (store: RootStore, id: string) =>
  blockById<ProfilesBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<ProfilesBlock>(store, serviceId, typeName);
