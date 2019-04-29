import { createAccessors } from '@/helpers/static-store';
import { HistoryState, Listener, QueryParams, QueryTarget } from '@/store/history/state';
import { RootState, RootStore } from '@/store/state';
import { ActionTree } from 'vuex';
import {
  fetchKnownKeys as fetchKnownKeysInApi,
  validateService as validateServiceInApi,
  subscribeMetrics,
  subscribeValues,
} from './api';
import {
  addListener as addListenerInStore,
  mutateAvailableKeys as mutateAvailableKeysInStore,
  removeListener as removeListenerInStore,
  transformListener as transformListenerInStore,
  updateListener as updateListenerInStore,
} from './mutations';
import { HistoryContext } from './state';

const { dispatch } = createAccessors('history');

const addListener = async (
  context: HistoryContext,
  listener: Listener,
  fetcher: (p: QueryParams, t: QueryTarget) => Promise<EventSource>
): Promise<void> => {
  const { id, params, target } = listener;

  addListenerInStore(context, listener);

  const source = await fetcher(params, target);
  source.onmessage = (event: MessageEvent) =>
    transformListenerInStore(context, { id, result: JSON.parse(event.data) });
  source.onerror = () => source.close();

  updateListenerInStore(context, { id, source });
};

export const actions: ActionTree<HistoryState, RootState> = {
  addValuesListener: async (context: HistoryContext, listener: Listener) =>
    addListener(context, listener, subscribeValues),

  addMetricsListener: async (context: HistoryContext, listener: Listener) =>
    addListener(context, listener, subscribeMetrics),

  removeListener: async (context: HistoryContext, listener: Listener) => {
    removeListenerInStore(context, listener);
    if (listener.source) {
      listener.source.close();
    }
  },
};

export const addValuesListener = dispatch(actions.addValuesListener);
export const addMetricsListener = dispatch(actions.addMetricsListener);
export const removeListener = dispatch(actions.removeListener);

export const fetchKnownKeys =
  async (store: RootStore): Promise<void> =>
    mutateAvailableKeysInStore(store, await fetchKnownKeysInApi());

export const validateService =
  async (): Promise<boolean> => validateServiceInApi();
