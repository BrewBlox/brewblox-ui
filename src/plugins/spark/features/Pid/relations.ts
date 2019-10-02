import get from 'lodash/get';

import { createDialog } from '@/helpers/dialog';
import { Link } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { featureStore } from '@/store/features';

import { BlockLink } from '../../types';
import { PidBlock } from './types';

function findLinks(serviceId: string, id: string | null): BlockLink[] {
  const block = sparkStore.blocks(serviceId)[id || ''];
  if (!id || !block) {
    return [];
  }

  const links = Object.entries(block.data)
    .filter(([, v]) => v instanceof Link) as [string, Link][];

  const filtered = links
    .filter(([, link]) => !link.driven && link.id);

  const relations: BlockLink[] = filtered
    .map(([k, link]) => ({
      source: id,
      target: link.id as string,
      relation: [k],
    }));

  return filtered
    .reduce((acc: BlockLink[], [, link]) => ([...acc, ...findLinks(serviceId, link.id)]), relations);
}

function relations(block: PidBlock): BlockLink[] {
  const chain = findLinks(block.serviceId, block.id);

  // Setpoints may be driven by something else (profile, setpoint driver, etc)
  // Just display the block that's actually driving, ignore any blocks driving the driver
  const setpointId = block.data.inputId.id;
  if (!setpointId) {
    return chain;
  }

  return [
    ...chain,
    ...sparkStore.blockValues(block.serviceId)
      .filter(block => get(block, 'data.targetId.id') === setpointId)
      .map(block => ({ source: block.id, target: setpointId, relation: ['target'] })),
  ];
}

function nodes(serviceId: string): { id: string; type: string }[] {
  return sparkStore.blockValues(serviceId)
    .map(block => ({
      id: block.id,
      type: featureStore.displayName(block.type),
    }));
}

export function startRelationsDialog(block: PidBlock): void {
  if (!block) {
    return;
  }
  createDialog({
    component: 'RelationsDialog',
    serviceId: block.serviceId,
    nodes: nodes(block.serviceId),
    relations: relations(block),
    title: `${block.id} relations`,
  });
}
