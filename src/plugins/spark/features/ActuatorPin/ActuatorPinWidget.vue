<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import WidgetField from '@/components/Widget/WidgetField.vue';
import { ActuatorPinBlock } from './state';
import { getById, state } from './getters';

@Component({
  components: {
    WidgetToolbar,
    WidgetModal,
    WidgetField,
  },
})
export default class ActuatorPinWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): ActuatorPinBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: ActuatorPinBlock) {
    this.saveBlock(block);
  }

  get actuatorState() {
    return state[this.block.data.state];
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
      <actuator-pin-form
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
            label="State"
          >
            <big>{{ actuatorState }}</big>
          </widget-field>

          <widget-field
            label="Pin"
          >
            <big>{{ block.data.pin }}</big>
          </widget-field>

          <widget-field
            label="Inverted"
          >
            <big>{{ block.data.invert }}</big>
          </widget-field>

          <widget-field
            label="Constraints"
          >
            <big>{{ block.data.constrainedBy }}</big>
          </widget-field>

        </q-card-main>
      </q-card>
    </q-scroll-area>

  </div>
</template>

<style scoped>
</style>

