<script lang="ts">
import Component from 'vue-class-component';

import sparkStore from '@/plugins/spark/store';

import ValEdit from './ValEdit';


@Component
export default class LinkValEdit extends ValEdit {
  filtered: string[] | null = null;

  get blockIdOpts() {
    return sparkStore.blockIds(this.$props.serviceId);
  }

  get filteredOpts(): string[] {
    return this.filtered || this.blockIdOpts;
  }

  get displayVal() {
    return this.field.id || '<None>';
  }

  filterFn(val, update) {
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
    dark
    dense
    options-dark
    clearable
    use-input
    @input="v => { field.id = v; saveField(field); }"
    @filter="filterFn"
  />
  <div v-else>{{ displayVal }}</div>
</template>
