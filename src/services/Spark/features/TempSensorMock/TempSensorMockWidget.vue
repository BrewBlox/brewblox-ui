<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/services/Spark/components/BlockWidget';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import WidgetField from '@/components/Widget/WidgetField.vue';
import { TempSensorMockBlock } from './state';
import { getById } from './getters';

@Component({
  components: {
    WidgetToolbar,
    WidgetModal,
    WidgetField,
  },
})
export default class TempSensorMockWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): TempSensorMockBlock {
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
          label="Address"
          icon=""
        >
          <big>{{ block.data.address }}</big>
        </widget-field>

        <widget-field
          label="Valid"
          icon=""
        >
          <big>{{ block.data.valid }}</big>
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

  </q-scroll-area>
</template>

<style scoped>
.q-card {
  display: flex;
}
</style>

