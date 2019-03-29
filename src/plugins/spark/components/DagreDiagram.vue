<script lang="ts">
import { graphlib, render as dagreRender } from 'dagre-d3';
import { select as d3Select } from 'd3-selection';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { setTimeout } from 'timers';

interface Edge {
  source: string;
  target: string;
  relation: string[];
}

const LABEL_HEIGHT = 50;
const LABEL_WIDTH = 150;

@Component({
  props: {
    nodes: {
      type: Array,
      required: true,
      default: [],
    },
    relations: {
      type: Array,
      required: true,
      default: [],
    },
  },
})
export default class DagreDiagram extends Vue {
  $refs!: {
    svg: SVGGraphicsElement;
    diagram: SVGGraphicsElement;
  }
  lastRelationString: string = '';
  graphObj: any = null;

  get edges() {
    return this.$props.relations
      .map(rel => ({ source: rel.source, target: rel.target, relation: rel.relation }));
  }

  get drawnNodes() {
    return this.$props.nodes
      .filter(n => this.edges.find(e => e.source === n.id || e.target === n.id));
  }

  @Watch('relations', { immediate: true })
  display() {
    setTimeout(() => this.calc() && setTimeout(() => this.draw(), 100), 100);
  }

  calc(): boolean {
    const newRelationString = JSON.stringify(this.$props.relations);
    if (newRelationString === this.lastRelationString) {
      return false;
    }

    const nodeTemplate = (id: string, type: string) => {
      return `
        <div style="width: ${LABEL_WIDTH}px; height: ${LABEL_HEIGHT}px">
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
      obj.setEdge(val.source, val.target, {
        label: val.relation[0].replace(/Id$/, ''),
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
    this.$refs.svg.setAttribute('height', outGraph.height);
    this.$refs.svg.setAttribute('width', outGraph.width);
    this.$refs.svg.setAttribute('viewBox', `0 0 ${outGraph.width} ${outGraph.height}`);

    this.$nextTick(() => {
      // Here be dragons
      // Dagre incorrectly renders the injected HTML as a "foreignObject" with 0x0 size
      // The hacky, but working solution is to override the SVG properties
      this.$el.querySelectorAll('foreignObject')
        .forEach(el => {
          el.setAttribute('width', `${LABEL_WIDTH}`);
          el.setAttribute('height', `${LABEL_HEIGHT}`);
          (el.parentElement as HTMLElement)
            .setAttribute('transform', `translate(-${LABEL_WIDTH / 2}, -${LABEL_HEIGHT / 2})`);
        });
    });
  }
}
</script>

<template>
  <q-card dark class="maximized bg-dark-bright">
    <FormToolbar>Block Relations</FormToolbar>

    <q-card-section class="absolute-center">
      <svg ref="svg" class="diag-svg">
        <g ref="diagram" class="diag-g"/>
      </svg>
    </q-card-section>
  </q-card>
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
}

/deep/ .node .type {
  font-weight: 300;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 12px;
  color: green;
  width: 100%;
  text-align: center;
}

/deep/ .node rect {
  fill: #fff;
}
</style>
