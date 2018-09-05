import { blockFeatures } from '@/features';
import DefaultWidget from '@/components/Defaults/DefaultWidget.vue';

const featureByName = (type: string) => (blockFeatures[type] || {});

export const allTypes: string[] = Object.keys(blockFeatures);
export const widgetByType = (type: string) => featureByName(type).widget || DefaultWidget;
export const wizardByType = (type: string) => featureByName(type).wizard; // No automatic default
export const displayNameByType = (type: string) => featureByName(type).displayName || type;
