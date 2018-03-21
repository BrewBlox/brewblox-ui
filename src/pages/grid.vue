<template>
  <q-page padding>
    <grid-container>
      <grid-item
        class="item"
        cols=4
        rows=3
      >
        <strong>1</strong>
      </grid-item>
      <grid-item
        class="item"
        cols=3
        rows=3
      >
        <strong>2</strong>
      </grid-item>
      <grid-item
        class="item"
        cols=2
        rows=4
      >
        <strong>3</strong>
      </grid-item>
      <grid-item
        class="item"
        cols=2
        rows=2
      >
        <strong>4</strong>
      </grid-item>
      <grid-item
        class="item"
        cols=4
        rows=2
      >
        <strong>5</strong>
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
@import '../css/app.styl';

.item {
  background: $block-background;
}

strong {
  display: flex;
  align-items center;
  justify-content center;
  height: 100%;
  width: 100%;
  font-size: 30pt;
}
</style>
