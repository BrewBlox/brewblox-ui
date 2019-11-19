<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DS2413Block } from './types';

@Component
export default class DS2413Full extends BlockCrudComponent {
  readonly block!: DS2413Block;
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <IoArray :crud="crud" />
    <q-separator inset />

    <q-card-section>
      <q-item>
        <q-item-section>
          <InputField
            :value="block.data.address"
            title="Address"
            label="Address"
            class="self-start"
            @input="v => { block.data.address = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <ValueField :value="block.data.connected ? 'Yes' : 'No'" label="Connected" />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
