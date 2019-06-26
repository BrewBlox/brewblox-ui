import get from 'lodash/get';

import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import { LinkedBlock, PersistentPart } from './types';

export const settingsBlock =
  (part: PersistentPart, key: string): Block | null => {
    const serviceId = get(part.settings, [key, 'serviceId'], null);
    const blockId = get(part.settings, [key, 'blockId'], null);
    return serviceId && blockId
      ? sparkStore.blocks(serviceId)[blockId]
      : null;
  };

export const settingsLink =
  (part: PersistentPart, key: string): LinkedBlock => {
    const serviceId = get(part.settings, [key, 'serviceId'], null);
    const blockId = get(part.settings, [key, 'blockId'], null);
    return { serviceId, blockId };
  };
