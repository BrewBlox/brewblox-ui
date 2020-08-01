<script lang="ts">
import { Component } from 'vue-property-decorator';

import { bloxLink, isLink, Link } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { isCompatible } from '@/plugins/spark/helpers';
import { BlockOrIntfType, DisplaySettingsBlock, DisplaySlot } from '@/plugins/spark/types';

@Component
export default class DisplaySettingsFull
  extends BlockCrudComponent<DisplaySettingsBlock> {

  slotNameRules: InputRule[] = [
    v => !v || v.length <= 15 || 'Name can only be 15 characters',
  ];
  footerRules: InputRule[] = [
    v => !v || v.length <= 40 || 'Footer text can only be 40 characters',
  ];
  validTypes: BlockOrIntfType[] = [
    'TempSensorInterface',
    'SetpointSensorPairInterface',
    'ActuatorAnalogInterface',
    'Pid',
  ]

  get slots(): (DisplaySlot | null)[] {
    const slots = Array(6);
    this.block.data.widgets
      .forEach(w => { slots[w.pos - 1] = w; });
    return slots;
  }

  slotLink(slot: DisplaySlot): Link {
    if (!slot) {
      return bloxLink(null);
    }
    return Object.values(slot)
      .find(v => isLink(v)) ?? bloxLink(null);
  }

  slotColor(slot: DisplaySlot): string {
    return slot?.color
      ? `#${slot.color}`
      : '#ff';
  }

  slotColorStyle(slot: DisplaySlot): Mapped<string> {
    const color = `#${slot?.color || 'ff'}`;
    return {
      color,
      backgroundColor: color,
    };
  }

  updateSlotLink(idx: number, link: Link): void {
    const pos = idx + 1;
    if (!link.id) {
      this.block.data.widgets = this.block.data.widgets
        .filter(w => w.pos !== pos);
      this.saveBlock();
      return;
    }

    const { type } = link;
    if (!type) { return; }

    const existing = this.slots[idx];
    const obj: DisplaySlot = {
      pos,
      color: existing?.color || '4169E1',
      name: existing?.name || link.id.slice(0, 15),
    };

    if (isCompatible(type, 'TempSensorInterface')) {
      obj.tempSensor = link;
    }
    else if (isCompatible(type, 'SetpointSensorPairInterface')) {
      obj.setpointSensorPair = link;
    }
    else if (isCompatible(type, 'ActuatorAnalogInterface')) {
      obj.actuatorAnalog = link;
    }
    else if (isCompatible(type, 'Pid')) {
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

  showUnitMenu(): void {
    createDialog({
      component: 'SparkUnitMenu',
      serviceId: this.serviceId,
    });
  }
}
</script>

<template>
  <div class="widget-lg">
    <slot name="warnings" />

    <q-card-section class="q-gutter-y-sm">
      <div class="grid-container">
        <div
          v-for="(slot, idx) in slots"
          :key="`display-slot-${idx}`"
          :style="`border: 2px solid ${slotColor(slot)}; grid-column-end: span 1`"
          class="q-pa-sm column q-gutter-y-xs"
        >
          <LinkField
            :value="slotLink(slot)"
            :service-id="serviceId"
            :compatible="validTypes"
            :show="false"
            title="Block"
            label="Block"
            @input="v => updateSlotLink(idx, v)"
          />
          <template v-if="slot">
            <InputField
              :value="slot.name"
              :rules="slotNameRules"
              label="Label text"
              title="Label text"
              message="Choose the LCD display label text for this block"
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

      <div class="row q-gutter-sm">
        <InputField
          :value="block.data.name"
          :rules="footerRules"
          class="col-grow"
          label="Footer text"
          title="footer text"
          @input="v => {block.data.name = v; saveBlock()}"
        />
        <LabeledField
          label="Display temperature unit"
          class="col-grow clickable"
          @click="showUnitMenu"
        >
          {{ block.data.tempUnit | capitalize }}
        </LabeledField>
        <q-field
          label="Display brightness"
          stack-label
          borderless
          class="col-grow min-width-md"
        >
          <q-slider
            label
            :value="block.data.brightness || 255"
            :min="20"
            :max="255"
            @change="v => { block.data.brightness = v; saveBlock(); }"
          />
        </q-field>
      </div>
    </q-card-section>
  </div>
</template>

<style scoped lang="sass">
.grid-container
  display: grid
  grid-template-columns: repeat(3, 1fr)
  grid-row-gap: 10px
  grid-column-gap: 10px
</style>
