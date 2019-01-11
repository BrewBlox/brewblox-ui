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
    <q-card-main class="column widget-body">
      <div :style="gridStyle(displaySlots.length)" class="full-width">
        <q-field v-for="(slot, idx) in displaySlots" :key="idx" :label="`Slot ${idx + 1}`">
          <big v-if="slot" :style="`color: #${slot.color} !important`">{{ slot.name }}</big>
          <big v-else>Not set</big>
        </q-field>
      </div>
    </q-card-main>
  </q-card>
</template>
