import { createAccessors } from '@/helpers/static-store';
import { GetterTree } from 'vuex';
import { Service } from '../services/state';
import { RootState, RootStore } from '../state';
import { Provider, ProviderState } from './state';

type ServiceFunc = (store: RootStore, service: Service) => Promise<any>;

const { read } = createAccessors('providers');

export const getters: GetterTree<ProviderState, RootState> = {
  providers: (state: ProviderState): { [id: string]: Provider } => state.providers,
  providerIds: (state: ProviderState): string[] => Object.keys(state.providers),
  providerValues: (state: ProviderState): Provider[] => Object.values(state.providers),
};

export const providers = read(getters.providers);
export const providerIds = read(getters.providerIds);
export const providerValues = read(getters.providerValues);

export const providerById = (store: RootStore, id: string) =>
  (providers(store)[id] || {});

export const displayNameById = (store: RootStore, id: string) =>
  providerById(store, id).displayName || id;

export const initializerById = (store: RootStore, id: string): ServiceFunc =>
  providerById(store, id).initializer || (async () => { });

export const fetcherById = (store: RootStore, id: string): ServiceFunc =>
  providerById(store, id).fetcher || (async () => { });

export const updaterById = (store: RootStore, id: string): ServiceFunc =>
  providerById(store, id).updater || (async () => { });

export const wizardById = (store: RootStore, id: string) =>
  providerById(store, id).wizard;

export const pageById = (store: RootStore, id: string) =>
  providerById(store, id).page;

export const featuresById = (store: RootStore, id: string) =>
  providerById(store, id).features;
