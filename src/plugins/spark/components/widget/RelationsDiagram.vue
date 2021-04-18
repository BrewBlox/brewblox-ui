<script lang="ts">
import * as d3 from 'd3';
import dagre from 'dagre-d3';
import graphlib from 'graphlib';
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue';

import { RelationEdge, RelationNode } from '@/plugins/spark/types';
import { createBlockDialog } from '@/utils/dialog';
import { isJsonEqual } from '@/utils/functional';

const DEFAULT_SCALE = 0.9;
const LONE_NODE_ROWS = 6;
const LABEL_HEIGHT = 70;
const LABEL_WIDTH = 170;
const INVERTED = [
  'input', // PID
  'reference', // Setpoint Driver
  'sensor', // Setpoint
  'analog', // Logic Actuator
  'digital', // Logic Actuator
];

export default defineComponent({
  name: 'RelationsDiagram',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    nodes: {
      type: Array as PropType<RelationNode[]>,
      required: true,
    },
    edges: {
      type: Array as PropType<RelationEdge[]>,
      required: true,
    },
    title: {
      type: String,
      default: 'Block Relations',
    },
    hideUnrelated: {
      type: Boolean,
      default: false,
    },
    centered: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const renderFunc = new dagre.render();
    const resetZoom = ref<() => void>(() => { });

    const svgRef = ref<SVGGraphicsElement>();
    const diagramRef = ref<SVGGraphicsElement>();

    const drawnNodes = computed<RelationNode[]>(
      () => [...new Set(props.edges.flatMap(edge => [edge.target, edge.source]))]
        .map(id => props.nodes.find(node => node.id === id) ?? { id, type: '???' }),
    );

    const loneNodes = computed<RelationNode[]>(
      () => props.nodes.filter(node => !drawnNodes.value.find(n => n.id === node.id)),
    );

    function openSettings(id: string): void {
      const addr = {
        id,
        serviceId: props.serviceId,
        type: null,
      };
      createBlockDialog(addr, { mode: 'Basic' });
    }

    function nodeTemplate(id: string, type: string): string {
      return [
        '<div class="block-label">',
        `  <div class="block-type">${type}</div>`,
        `  <div class="block-id">${id}</div>`,
        '</div>',
      ].join('\n');
    }

    function createGraph(): graphlib.Graph {
      const graph = new graphlib
        .Graph({ multigraph: true, compound: true })
        .setGraph({ marginx: 20, marginy: 20 });

      const nodes = props.hideUnrelated
        ? drawnNodes.value
        : [...drawnNodes.value, ...loneNodes.value];

      nodes.forEach(node => {
        graph.setNode(node.id, {
          id: node.id,
          label: nodeTemplate(node.id, node.type),
          labelType: 'html',
          width: LABEL_WIDTH,
          height: LABEL_HEIGHT,
          padding: 0,
          rx: 5,
          ry: 5,
          style: 'fill: #fff',
        });
      });

      props.edges.forEach(edge => {
        const label = edge.relation[0].replace(/Id$/, '');
        const [source, target] = INVERTED.includes(label)
          ? [edge.target, edge.source]
          : [edge.source, edge.target];

        graph.setEdge(source, target, {
          label,
          labelStyle: 'fill: white; stroke: none;',
          style: 'fill: none; stroke: red; stroke-width: 1.5px;',
          arrowheadStyle: 'fill: red; stroke: red;',
        },
          edge.relation[0]);
      });

      if (!props.hideUnrelated) {
        const invisible = 'fill: transparent; stroke: none;';

        // Add an invisible edge between lone nodes to force vertical ordering
        // Skip an edge every few nodes to create a new column
        loneNodes.value.forEach((node, idx) => {
          if (idx % LONE_NODE_ROWS === 0) { return; }
          graph.setEdge(loneNodes.value[idx - 1].id, node.id, {
            label: '',
            labelStyle: invisible,
            style: invisible,
            arrowheadStyle: invisible,
          });
        });
      }

      return graph;
    }

    function drawGraph(graph: graphlib.Graph): void {
      const svg = d3.select(svgRef.value!);
      const diagram = d3.select(diagramRef.value!);

      try {
        renderFunc(diagram, graph);
      } catch (e) {
        // Workaround for a bug in FireFox where getScreenCTM() returns null for hidden or 0x0 elements
        // https://github.com/dagrejs/dagre-d3/issues/340
        if (e.name === 'TypeError') {
          renderFunc(diagram, graph);
        } else {
          throw e;
        }
      }

      // Set custom formatting and onClick handlers for all nodes
      graph
        .nodes()
        .map(id => graph.node(id))
        .forEach((node: { id: string; elem: SVGGElement }) => {
          const { id, elem } = node;
          const label = elem.querySelector('foreignObject');
          if (label) {
            label.setAttribute('width', `${LABEL_WIDTH}`);
            label.setAttribute('height', `${LABEL_HEIGHT}`);
            label.parentElement!.setAttribute('transform', `translate(-${LABEL_WIDTH / 2}, -${LABEL_HEIGHT / 2})`);
            label.onclick = () => openSettings(id);
          }
        });

      // Get actual diagram size
      const { width, height } = graph.graph() as any;

      // Enable zooming the graph
      const zoom = d3.zoom<SVGGraphicsElement, unknown>()
        .on('zoom', () => diagram.attr('transform', d3.event.transform));

      // Enable centering the graph
      // Implemented as function to yield new values after window resize
      const centered = (scaleOffset = 0): d3.ZoomTransform => {
        const rect = svgRef.value!.getBoundingClientRect();
        const scale = Math.min((rect.width / width), (rect.height / height), 1) * (DEFAULT_SCALE + scaleOffset);
        return d3
          .zoomIdentity
          .translate((rect.width - width * scale) / 2, (rect.height - height * scale) / 2)
          .scale(scale);
      };

      // Apply effects
      // Initialize scale slightly larger
      // We want something to happen if users immediately press the reset button
      svg
        .call(zoom)
        .call(zoom.transform, centered(0.05));

      // Provide functionality to reset zoom level
      // This captures local variables
      resetZoom.value = () =>
        svg
          .transition()
          .duration(750)
          .call(zoom.transform, centered());
    }

    onMounted(() => {
      watch(
        () => props.nodes,
        (newV, oldV) => {
          if (newV && !isJsonEqual(newV, oldV)) {
            drawGraph(createGraph());
          }
        },
        { immediate: true },
      );
    });

    return {
      svgRef,
      diagramRef,
      resetZoom,
    };
  },
});
</script>

<template>
  <div :class="['fit', centered && 'flex flex-center']">
    <svg ref="svgRef" class="fit">
      <g ref="diagramRef" />
    </svg>
    <q-btn
      unelevated
      class="absolute-bottom-right q-ma-lg"
      color="secondary"
      icon="mdi-arrow-expand-all"
      @click="resetZoom"
    >
      <q-tooltip>
        Fit to screen
      </q-tooltip>
    </q-btn>
  </div>
</template>

<style>
.node * {
  cursor: pointer;
}

.node rect {
  fill: #fff;
}

.node:hover rect {
  fill-opacity: 0.8;
}

.block-label {
  height: 50px;
  width: 150px;
  margin: 10px;
}

.block-label > div {
  width: 100%;
  text-align: center;
  font-weight: 300;
}

.block-label > .block-type {
  font-size: 12px;
  color: green;
}

.block-label > .block-id {
  font-size: 14px;
  color: black;
  padding: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
