<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class DialogToolbar extends Vue {

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
        icon="mdi-close-circle"
        class="close-button"
        @click="$emit('close')"
      />
    </template>
  </Toolbar>
</template>

<style lang="sass">
.close-button:hover
  color: $red-6
  > .q-focus-helper
    opacity: 0 !important
</style>
