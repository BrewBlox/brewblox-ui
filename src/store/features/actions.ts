import { createAccessors } from '@/helpers/static-store';
import { ActionTree } from 'vuex';
import { RootState } from '../state';
import {
  createFeature as createFeatureInStore,
  createArrangement as createArrangementInStore,
} from './mutations';
import { Feature, FeatureContext, FeatureState, Arrangement } from './state';

const { dispatch } = createAccessors('features');

export const actions: ActionTree<FeatureState, RootState> = {
  createFeature: async (context: FeatureContext, feature: Feature) =>
    createFeatureInStore(context, feature),

  createArrangement: async (context: FeatureContext, arr: Arrangement) =>
    createArrangementInStore(context, arr),
};

export const createFeature = dispatch(actions.createFeature);
export const createArrangement = dispatch(actions.createArrangement);
