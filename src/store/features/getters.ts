import { getStoreAccessors } from 'vuex-typescript';

import { RootState, RootStore } from '../state';
import { Feature, FeatureState } from './state';

const { read } = getStoreAccessors<FeatureState, RootState>('features');

const getters = {
  features: (state: FeatureState): { [id: string]: Feature } => state.features,
  featureIds: (state: FeatureState): string[] => Object.keys(state.features),
  featureValues: (state: FeatureState): Feature[] => Object.values(state.features),
  initialized: (state: FeatureState): boolean => state.initialized,
};
export default getters;

export const features = read(getters.features);
export const featureIds = read(getters.featureIds);
export const featureValues = read(getters.featureValues);
export const initialized = read(getters.initialized);

export const featureById = (store: RootStore, id: string) =>
  (features(store)[id] || {});

export const displayNameById = (store: RootStore, id: string) =>
  (featureById(store, id).displayName || id);

export const validatorById = (store: RootStore, id: string) =>
  (featureById(store, id).validator || (() => true));

export const onDeleteById = (store: RootStore, id: string) =>
  (featureById(store, id).onDelete);

export const wizardById = (store: RootStore, id: string) =>
  featureById(store, id).wizard;

export const widgetById = (store: RootStore, id: string) =>
  featureById(store, id).widget;

export const widgetSizeById = (store: RootStore, id: string) =>
  (featureById(store, id).widgetSize || { ...{ cols: 3, rows: 2 } });

export const formById = (store: RootStore, id: string) =>
  featureById(store, id).form;
