import { FeatureService } from '@/services/state';

import spark from './spark';
import HistoryService from './HistoryService';

export const services: { [id: string]: FeatureService } = {
  spark,
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
