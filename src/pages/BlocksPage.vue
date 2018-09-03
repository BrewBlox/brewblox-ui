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
export default class BlocksPage extends Vue {
  editable: boolean = false;
  modalOpen: boolean = false;

  defaultItem(block: Block): DashboardItem {
    return {
      id: `default-${block.serviceId}/${block.id}`,
      order: 0,
      cols: 4,
      rows: 4,
      widget: block.type,
      config: {
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
          Blocks
        </div>
      </portal>

      <grid-container>
        <component
          class="dashboard-item"
          v-for="item in items"
          :is="item.component"
          :key="item.id"
          :id="item.id"
          :cols="item.cols"
          :rows="item.rows"
          :config="item.config"
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
