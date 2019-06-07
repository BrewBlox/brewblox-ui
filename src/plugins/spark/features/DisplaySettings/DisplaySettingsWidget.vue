<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { DisplaySettingsBlock } from './types';

@Component
export default class DisplaySettingsWidget extends BlockWidget {
  readonly block!: DisplaySettingsBlock;

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
        :block="block"
        @update:block="saveBlock"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me"/>

    <q-card-section>
      <q-list dark dense>
        <div class="row">
          <q-item
            v-for="(slot, idx) in displaySlots"
            :key="idx"
            clickable
            class="col-4"
            @click="openModal"
          >
            <q-item-section>
              <q-item-label caption>Slot {{ idx + 1 }}</q-item-label>
              <span v-if="slot" :style="slotStyle(slot)" class="text-bold">{{ slot.name }}</span>
              <span v-else class="darkened">Not set</span>
            </q-item-section>
          </q-item>
        </div>

        <q-item dark>
          <q-item-section side class="q-pb-xs">Footer text</q-item-section>
          <q-item-section>
            <InputField
              :value="block.data.name"
              title="footer text"
              @input="v => { block.data.name = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
