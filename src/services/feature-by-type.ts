import generic from './SparkService/features/GenericBlock';

import { allFeatures } from './';

export const allFeatureTypes: string[] = Object.keys(allFeatures);

export const featureByType = (type: string) =>
  (allFeatures[type] || {});

export const widgetByType = (type: string) =>
  featureByType(type).widget || generic.widget;

export const wizardByType = (type: string) =>
  featureByType(type).wizard; // No automatic default

export const displayNameByType = (type: string) =>
  featureByType(type).displayName || type;

export const validatorByType = (type: string) =>
  featureByType(type).validator || generic.validator;

export const widgetSizeByType = (type: string) =>
  featureByType(type).widgetSize || generic.widgetSize;
