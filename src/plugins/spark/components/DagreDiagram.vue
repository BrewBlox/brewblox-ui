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
  renderFunc = new dagreRender();

  get edges() {
    return this.$props.relations
      .map(rel => ({ source: rel.source, target: rel.target, relation: rel.relation }));
  }

  get drawnNodes() {
    return this.$props.nodes
      .filter(n => this.edges.find(e => e.source === n.id || e.target === n.id));
  }

  mounted() {
    setTimeout(() => this.draw(), 50);
  }

  @Watch('relations')
  draw() {
    const nodeTemplate = (id: string, type: string) => {
      return `
        <div>
          <div class="type">${type}</div>
          <div class="id">${id}</div>
        </div>
        `;
    };

    const graphObj = new graphlib
      .Graph({ multigraph: true })
      .setGraph({ marginx: 20, marginy: 20 });

    this.drawnNodes.forEach(val => {
      graphObj.setNode(val.id, {
        id: val.id,
        labelType: 'html',
        label: nodeTemplate(val.id, val.type),
        rx: 5,
        ry: 5,
      });
    });

    this.edges.forEach(val => {
      graphObj.setEdge(val.source, val.target, {
        labelType: 'html',
        label: `<div class="relation">${val.relation[0].replace(/Id$/, '')}</div>`,
      },
        val.relation[0]);
    });

    this.renderFunc(d3Select(this.$refs.diagram), graphObj);

    const outGraph = graphObj.graph();
    this.$refs.svg.setAttribute('width', outGraph.width);
    this.$refs.svg.setAttribute('height', outGraph.height);
  }
}
</script>

<template>
  <div class="container">
    <svg ref="svg" class="diag-svg">
      <g ref="diagram" class="diag-g"/>
    </svg>
  </div>
</template>

<style lang="stylus" scoped>
.diag-svg {
  stroke: red;
  fill: red;
}

/deep/ .node .id {
  font-weight: 300;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serf;
  font-size: 14px;
  color: black;
  padding: 10px;
  width: 100%;
  text-align: center;
}

/deep/ .node .type {
  font-weight: 300;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serf;
  font-size: 12px;
  color: green;
  width: 100%;
  text-align: center;
}

/deep/ .node rect {
  stroke: none;
  fill: #fff;
  stroke-width: 1.5px;
}

/deep/ .edgePath path.path {
  fill: none;
  stroke-width: 1.5px;
}

.container {
  padding: 20px;
}
</style>
