import { ActionContext } from 'vuex';
import { RootStore, RootState } from '@/store/state';
import { Service } from '@/store/services/state';

export interface Provider {
  id: string;
  displayName?: string;
  features: string[];
  initializer: (store: RootStore, service: Service) => Promise<any>;
  fetcher?: (store: RootStore, service: Service) => Promise<any>;
  updater?: (store: RootStore, service: Service) => Promise<any>;
  wizard?: string;
  page?: string;
}

export type ProviderState = {
  providers: {
    [id: string]: Provider;
  };
};

export type ProviderContext = ActionContext<ProviderState, RootState>;
