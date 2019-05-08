import { Service } from '@/store/services/state';

export interface Provider {
  id: string;
  displayName?: string;
  features: string[];
  initializer: (store: any, service: Service) => Promise<any>;
  fetcher?: (store: any, service: Service) => Promise<any>;
  wizard?: string;
  page?: string;
  watcher?: string;
}
