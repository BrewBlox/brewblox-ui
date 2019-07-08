import get from 'lodash/get';

import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import { LinkedBlock, PersistentPart } from './types';

export function settingsBlock<T extends Block>(part: PersistentPart, key: string): T | null {
  const serviceId = get(part.settings, [key, 'serviceId'], null);
  const blockId = get(part.settings, [key, 'blockId'], null);
  return serviceId && blockId
    ? sparkStore.tryBlockById(serviceId, blockId) as T | null
    : null;
}

export function settingsLink(part: PersistentPart, key: string): LinkedBlock {
  const serviceId = get(part.settings, [key, 'serviceId'], null);
  const blockId = get(part.settings, [key, 'blockId'], null);
  return { serviceId, blockId };
};
