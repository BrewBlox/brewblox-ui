import { createAccessors } from '@/helpers/static-store';
import { createProvider as createProviderInStore } from './mutations';
import { Provider, ProviderContext } from './state';

const { dispatch } = createAccessors('providers');

export const actions = {
  create: (context: ProviderContext, provider: Provider) => {
    createProviderInStore(context, provider);
  },
};

export const createProvider = dispatch(actions.create);
