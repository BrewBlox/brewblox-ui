<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/plugins/spark/components/BlockWidget';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import WidgetField from '@/components/Widget/WidgetField.vue';
import { SetpointSensorPairBlock } from './state';
import { getById } from './getters';

@Component({
  components: {
    WidgetToolbar,
    WidgetModal,
    WidgetField,
  },
})
export default class SetpointSensorPairWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): SetpointSensorPairBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }
}
</script>

<template>
  <div>

    <widget-modal
      :isOpen="modalOpen"
      :onClose="() => { this.modalOpen = false; }"
      :title="$props.id"
    >
      TODO
    </widget-modal>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
      :on-settings="() => { this.modalOpen = true }"
    />

    <q-scroll-area class="widget-body">
      <q-card>
        <q-card-main class="row">

          <widget-field
            :label="`Setpoint (${block.data.setpointId.id})`"
            :icon="block.data.setpointValid ? 'link' : 'link_off'"
          >
            <big>{{ block.data.setpointValue | unit }}</big>
          </widget-field>

          <widget-field
            :label="`Sensor (${block.data.sensorId.id})`"
            :icon="block.data.sensorValid ? 'link' : 'link_off'"
          >
            <big>{{ block.data.sensorValue | unit }}</big>
          </widget-field>

        </q-card-main>
      </q-card>
    </q-scroll-area>

  </div>
</template>

<style scoped>
.q-card {
  display: flex;
}
.widget-body {
  flex: 1;
  overflow: auto;
}
</style>

