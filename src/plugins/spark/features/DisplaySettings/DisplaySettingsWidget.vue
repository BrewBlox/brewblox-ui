<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById, validDisplayTypes } from './getters';
import { DisplaySettingsBlock, DisplayWidget } from './state';
import { Link } from '@/helpers/units';
import { blockValues, blockById } from '@/plugins/spark/store/getters';

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

  slotLink(slot) {
    if (!slot) {
      return new Link(null);
    }
    return Object.values(slot).find(v => v instanceof Link);
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

  get subtitles() {
    return [...Array(6).keys()].map(k => `Slot ${k + 1}`);
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

    if (block.type === 'TempSensorInterface') {
      obj.tempSensor = link;
    }

    if (block.type === 'SetpointSensorPair') {
      obj.setpointSensorPair = link;
    }

    if (block.type === 'ActuatorAnalogInterface') {
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
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <DisplaySettingsForm
        v-if="modalOpen"
        :field="block"
        :change="saveBlock"
        :change-id="changeBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="widgetId"
        :change="v => widgetId = v"
        class="ellipsis"
        label="Widget ID"
        display="span"
      />
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-carousel v-model="slideIndex" quick-nav class="col">
      <!-- State -->
      <q-carousel-slide v-for="(slot, idx) in displaySlots" :key="idx" class="unpadded">
        <div :class="['widget-body', orientationClass]">
          <q-card-main class="column col">
            <q-field class="col" label="Block">
              <SelectPopupEdit
                :field="slotLink(slot).id"
                :options="slotLinkOpts"
                :change="callAndSaveBlock(v => updateSlotLink(idx, v))"
                clearable
                label="Field"
              />
            </q-field>
            <q-field class="col" label="Name">
              <InputPopupEdit
                v-if="slot"
                :field="slot.name"
                :change="callAndSaveBlock(v => updateSlotName(idx, v))"
                label="Name"
              />
              <big v-else>-</big>
            </q-field>
            <q-field class="col" label="Color">
              <ColorPickerPopupEdit
                v-if="slot"
                :field="slot.color"
                :change="callAndSaveBlock(v => updateSlotColor(idx, v))"
                label="Color"
              />
              <big v-else>-</big>
            </q-field>
          </q-card-main>
        </div>
      </q-carousel-slide>
      <q-btn
        slot-scope="props"
        slot="quick-nav"
        :icon="navIcon(props.slide)"
        :label="navTitle(props.slide)"
        :class="{inactive: !props.current}"
        color="white"
        flat
        dense
        @click="props.goToSlide()"
      />
    </q-carousel>
  </q-card>
</template>

<style scoped>
</style>

