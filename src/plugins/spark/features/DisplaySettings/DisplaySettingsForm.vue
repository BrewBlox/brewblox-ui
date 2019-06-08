<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { validDisplayTypes } from '@/plugins/spark/features/DisplaySettings/getters';
import { DisplaySettingsBlock, DisplayWidget } from '@/plugins/spark/features/DisplaySettings/types';

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
    return Object.values(slot)
      .find(v => v instanceof Link) || new Link(null);
  }

  slotColorStyle(slot) {
    const color = `#${slot.color || 'ff'}`;
    return {
      color,
      backgroundColor: color,
    };
  }

  get linkFilter() {
    return block => validDisplayTypes.includes(block.type);
  }

  updateSlotLink(idx: number, link: Link) {
    const pos = idx + 1;
    if (!link.id) {
      this.block.data.widgets = this.block.data.widgets
        .filter(w => w.pos !== pos);
      return;
    }

    const type = link.type || '';
    const existing = this.displaySlots[idx] || {};
    const obj: DisplayWidget = {
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

  updateSlotName(idx: number, name: string) {
    if (name.length > 15) {
      this.$q.notify({ message: 'Name can only be 15 characters' });
      return;
    }
    const pos = idx + 1;
    this.block.data.widgets = this.block.data.widgets
      .map(w => (w.pos === pos ? { ...w, name } : w));
    this.saveBlock();
  }

  updateSlotColor(idx: number, color: string) {
    const pos = idx + 1;
    this.block.data.widgets = this.block.data.widgets
      .map(w => (w.pos === pos ? { ...w, color: color.replace('#', '') } : w));
    this.saveBlock();
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>

    <q-scroll-area style="min-height: 400px; height: 80vh">
      <q-card-section>
        <q-list v-for="(slot, idx) in displaySlots" :key="idx" bordered dark class="q-mb-sm">
          <q-item dark>
            <q-item-section avatar>
              <q-icon name="mdi-widgets"/>
            </q-item-section>
            <q-item-section>Slot {{ idx + 1 }}</q-item-section>
          </q-item>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>Block</q-item-label>
              <LinkField
                :value="slotLink(slot)"
                :filter="linkFilter"
                :service-id="serviceId"
                title="Block"
                @input="v => updateSlotLink(idx, v)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Display name</q-item-label>
              <InputField
                v-if="slot"
                :value="slot.name"
                title="Slot name"
                message="Choose the LCD display name for this block"
                @input="v => updateSlotName(idx, v)"
              />
              <span v-else>-</span>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Color</q-item-label>
              <ColorField
                v-if="slot"
                :value="slot.color"
                title="Color"
                message="Choose the LCD display background color for this block"
                @input="v => updateSlotColor(idx, v)"
              />
              <span v-else>-</span>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list dark bordered>
          <q-item dark>
            <q-item-section side>Footer text</q-item-section>
            <q-item-section>
              <InputField
                :value="block.data.name"
                title="footer text"
                @input="v => {block.data.name = v; saveBlock()}"
              />
            </q-item-section>
          </q-item>
          <q-item dark>
            <q-item-section side>Temperature Unit</q-item-section>
            <q-item-section>
              <SelectField
                :value="block.data.tempUnit"
                :options="[{ label: 'Celsius', value: 0 }, { label: 'Fahrenheit', value: 1 }]"
                title="Temperature Unit"
                @input="v => { block.data.tempUnit = v; saveBlock(); }"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-scroll-area>
  </q-card>
</template>
