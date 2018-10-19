<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { ActuatorAnalogMockBlock } from './state';
import { getById } from './getters';

@Component
export default class ActuatorAnalogMockWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): ActuatorAnalogMockBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: ActuatorAnalogMockBlock) {
    this.saveBlock(block);
  }
}
</script>

<template>
  <div class="widget-container">

    <widget-modal
      :isOpen="modalOpen"
      :onClose="() => { this.modalOpen = false; }"
      :title="$props.id"
    >
      <actuator-analog-mock-form
        v-model="block"
      />
    </widget-modal>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
      :on-settings="() => { this.modalOpen = true; }"
    />

    <q-scroll-area class="widget-body">
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

  </div>
</template>

<style scoped>
</style>

