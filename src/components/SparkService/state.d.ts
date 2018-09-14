import { Service } from '@/store/services/state';

export interface SparkService extends Service {
  config: {
    profileNames: string[];
  };
}
