<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import dagreD3 from 'dagre-d3/dist/dagre-d3';
import { select } from 'd3';


interface Edge {
  source: string,
  target: string,
  relation: string[],
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
    svg: SVGGraphicsElement,
    diagram: SVGGraphicsElement,
  }

  graph = new dagreD3.graphlib.Graph({ compound: true }).setGraph({}).setDefaultEdgeLabel(function () { return {}; });

  get edges() {
    return this.$props.relations.map( rel => ({ source: rel.source, target: rel.target, relation: rel.relation })); 
  } 
  get drawnNodes() {
    return this.$props.nodes.filter(n => this.edges.find(e => e.source === n.id || e.target === n.id));
  } 
  
  draw() {
    const nodeTemplate = (id: string, type: string) => {
      return `
        <div>
          <div class="type">${type}</div>
          <div class="id">${id}</div>
        </div>
        `;
    };

    this.drawnNodes.forEach(val => {
      this.graph.setNode(val.id, {
        id: val.id,
        labelType: "html",
        label: nodeTemplate(val.id, val.type),
        rx: 5,
        ry: 5,
      });
    });

    this.edges.forEach(val => {
      this.graph.setEdge(val.source, val.target, {
        labelType: "html",
        label: `<div class="relation">${val.relation[0]}</div>`,
      });
    });
    const renderer = new dagreD3.render();
    const diag = select(this.$refs.diagram);
    renderer(diag, this.graph);
    this.fit();
  }

  fit() {
    // resize svg to fit and center content
    const bbox = this.$refs.svg.getBBox();
    this.$refs.svg.setAttribute("width", bbox.width - bbox.x + "px");
    this.$refs.svg.setAttribute("height", bbox.height - bbox.y + "px");
    this.$refs.diagram.setAttribute("transform", `translate(${-bbox.x},${-bbox.y})`);
  }

  mounted(){
    this.$nextTick(() => {this.draw();});
  }
}
</script>

<template>
  <div class="container">
    <svg ref="svg" class="diag-svg">
      <g ref="diagram" :key="redraws"/>
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
