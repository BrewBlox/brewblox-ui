import { RootStore } from '@/store/state';
import { Action, ActionContext, Getter, Module, Mutation } from 'vuex';

export const serviceAvailable =
  (store: RootStore, serviceId: string): boolean => !!(store as any).state[serviceId];

export function registerService<TModuleState>(
  store: RootStore,
  serviceId: string,
  module: Module<TModuleState, {}>,
): void {
  if (!serviceAvailable(store, serviceId)) {
    store.registerModule(serviceId, module);
  }
}

/*
  These store accessors are for use by dynamically created store modules (services).
  They add a 'serviceId' argument to all store accessors: read, commit, and dispatch.
  This serviceId argument always follows 'store', and precedes payload.

  Example:

  const getters = {
    blocks: (state: SparkState): { [id: string]: Block } => state.blocks,
  };

  export const blocks = read(getters.blocks);

  const mutations = {
    mutateBlock: (state: SparkState, block: Block) => {
      Vue.set(state.blocks, block.id, { ...block });
    },
  };

  export const mutateBlock = commit(mutations.mutateBlock);

  const actions = {
    fetchBlock: async (context: BlocksContext, block: Block) => {
      const fetchedBlock = await fetchBlockInApi(block);
      mutateBlock(context, block.serviceId, fetchedBlock);
    },
  };

  export const fetchBlock = dispatch(actions.fetchBlock);

  // Code end

  Normally, call signatures would be:
    blocks(store: RootStore): { [id: string]: Block }
    mutateBlock(store: RootStore, block: Block)
    fetchBlock(store: RootStore, block: Block)

  Using these store accessors, call signatures are now:
    blocks(store: RootStore, serviceId: string): { [id: string]: Block }
    mutateBlock(store: RootStore, serviceId: string, block: Block)
    fetchBlock(store: RootStore, serviceId: string, block: Block)
*/

type StoreType<TModuleState> = RootStore | ActionContext<TModuleState, {}>;

const nestedName =
  (serviceId: string, func: Function): string => `${serviceId}/${func.name}`;

export function read<TModuleState>(
  getter: Getter<TModuleState, {}>
): (store: StoreType<TModuleState>, serviceId: string) => any {
  return (store: StoreType<TModuleState>, serviceId: string) =>
    ((store as ActionContext<TModuleState, {}>).rootGetters
      || store.getters
    )[nestedName(serviceId, getter)];
}

export function commit<TModuleState>(
  mutation: Mutation<TModuleState>
): (store: StoreType<TModuleState>, serviceId: string, payload?: any) => any {
  return (store: StoreType<TModuleState>, serviceId: string, payload?: any) =>
    store.commit(nestedName(serviceId, mutation), payload, { root: true });
}

export function dispatch<TModuleState>(
  action: Action<TModuleState, {}>
): (store: StoreType<TModuleState>, serviceId: string, payload?: any) => Promise<any> {
  return async (store: StoreType<TModuleState>, serviceId: string, payload?: any) =>
    store.dispatch(nestedName(serviceId, action as Function), payload, { root: true });
}
