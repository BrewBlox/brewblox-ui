<template>
  <q-page padding>
    <grid-container
      :on-change-order="onChangeOrder"
      :on-change-size="onChangeSize"
      :on-add-block="onAddBlock"
    >
      <strong
        class="item"
        v-for="item in items"
        :key="item.id"
        :id="item.id"
        :cols="item.cols"
        :rows="item.rows"
      >
        {{ item.id }}
      </strong>
    </grid-container>
  </q-page>
</template>

<script>
import GridContainer from '../components/grid/grid-container';

export default {
  name: 'Grid',
  components: { GridContainer },
  data: () => ({
    items: [
      { id: 1, cols: 3, rows: 2 },
      { id: 2, cols: 2, rows: 5 },
      { id: 3, cols: 2, rows: 2 },
    ],
  }),
  methods: {
    onChangeOrder(order) {
      this.$set(
        this,
        'items',
        order.map(item => this.items.find(dataItem => dataItem.id === item.id)),
      );
    },
    onChangeSize(id, cols, rows) {
      this.$set(
        this,
        'items',
        this.items.map((item) => {
          if (item.id === id) {
            return { id, cols, rows };
          }

          return item;
        }),
      );
    },
    onAddBlock() {
      this.$set(
        this,
        'items',
        [...this.items, {
          id: this.items.length + 1,
          cols: 1,
          rows: 1,
        }],
      );
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
