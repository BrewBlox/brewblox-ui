<script setup lang="ts">
import { BlockRelation } from 'brewblox-proto/ts';
import * as d3 from 'd3';
import ELK, { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import toFinite from 'lodash/toFinite';
import { onMounted, ref, watch } from 'vue';
import { BlockRelationNode } from '@/plugins/spark/types';
import { createBlockDialog } from '@/utils/block-dialog';
import { isJsonEqual } from '@/utils/objects';

const DEFAULT_SCALE = 0.9;
const UNKNOWN_TYPE = '???';
const LABEL_HEIGHT = 50;
const LABEL_WIDTH = 150;

interface ElkRelationNode extends BlockRelationNode, ElkNode {
  x: number;
  y: number;
}

interface ElkRelationEdge extends BlockRelation, ElkExtendedEdge {}

interface Props {
  serviceId: string;
  nodes: BlockRelationNode[];
  edges: BlockRelation[];
  hideUnrelated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hideUnrelated: false,
});

const elk = new ELK();

const resetZoom = ref<() => void>(() => {});
const svgRef = ref<SVGElement>();
const gRef = ref<SVGGElement>();
const graphWidth = ref<number>(0);
const graphHeight = ref<number>(0);

const renderedNodes = ref<BlockRelationNode[]>();
const renderedEdges = ref<BlockRelation[]>();

function relevantNodes(
  nodes: BlockRelationNode[],
  edges: BlockRelation[],
): BlockRelationNode[] {
  const referencedIds = new Set(
    edges.flatMap((edge) => [edge.target, edge.source]),
  );
  const nodeIds = new Set(nodes.map((n) => n.id));
  const knownNodes = props.hideUnrelated
    ? nodes.filter((n) => referencedIds.has(n.id))
    : nodes;
  const unknownNodes: BlockRelationNode[] = [...referencedIds]
    .filter((id) => !nodeIds.has(id))
    .map((id) => ({ id, type: UNKNOWN_TYPE }));
  return [...knownNodes, ...unknownNodes];
}

function openSettings(id: string): void {
  const addr = {
    id,
    serviceId: props.serviceId,
    type: null,
  };
  createBlockDialog(addr, { mode: 'Basic' });
}

function makeCenteringTransform(scaleOffset = 0): d3.ZoomTransform {
  if (!svgRef.value) {
    return d3.zoomIdentity;
  }
  const width = graphWidth.value || 1;
  const height = graphHeight.value || 1;

  const svgRect = svgRef.value!.getBoundingClientRect();
  const scale =
    (DEFAULT_SCALE + scaleOffset) *
    Math.min(svgRect.width / width, svgRect.height / height, 1);
  return d3.zoomIdentity
    .translate(
      toFinite(svgRect.width - width * scale) / 2,
      toFinite(svgRect.height - height * scale) / 2,
    )
    .scale(scale);
}

