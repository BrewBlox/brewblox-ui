<script lang="ts">
import * as d3 from 'd3';
import ELK, { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled';
import debounce from 'lodash/debounce';
import toFinite from 'lodash/toFinite';
import { PropType, defineComponent, onMounted, ref, watch } from 'vue';

import { BlockRelation, BlockRelationNode } from '@/plugins/spark/types';
import { createBlockDialog } from '@/utils/dialog';
import { deepCopy, isJsonEqual } from '@/utils/objects';

const DEFAULT_SCALE = 0.9;
const UNKNOWN_TYPE = '???';
const LABEL_HEIGHT = 50;
const LABEL_WIDTH = 150;

interface ElkRelationNode extends BlockRelationNode, ElkNode {
  x: number;
  y: number;
}

interface ElkRelationEdge extends BlockRelation, ElkExtendedEdge {}

export default defineComponent({
  name: 'RelationsDiagram',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    nodes: {
      type: Array as PropType<BlockRelationNode[]>,
      required: true,
    },
    edges: {
      type: Array as PropType<BlockRelation[]>,
      required: true,
    },
    hideUnrelated: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const elk = new ELK();

    const resetZoom = ref<() => void>(() => {});
    const svgRef = ref<SVGElement>();
    const gRef = ref<SVGGElement>();
    const graphWidth = ref<number>(0);
    const graphHeight = ref<number>(0);

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

      // Create a node element for every node in the graph
      const nodeSelect = diagram
        .selectAll<SVGForeignObjectElement, ElkRelationNode>('.relation-node')
        .data(graph.children as ElkRelationNode[], (d) => d.id)
        .join('foreignObject')
        .attr('class', 'relation-node');

      // Edge configuration:
      // Create a straight line between start, end, and all bend points of the edge
      edgeSelect.attr('d', (d): string => {
        const path: (string | number)[] = [];
        d.sections.forEach((s) => {
          path.push('M', s.startPoint.x, s.startPoint.y);
          s.bendPoints?.forEach((bp) => path.push('L', bp.x, bp.y));
          path.push('L', s.endPoint.x, s.endPoint.y);
        });
        return path.join(' ');
      });

      // Node configuration:
      // Set overall position and size of the node element
      // We'll add its children below
      nodeSelect
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y)
        .attr('width', LABEL_WIDTH)
        .attr('height', LABEL_HEIGHT)
        .on('click', (evt, d) => openSettings(d.id));

      // create the top-level divs in the SVG foreignObject elements
      // Save the selection to a variable to easily add multiple children
      const nodeContentSelect = nodeSelect
        .append('xhtml:div')
        .attr('class', 'relation-node-content');

      nodeContentSelect
        .append('xhtml:div')
        .attr('class', 'title')
        .text((d) => d.type);

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

    const debouncedDrawGraph = debounce(drawGraph, 500, {
      leading: true,
      trailing: true,
    });

    onMounted(() => {
      watch(
        [() => props.nodes, () => props.edges],
        ([nodes, edges], [oldNodes, oldEdges]) => {
          if (
            nodes &&
            edges &&
            !isJsonEqual([nodes, edges], [oldNodes, oldEdges])
          ) {
            debouncedDrawGraph(deepCopy(nodes), deepCopy(edges));
          }
        },
        { immediate: true },
      );
    });

    return {
      svgRef,
      gRef,
      resetZoom,
    };
  },
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
.relation-node-content:hover
  opacity: 0.8

.relation-node-content
  height: 50px
  width: 150px
  background-color: #fff
  cursor: pointer
  display: flex
  flex-flow: column nowrap
  justify-content: space-around
  > div
    width: 100%
    text-align: center
    font-weight: 300
    padding: 0px 10px
    overflow: hidden
    white-space: nowrap
    text-overflow: ellipsis
  > .title
    font-size: 12px
    color: green
  > .name
    font-size: 14px
    color: black

.relation-edge
  stroke: #aaa
  fill: none
</style>
