import { createAccessors } from '@/helpers/static-store';
import { RootState, RootStore } from '@/store/state';
import { GetterTree } from 'vuex';
import { HistoryState, Listener } from './state';

const { read } = createAccessors('history');

export const MAX_POINTS = 2000;

export const getters: GetterTree<HistoryState, RootState> = {
  listeners: (state: HistoryState): { [id: string]: Listener } => state.listeners || {},
  listenerIds: (state: HistoryState): string[] => Object.keys(state.listeners),
  listenerValues: (state: HistoryState): Listener[] => Object.values(state.listeners),
  measurements: (state: HistoryState): string[] => Object.keys(state.availableFields),
  fields: (state: HistoryState): { [id: string]: string[] } => state.availableFields,
};

export const listeners = read(getters.listeners);
export const listenerIds = read(getters.listenerIds);
export const listenerValues = read(getters.listenerValues);
export const measurements = read(getters.measurements);
export const fields = read(getters.fields);

export const listenerById =
  (store: RootStore, listenerId: string): Listener => {
    const listener = listeners(store)[listenerId];
    if (listener === undefined) {
      throw new Error(`${listenerId} not found in history store`);
    }
    return listener;
  };

export const tryListenerById =
  (store: RootStore, listenerId: string): Listener | null =>
    listeners(store)[listenerId] || null;

export const fieldsByMeasurement =
  (store: RootStore, measurement: string): string[] =>
    fields(store)[measurement];
