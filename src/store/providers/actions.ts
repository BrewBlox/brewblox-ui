import { getStoreAccessors } from 'vuex-typescript';
import { addVuexKey } from '@/store/vuex-key-fix';
import { RootState } from '@/store/state';
import { Provider, ProviderContext, ProviderState } from './state';
import { createProvider as createProviderInStore } from './mutations';

const { dispatch } = getStoreAccessors<ProviderState, RootState>('providers');

const actions = {
  create: (context: ProviderContext, provider: Provider) => {
    createProviderInStore(context, provider);
  },
};

addVuexKey(actions);
export default actions;

export const createProvider = dispatch(actions.create);
