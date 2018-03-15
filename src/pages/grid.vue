<template>
  <q-page padding>
    <grid-container>
      <grid-item
        class="item"
        cols=4
        rows=3
      >
        1
      </grid-item>
      <grid-item
        class="item"
        cols=3
        rows=3
      >
        2
      </grid-item>
      <grid-item
        class="item"
        cols=2
        rows=4
      >
        3
      </grid-item>
      <grid-item
        class="item"
        cols=2
        rows=2
      >
        4
      </grid-item>
      <grid-item
        class="item"
        cols=4
        rows=2
      >
        5
      </grid-item>
    </grid-container>
  </q-page>
</template>

<script>
import GridContainer from '../components/grid/grid-container';
import GridItem from '../components/grid/grid-item';

export default {
  name: 'Grid',
  components: {
    GridContainer,
    GridItem,
  },
};
</script>

<style scoped lang="stylus">
@import '../css/themes/dark.variables.styl';

.item {
  background: $block-background;
}
</style>
