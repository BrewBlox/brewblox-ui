<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';
import GridContainer from '@/components/Grid/GridContainer.vue';
import SparkWidget from '@/services/Spark/components/SparkWidget.vue';
import byOrder from '@/helpers/byOrder';
import { serviceAvailable } from '@/helpers/dynamic-store';
import { DashboardItem } from '@/store/dashboards/state';
import { Block } from '@/services/Spark/state';
import { isFetching, allBlocks } from '@/services/Spark/store/getters';
import {
  widgetByType,
  widgetSizeByType,
  allFeatureTypes,
} from '@/services/feature-by-type';

interface VueOrdered extends Vue {
  id: string;
}

@Component({
  components: {
    GridContainer,
    SparkWidget,
  },
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
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

  get isAvailable() {
    return serviceAvailable(this.$store, this.$props.serviceId);
  }

  get items() {
    if (!this.isAvailable) {
      return [];
    }
    return [
      ...allBlocks(this.$store, this.$props.serviceId)
        .filter(block => !block.id.startsWith('__'))
        .map(this.defaultItem),
    ];
  }

  get isFetching() {
    return !this.isAvailable || isFetching(this.$store, this.$props.serviceId);
  }

  widgetComponent(type: string): VueConstructor {
    return widgetByType(type);
  }
}
</script>

<template>
  <div>
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
        <spark-widget
          class="dashboard-item"
          :id="$props.serviceId"
          :serviceId="$props.serviceId"
          :cols="6"
          :rows="3"
        />
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
  </div>
</template>

<style lang="stylus" scoped>
@import '../../../css/app.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
}
</style>
