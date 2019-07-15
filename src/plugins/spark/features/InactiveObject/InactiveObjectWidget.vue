<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';
import featureStore from '@/store/features';

import { InactiveObjectBlock } from './types';

@Component
export default class InactiveObjectWidget extends BlockWidget {
  readonly block!: InactiveObjectBlock;

  get actualDisplayName() {
    return featureStore.displayNameById(this.block.data.actualType);
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />
    <CardWarning v-if="!block.data.connected">
      <template #message>
        This {{ actualDisplayName }} block is disabled.
        <br />To enable it, ensure that it is in an enabled group.
      </template>
    </CardWarning>
  </q-card>
</template>
