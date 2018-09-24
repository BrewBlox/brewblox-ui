<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/plugins/spark/components/BlockWidget';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import WidgetField from '@/components/Widget/WidgetField.vue';
import { ActuatorAnalogMockBlock } from './state';
import { getById } from './getters';

@Component({
  components: {
    WidgetToolbar,
    WidgetModal,
    WidgetField,
  },
})
export default class ActuatorAnalogMockWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): ActuatorAnalogMockBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }
}
</script>

<template>
  <q-scroll-area>

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

    <q-card>
      <q-card-main class="row">

        <widget-field
          label="Setting"
          icon=""
        >
          <big>{{ block.data.setting }}</big>
        </widget-field>

        <widget-field
          label="Value"
          icon=""
        >
          <big>{{ block.data.value }}</big>
        </widget-field>

      </q-card-main>
    </q-card>

  </q-scroll-area>
</template>

<style scoped>
.q-card {
  display: flex;
}
</style>

