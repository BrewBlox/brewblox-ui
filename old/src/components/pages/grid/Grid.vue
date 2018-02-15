<template>
<div class='container' ref="container" v-resize:debounce="onResize">
  <div class='grid'>
    <div class='tile'
      v-for="(item, index) in coordinates"
      :key="index"
      :style="{
        position: 'absolute',
        left: `${positions[index].x}px`,
        top:  `${positions[index].y}px`,
        width: `${tileSize}px`,
        height: `${tileSize}px`,
      }">
      <span class='coordinate'>
        {{item.x}},{{item.y}}
      </span>
    </div>
  </div>
  <TubeStraight class='tube'/>
</div>
</template>

<script>
// import VueTypes from 'vue-types';
import { mapGetters } from 'vuex';
import resize from 'vue-resize-directive';
import TubeStraight from './TubeStraight.vue';

export default {
  name: 'Grid',
  components: {
    TubeStraight,
  },
  props: {
  },
  data: () => ({
    showGrid: true,
    showCoordinates: true,
    cols: 15,
    rows: 10,
    tileSize: 50,
  }),
  directives: {
    resize,
  },
  ready() {
    window.addEventListener('resize', this.onResize);
  },
  created() {
  },
  computed: {
    ...mapGetters({
    }),
    coordinates() {
      return Array.from(Array(this.cols * this.rows), (_, i) => ({
        x: Math.floor(i / this.rows),
        y: i % this.rows,
      }));
    },
    positions() {
      return this.coordinates.map(item => ({
        x: item.x * this.tileSize,
        y: item.y * this.tileSize,
      }));
    },
  },
  methods: {
    onResize() {
      this.tileSize = Math.min(50, Math.floor(this.$refs.container.clientWidth / this.cols));
    },
  },
  mounted() {
  },
  beforeDestroy() {
  },
};

</script>

<style lang="stylus">
.container {
  width: 100%;
  min-height: 100px;
}
.grid {
  position: relative;
}
.coordinate {
  position: absolute;
  font-size: 10px;
  top: 2px;
  left: 2px;
}
.tile {
  box-shadow: -1px -1px 1px #45525A;
  overflow: visible;
}
.tube {
  top: 600px;
}
</style>
