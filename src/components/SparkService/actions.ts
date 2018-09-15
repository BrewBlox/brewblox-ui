import { RootStore } from '@/store/state';
import { saveService } from '@/store/services/actions';

import { getById } from './getters';

export const updateProfileNames = (store: RootStore, id: string, names: string[]) => {
  const existing = getById(store, id);
  saveService(store, {
    ...existing,
    config: {
      ...existing.config,
      profileNames: names,
    },
  });
};
