<template>
  <q-page padding>
    <grid-container
      :on-change-order="onChangeOrder"
    >
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
      <strong
        class="item"
        cols="2"
        rows="2"
      >
        3
      </strong>
    </grid-container>
  </q-page>
</template>

<script>
import GridContainer from '../components/grid/grid-container';

export default {
  name: 'Grid',
  components: { GridContainer },
  methods: {
    onChangeOrder(order) {
      console.log(order);
    },
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
