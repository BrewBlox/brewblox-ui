<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';


@Component
export default class WizardCard extends Vue {

}
</script>

<template>
  <div class="full-height col column justify-between">
    <div class="col scroll">
      <slot />
    </div>
    <div class="col-auto">
      <q-separator />
      <q-card-actions align="right">
        <slot name="actions" />
      </q-card-actions>
    </div>
  </div>
</template>

<style scoped>
.quickstart-card-body {
  height: calc(100% - 60px) !important;
}
</style>
