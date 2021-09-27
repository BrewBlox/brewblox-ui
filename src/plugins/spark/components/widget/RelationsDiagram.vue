<script lang="ts">
import * as d3 from 'd3';
import debounce from 'lodash/debounce';
import startCase from 'lodash/startCase';
import toFinite from 'lodash/toFinite';
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  ref,
  watch,
} from 'vue';

import { BlockRelation, BlockRelationNode } from '@/plugins/spark/types';
import { createBlockWizard } from '@/plugins/wizardry';
import { createBlockDialog } from '@/utils/dialog';
import { uniqueFilter } from '@/utils/functional';
import { deepCopy, isJsonEqual } from '@/utils/objects';

const DEFAULT_SCALE = 0.9;
const UNKNOWN_TYPE = '???';
const LABEL_HEIGHT = 50;
const LABEL_WIDTH = 150;

type NodeT = BlockRelationNode & d3.SimulationNodeDatum;
type LinkT = BlockRelation & d3.SimulationLinkDatum<NodeT>;

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
    canCreate: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    // const renderFunc = new dagre.render();
    const resetZoom = ref<() => void>(() => {});

    const svgRef = ref<SVGElement>();
    const gRef = ref<SVGGElement>();
    const currentScale = ref<number>(1);

    function calcDrawnNodes(
      edges: BlockRelation[],
      nodes: BlockRelationNode[],
    ): BlockRelationNode[] {
      const relationalIds = edges
        .flatMap((edge) => [edge.target, edge.source])
        .filter(uniqueFilter);
      const relationalNodes = relationalIds.map(
        (id) =>
          nodes.find((node) => node.id === id) ?? {
            id,
            type: UNKNOWN_TYPE,
          },
      );
      const loneNodes = nodes
        .filter((n) => !relationalIds.includes(n.id))
        .map((n) => ({ ...n, lone: true }));
      return [...relationalNodes, ...loneNodes];
    }

    function openSettings(id: string): void {
      const addr = {
        id,
        serviceId: props.serviceId,
        type: null,
      };
      createBlockDialog(addr, { mode: 'Basic' });
    }

    function addIndex<T>(v: T, index: number): T & { index: number } {
      return {
        ...v,
        index,
      };
    }

    function drawGraph(): void {
      if (!svgRef.value || !gRef.value) {
        return;
      }

      const svgRect = svgRef.value.getBoundingClientRect();

      const svg = d3.select(svgRef.value);
      const diagram = d3.select(gRef.value);

      const nodesCopy = deepCopy(props.nodes);
      const edgesCopy = deepCopy(props.edges);

      const nodes: NodeT[] = calcDrawnNodes(edgesCopy, nodesCopy).map(addIndex);
      const edges: LinkT[] = edgesCopy.map(addIndex);

      const linkSelect = diagram
        .selectAll('line')
        .data(edges)
        .join('line')
        .style('stroke', '#aaa');

      const nodeSelect = diagram
        .selectAll('foreignObject')
        .data(nodes)
        .join('foreignObject')
        .attr('width', LABEL_WIDTH)
        .attr('height', LABEL_HEIGHT)
        .attr(
          'transform',
          `translate(-${LABEL_WIDTH / 2}, -${LABEL_HEIGHT / 2})`,
        )
        .attr('class', 'node')
        .on('click', (evt, d) => openSettings(d.id));

      const nodeContentSelect = nodeSelect
        .append('xhtml:div')
        .attr('class', 'node-content');

      nodeContentSelect
        .append('xhtml:div')
        .attr('class', 'node-content-title')
        .text((d) => d.type);

      nodeContentSelect
        .append('xhtml:div')
        .attr('class', 'node-content-name')
        .text((d) => d.name || d.id);

      // Enable zooming the graph
      const zoom = d3
        .zoom<SVGElement, unknown>()
        .on('zoom', (e: d3.D3ZoomEvent<SVGElement, unknown>) => {
          diagram.attr('transform', e.transform.toString());
        });

      // Enable centering the graph
      // Implemented as function to yield new values after window resize
      const centered = (scaleOffset = 0): d3.ZoomTransform => {
        if (!svgRef.value) {
          return d3.zoomIdentity;
        }
        const xCoords = nodes.map((n) => n.x || 0);
        const yCoords = nodes.map((n) => n.y || 0);

        const minX = Math.min(...xCoords, 0);
        const minY = Math.min(...yCoords, 0);
        const maxX = Math.max(...xCoords, 0);
        const maxY = Math.max(...yCoords, 0);

        const svgRect = svgRef.value!.getBoundingClientRect();
        const diagramWidth = maxX - minX + 100;
        const diagramHeight = maxY - minY + 100;
        const scale =
          (DEFAULT_SCALE + scaleOffset) *
          Math.min(
            svgRect.width / diagramWidth,
            svgRect.height / diagramHeight,
            1,
          );
        currentScale.value = scale;
        return d3.zoomIdentity
          .translate(
            toFinite(svgRect.width - diagramWidth * scale) / 2 - minX * scale,
            toFinite(svgRect.height - diagramHeight * scale) / 2 - minY * scale,
          )
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

      // Apply zoom handler
      svg
        .call(zoom)
        .call(zoom.transform, centered(0.05))
        .on('dblclick.zoom', resetZoom.value);

      // Apply forces
      d3.forceSimulation(nodes)
        .force(
          'link',
          d3
            .forceLink<NodeT, LinkT>()
            .id((d) => d.id)
            .links(edges),
        )
        .force('charge', d3.forceManyBody().strength(100))
        // .force('center', d3.forceCenter())
        .force('collide', d3.forceCollide(90))
        // .force('link', d3.forceLink(edges).iterations(5))
        // .force('x', d3.forceX(rect.width))
        // .force('y', d3.forceY(rect.height))
        .force(
          'y',
          d3.forceY<NodeT>().y((d) => {
            if (d.lone) {
              return 0;
            }
            if (d.placement === 'top') {
              return -1000;
            }
            if (d.placement === 'bottom') {
              return 1000;
            }
            return 0;
          }),
        )
        .force(
          'x',
          d3.forceX<NodeT>().x((d) => (d.lone ? 1000 : 0)),
        )
        .on('tick', () => {
          // d3 replaced d.source / d.target strings with Node objects where x/y is set
          linkSelect
            .attr('x1', (d) => (d.source as any).x)
            .attr('y1', (d) => (d.source as any).y + LABEL_HEIGHT / 2)
            .attr('x2', (d) => (d.target as any).x)
            .attr('y2', (d) => (d.target as any).y - LABEL_HEIGHT / 2);

          nodeSelect.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
        })
        .on('end', () => {
          svg.transition().duration(750).call(zoom.transform, centered(0.05));
          // Auto-zoom when the force simulation is done
        });
    }

    function startCreateBlock(): void {
      if (props.canCreate) {
        createBlockWizard(props.serviceId);
      }
    }

    const debouncedDrawGraph = debounce(() => drawGraph(), 500, {
      leading: true,
    });

    onMounted(() => {
      watch(
        [() => props.nodes, () => props.edges],
        (newV, oldV) => {
          if (newV && !isJsonEqual(newV, oldV)) {
            debouncedDrawGraph();
            // drawGraph(createGraph());
          }
        },
        { immediate: true },
      );
    });

    return {
      svgRef,
      gRef,
      drawGraph,
      resetZoom,
      startCreateBlock,
    };
  },
});
</script>

<template>
  <div class="fit">
    <svg ref="svgRef" class="fit" xmlns:xhtml="http://www.w3.org/1999/xhtml">
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

<style>
.node {
  fill: #fff;
}

.node * {
  cursor: pointer;
}

.node:hover {
  fill-opacity: 0.8;
}

.node-content {
  height: 50px;
  width: 150px;
  /* margin: 10px; */
  background-color: #fff;
}

.node-content > div {
  width: 100%;
  text-align: center;
  font-weight: 300;
}

.node-content-title {
  font-size: 12px;
  color: green;
}

.node-content-name {
  font-size: 14px;
  color: black;
  padding: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
