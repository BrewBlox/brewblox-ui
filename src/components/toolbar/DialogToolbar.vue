<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { getNumDialogs } from '@/helpers/dialog';

@Component
export default class DialogToolbar extends Vue {
  numDialogs = 1;

  created(): void {
    this.numDialogs = getNumDialogs();
  }
}
</script>

<template>
  <Toolbar class="q-pa-none" v-bind="$attrs" v-on="$listeners">
    <slot />
    <template #buttons>
      <slot name="buttons" />
      <q-btn
        v-close-popup
        flat
        round
        dense
        :icon="numDialogs > 1
          ? 'mdi-arrow-left-circle'
          : 'mdi-close-circle'"
        class="close-button"
        @click="$emit('close')"
      />
    </template>
  </Toolbar>
</template>
