<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component({
  props: {
    value: {
      type: Array,
      required: true,
    },
    profileNames: {
      type: Array,
      required: true,
    },
  },
})
/* eslint-enable */
export default class ProfilesBar extends Vue {
  get selectOptions() {
    return this.$props.profileNames
      .map((name: string, idx: number) => ({
        label: name,
        value: idx,
      }));
  }

  get profiles() {
    return [...this.$props.value];
  }

  set profiles(values: number[]) {
    this.$emit('input', [...values]);
  }
}
</script>

<template>
  <q-select
    multiple
    v-model="profiles"
    :options="selectOptions"
  />
</template>
