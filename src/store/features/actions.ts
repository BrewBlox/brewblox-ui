import { getStoreAccessors } from 'vuex-typescript';
import { addVuexKey } from '@/store/vuex-key-fix';
import { RootState } from '../state';
import { Feature, FeatureContext, FeatureState } from './state';
import { createFeature as createFeatureInStore } from './mutations';

const { dispatch } = getStoreAccessors<FeatureState, RootState>('features');

const actions = {
  create: (context: FeatureContext, provider: Feature) =>
    createFeatureInStore(context, provider),
};

addVuexKey(actions);
export default actions;

export const createFeature = dispatch(actions.create);
