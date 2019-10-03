import { VueConstructor } from 'vue';

import { ref } from '@/helpers/component-ref';
import {
  base64ToHex,
  dateString,
  durationString,
  hexToBase64,
  round,
  shortDateString,
  truncate,
  truncateRound,
  unitDurationString,
} from '@/helpers/functional';
import { Link, Unit } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { WidgetSelector } from '@/store/features';

import { BlockConfig } from './types';

export const blockIdRules = (serviceId: string): InputRule[] => [
  v => !!v || 'Name must not be empty',
  v => !sparkStore.blockIds(serviceId).includes(v) || 'Name must be unique',
  v => !!v.match(/^[a-zA-Z]/) || 'Name must start with a letter',
  v => !!v.match(/^[a-zA-Z0-9 \(\)_\-\|]*$/) || 'Name may only contain letters, numbers, spaces, and ()-_|',
  v => v.length < 200 || 'Name must be less than 200 characters',
];

export const digitalConstraintLabels = new Map([
  ['minOff', 'Minimum OFF time'],
  ['minOn', 'Minimum ON time'],
  ['mutex', 'Mutually exclusive'],
]);

export const analogConstraintLabels = new Map([
  ['min', 'Minimum'],
  ['max', 'Maximum'],
  ['balanced', 'Balanced'],
]);

export const constraintLabels = new Map([
  ...digitalConstraintLabels.entries(),
  ...analogConstraintLabels.entries(),
]);

export const installFilters = (Vue: VueConstructor): void => {
  Vue.filter(
    'unit',
    (value: Unit | null) =>
      (value !== null && value !== undefined ? value.toString() : '-'));
  Vue.filter(
    'link',
    (value: Link | null) =>
      (value !== null && value !== undefined ? value.toString() : '-'));
  Vue.filter('round', round);
  Vue.filter('truncateRound', truncateRound);
  Vue.filter('hexToBase64', hexToBase64);
  Vue.filter('base64ToHex', base64ToHex);
  Vue.filter('duration', durationString);
  Vue.filter('truncated', truncate);
  Vue.filter('unitDuration', unitDurationString);
  Vue.filter('dateString', dateString);
  Vue.filter('shortDateString', shortDateString);
};

export const blockWidgetSelector = (component: VueConstructor): WidgetSelector => {
  const widget = ref(component);
  return (config: BlockConfig) => {
    if (!sparkStore.serviceAvailable(config.serviceId)) {
      throw new Error(`Service '${config.serviceId}' not found`);
    }
    const block = sparkStore.tryBlockById(config.serviceId, config.blockId);
    return block ? widget : 'UnknownBlockWidget';
  };
};

