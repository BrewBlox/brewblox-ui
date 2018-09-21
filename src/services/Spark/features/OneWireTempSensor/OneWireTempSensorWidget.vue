<script lang="ts">
import Component from 'vue-class-component';

import { saveBlock } from '@/services/Spark/store/actions';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetField from '@/components/Widget/WidgetField.vue';
import BlockWidget from '@/services/Spark/components/BlockWidget';
import { OneWireTempSensorBlock } from './state';
import { getById } from './getters';

@Component({
  components: {
    WidgetToolbar,
    WidgetField,
  },
})
export default class OneWireTempSensor extends BlockWidget {
  get block(): OneWireTempSensorBlock {
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
      <q-card-main class="row">

        <widget-field
          label="Address"
          icon=""
        >
          <big>{{ block.data.address }}</big>
        </widget-field>

        <widget-field
          label="Connection status"
          icon=""
        >
          <big>{{ block.data.connected }}</big>
        </widget-field>

        <widget-field
          label="Value"
          icon=""
        >
          <big>{{ block.data.value | unit }}</big>
        </widget-field>

        <widget-field
          label="Offset"
          icon=""
        >
          <big>{{ block.data.offset | unit }}</big>
        </widget-field>

      </q-card-main>

    </q-card>
  </div>
</template>

<style scoped>
.q-card {
  display: flex;
}
</style>
