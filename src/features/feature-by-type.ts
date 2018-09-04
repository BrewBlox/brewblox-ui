import { blockFeatures } from '@/features';
import DefaultWidget from '@/components/Defaults/DefaultWidget.vue';

const featureByName = (type: string) => (blockFeatures[type] || {});

export const allTypes: string[] = Object.keys(blockFeatures);
export const widgetByType = (type: string) => featureByName(type).widget || DefaultWidget;
export const createByType = (type: string) => featureByName(type).create;
export const descriptionByType = (type: string) => featureByName(type).description || type;
