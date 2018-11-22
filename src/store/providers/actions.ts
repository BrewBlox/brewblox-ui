import { createAccessors } from '@/helpers/static-store';
import { ActionTree } from 'vuex';
import { RootState } from '../state';
import { createProvider as createProviderInStore } from './mutations';
import { Provider, ProviderContext, ProviderState } from './state';

const { dispatch } = createAccessors('providers');

export const actions: ActionTree<ProviderState, RootState> = {
  create: async (context: ProviderContext, provider: Provider) => {
    createProviderInStore(context, provider);
  },
};

export const createProvider = dispatch(actions.create);
