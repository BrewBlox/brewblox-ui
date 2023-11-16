import { Block, BlockRelation, Link } from 'brewblox-proto/ts';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockRelationNode } from '@/plugins/spark/types';
import { useFeatureStore } from '@/store/features';
import { createDialog } from '@/utils/dialog';
import { isLink } from '@/utils/identity';

type LinkEntry = [key: string, link: Link & { id: string }];

function findFirstOrderRelations(addr: BlockAddress): BlockRelation[] {
  if (addr.serviceId == null || addr.id == null) {
    return [];
  }

  const store = useSparkStore();
  const relatedIds: string[] = [];

  const findFn = (id: string): string[] => {
    if (relatedIds.includes(id)) {
      return [];
    }

    relatedIds.push(id);
    const block = store.blockById(addr.serviceId, id);
    if (block == null) {
      return [];
    }

    return Object.entries(block.data)
      .filter((e): e is LinkEntry => isLink(e[1]) && e[1].id != null)
      .filter((e) => e[0] !== 'claimedBy')
      .map((e) => e[1].id);
  };

  let sources: string[] = [addr.id];

  // Continue until none of the evaluated blocks yields new relations
  // findFn() appends all unique IDs it encounters to `relatedIds`
  while (sources.length > 0) {
    sources = sources.flatMap(findFn);
  }

  // Use the relations as defined by the service.
  // This ensures the relevant relations are inverted or ignored,
  // and the diagram is rendered like a subset of the service relations diagram.
  return (
    store
      .relationsByService(addr.serviceId)
      .filter(
        (r) => relatedIds.includes(r.source) || relatedIds.includes(r.target),
      )
      // Special exception for pin blocks
      // We don't want to show all peer Digital Actuators when not directly relevant
      .filter(
        (r) =>
          r.target === addr.id ||
          r.relation[0] !== 'hwDevice' ||
          relatedIds.includes(r.source),
      )
  );
}

function fetchNodes(serviceId: string): BlockRelationNode[] {
  const featureStore = useFeatureStore();
  const sparkStore = useSparkStore();
  const specStore = useBlockSpecStore();
  return sparkStore.blocksByService(serviceId).map((block) => ({
    id: block.id,
    type: featureStore.widgetTitle(block.type),
    status: specStore.blockSpecByType(block.type)?.analyze(block),
  }));
}

export function startRelationsDialog(block: Block): void {
  if (!block) {
    return;
  }
  const nodes = fetchNodes(block.serviceId);
  const edges = findFirstOrderRelations(block);

  createDialog({
    component: 'RelationsDialog',
    componentProps: {
      serviceId: block.serviceId,
      nodes,
      edges,
      title: `${block.id} relations`,
      hideUnrelated: true,
    },
  });
}
