import { Service } from '@/store/services/state';
import { RootState, RootStore } from '@/store/state';
import { ActionContext } from 'vuex';

export interface Provider {
  id: string;
  displayName?: string;
  features: string[];
  initializer: (store: RootStore, service: Service) => Promise<any>;
  fetcher?: (store: RootStore, service: Service) => Promise<any>;
  wizard?: string;
  page?: string;
  watcher?: string;
}

export interface ProviderState {
  providers: {
    [id: string]: Provider;
  };
}

export type ProviderContext = ActionContext<ProviderState, RootState>;
