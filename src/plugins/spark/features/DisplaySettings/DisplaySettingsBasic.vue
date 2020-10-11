<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { DisplaySettingsBlock, DisplaySlot } from '@/plugins/spark/types';

@Component
export default class DisplaySettingsBasic
  extends BlockCrudComponent<DisplaySettingsBlock> {

  footerRules: InputRule[] = [
    v => !v || v.length <= 40 || 'Footer text can only be 40 characters',
  ];

  get slots(): (DisplaySlot | null)[] {
    const slots = Array(6).fill(null);
    this.block.data.widgets
      .forEach(w => { slots[w.pos - 1] = w; });
    return slots;
  }

  slotStyle(slot: DisplaySlot): Mapped<string> {
    return {
      gridColumnEnd: 'span 1',
      borderColor: slot ? `#${slot.color} !important` : '',
      borderStyle: 'solid',
      borderWidth: slot ? '1px' : '0px',
    };
  }
}
</script>

<template>
  <div class="q-pa-lg widget-lg">
    <slot name="warnings" />

    <div class="q-gutter-y-sm">
      <div class="grid-container">
        <div
          v-for="(slot, idx) in slots"
          :key="idx"
          :style="slotStyle(slot)"
          class="hoverable q-pa-sm q-item--dark"
          @click="showDialog"
        >
          <q-item-label caption>
            Slot {{ idx + 1 }}
          </q-item-label>
          <span v-if="slot" class="text-bold ellipsis">{{ slot.name || '---' }}</span>
          <span v-else class="darkened">Not set</span>
        </div>
      </div>

      <InputField
        :value="block.data.name"
        :rules="footerRules"
        label="Footer text"
        title="footer text"
        @input="v => { block.data.name = v; saveBlock(); }"
      />
    </div>
  </div>
</template>

<style scoped lang="sass">
.grid-container
  display: grid
  grid-template-columns: repeat(3, 1fr)
  grid-row-gap: 10px
  grid-column-gap: 10px
</style>
