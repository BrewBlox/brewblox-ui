<script lang="ts">
import Component from 'vue-class-component';

import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import BlockWidget from '@/services/spark/components/BlockWidget';
import { SysInfoBlock } from './state';
import { getById } from './getters';

@Component({
  components: {
    WidgetToolbar,
  },
})
export default class SensorSetPointPairWidget extends BlockWidget {
  get block(): SysInfoBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }
}
</script>

<template>
  <div>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
    />

    <q-card>
      <q-card-main>
        <q-list>

          <q-item class="grid-items-2">
            <q-item-main>
              <q-item-tile sublabel>Device ID</q-item-tile>
              <q-item-tile label class="q-headline">
                {{ block.data.deviceId }}
              </q-item-tile>
            </q-item-main>
          </q-item>

        </q-list>
      </q-card-main>
    </q-card>

  </div>
</template>

<style scoped>
.q-list {
  border: 0;
}

.q-item {
  display: grid;
  grid-gap: 10px;
}

.grid-items-2 {
  grid-template-columns: 1fr 1fr;
}
</style>
