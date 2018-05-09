<template>
  <div>
    Add one wire temp sensor

    <q-btn @click="$props.onCancel">Go back</q-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component({
  props: {
    onCancel: {
      type: Function,
      default: () => {},
    }
  }
})
/* eslint-enable */

export default class Sensor extends Vue {}
</script>

<style scoped>

</style>
