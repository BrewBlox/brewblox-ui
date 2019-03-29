<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';
import { DisplaySettingsBlock, DisplayWidget } from '@/plugins/spark/features/DisplaySettings/state';
import { Link } from '@/helpers/units';
import { blockValues, blockById } from '@/plugins/spark/store/getters';
import { validDisplayTypes } from '@/plugins/spark/features/DisplaySettings/getters';

@Component
export default class DisplaySettingsForm extends BlockForm {
  $q: any;

  get block() {
    return this.blockField as DisplaySettingsBlock;
  }

  defaultData() {
    return {
      name: 'Display settings',
      widgets: [],
    };
  }

  presets() {
    return [];
  }

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
    return blockValues(this.$store, this.serviceId)
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

    const block = blockById(this.$store, this.serviceId, id);
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
      this.$q.notify('Name can only be 15 characters');
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
    <BlockFormToolbar v-if="!$props.embedded" v-bind="$props" :block="block"/>

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

    <q-expansion-item group="modal" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-expansion-item>
  </q-card>
</template>