async function drawGraph(
  nodes: BlockRelationNode[],
  edges: BlockRelation[],
): Promise<void> {
  if (!svgRef.value || !gRef.value) {
    return;
  }

  if (!nodes || !edges) {
    return;
  }

  if (
    isJsonEqual(nodes, renderedNodes.value) &&
    isJsonEqual(edges, renderedEdges.value)
  ) {
    return;
  }

  nodes = cloneDeep(nodes);
  edges = cloneDeep(edges);

  renderedNodes.value = nodes;
  renderedEdges.value = edges;

  const graph = await elk.layout({
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
    },
    children: relevantNodes(nodes, edges).map((v) => ({
      ...v,
      width: LABEL_WIDTH,
      height: LABEL_HEIGHT,
    })),
    edges: edges.map((v, idx) => ({
      id: `${idx}__${v.source}__${v.target}`,
      sources: [v.source],
      targets: [v.target],
    })),
  });

  // Set component variables
  // These will be needed for centering the graph
  graphWidth.value = graph.width || 1;
  graphHeight.value = graph.height || 1;

  // Start d3 configuration here by selecting the HTML elements
  const svg = d3.select(svgRef.value);
  const diagram = d3.select(gRef.value);

  // Create a path element for every edge in the graph
  const edgeSelect = diagram
    .selectAll<SVGPathElement, ElkRelationEdge>('.relation-edge')
    .data(graph.edges as ElkRelationEdge[], (d) => d.id)
    .join('path')
    .attr('class', 'relation-edge');

  // Edge configuration:
  // Create a straight line between start, end, and all bend points of the edge
  edgeSelect.attr('d', (d): string => {
    const path: (string | number)[] = [];
    d.sections?.forEach((s) => {
      path.push('M', s.startPoint.x, s.startPoint.y);
      s.bendPoints?.forEach((bp) => path.push('L', bp.x, bp.y));
      path.push('L', s.endPoint.x, s.endPoint.y);
    });
    return path.join(' ');
  });

  // Node configuration:
  // Create an SVG element for each node in the graph
  // Set overall position and size of the node element
  // We'll add its children below
  // Create a node element for every node in the graph
  const nodeSelect = diagram
    .selectAll<SVGForeignObjectElement, ElkRelationNode>('.relation-node')
    .data(graph.children as ElkRelationNode[], (d) => d.id)
    .join('svg')
    .attr('class', 'relation-node')
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('width', LABEL_WIDTH)
    .attr('height', LABEL_HEIGHT)
    .on('click', (evt, d) => openSettings(d.id));

  // SVG objects can't have a background color
  // Add a rect to serve as background
  nodeSelect
    .append('rect')
    .attr('class', 'background')
    .attr('width', LABEL_WIDTH)
    .attr('height', LABEL_HEIGHT)
    .attr('rx', 6)
    .attr('ry', 6);

  // Add status icons
  nodeSelect
    .append('circle')
    .attr('class', (d) => `status-icon status__${d.status}`)
    .attr('cx', 7)
    .attr('cy', 7)
    .attr('r', 4);

  // We want to use the HTML text rendering features for content
  // Add a foreign object to render content
  const nodeContentSelect = nodeSelect
    .append('foreignObject')
    .attr('width', LABEL_WIDTH)
    .attr('height', LABEL_HEIGHT)
    .append('xhtml:div')
    .attr('class', 'relation-node-content');

  // Add content title
  nodeContentSelect
    .append('xhtml:div')
    .attr('class', 'title')
    .text((d) => d.type);

  // Add content name
  nodeContentSelect
    .append('xhtml:div')
    .attr('class', 'name')
    .text((d) => d.name || d.id);

  // Enable zooming the graph
  const zoomBehavior = d3
    .zoom<SVGElement, unknown>()
    .on('zoom', (e: d3.D3ZoomEvent<SVGElement, unknown>) => {
      diagram.attr('transform', e.transform.toString());
    });

  // Provide functionality to reset zoom level
  // We need to capture `zoomBehavior`
  resetZoom.value = () => {
    if (svgRef.value) {
      d3.select(svgRef.value)
        .transition()
        .duration(750)
        .call(zoomBehavior.transform, () => makeCenteringTransform());
    }
  };

  // Zoom the graph now to provide a sensible initial value
  svg
    .call(zoomBehavior)
    .call(zoomBehavior.transform, makeCenteringTransform(0.05))
    .on('dblclick.zoom', resetZoom.value);
}

const debouncedDrawGraph = debounce(drawGraph, 100, {
  leading: false,
  trailing: true,
});

onMounted(() => {
  drawGraph(props.nodes, props.edges);
  watch([() => props.nodes, () => props.edges], () => {
    debouncedDrawGraph(props.nodes, props.edges);
  });
});
</script>

<template>
  <div class="fit">
    <svg
      :key="`relations-svg-${serviceId}`"
      ref="svgRef"
      class="fit"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
    >
      <g ref="gRef" />
    </svg>
    <q-btn
      unelevated
      class="absolute-bottom-right q-ma-lg"
      color="secondary"
      icon="mdi-stretch-to-page-outline"
      @click="resetZoom"
    >
      <q-tooltip> Reset zoom </q-tooltip>
    </q-btn>
  </div>
</template>

<style lang="sass">
.relation-edge
  stroke: #aaa
  fill: none
  stroke-width: 2px

.relation-node
  cursor: pointer
  > .background
    fill: #fff
    &:hover
      opacity: 0.8
  > .status-icon
    stroke: black
    stroke-width: 0.5
  > .status
    &__Active
      fill: $green-7
    &__Inactive
      fill: $orange-7
    &__Disabled
      fill: $grey-8
    &__Invalid
      fill: $red-8
    &__undefined
      fill: none

.relation-node-content
  width: 100%
  height: 100%
  display: flex
  flex-flow: column nowrap
  justify-content: space-around
  padding: 2px 8px
  > div
    overflow: hidden
    white-space: nowrap
    text-align: center
    text-overflow: ellipsis
  > .title
    font-weight: 300
    font-size: 11px
    color: black
  > .name
    font-weight: 500
    font-size: 12px
    color: black
</style>
