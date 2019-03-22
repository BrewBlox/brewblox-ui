<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { DisplaySettingsBlock } from './state';

@Component
export default class DisplaySettingsWidget extends BlockWidget {
  get block(): DisplaySettingsBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get displaySlots(): any[][] {
    const slots = Array(6);
    this.block.data.widgets
      .forEach((w) => { slots[w.pos - 1] = w; });
    return slots;
  }

  slotStyle(slot) {
    return `color: #${slot.color} !important`;
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <DisplaySettingsForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me"/>

    <q-card-section>
      <q-item>
        <q-item-section v-for="(slot, idx) in displaySlots.slice(0, 3)" :key="idx">
          <big v-if="slot" :style="slotStyle(slot)">{{ slot.name }}</big>
          <big v-else>Not set</big>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section v-for="(slot, idx) in displaySlots.slice(3, 6)" :key="idx">
          <big v-if="slot" :style="slotStyle(slot)">{{ slot.name }}</big>
          <big v-else>Not set</big>
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section side>Footer text</q-item-section>
        <q-item-section>
          <InputPopupEdit
            :field="block.data.name"
            :change="callAndSaveBlock(v => block.data.name = v)"
            label="footer text"
            tag="span"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section side>Temperature Unit</q-item-section>
        <q-item-section>
          <SelectPopupEdit
            :field="block.data.tempUnit"
            :options="[{ label: 'Celsius', value: 0 }, { label: 'Fahrenheit', value: 1 }]"
            :change="callAndSaveBlock(v => block.data.tempUnit = v)"
            label="Temperature Unit"
            tag="span"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
