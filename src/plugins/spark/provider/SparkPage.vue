<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';
import { serviceAvailable } from '@/helpers/dynamic-store';
import { DashboardItem } from '@/store/dashboards/state';
import { Block } from '@/plugins/spark/state';
import { isFetching, allBlocks } from '@/plugins/spark/store/getters';
import {
  featureIds,
  widgetById,
  widgetSizeById,
} from '@/store/features/getters';
import { widgetSize, isSystemBlock } from './getters';

interface VueOrdered extends Vue {
  id: string;
}

@Component({
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
      id: block.id,
      widget: block.type,
      config: {
        serviceId: block.serviceId,
        blockId: block.id,
      },
      ...widgetSizeById(this.$store, block.type),
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
        .filter(block => !isSystemBlock(block))
        .map(this.defaultItem),
    ];
  }

  get isFetching() {
    return !this.isAvailable || isFetching(this.$store, this.$props.serviceId);
  }

  get widgetSize() {
    return widgetSize;
  }

  widgetComponent(id: string): string {
    return widgetById(this.$store, id) || 'InvalidWidget';
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
        <SparkWidget
          class="dashboard-item"
          :id="$props.serviceId"
          :serviceId="$props.serviceId"
          :cols="widgetSize.cols"
          :rows="widgetSize.rows"
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
