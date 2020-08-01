<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/bloxfield';
import { isCompatible } from '@/plugins/spark/helpers';

import ValEditBase from '../ValEditBase';


@Component
export default class LinkValEdit extends ValEditBase {
  field!: Link;
  filtered: string[] | null = null;

  get blockIdOpts(): string[] {
    return this.sparkModule
      .blocks
      .filter(block => isCompatible(block.type, this.field.type))
      .map(block => block.id);
  }

  get filteredOpts(): string[] {
    return this.filtered || this.blockIdOpts;
  }

  get displayVal(): string {
    return this.field.id || '<None>';
  }

  filterFn(val, update): void {
    if (val === '') {
      update(() => this.filtered = this.blockIdOpts);
      return;
    }

    update(() => {
      const needle = val.toLowerCase();
      this.filtered = this.blockIdOpts
        .filter(opt => opt.toLowerCase().match(needle));
    });
  }
}
</script>

<template>
  <q-select
    v-if="editable"
    v-model="field.id"
    :options="filteredOpts"
    label="Link"
    dense
    clearable
    use-input
    item-aligned
    @filter="filterFn"
  />
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayVal }}
  </div>
</template>
