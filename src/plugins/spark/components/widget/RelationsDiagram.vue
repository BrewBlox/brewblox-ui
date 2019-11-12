<script lang="ts">
import { select as d3Select } from 'd3-selection';
import { graphlib, render as dagreRender } from 'dagre-d3';
import { setTimeout } from 'timers';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { showBlockDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';
import { RelationEdge, RelationNode } from '@/plugins/spark/types';


const LABEL_HEIGHT = 50;
const LABEL_WIDTH = 150;
const INVERTED = [
  'input',
  'reference',
  'sensor',
];

@Component
export default class RelationsDiagram extends Vue {
  graphObj: any = null;

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

  @Prop({ type: Object, required: true })
  public readonly contentStyle!: Mapped<string>;

  get drawnNodes(): RelationNode[] {
    return [...new Set(this.edges.flatMap(edge => [edge.target, edge.source]))]
      .map(id => this.nodes.find(node => node.id === id) || { id, type: '???' });
  }

  get loneNodes(): RelationNode[] {
    return this.nodes.filter(node => !this.drawnNodes.find(n => n.id === node.id));
  }

  @Watch('edges', { immediate: true })
  display(newV: RelationEdge[], oldV: RelationEdge[] | null): void {
    if (newV && JSON.stringify(newV) !== JSON.stringify(oldV)) {
      setTimeout(() => this.calc() && setTimeout(() => this.draw(), 100), 100);
    }
  }

  calc(): boolean {
    const nodeTemplate = (id: string, type: string): string => {
      return `
        <div class="block-label">
          <div class="type">${type}</div>
          <div class="id">${id}</div>
        </div>
        `.replace(/\n\s+/gm, '');
    };

    const obj = new graphlib
      .Graph({ multigraph: true, compound: true })
      .setGraph({ marginx: 20, marginy: 20 });

    const nodes = this.hideUnrelated
      ? this.drawnNodes
      : [...this.drawnNodes, ...this.loneNodes];

    nodes.forEach(node => {
      obj.setNode(node.id, {
        id: node.id,
        label: nodeTemplate(node.id, node.type),
        labelType: 'html',
        width: LABEL_WIDTH,
        height: LABEL_HEIGHT,
        rx: 5,
        ry: 5,
        style: 'fill: #fff; cursor: pointer;',
      });
    });

    this.edges.forEach(edge => {
      const label = edge.relation[0].replace(/Id$/, '');
      const [source, target] = INVERTED.includes(label)
        ? [edge.target, edge.source]
        : [edge.source, edge.target];

      obj.setEdge(source, target, {
        label,
        labelStyle: 'fill: white; stroke: none;',
        style: 'fill: none; stroke: red; stroke-width: 1.5px;',
        arrowheadStyle: 'fill: red; stroke: red;',
      },
        edge.relation[0]);
    });

    if (!this.hideUnrelated) {
      const invisible = 'fill: transparent; stroke: none;';
      const stackHeight = 6;

      this.loneNodes.forEach((node, idx) => {
        if (idx % stackHeight === 0) { return; }
        obj.setEdge(this.loneNodes[idx - 1].id, node.id, {
          label: '',
          labelStyle: invisible,
          style: invisible,
          arrowheadStyle: invisible,
        });
      });
    }

    this.graphObj = obj;
    return true;
  }

  draw(): void {
    const renderFunc = new dagreRender();
    try {
      renderFunc(d3Select(this.diagram), this.graphObj);
    } catch (e) {
      // Workaround for a bug in FireFox where getScreenCTM() returns null for hidden or 0x0 elements
      if (e.name === 'TypeError') {
        renderFunc(d3Select(this.diagram), this.graphObj);
      } else {
        throw e;
      }
    }

    const outGraph = this.graphObj.graph();
    this.svg.setAttribute('style', [
      `min-width: ${outGraph.width}px;`,
      `min-height: ${outGraph.height}px;`,
    ].join(' '));
    this.svg.setAttribute('height', outGraph.height);
    this.svg.setAttribute('width', outGraph.width);

    this.$nextTick(() => {
      this.svg.querySelectorAll('foreignObject')
        .forEach(el => {
          const id = el.children[0].children[0].children[1].innerHTML;
          // Add click listeners
          el.addEventListener('click', () => this.openSettings(id));
          // Dagre has issues setting the correct height/width on the generated ForeignObject elements
          // This seems fixed on Linux, but still present on Windows
          // Enforce values here to guarantee correctness
          el.setAttribute('width', `${LABEL_WIDTH}`);
          el.setAttribute('height', `${LABEL_HEIGHT}`);
          (el.parentElement as HTMLElement)
            .setAttribute('transform', `translate(-${LABEL_WIDTH / 2}, -${LABEL_HEIGHT / 2})`);
        });
    });
  }

  openSettings(id: string): void {
    showBlockDialog(sparkStore.blocks(this.serviceId)[id], { mode: 'Basic' });
  }
}
</script>

<template>
  <div class="row overflow-auto" :style="contentStyle">
    <q-space />
    <svg ref="svg" class="col-auto">
      <g ref="diagram" />
    </svg>
    <q-space />
  </div>
</template>

<style lang="stylus" scoped>
/deep/ .node .block-label {
  height: 50px;
  width: 150px;
}

/deep/ .node .id {
  font-weight: 300;
  font-size: 14px;
  color: black;
  padding: 10px;
  width: 100%;
  text-align: center;
  cursor: pointer;
}

/deep/ .node .type {
  font-weight: 300;
  font-size: 12px;
  color: green;
  width: 100%;
  text-align: center;
  cursor: pointer;
}

/deep/ .node rect {
  fill: #fff;
  cursor: pointer;
}

/deep/ .node:hover rect {
  fill-opacity: 0.8;
}
</style>