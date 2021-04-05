<script lang="ts">
import { select as d3Select } from 'd3-selection';
import { render as dagreRender } from 'dagre-d3';
import graphlib from 'graphlib';
import isFinite from 'lodash/isFinite';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';

import { createBlockDialog } from '@/helpers/dialog';
import { RelationEdge, RelationNode } from '@/plugins/spark/types';

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
  renderFunc = new dagreRender();
  autoscale: boolean = false;
  graphSize: { width: number; height: number } = {
    width: 0,
    height: 0,
  };

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

  get svgProps(): Mapped<any> {
    const { width, height } = this.graphSize;
    return {
      viewBox: [0, 0, width, height].join(' '),
      width: this.autoscale ? '100%' : `${width}px`,
      height: this.autoscale ? '100%' : `${height}px`,
    };
  }

  mounted(): void {
    // Graph rendering depends on HTML elements already being rendered
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
    try {
      this.renderFunc(d3Select(this.diagram), graph);
    } catch (e) {
      // Workaround for a bug in FireFox where getScreenCTM() returns null for hidden or 0x0 elements
      // https://github.com/dagrejs/dagre-d3/issues/340
      if (e.name === 'TypeError') {
        this.renderFunc(d3Select(this.diagram), graph);
      } else {
        throw e;
      }
    }

    graph
      .nodes()
      .map(id => graph.node(id))
      .forEach((node: { id: string; elem: SVGGElement }) => {
        const { id, elem } = node;
        const label: SVGForeignObjectElement | null = elem.querySelector('foreignObject');
        if (label) {
          label.setAttribute('width', `${LABEL_WIDTH}`);
          label.setAttribute('height', `${LABEL_HEIGHT}`);
          label.parentElement!.setAttribute('transform', `translate(-${LABEL_WIDTH / 2}, -${LABEL_HEIGHT / 2})`);
          label.onclick = () => this.openSettings(id);
        }
      });

    const { width, height } = graph.graph() as any;
    this.graphSize = {
      width: this.finite(width),
      height: this.finite(height),
    };
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
    <svg ref="svg" v-bind="svgProps">
      <g ref="diagram" />
    </svg>
    <q-btn
      fab-mini
      class="absolute-bottom-right q-ma-lg"
      color="secondary"
      :icon="autoscale ? 'mdi-arrow-expand-all' : 'mdi-arrow-collapse-all'"
      @click="autoscale = !autoscale"
    />
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
