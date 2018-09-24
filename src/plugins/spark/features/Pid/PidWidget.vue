<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/plugins/spark/components/BlockWidget';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import WidgetField from '@/components/Widget/WidgetField.vue';
import { saveBlock } from '@/plugins/spark/store/actions';
import { PidBlock } from './state';
import { getById } from './getters';

@Component({
  components: {
    WidgetToolbar,
    WidgetModal,
    WidgetField,
  },
})
export default class PidWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): PidBlock {
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
        <!-- Input/output -->

        <widget-field
          :label="`Input value (${block.data.inputId})`"
          :icon="block.data.inputValid ? 'link' : 'link_off'"
        >
          <big>{{ block.data.inputValue | unit }}</big>
        </widget-field>

        <widget-field
          label="Input setting"
          icon="settings"
        >
          <big>{{ block.data.inputSetting | unit }}</big>
        </widget-field>

        <widget-field
          :label="`Output value (${block.data.outputId})`"
          :icon="block.data.outputValid ? 'link' : 'link_off'"
        >
          <big>{{ block.data.outputValue }}</big>
        </widget-field>

        <widget-field
          label="Output setting"
          icon="settings"
        >
          <big>{{ block.data.outputSetting }}</big>
        </widget-field>

        <!-- Filter -->

        <widget-field
          label="Filter / treshold"
          icon=""
        >
          <big>{{ block.data.filter }} / {{ block.data.filterThreshold | unit }}</big>
        </widget-field>

        <!-- Enabled / active -->

        <widget-field
          label="Enabled"
          icon=""
        >
          <big>{{ block.data.enabled }}</big>
        </widget-field>

        <widget-field
          label="Active"
          icon=""
        >
          <big>{{ block.data.active }}</big>
        </widget-field>

        <!-- kp / ti / td -->

        <widget-field
          label="Kp"
          icon=""
        >
          <big>{{ block.data.kp | unit }}</big>
        </widget-field>

        <widget-field
          label="Ti"
          icon=""
        >
          <big>{{ block.data.ti | unit }}</big>
        </widget-field>

        <widget-field
          label="Td"
          icon=""
        >
          <big>{{ block.data.td | unit }}</big>
        </widget-field>

        <!-- p / i / d -->

        <widget-field
          label="P"
          icon=""
        >
          <big>{{ block.data.p }}</big>
        </widget-field>

        <widget-field
          label="I"
          icon=""
        >
          <big>{{ block.data.i }}</big>
        </widget-field>

        <widget-field
          label="D"
          icon=""
        >
          <big>{{ block.data.d }}</big>
        </widget-field>

        <!-- error / integral / derivative -->

        <widget-field
          label="Error"
          icon=""
        >
          <big>{{ block.data.error | unit }}</big>
        </widget-field>

        <widget-field
          label="Integral"
          icon=""
        >
          <big>{{ block.data.integral | unit }}</big>
        </widget-field>

        <widget-field
          label="derivative"
          icon=""
        >
          <big>{{ block.data.derivative | unit }}</big>
        </widget-field>

      </q-card-main>
    </q-card>
  </q-scroll-area>
</template>

<style scoped>
.q-card {
  display: flex;
}

.filler {
  height: 100%;
  width: 100%;
  direction: vertical;
}
</style>
