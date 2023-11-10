import { BlockRelation, Link, PidBlock } from 'brewblox-proto/ts';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import { BlockRelationNode } from '@/plugins/spark/types';
import { useFeatureStore } from '@/store/features';
import { createDialog } from '@/utils/dialog';
import { isLink } from '@/utils/identity';

function findLinks(serviceId: string, id: string | null): BlockRelation[] {
  const block = useSparkStore().blockById(serviceId, id);
  if (!id || !block) {
    return [];
  }

  const links = Object.entries(block.data).filter(([, v]) => isLink(v)) as [
    string,
    Link,
  ][];

  const filtered = links.filter(([, link]) => link.id != null);

  const relations: BlockRelation[] = filtered.map(([k, link]) => ({
    source: id,
    target: link.id as string,
    relation: [k],
  }));

  filtered.forEach(([, link]) =>
    relations.push(...findLinks(serviceId, link.id)),
  );

  return relations;
}

function relations(block: PidBlock): BlockRelation[] {
  const chain = findLinks(block.serviceId, block.id);

  // Setpoints may be claimed by something else (profile, setpoint driver, etc)
  // Just display the block that directly claims the setpoint.
  // Ignore any blocks that claim this block in turn.
  const setpointId = block.data.inputId.id;
  if (!setpointId) {
    return chain;
  }

  return [
    ...chain,
    ...useSparkStore()
      .blocksByService(block.serviceId)
      .filter((block) => block.data.targetId?.id === setpointId)
      .map((block) => ({
        source: block.id,
        target: setpointId,
        relation: ['target'],
      })),
  ];
}

function nodes(serviceId: string): BlockRelationNode[] {
  const featureStore = useFeatureStore();
  const sparkStore = useSparkStore();
  const specStore = useBlockSpecStore();
  return sparkStore.blocksByService(serviceId).map((block) => ({
    id: block.id,
    type: featureStore.widgetTitle(block.type),
    status: specStore.blockSpecByType(block.type)?.analyze(block),
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
