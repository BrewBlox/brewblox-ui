<script lang="ts">
import * as d3 from 'd3';
import dagre from 'dagre-d3';
import graphlib from 'graphlib';
import startCase from 'lodash/startCase';
import toFinite from 'lodash/toFinite';
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue';

import { RelationEdge, RelationNode } from '@/plugins/spark/types';
import { createBlockWizard } from '@/plugins/wizardry';
import { createBlockDialog } from '@/utils/dialog';
import { isJsonEqual } from '@/utils/objects';

const DEFAULT_SCALE = 0.9;
const UNKNOWN_TYPE = '???';
const LONE_NODE_ROWS = 6;
const LABEL_HEIGHT = 70;
const LABEL_WIDTH = 170;

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
    hideUnrelated: {
      type: Boolean,
      default: false,
    },
    canCreate: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const renderFunc = new dagre.render();
    const resetZoom = ref<() => void>(() => { });

    const svgRef = ref<SVGElement>();
    const diagramRef = ref<SVGGElement>();

    const drawnNodes = computed<RelationNode[]>(
      () => [...new Set(props.edges.flatMap(edge => [edge.target, edge.source]))]
        .map(id => props.nodes.find(node => node.id === id) ?? { id, type: UNKNOWN_TYPE }),
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

    function nodeTemplate(name: string, title: string): string {
      return [
        '<div class="relations-node">',
        `  <div class="relations-node-title">${title}</div>`,
        `  <div class="relations-node-name">${name}</div>`,
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
          label: nodeTemplate(node.name ?? node.id, node.type),
          labelType: 'html',
          width: LABEL_WIDTH,
          height: LABEL_HEIGHT,
          padding: 0,
          rx: 5,
          ry: 5,
          style: node.type === UNKNOWN_TYPE
            ? 'fill: gray'
            : undefined,
        });
      });

      props.edges.forEach(edge => {
        const label = edge.relation[0].replace(/Id$/, '');
        graph.setEdge(edge.source, edge.target, {
          label: startCase(label),
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
        // dagre typings for graphlib are outdated
        renderFunc(diagram, graph as any);
      } catch (e) {
        // Workaround for a bug in FireFox where getScreenCTM() returns null for hidden or 0x0 elements
        // https://github.com/dagrejs/dagre-d3/issues/340
        if (e.name === 'TypeError') {
          renderFunc(diagram, graph as any);
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
      const zoom = d3.zoom<SVGElement, unknown>()
        .on('zoom', function () {
          diagramRef.value?.setAttribute('transform', d3.event.transform);
        });

      // Enable centering the graph
      // Implemented as function to yield new values after window resize
      const centered = (scaleOffset = 0): d3.ZoomTransform => {
        const rect = svgRef.value!.getBoundingClientRect();
        const scale = (DEFAULT_SCALE + scaleOffset) * Math.min(
          (rect.width / width),
          (rect.height / height),
          1,
        );
        return d3
          .zoomIdentity
          .translate(toFinite(rect.width - width * scale) / 2, toFinite(rect.height - height * scale) / 2)
          .scale(scale);
      };

      // Provide functionality to reset zoom level
      // This captures local variables
      resetZoom.value = () => {
        if (svgRef.value) {
          d3.select(svgRef.value)
            .transition()
            .duration(750)
            .call(zoom.transform, centered());
        }
      };

      // Apply effects
      // Initialize scale slightly larger
      // We want something to happen if users immediately press the reset button
      svg
        .call(zoom)
        .call(zoom.transform, centered(0.05))
        .on('dblclick.zoom', resetZoom.value);
    }

    function startCreateBlock(): void {
      if (props.canCreate) {
        createBlockWizard(props.serviceId);
      }
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
      startCreateBlock,
    };
  },
});
</script>

<template>
  <div class="fit">
    <svg
      ref="svgRef"
      class="fit"
    >
      <g ref="diagramRef" />
    </svg>
    <q-btn
      unelevated
      class="absolute-bottom-right q-ma-lg"
      color="secondary"
      icon="mdi-stretch-to-page-outline"
      @click="resetZoom"
    >
      <q-tooltip>
        Reset zoom
      </q-tooltip>
    </q-btn>
  </div>
</template>

<style>
.node * {
  cursor: pointer;
}

.label-container {
  fill: #fff;
}

.node:hover rect {
  fill-opacity: 0.8;
}

.relations-node {
  height: 50px;
  width: 150px;
  margin: 10px;
}

.relations-node > div {
  width: 100%;
  text-align: center;
  font-weight: 300;
}

.relations-node-title {
  font-size: 12px;
  color: green;
}

.relations-node-name {
  font-size: 14px;
  color: black;
  padding: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
