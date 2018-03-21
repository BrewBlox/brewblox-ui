<template>
  <q-page padding>
    <grid-container>
      <strong
        class="item"
        cols="3"
        rows="2"
      >
        1
      </strong>

      <strong
        class="item"
        cols="2"
        rows="5"
      >
        2
      </strong>
    </grid-container>
  </q-page>
</template>

<script>
import GridContainer from '../components/grid/grid-container';

export default {
  name: 'Grid',
  components: { GridContainer },
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
