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
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <DialogToolbar v-if="inDialog">
        <q-item-section>
          <q-item-label>{{ widget.title }}</q-item-label>
          <q-item-label caption>
            {{ displayName }}
          </q-item-label>
        </q-item-section>
      </DialogToolbar>
      <WidgetToolbar v-else :crud="crud" />
    </template>

    <div class="widget-md widget-body">
      <LabeledField
        :value="actual ? actual.id : 'Unknown'"
        label="ID"
        class="col-grow"
      />
      <LabeledField
        :value="actual ? actual.type : 'Unknown'"
        label="Type"
        class="col-grow"
      />
      <q-btn
        icon="delete"
        flat
        class="col-grow"
        @click="removeBlock"
      />
    </div>
  </CardWrapper>
</template>
