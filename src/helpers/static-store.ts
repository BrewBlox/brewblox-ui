import { Getter, Mutation, ActionContext, Action } from 'vuex';
import { RootStore, RootState } from '@/store/state';

const nestedName = (serviceId: string, func: Function) =>
  `${serviceId}/${func.name}`;

export function createAccessors(moduleName: string) {
  return {
    read: function read<TModuleState>(getter: Getter<TModuleState, RootState>) {
      return (store: RootStore | ActionContext<TModuleState, RootState>) =>
        store.getters[nestedName(moduleName, getter)];
    },
    commit: function commit<TModuleState>(mutation: Mutation<TModuleState>) {
      return (
        store: RootStore | ActionContext<TModuleState, RootState>,
        payload?: any,
        options?: any,
      ) =>
        store.commit(nestedName(moduleName, mutation), payload, options);
    },
    dispatch: function dispatch<TModuleState>(action: Action<TModuleState, RootState>) {
      return async (store: RootStore, payload: any) =>
        store.dispatch(nestedName(moduleName, action as Function), payload);
    },
  };
}
