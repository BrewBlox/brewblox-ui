<script setup lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { createBlockDialog } from '@/utils/block-dialog';
import { DisplaySettingsBlock, DisplaySlot } from 'brewblox-proto/ts';
import { computed } from 'vue';

const footerRules: InputRule[] = [
  (v) => !v || v.length <= 40 || 'Footer text can only be 40 characters',
];

const { block, patchBlock } = useBlockWidget.setup<DisplaySettingsBlock>();

const slots = computed<(DisplaySlot | null)[]>(() => {
  const slots = Array(6).fill(null);
  block.value.data.widgets.forEach((w) => {
    slots[w.pos - 1] = w;
  });
  return slots;
});

function slotStyle(slot: DisplaySlot | null): AnyDict {
  return slot
    ? {
        gridColumnEnd: 'span 1',
        borderColor: slot ? `#${slot.color} !important` : '',
        borderStyle: 'solid',
        borderWidth: slot ? '1px' : '0px',
      }
    : {};
}

function showDialog(): void {
  createBlockDialog(block.value);
}
</script>

<template>
  <div class="q-pa-lg">
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
          <q-item-label caption> Slot {{ idx + 1 }} </q-item-label>
          <span
            v-if="slot"
            class="text-bold ellipsis"
          >
            {{ slot.name || '---' }}
          </span>
          <span
            v-else
            class="darkened"
          >
            Not set
          </span>
        </div>
      </div>

      <TextField
        :model-value="block.data.name"
        :rules="footerRules"
        label="Footer text"
        title="footer text"
        @update:model-value="(v) => patchBlock({ name: v! })"
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
