<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';


@Component
export default class WizardBody extends Vue {

}
</script>

<template>
  <div class="fit col column justify-between">
    <div class="col scroll">
      <slot />
    </div>
    <div v-if="$slots.actions" class="col-auto">
      <q-separator />
      <q-card-actions align="right">
        <slot name="actions" />
      </q-card-actions>
    </div>
  </div>
</template>
