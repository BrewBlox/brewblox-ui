<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { validDisplayTypes } from '@/plugins/spark/features/DisplaySettings/getters';
import { DisplaySettingsBlock, DisplayWidget } from '@/plugins/spark/features/DisplaySettings/types';
import sparkStore from '@/plugins/spark/store';

@Component
export default class DisplaySettingsForm extends BlockForm {
  readonly block!: DisplaySettingsBlock;

  get displaySlots() {
    const slots = Array(6);
    this.block.data.widgets
      .forEach((w) => { slots[w.pos - 1] = w; });
    return slots;
  }

  slotLink(slot) {
    if (!slot) {
      return new Link(null);
    }
    return Object.values(slot).find(v => v instanceof Link) || new Link(null);
  }

  slotColorStyle(slot) {
    const color = `#${slot.color || 'ff'}`;
    return {
      color,
      backgroundColor: color,
    };
  }

  get slotLinkOpts() {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => validDisplayTypes.includes(block.type))
      .map(block => ({
        label: block.id,
        value: block.id,
      }));
  }

  updateSlotLink(idx: number, id: string | null) {
    const pos = idx + 1;
    if (!id) {
      this.block.data.widgets = this.block.data.widgets
        .filter(w => w.pos !== pos);
      return;
    }

    const block = sparkStore.blockById(this.serviceId, id);
    const link = new Link(block.id, block.type);
    const existing = this.displaySlots[idx] || {};
    const obj: DisplayWidget = {
      pos,
      color: existing.color || '4169E1',
      name: existing.name || block.id.slice(0, 15),
    };

    if (['TempSensorInterface', 'TempSensorMock', 'TempSensorOneWire'].includes(block.type)) {
      obj.tempSensor = link;
    }

    if (block.type === 'SetpointSensorPair') {
      obj.setpointSensorPair = link;
    }

    if (['ActuatorAnalogInterface', 'ActuatorPwm', 'ActuatorAnalogMock'].includes(block.type)) {
      obj.actuatorAnalog = link;
    }

    if (block.type === 'Pid') {
      obj.pid = link;
    }

    this.block.data.widgets = [
      ...this.block.data.widgets.filter(w => w.pos !== pos),
      obj,
    ];
  }

  updateSlotName(idx: number, name: string) {
    if (name.length > 15) {
      this.$q.notify({ message: 'Name can only be 15 characters' });
      return;
    }
    const pos = idx + 1;
    this.block.data.widgets = this.block.data.widgets
      .map(w => (w.pos === pos ? { ...w, name } : w));
  }

  updateSlotColor(idx: number, color: string) {
    const pos = idx + 1;
    this.block.data.widgets = this.block.data.widgets
      .map(w => (w.pos === pos ? { ...w, color: color.replace('#', '') } : w));
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>

    <q-expansion-item
      v-for="(slot, idx) in displaySlots"
      :key="idx"
      :label="`Slot ${idx + 1}`"
      group="modal"
      icon="mdi-widgets"
    >
      <q-item dark>
        <q-item-section>Block</q-item-section>
        <q-item-section>
          <SelectPopupEdit
            :field="slotLink(slot).id"
            :options="slotLinkOpts"
            :change="callAndSaveBlock(v => updateSlotLink(idx, v))"
            clearable
            label="block"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Display name</q-item-section>
        <q-item-section>
          <InputPopupEdit
            v-if="slot"
            :field="slot.name"
            :change="callAndSaveBlock(v => updateSlotName(idx, v))"
            label="name"
          />
          <big v-else>-</big>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Color</q-item-section>
        <q-item-section>
          <ColorPickerPopupEdit
            v-if="slot"
            :field="slot.color"
            :change="callAndSaveBlock(v => updateSlotColor(idx, v))"
            label="color"
          />
          <big v-else>-</big>
        </q-item-section>
      </q-item>
    </q-expansion-item>
    <q-expansion-item group="modal" icon="mdi-format-text" label="Shared Display Settings">
      <q-item dark>
        <q-item-section side>Footer text</q-item-section>
        <q-item-section>
          <InputPopupEdit
            :field="block.data.name"
            :change="callAndSaveBlock(v => block.data.name = v)"
            label="Footer text"
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
    </q-expansion-item>
  </q-card>
</template>
