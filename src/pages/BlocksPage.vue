<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';

import GridContainer from '@/components/Grid/GridContainer.vue';

import byOrder from '@/helpers/byOrder';

import { DashboardItem } from '@/store/dashboards/state';

import { Block } from '@/store/blocks/state';
import { isFetching, allBlocks } from '@/store/blocks/getters';

import { widgetByType } from '@/features/feature-by-type';

interface VueOrdered extends Vue {
  id: string;
}

/* eslint-disable indent */
@Component({
  components: {
    GridContainer,
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
        .map(this.defaultItem),
    ];
  }

  get isFetching() {
    return isFetching(this.$store);
  }

  widgetComponent(type: string): VueConstructor {
    return widgetByType(type);
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
          :is="widgetComponent(item.widget)"
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
