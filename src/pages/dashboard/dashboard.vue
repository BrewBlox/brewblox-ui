<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import GridContainer from '@/components/grid/grid-container.vue';
import WidgetModal from '@/components/widget-modal/widget-modal.vue';

import byOrder from '@/core/byOrder';

import { isFetching, dashboardById, dashboardItemById } from '@/store/dashboards/getters';
import {
  updateDashboardItemOrder,
  updateDashboardItemSize,
  createDashboardItem,
  addDashboardItemToDashboard,
} from '@/store/dashboards/actions';
import { Block } from '@/store/blocks/state';

import { addComponentByType } from './widgets';

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
class DashboardPage extends Vue {
  editable: boolean = false;
  modalOpen: boolean = false;

  get dashboardId(): string {
    return this.$route.params.id;
  }

  get dashboard() {
    return dashboardById(this.$store, this.dashboardId);
  }

  get items() {
    return [
      ...this.dashboard.items
        .map(id => dashboardItemById(this.$store, id))
        .map(addComponentByType),
    ].sort(byOrder);
  }

  get isFetching() {
    return isFetching(this.$store);
  }

  toggleEditable() {
    this.editable = !this.editable;
  }

  onOpenAddWidget() {
    this.modalOpen = true;
  }

  async onChangeOrder(order: VueOrdered[]) {
    const newOrder = order.map(item => item.id);

    try {
      await updateDashboardItemOrder(this.$store, newOrder);
    } catch (e) {
      throw e;
    }
  }

  onChangeSize(id: string, cols: number, rows: number) {
    updateDashboardItemSize(this.$store, { id, cols, rows });
  }

  async onAddWidget(type: string, block: Block) {
    // create dashboard item on api and wait
    const dashboardItem = await createDashboardItem(this.$store, {
      order: this.items.length + 1,
      cols: 4,
      rows: 4,
      widget: block.type,
      options: {
        block: `${block.serviceId}/${block.id}`,
      },
    });

    // add item to dashboard
    addDashboardItemToDashboard(this.$store, { dashboard: this.dashboard, dashboardItem });

    this.modalOpen = false;
  }
}

export default DashboardPage;
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
        {{ dashboard.title }}
      </portal>

      <portal to="toolbar-buttons">
        <q-btn
          v-if="editable"
          color="primary"
          icon="add"
          label="Add widget"
          @click="onOpenAddWidget"
        />
        <q-btn
          :icon="editable ? 'check' : 'mode edit'"
          :color="editable ? 'positive' : 'primary'"
          @click="toggleEditable"
          :label="editable ? 'Save changes' : 'Edit dashboard'"
        />
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
        />
      </grid-container>
    </template>
  </q-page>
</template>

<style lang="stylus" scoped>
@import '../../css/app.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
}
</style>
