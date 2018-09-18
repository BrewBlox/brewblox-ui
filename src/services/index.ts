import { FeatureService } from '@/services/state';

import spark from './spark';
import history from './history';

import GenericBlock from './spark/components/GenericBlock';

export const services: { [id: string]: FeatureService } = {
  spark,
  history,
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

export const generic = GenericBlock;
