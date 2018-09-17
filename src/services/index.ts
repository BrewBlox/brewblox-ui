import { FeatureService } from '@/services/state';

import SparkService from './SparkService';
import HistoryService from './HistoryService';

const services: { [id: string]: FeatureService } = {
  SparkService,
  HistoryService,
};

const features = Object.values(services).reduce(
  (acc: any, service: FeatureService) => ({
    ...acc,
    ...service.features,
  }),
  {},
);

export const allServices = services;
export const allFeatures = features;
