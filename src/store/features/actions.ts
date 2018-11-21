import { createAccessors } from '@/helpers/static-store';
import { createFeature as createFeatureInStore } from './mutations';
import { Feature, FeatureContext } from './state';

const { dispatch } = createAccessors('features');

export const actions = {
  create: (context: FeatureContext, provider: Feature) =>
    createFeatureInStore(context, provider),
};

export const createFeature = dispatch(actions.create);
