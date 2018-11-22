import { createAccessors } from '@/helpers/static-store';
import { GetterTree } from 'vuex';
import { RootState, RootStore } from '../state';
import { Deleter, Feature, FeatureState, Validator } from './state';

const { read } = createAccessors('features');

export const getters: GetterTree<FeatureState, RootState> = {
  features: (state: FeatureState): { [id: string]: Feature } => state.features,
  featureIds: (state: FeatureState): string[] => Object.keys(state.features),
  featureValues: (state: FeatureState): Feature[] => Object.values(state.features),
};

export const features = read(getters.features);
export const featureIds = read(getters.featureIds);
export const featureValues = read(getters.featureValues);

export const featureById = (store: RootStore, id: string): Feature =>
  (features(store)[id] || {});

export const displayNameById = (store: RootStore, id: string): string =>
  (featureById(store, id).displayName || id);

export const validatorById = (store: RootStore, id: string): Validator =>
  (featureById(store, id).validator || (() => true));

export const wizardById = (store: RootStore, id: string): string | undefined =>
  featureById(store, id).wizard;

export const widgetById = (store: RootStore, id: string): string | undefined =>
  featureById(store, id).widget;

export const widgetSizeById = (store: RootStore, id: string) =>
  (featureById(store, id).widgetSize || { ...{ cols: 3, rows: 2 } });

export const formById = (store: RootStore, id: string): string | undefined =>
  featureById(store, id).form;

export const deletersById = (store: RootStore, id: string): Deleter[] =>
  (featureById(store, id).deleters || []);
