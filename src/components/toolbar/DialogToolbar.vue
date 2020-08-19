<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class DialogToolbar extends Vue {
  dialogDepth = 1;

  created(): void {
    this.dialogDepth = document.getElementsByClassName('q-dialog').length;
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
        :icon="dialogDepth > 1
          ? 'mdi-arrow-left-circle'
          : 'mdi-close-circle'"
        class="close-button"
        @click="$emit('close')"
      />
    </template>
  </Toolbar>
</template>
