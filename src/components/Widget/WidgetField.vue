<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    label: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
  },
})
export default class WidgetField extends Vue { }
</script>

<template>
  <q-field
    dark
    inset="full"
    orientation="vertical"
    :label="$props.label"
    :icon="$props.icon"
  >
    <slot />
  </q-field>
</template>

<style scoped>
.q-field {
  margin-top: 2pt;
  margin-bottom: 10pt;
}
</style>
