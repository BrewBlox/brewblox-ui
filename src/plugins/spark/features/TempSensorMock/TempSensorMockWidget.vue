<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { TempSensorMockBlock } from './state';
import { getById } from './getters';

@Component
export default class TempSensorMockWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): TempSensorMockBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: TempSensorMockBlock) {
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
      <temp-sensor-mock-form
        v-model="block"
      />
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
            label="Address"
            :icon="block.data.valid ? 'link' : 'link_off'"
          >
            <big>{{ block.data.address }}</big>
          </widget-field>

          <widget-field
            label="Value"
            icon=""
          >
            <big>{{ block.data.value | unit }}</big>
          </widget-field>

        </q-card-main>
      </q-card>
    </q-scroll-area>

  </div>
</template>

<style scoped>
</style>
