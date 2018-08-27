import { RootStore } from '../../state';

import { allBlocksFromService, blockById } from '../getters';

import { ProfilesBlock } from './Profiles';

export const typeName = 'Profiles';

export const getById = (store: RootStore, id: string) =>
  blockById<ProfilesBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<ProfilesBlock>(store, serviceId, typeName);
