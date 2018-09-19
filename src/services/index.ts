import { FeatureService } from '@/services/state';

import Spark from './Spark';
import History from './History';

import GenericBlock from './Spark/components/GenericBlock';

export const services: { [id: string]: FeatureService } = {
  Spark,
  History,
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
