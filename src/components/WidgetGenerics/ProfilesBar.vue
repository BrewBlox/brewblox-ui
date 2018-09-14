<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component({
  props: {
    profiles: {
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
}
</script>

<template>
  <q-select
    multiple
    v-model="$props.profiles"
    :options="selectOptions"
  />
</template>
