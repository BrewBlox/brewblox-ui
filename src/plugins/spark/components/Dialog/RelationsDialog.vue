<script lang="ts">
import { select as d3Select } from 'd3-selection';
import { graphlib, render as dagreRender } from 'dagre-d3';
import { Dialog, uid } from 'quasar';
import { saveSvgAsPng } from 'save-svg-as-png';
import { setTimeout } from 'timers';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import sparkStore from '@/plugins/spark/store';
import { BlockLink } from '@/plugins/spark/types';
import featureStore from '@/store/features';

interface Edge {
  source: string;
  target: string;
  relation: string[];
}

interface Node {
  id: string;
  type: string;
}

const LABEL_HEIGHT = 50;
const LABEL_WIDTH = 150;
const INVERTED = [
  'input',
  'reference',
  'sensor',
];

@Component
export default class RelationsDialog extends DialogBase {
  $refs!: {
    dialog: any;
    svg: SVGGraphicsElement;
    diagram: SVGGraphicsElement;
    toolbar: Vue;
  }

  exportBusy: boolean = false;
  lastRelationString: string = '';
  graphObj: any = null;
  availableHeight: number = 0;
  availableWidth: number = 0;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: Array, default: [] })
  readonly nodes!: Node[];

  @Prop({ type: Array, default: [] })
  readonly relations!: BlockLink[];

  @Prop({ type: String, default: 'Block Relations' })
  public readonly title!: string;

  get edges() {
    return this.relations
      .map(rel => ({ source: rel.source, target: rel.target, relation: rel.relation }));
  }

  get drawnNodes() {
    const findNode = (id: string): Node =>
      this.nodes.find(node => node.id === id) || { id, type: '???' };

    return this.edges
      // Create a list of each ID referenced by an edge
      .reduce((acc: string[], edge: Edge) => [...acc, edge.target, edge.source], [])
      // Find a node for each unique ID
      .reduce((acc: Node[], id: string) =>
        acc.find(node => node.id === id)
          ? acc
          : [...acc, findNode(id)],
        [],
      );
  }

  @Watch('relations', { immediate: true })
  display() {
    setTimeout(() => this.calc() && setTimeout(() => this.draw(), 100), 100);
  }

  calc(): boolean {
    const newRelationString = JSON.stringify(this.relations);
    if (newRelationString === this.lastRelationString) {
      return false;
    }

    const nodeTemplate = (id: string, type: string) => {
      return `
        <div style="width: ${LABEL_WIDTH}px; height: ${LABEL_HEIGHT}px" ">
          <div class="type">${type}</div>
          <div class="id">${id}</div>
        </div>
        `;
    };

    const obj = new graphlib
      .Graph({ multigraph: true })
      .setGraph({ marginx: 20, marginy: 20 });

    this.drawnNodes.forEach(val => {
      obj.setNode(val.id, {
        id: val.id,
        label: nodeTemplate(val.id, val.type),
        labelType: 'html',
        width: LABEL_WIDTH,
        height: LABEL_HEIGHT,
        rx: 5,
        ry: 5,
        class: 'test-label',
      });
    });

    this.edges.forEach(val => {
      const label = val.relation[0].replace(/Id$/, '');
      const [source, target] = INVERTED.includes(label)
        ? [val.target, val.source]
        : [val.source, val.target];

      obj.setEdge(source, target, {
        label,
        labelStyle: 'fill: white; stroke: none;',
        style: 'fill: none; stroke: red; stroke-width: 1.5px;',
        arrowheadStyle: 'fill: red; stroke: red;',
      },
        val.relation[0]);
    });

    this.graphObj = obj;
    this.lastRelationString = newRelationString;
    return true;
  }

  draw() {
    const renderFunc = new dagreRender();
    renderFunc(d3Select(this.$refs.diagram), this.graphObj);
    const outGraph = this.graphObj.graph();
    const toolbarHeight = this.$refs.toolbar.$el.clientHeight || 50;
    this.availableHeight = window.innerHeight - toolbarHeight;
    this.availableWidth = window.innerWidth;
    this.$refs.svg.setAttribute('height', outGraph.height);
    this.$refs.svg.setAttribute('width', outGraph.width);
    this.$refs.svg.setAttribute('viewBox', `0 0 ${outGraph.width} ${outGraph.height}`);

    this.$nextTick(() => {
      // Here be dragons
      // Dagre incorrectly renders the injected HTML as a "foreignObject" with 0x0 size
      // The hacky, but working solution is to override the SVG properties
      this.$refs.svg.querySelectorAll('foreignObject')
        .forEach(el => {
          const id = el.children[0].children[0].children[1].innerHTML;
          el.addEventListener('click', () => this.openSettings(id));
          el.setAttribute('width', `${LABEL_WIDTH}`);
          el.setAttribute('height', `${LABEL_HEIGHT}`);
          (el.parentElement as HTMLElement)
            .setAttribute('transform', `translate(-${LABEL_WIDTH / 2}, -${LABEL_HEIGHT / 2})`);
        });
    });
  }

  exportDiagram() {
    this.exportBusy = true;
    // uses quasar "dark" as background color
    saveSvgAsPng(this.$refs.svg, 'block-relations.png', { backgroundColor: '#282c34' })
      .finally(() => this.exportBusy = false);
  }

  openSettings(id: string) {
    const block = sparkStore.blocks(this.serviceId)[id];
    if (!block) {
      return;
    }

    const widget = {
      id: uid(),
      title: block.id,
      feature: block.type,
      dashboard: '',
      order: 0,
      config: {
        serviceId: this.serviceId,
        blockId: block.id,
      },
      ...featureStore.widgetSizeById(block.type),
    };

    Dialog.create({
      block,
      widget,
      component: 'BlockFormDialog',
      volatile: true,
      saveBlock: v => sparkStore.saveBlock([this.serviceId, v]),
      saveWidget: () => { },
      root: this.$root,
    });
  }
}
</script>

<template>
  <q-dialog ref="dialog" maximized no-backdrop-dismiss @hide="onDialogHide">
    <q-card dark class="maximized bg-dark-bright">
      <FormToolbar ref="toolbar" @close="onDialogHide">
        {{ title }}
        <template v-slot:buttons>
          <!-- Exporting is bugged right now. See https://github.com/BrewBlox/brewblox-ui/issues/638 -->
          <q-btn
            v-if="false"
            :loading="exportBusy"
            flat
            rounded
            label="export"
            @click="exportDiagram"
          />
        </template>
      </FormToolbar>

      <div
        :style="`
        overflow: scroll;
        height: ${availableHeight}px;
        width: ${availableWidth}px;
        `"
        class="row"
      >
        <svg ref="svg" class="diag-svg col-12">
          <g ref="diagram" class="diag-g"/>
        </svg>
      </div>
    </q-card>
  </q-dialog>
</template>

<style lang="stylus" scoped>
/deep/ .node .id {
  font-weight: 300;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: black;
  padding: 10px;
  width: 100%;
  text-align: center;
  cursor: pointer;
}

/deep/ .node .type {
  font-weight: 300;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
</style>
