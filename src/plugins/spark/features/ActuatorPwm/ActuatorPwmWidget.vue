<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/plugins/spark/components/BlockWidget';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import WidgetField from '@/components/Widget/WidgetField.vue';
import Constraints from '@/plugins/spark/components/Constraints.vue';
import { ActuatorPwmBlock } from './state';
import { getById } from './getters';

@Component({
  components: {
    WidgetToolbar,
    WidgetModal,
    WidgetField,
    Constraints,
  },
})
export default class ActuatorPwmWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): ActuatorPwmBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: ActuatorPwmBlock) {
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
      <actuator-pwm-form
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
            :label="`Actuator (${block.data.actuatorId.id})`"
            :icon="block.data.actuatorValid ? 'link' : 'link_off'"
          >
            <big>Setting: {{ block.data.setting }}</big> <br/>
            <big>Value: {{ block.data.value }}</big>
          </widget-field>

          <widget-field
            label="Period"
          >
            <big>Period: {{ block.data.period }}</big>
          </widget-field>

          <widget-field
            label="Constraints"
          >
            <constraints
              readonly
              type="analog"
              :serviceId="serviceId"
              v-model="block.data.constrainedBy"
            />
          </widget-field>

        </q-card-main>
      </q-card>
    </q-scroll-area>

  </div>
</template>

<style scoped>
</style>

