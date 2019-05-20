<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';


@Component({
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
})
export default class ExpandToggle extends Vue {
  toggle() {
    this.$emit('input', !this.$props.value);
  }
}
</script>

<template>
  <q-btn
    :icon="value ? 'mdi-unfold-less-horizontal' : 'mdi-unfold-more-horizontal'"
    flat
    round
    @click="toggle"
  >
    <q-tooltip>{{ value ? 'Collapse' : 'Expand' }}</q-tooltip>
  </q-btn>
</template>
