<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import { blockTypes } from '@/plugins/spark/block-types';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { DisplaySettingsBlock, DisplaySlot } from '@/plugins/spark/features/DisplaySettings/types';

@Component
export default class DisplaySettingsFull extends BlockCrudComponent {
  readonly block!: DisplaySettingsBlock;

  validDisplayTypes = [
    blockTypes.TempSensorMock,
    blockTypes.TempSensorOneWire,
    blockTypes.SetpointSensorPair,
    blockTypes.ActuatorPwm,
    blockTypes.ActuatorAnalogMock,
    blockTypes.Pid,
  ];

  get slots(): Array<any> {
    const slots = Array(6);
    this.block.data.widgets
      .forEach((w) => { slots[w.pos - 1] = w; });
    return slots;
  }

  get slotNameRules(): InputRule[] {
    return [
      v => !v || v.length <= 15 || 'Name can only be 15 characters',
    ];
  }

  get footerRules(): InputRule[] {
    return [
      v => !v || v.length <= 40 || 'Footer text can only be 40 characters',
    ];
  }

  slotLink(slot: DisplaySlot): Link {
    if (!slot) {
      return new Link(null);
    }
    return Object.values(slot)
      .find(v => v instanceof Link) || new Link(null);
  }

  slotColor(slot: DisplaySlot): string {
    return slot && slot.color
      ? `#${slot.color}`
      : '#ff';
  }

  slotColorStyle(slot: DisplaySlot): Mapped<string> {
    const color = `#${slot.color || 'ff'}`;
    return {
      color,
      backgroundColor: color,
    };
  }

  get linkFilter() {
    return block => this.validDisplayTypes.includes(block.type);
  }

  updateSlotLink(idx: number, link: Link): void {
    const pos = idx + 1;
    if (!link.id) {
      this.block.data.widgets = this.block.data.widgets
        .filter(w => w.pos !== pos);
      this.saveBlock();
      return;
    }

    const type = link.type || '';
    const existing = this.slots[idx] || {};
    const obj: DisplaySlot = {
      pos,
      color: existing.color || '4169E1',
      name: existing.name || link.id.slice(0, 15),
    };

    if (['TempSensorInterface', 'TempSensorMock', 'TempSensorOneWire'].includes(type)) {
      obj.tempSensor = link;
    }

    if (type === 'SetpointSensorPair') {
      obj.setpointSensorPair = link;
    }

    if (['ActuatorAnalogInterface', 'ActuatorPwm', 'ActuatorAnalogMock'].includes(type)) {
      obj.actuatorAnalog = link;
    }

    if (type === 'Pid') {
      obj.pid = link;
    }

    this.block.data.widgets = [
      ...this.block.data.widgets.filter(w => w.pos !== pos),
      obj,
    ];
    this.saveBlock();
  }

  updateSlotName(idx: number, name: string): void {
    const pos = idx + 1;
    this.block.data.widgets = this.block.data.widgets
      .map(w => (w.pos === pos ? { ...w, name } : w));
    this.saveBlock();
  }

  updateSlotColor(idx: number, color: string): void {
    const pos = idx + 1;
    this.block.data.widgets = this.block.data.widgets
      .map(w => (w.pos === pos ? { ...w, color: color.replace('#', '') } : w));
    this.saveBlock();
  }
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <div class="grid-container">
        <div
          v-for="(slot, idx) in slots"
          :key="idx"
          :style="`border: 2px solid ${slotColor(slot)}; grid-column-end: span 1`"
          class="q-pa-sm column justify-between"
        >
          <BlockField
            :value="slotLink(slot)"
            :filter="linkFilter"
            :service-id="serviceId"
            no-create
            title="Block"
            label="Block"
            @input="v => updateSlotLink(idx, v)"
          />
          <template v-if="slot">
            <InputField
              :value="slot.name"
              :rules="slotNameRules"
              label="Slot name"
              title="Slot name"
              message="Choose the LCD display name for this block"
              @input="v => updateSlotName(idx, v)"
            />
            <ColorField
              :value="slot.color"
              title="Color"
              label="Color"
              message="Choose the LCD display background color for this block"
              @input="v => updateSlotColor(idx, v)"
            />
          </template>
        </div>
      </div>
    </q-card-section>

    <q-separator inset />

    <q-card-section class="row items-start q-x-sm">
      <InputField
        :value="block.data.name"
        :rules="footerRules"
        class="col"
        label="Footer text"
        title="footer text"
        @input="v => {block.data.name = v; saveBlock()}"
      />
      <SelectField
        :value="block.data.tempUnit"
        :options="[{ label: 'Celsius', value: 0 }, { label: 'Fahrenheit', value: 1 }]"
        label="Temperature unit"
        title="Temperature unit"
        class="col q-pl-sm"
        @input="v => { block.data.tempUnit = v; saveBlock(); }"
      />
      <q-field
        label="Display brightness"
        stack-label
        class="col q-px-sm"
        borderless
      >
        <q-slider
          :value="block.data.brightness || 255"
          :min="20"
          :max="255"
          @change="v => { block.data.brightness = v; saveBlock(); }"
        />
      </q-field>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-row-gap: 10px;
  grid-column-gap: 10px;
}
</style>
