import get from 'lodash/get';

import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import specs from './specs';
import { FlowPart, LinkedBlock, PersistentPart, StatePart } from './types';

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

export function asPersistentPart(part: PersistentPart | FlowPart): PersistentPart {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { transitions, size, flows, ...persistent } = part as FlowPart;
  return persistent;
}

export function asStatePart(part: PersistentPart): StatePart {
  const spec = specs[part.type];
  return {
    ...part,
    transitions: spec.transitions(part),
    size: spec.size(part),
  };
}
