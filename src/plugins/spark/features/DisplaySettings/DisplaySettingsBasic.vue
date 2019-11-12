<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DisplaySettingsBlock, DisplaySlot } from './types';

@Component
export default class DisplaySettingsBasic extends BlockCrudComponent {
  readonly block!: DisplaySettingsBlock;

  get slots(): DisplaySlot[] {
    const slots = Array<DisplaySlot>(6);
    this.block.data.widgets
      .forEach(w => slots[w.pos - 1] = w);
    return slots;
  }

  get footerRules(): InputRule[] {
    return [
      v => !v || v.length <= 40 || 'Footer text can only be 40 characters',
    ];
  }
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <q-list dark dense>
        <div class="row">
          <q-item
            v-for="(slot, idx) in slots"
            :key="idx"
            clickable
            class="col-4"
            @click="showDialog"
          >
            <q-item-section>
              <q-item-label caption>
                Slot {{ idx + 1 }}
              </q-item-label>
              <span
                v-if="slot"
                :style="`color: #${slot.color} !important`"
                class="text-bold"
              >{{ slot.name || '---' }}</span>
              <span v-else class="darkened">Not set</span>
            </q-item-section>
          </q-item>
        </div>

        <q-item dark>
          <q-item-section side class="q-pb-xs">
            Footer text
          </q-item-section>
          <q-item-section>
            <InputField
              :value="block.data.name"
              :rules="footerRules"
              title="footer text"
              @input="v => { block.data.name = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
