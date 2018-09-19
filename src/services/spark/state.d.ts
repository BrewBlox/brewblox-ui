import { Service } from '@/store/services/state';

export interface spark extends Service {
  config: {
    profileNames: string[];
  };
}

export interface DataBlock {
  id: string;
  type: string;
  profiles: number[];
  data: Object;
}

export interface Block extends DataBlock {
  serviceId: string;
  isLoading?: boolean;
}
