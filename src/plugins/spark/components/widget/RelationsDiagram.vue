<script lang="ts">
import * as d3 from 'd3';
import dagre from 'dagre-d3';
import graphlib from 'graphlib';
import isFinite from 'lodash/isFinite';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';

import { createBlockDialog } from '@/helpers/dialog';
import { RelationEdge, RelationNode } from '@/plugins/spark/types';

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

@Component
export default class RelationsDiagram extends Vue {
  renderFunc = new dagre.render();
  resetZoom: Function = () => { };

  @Ref()
  readonly svg!: SVGGraphicsElement;

  @Ref()
  readonly diagram!: SVGGraphicsElement;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: Array, required: true })
  readonly nodes!: RelationNode[];

  @Prop({ type: Array, required: true })
  readonly edges!: RelationEdge[];

  @Prop({ type: String, default: 'Block Relations' })
  public readonly title!: string;

  @Prop({ type: Boolean, default: false })
  public readonly hideUnrelated!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly centered!: boolean;

  get drawnNodes(): RelationNode[] {
    return [...new Set(this.edges.flatMap(edge => [edge.target, edge.source]))]
      .map(id => this.nodes.find(node => node.id === id) ?? { id, type: '???' });
  }

  get loneNodes(): RelationNode[] {
    return this.nodes.filter(node => !this.drawnNodes.find(n => n.id === node.id));
  }

  mounted(): void {
    // Graph rendering depends on HTML elements already being rendered
    // We want to trigger first render after the svg element was mounted
    this.$watch('nodes', this.onRelationsChanged, { immediate: true });
  }

  finite(v: number): number {
    return isFinite(v) ? v : 0;
  }

  nodeTemplate(id: string, type: string): string {
    return [
      '<div class="block-label">',
      `  <div class="block-type">${type}</div>`,
      `  <div class="block-id">${id}</div>`,
      '</div>',
    ].join('\n');
  }

  onRelationsChanged(newV: RelationNode[], oldV: RelationNode[] | null): void {
    if (newV && JSON.stringify(newV) !== JSON.stringify(oldV)) {
      this.drawGraph(this.createGraph());
    }
  }

  createGraph(): graphlib.Graph {
    const graph = new graphlib
      .Graph({ multigraph: true, compound: true })
      .setGraph({ marginx: 20, marginy: 20 });

    const nodes = this.hideUnrelated
      ? this.drawnNodes
      : [...this.drawnNodes, ...this.loneNodes];

    nodes.forEach(node => {
      graph.setNode(node.id, {
        id: node.id,
        label: this.nodeTemplate(node.id, node.type),
        labelType: 'html',
        width: LABEL_WIDTH,
        height: LABEL_HEIGHT,
        padding: 0,
        rx: 5,
        ry: 5,
        style: 'fill: #fff',
      });
    });

    this.edges.forEach(edge => {
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

    if (!this.hideUnrelated) {
      const invisible = 'fill: transparent; stroke: none;';

      // Add an invisible edge between lone nodes to force vertical ordering
      // Skip an edge every few nodes to create a new column
      this.loneNodes.forEach((node, idx) => {
        if (idx % LONE_NODE_ROWS === 0) { return; }
        graph.setEdge(this.loneNodes[idx - 1].id, node.id, {
          label: '',
          labelStyle: invisible,
          style: invisible,
          arrowheadStyle: invisible,
        });
      });
    }

    return graph;
  }

  drawGraph(graph: graphlib.Graph): void {
    const svg = d3.select(this.svg);
    const diagram = d3.select(this.diagram);

    try {
      this.renderFunc(diagram, graph);
    } catch (e) {
      // Workaround for a bug in FireFox where getScreenCTM() returns null for hidden or 0x0 elements
      // https://github.com/dagrejs/dagre-d3/issues/340
      if (e.name === 'TypeError') {
        this.renderFunc(diagram, graph);
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
          label.onclick = () => this.openSettings(id);
        }
      });

    // Get actual diagram size
    const { width, height } = graph.graph() as any;

    // Enable zooming the graph
    const zoom = d3.zoom<SVGGraphicsElement, unknown>()
      .on('zoom', () => diagram.attr('transform', d3.event.transform));

    // Enable centering the graph
    // Implemented as function to yield new values after window resize
    const centered = (scaleOffset: number = 0): d3.ZoomTransform => {
      const rect = this.svg.getBoundingClientRect();
      const scale = Math.min((rect.width / width), (rect.height / height)) * (DEFAULT_SCALE + scaleOffset);
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
    this.resetZoom = () =>
      svg
        .transition()
        .duration(750)
        .call(zoom.transform, centered());
  }

  openSettings(id: string): void {
    const addr = {
      id,
      serviceId: this.serviceId,
      type: null,
    };
    createBlockDialog(addr, { mode: 'Basic' });
  }
}
</script>

<template>
  <div :class="['fit', centered && 'flex flex-center']">
    <svg ref="svg" class="fit">
      <g ref="diagram" />
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
