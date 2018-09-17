import { FeatureService } from '@/services/state';

import SparkService from './SparkService';
import HistoryService from './HistoryService';

export const services: { [id: string]: FeatureService } = {
  SparkService,
  HistoryService,
};

export const features = Object.values(services)
  .filter(service => !!service.features)
  .reduce(
    (acc: any, service: FeatureService) => ({
      ...acc,
      ...service.features,
    }),
    {},
  );
