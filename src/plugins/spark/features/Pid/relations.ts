import { sparkStore } from '@/plugins/spark/store';
import { PidBlock, RelationEdge, RelationNode } from '@/plugins/spark/types';
import { Link } from '@/shared-types';
import { featureStore } from '@/store/features';
import { createDialog } from '@/utils/dialog';
import { isLink } from '@/utils/identity';

function findLinks(serviceId: string, id: string | null): RelationEdge[] {
  const block = sparkStore.blockById(serviceId, id);
  if (!id || !block) {
    return [];
  }

  const links = Object.entries(block.data)
    .filter(([, v]) => isLink(v)) as [string, Link][];

  const filtered = links
    .filter(([, link]) => !link.driven && link.id);

  const relations: RelationEdge[] = filtered
    .map(([k, link]) => ({
      source: id,
      target: link.id as string,
      relation: [k],
    }));

  filtered
    .forEach(([, link]) => relations.push(...findLinks(serviceId, link.id)));

  return relations;
}

function relations(block: PidBlock): RelationEdge[] {
  const chain = findLinks(block.serviceId, block.id);

  // Setpoints may be driven by something else (profile, setpoint driver, etc)
  // Just display the block that's actually driving, ignore any blocks driving the driver
  const setpointId = block.data.inputId.id;
  if (!setpointId) {
    return chain;
  }

  return [
    ...chain,
    ...sparkStore.serviceBlocks(block.serviceId)
      .filter(block => block.data.targetId?.id === setpointId)
      .map(block => ({ source: block.id, target: setpointId, relation: ['target'] })),
  ];
}

function nodes(serviceId: string): RelationNode[] {
  return sparkStore.serviceBlocks(serviceId)
    .map(block => ({
      id: block.id,
      type: featureStore.widgetTitle(block.type),
    }));
}

export function startRelationsDialog(block: PidBlock): void {
  if (!block) {
    return;
  }
  createDialog({
    component: 'RelationsDialog',
    componentProps: {
      serviceId: block.serviceId,
      nodes: nodes(block.serviceId),
      edges: relations(block),
      title: `${block.id} relations`,
      hideUnrelated: true,
    },
  });
}
