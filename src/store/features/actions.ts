import { createAccessors } from '@/helpers/static-store';
import { ActionTree } from 'vuex';
import { RootState } from '../state';
import { createFeature as createFeatureInStore } from './mutations';
import { Feature, FeatureContext, FeatureState } from './state';

const { dispatch } = createAccessors('features');

export const actions: ActionTree<FeatureState, RootState> = {
  create: async (context: FeatureContext, provider: Feature) =>
    createFeatureInStore(context, provider),
};

export const createFeature = dispatch(actions.create);
