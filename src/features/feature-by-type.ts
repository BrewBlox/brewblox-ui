import { blockFeatures } from '@/features';
import UnknownBlock from './UnknownBlock';

const featureByName = (type: string) => (blockFeatures[type] || {});

export const allTypes: string[] = Object.keys(blockFeatures);

export const widgetByType = (type: string) =>
  featureByName(type).widget || UnknownBlock.widget;

export const wizardByType = (type: string) =>
  featureByName(type).wizard; // No automatic default

export const displayNameByType = (type: string) =>
  featureByName(type).displayName || type;

export const validatorByType = (type: string) =>
  featureByName(type).validator || UnknownBlock.validator;

export const widgetSizeByType = (type: string) =>
  featureByName(type).widgetSize || UnknownBlock.widgetSize;
