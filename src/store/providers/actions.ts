import { getStoreAccessors } from 'vuex-typescript';
import { RootState } from '@/store/state';
import { Provider, ProviderContext, ProviderState } from './state';
import { createProvider as createProviderInStore } from './mutations';

const { dispatch } = getStoreAccessors<ProviderState, RootState>('providers');

const actions = {
  create: (context: ProviderContext, provider: Provider) => {
    createProviderInStore(context, provider);
  },
};

export default actions;

export const createProvider = dispatch(actions.create);
