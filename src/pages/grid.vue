<template>
  <q-page padding>
    <q-modal
      v-model="modalOpen"
    >
      <q-btn
        label="1 x 1 Block"
        @click="addBlock(1, 1)"
      />
      <q-btn
        label="2 x 2 Block"
        @click="addBlock(2, 2)"
      />
      <q-btn
        label="3 x 3 Block"
        @click="addBlock(3, 3)"
      />
      <q-btn
        label="4 x 4 Block"
        @click="addBlock(4, 4)"
      />
    </q-modal>

    <div class="grid-settings">
      <q-btn
        v-if="editable"
        color="secondary"
        label="Add block"
        @click="onOpenAddBlock"
      />
      <q-btn
        :icon="editable ? 'check' : 'mode edit'"
        :color="editable ? 'primary' : 'standard'"
        @click="toggleEditable"
        :label="editable ? 'Save changes' : 'Edit layout'"
      />
    </div>

    <grid-container
      :editable="editable"
      :on-change-order="onChangeOrder"
      :on-change-size="onChangeSize"
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
    editable: false,
    modalOpen: false,
    items: [
      { id: 1, cols: 3, rows: 2 },
      { id: 2, cols: 2, rows: 5 },
      { id: 3, cols: 2, rows: 2 },
    ],
  }),
  methods: {
    toggleEditable() {
      this.editable = !this.editable;
    },
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
    onOpenAddBlock() {
      this.modalOpen = true;
    },
    addBlock(cols, rows) {
      this.$set(
        this,
        'items',
        [
          ...this.items,
          { id: this.items.length + 1, cols, rows },
        ],
      );

      this.editable = true;
      this.modalOpen = false;
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

.grid-settings {
  display: flex;
  margin: 0 0 24px 0;
  justify-content: flex-end;
}

.grid-settings button {
  margin-left: 12px;
}
</style>
