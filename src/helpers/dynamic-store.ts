import { ActionContext } from 'vuex';
import {
  ActionHandlerWithPayload,
  getStoreAccessors,
  GetterHandler,
  MutationHandlerNoPayload,
  MutationHandlerWithPayload,
} from 'vuex-typescript';
import { RootStore, State as RootState } from '@/store/state';

export const serviceAvailable = (store: RootStore, serviceId: string) =>
  !!(store as any).state[serviceId];

export const registerService = (store: RootStore, serviceId: string, module: any) => {
  if (!serviceAvailable(store, serviceId)) {
    store.registerModule(serviceId, module);
  }
};

/*
  These store accessors are for use by dynamically created store modules (services).
  They add a 'serviceId' argument to all store accessors: read, commit, and dispatch.
  This serviceId argument always follows 'store', and precedes payload.

  Example:

  const getters = {
    blocks: (state: BlocksState): { [id: string]: Block } => state.blocks,
  };

  export const blocks = read(getters.blocks);

  const mutations = {
    mutateBlock: (state: BlocksState, block: Block) => {
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

export function read<
  TModuleState,
  TResult>(handler: GetterHandler<TModuleState, RootState, TResult>) {
  return (
    store: RootStore,
    serviceId: string,
  ): TResult =>
    getStoreAccessors<TModuleState, RootState>(serviceId)
      .read(handler)(store);
}

export function commit<
  TModuleState,
  TPayload>(handler: MutationHandlerWithPayload<TModuleState, TPayload>) {
  return (
    store: RootStore | ActionContext<TModuleState, RootState>,
    serviceId: string, payload: TPayload,
  ) =>
    getStoreAccessors<TModuleState, RootState>(serviceId)
      .commit(handler)(store, payload);
}

export function noArgCommit<
  TModuleState>(handler: MutationHandlerNoPayload<TModuleState>) {
  return (
    store: RootStore | ActionContext<TModuleState, RootState>,
    serviceId: string,
  ) =>
    getStoreAccessors<TModuleState, RootState>(serviceId)
      .commit(handler)(store);
}

export function dispatch<
  TModuleState,
  TPayload,
  TResult>(handler: ActionHandlerWithPayload<TModuleState, RootState, TPayload, TResult>) {
  return (
    store: RootStore,
    serviceId: string,
    payload: TPayload,
  ) =>
    getStoreAccessors<TModuleState, RootState>(serviceId)
      .dispatch(handler)(store, payload);
}
