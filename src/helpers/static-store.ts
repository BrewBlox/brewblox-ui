import { RootStore } from '@/store/state';
import { Action, ActionContext, Getter, Mutation } from 'vuex';

const nestedName =
  (serviceId: string, func: Function): string => `${serviceId}/${func.name}`;

type StoreType<TModuleState> = RootStore | ActionContext<TModuleState, {}>;

export const createAccessors = (moduleName: string): any =>
  ({
    read: function read<TModuleState>(getter: Getter<TModuleState, {}>) {
      const name = nestedName(moduleName, getter);
      return (store: StoreType<TModuleState>) =>
        ((store as ActionContext<TModuleState, {}>).rootGetters || store.getters)[name];
    },
    commit: function commit<TModuleState>(mutation: Mutation<TModuleState>) {
      const name = nestedName(moduleName, mutation);
      return (store: StoreType<TModuleState>, payload?: any) =>
        store.commit(name, payload, { root: true });
    },
    dispatch: function dispatch<TModuleState>(action: Action<TModuleState, {}>) {
      const name = nestedName(moduleName, action as Function);
      return async (store: StoreType<TModuleState>, payload?: any) =>
        store.dispatch(name, payload, { root: true });
    },
  });
