<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';

import GridContainer from '@/components/Grid/GridContainer.vue';

import byOrder from '@/helpers/byOrder';

import { DashboardItem } from '@/store/dashboards/state';

import { Block } from '@/services/spark/state';
import { isFetching, allBlocks } from '@/services/spark/store/getters';

import { widgetByType, widgetSizeByType, allFeatureTypes } from '@/services/feature-by-type';

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
export default class SparkPage extends Vue {
  editable: boolean = false;
  modalOpen: boolean = false;

  defaultItem(block: Block): DashboardItem {
    return {
      ...widgetSizeByType(block.type),
      id: block.id,
      widget: block.type,
      config: {
        serviceId: block.serviceId,
        blockId: block.id,
      },
      order: 0,
    };
  }

  get items() {
    return [
      ...allBlocks(this.$store, 'spark')
        .map(this.defaultItem),
    ];
  }

  get isFetching() {
    return isFetching(this.$store, 'spark');
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
          :type="item.widget"
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
