<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import GridContainer from '@/components/Grid/GridContainer.vue';
import WidgetModal from '@/components/WidgetModal/WidgetModal.vue';

import byOrder from '@/helpers/byOrder';

import { DashboardItem } from '@/store/dashboards/state';

import { Block } from '@/store/blocks/state';
import { isFetching, allBlocks } from '@/store/blocks/getters';

import addWidgetByType from '@/components/widgetByType';

interface VueOrdered extends Vue {
  id: string;
}

/* eslint-disable indent */
@Component({
  components: {
    GridContainer,
    WidgetModal,
  },
})
/* eslint-enable */
export default class BlocksDashboardPage extends Vue {
  editable: boolean = false;
  modalOpen: boolean = false;

  defaultItem(block: Block): DashboardItem {
    return {
      id: `default-${block.serviceId}/${block.id}`,
      order: 0,
      cols: 4,
      rows: 4,
      widget: block.type,
      options: {
        blockId: `${block.serviceId}/${block.id}`,
      },
    };
  }

  get items() {
    return [
      ...allBlocks(this.$store)
        .map(this.defaultItem)
        .map(addWidgetByType),
    ];
  }

  get isFetching() {
    return isFetching(this.$store);
  }

  toggleEditable() {
    this.editable = true;
  }

  onSave() {
    this.editable = false;
  }

  onOpenAddWidget() {
    this.modalOpen = true;
  }

  async onAddWidget(type: WidgetType, blockId: string) {
    throw new Error('Not supported here');
  }

  async onChangeOrder(order: VueOrdered[]) {
    // const newOrder = order.map(item => item.id);

    // try {
    //   await updateDashboardItemOrder(this.$store, newOrder);
    // } catch (e) {
    //   throw e;
    // }
  }

  onChangeSize(id: string, cols: number, rows: number) {
    // updateDashboardItemSize(this.$store, { id, cols, rows });
  }
}
</script>

<template>
  <q-page padding>
    <q-inner-loading :visible="isFetching">
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>

    <template v-if="!isFetching">
      <portal to="toolbar-title">
        <div>
          Blocks Overview
        </div>
      </portal>

      <portal to="toolbar-buttons">
        <!-- <q-btn
          :icon="editable ? 'check' : 'mode edit'"
          :color="editable ? 'positive' : 'primary'"
          @click="editable ? onSave() : toggleEditable()"
          :label="editable ? 'Save changes' : 'Edit dashboard'"
        /> -->
      </portal>

      <q-modal
        v-model="modalOpen"
        :content-css="{ minWidth: '80vw', minHeight: '500px' }"
      >
        <widget-modal
          :isOpen="modalOpen"
          :onAddWidget="onAddWidget"
        />
      </q-modal>

      <grid-container
        :editable="editable"
        :on-change-order="onChangeOrder"
        :on-change-size="onChangeSize"
      >
        <component
          class="dashboard-item"
          v-for="item in items"
          :is="item.component"
          :key="item.id"
          :id="item.id"
          :cols="item.cols"
          :rows="item.rows"
          :widgetOptions="item.options"
        />
      </grid-container>
    </template>
  </q-page>
</template>

<style lang="stylus" scoped>
@import '../css/app.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
}
</style>
