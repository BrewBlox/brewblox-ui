<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component({
  props: {
    onCancel: {
      type: Function,
      default: () => { },
    }
  }
})
/* eslint-enable */
export default class DefaultWizard extends Vue { }
</script>

<template>
  <div>
    <q-btn @click="$props.onCancel">Go back</q-btn>
  </div>
</template>

<style scoped>
</style>
