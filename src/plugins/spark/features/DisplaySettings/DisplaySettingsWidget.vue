<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { DisplaySettingsBlock } from './state';

@Component
export default class DisplaySettingsWidget extends BlockWidget {
  $q: any;

  get block(): DisplaySettingsBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get displaySlots() {
    const slots = Array(6);
    this.block.data.widgets
      .forEach((w) => { slots[w.pos - 1] = w; });
    return slots;
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen" no-backdrop-dismiss>
      <DisplaySettingsForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="column widget-body">
      <div :style="gridStyle(displaySlots.length)" class="slots full-width">
        <q-field v-for="(slot, idx) in displaySlots" :key="idx" :label="`Slot ${idx + 1}`">
          <big v-if="slot" :style="`color: #${slot.color} !important`">{{ slot.name }}</big>
          <big v-else>Not set</big>
        </q-field>
      </div>
      <div class="footer-text row full-width">
        <div class="q-field-label col-4">Footer text</div>
        <InputPopupEdit
          :field="block.data.name"
          :change="callAndSaveBlock(v => block.data.name = v)"
          class="col-8 self-center"
          label="footer text"
          tag="span"
        />
        <div class="q-field-label col-4">Temperature Unit</div>
        <SelectPopupEdit
          :field="block.data.tempUnit"
          :options="[{ label: 'Celsius', value: 0 }, { label: 'Fahrenheit', value: 1 }]"
          :change="callAndSaveBlock(v => block.data.tempUnit = v)"
          class="col-8 self-center"
          label="Temperature Unit"
          tag="span"
        />
      </div>
    </q-card-main>
  </q-card>
</template>


<style lang="stylus" scoped>
/deep/ .widget-body .q-field-margin {
  margin-top: 0px;
}

/deep/ .widget-body .q-field-content {
  padding-top: 0px;
}

.footer-text {
  margin-top: 20px;
}

.slots {
  align-items: center;
}
</style>
