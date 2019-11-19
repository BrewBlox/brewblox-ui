<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { sparkStore } from '@/plugins/spark/store';
import { fetchStoredBlock } from '@/plugins/spark/store/api';

import { Block } from '../../types';
import { DeprecatedObjectBlock } from './types';

@Component
export default class DeprecatedObjectWidget extends BlockWidgetBase {
  readonly block!: DeprecatedObjectBlock;
  actual: Block | null = null;

  async created(): Promise<void> {
    this.actual = await fetchStoredBlock(this.serviceId, this.block.data.actualId);
  }

  removeBlock(): void {
    sparkStore.removeBlock([this.block.serviceId, this.block]);
  }
}
</script>

<template>
  <q-card :class="cardClass">
    <DialogToolbar v-if="inDialog">
      <q-item-section>
        <q-item-label>{{ widget.title }}</q-item-label>
        <q-item-label caption>
          {{ displayName }}
        </q-item-label>
      </q-item-section>
    </DialogToolbar>
    <WidgetToolbar v-else :crud="crud" />

    <q-card-section>
      <q-item>
        <q-item-section>
          <ValueField :value="actual ? actual.id : 'Unknown'" label="ID" />
        </q-item-section>
        <q-item-section>
          <ValueField :value="actual ? actual.type : 'Unknown'" label="Type" />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn icon="delete" flat @click="removeBlock" />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
