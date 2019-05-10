import { Service } from '@/store/services/types';

export interface Provider {
  id: string;
  displayName?: string;
  features: string[];
  onAdd: (service: Service) => Promise<any>;
  onRemove?: (service: Service) => Promise<any>;
  onFetch?: (service: Service) => Promise<any>;
  wizard?: string;
  page?: string;
  watcher?: string;
}
