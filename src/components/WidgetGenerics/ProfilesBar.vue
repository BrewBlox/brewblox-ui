<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component({
  props: {
    profiles: {
      type: Array,
      default: () => { throw new Error('Provide profiles'); },
    },
  }
})
/* eslint-enable */
export default class ProfilesBar extends Vue {
  get displayNames() {
    return [
      'P1',
      'P2',
      'P3',
      'P4',
      'P5',
      'P6',
      'P7',
      'P8',
    ];
  }

  get selectOptions() {
    return this.displayNames
      .map((name: string, idx: number) => ({
        label: name,
        value: idx,
      }));
  }
}
</script>

<template>
  <q-select
    multiple
    v-model="$props.profiles"
    :options="selectOptions"
  />
</template>
