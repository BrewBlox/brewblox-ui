<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';


@Component
export default class KeyboardButton extends Vue {

}
</script>

<template>
  <q-icon
    name="mdi-keyboard"
    class="pointer q-mx-xs"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <q-tooltip>Open keyboard</q-tooltip>
  </q-icon>
</template>
