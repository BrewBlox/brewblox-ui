import InvalidWidget from '@/components/Widget/InvalidWidget.vue';
import { features } from './';

export const allFeatureTypes = () => Object.keys(features);

export const featureByType = (type: string) =>
  (features[type] || {});

export const widgetByType = (type: string) =>
  featureByType(type).widget || InvalidWidget;

export const wizardByType = (type: string) =>
  featureByType(type).wizard; // No automatic default

export const displayNameByType = (type: string) =>
  featureByType(type).displayName || type;

export const validatorByType = (type: string) =>
  featureByType(type).validator || (() => true);

export const widgetSizeByType = (type: string) =>
  featureByType(type).widgetSize || { cols: 3, rows: 2 };
