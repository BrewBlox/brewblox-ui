import { allFeatureTypes, displayNameByType, wizardByType } from '@/services/feature-by-type';
import { VueConstructor } from 'vue';

export const widgetWizards: { [name: string]: VueConstructor } = allFeatureTypes()
  .filter(wizardByType)
  .reduce(
    (acc: any, type: string) => {
      acc[type] = wizardByType(type);
      return acc;
    },
    {},
  );

export const widgetDescriptions: { [name: string]: string } = allFeatureTypes()
  .reduce(
    (acc: any, type: string) => {
      acc[type] = displayNameByType(type);
      return acc;
    },
    {},
  );
