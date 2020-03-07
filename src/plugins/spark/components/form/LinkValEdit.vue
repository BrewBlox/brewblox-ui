<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import { isCompatible } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';

import ValEditBase from '../ValEditBase';


@Component
export default class LinkValEdit extends ValEditBase {
  field!: Link;
  filtered: string[] | null = null;

  get blockIdOpts(): string[] {
    return sparkStore.blockValues(this.serviceId)
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
    :value="field.id"
    :options="filteredOpts"
    dense
    clearable
    use-input
    @input="v => { field.id = v; saveField(field); }"
    @filter="filterFn"
  />
  <div v-else>
    {{ displayVal }}
  </div>
</template>
