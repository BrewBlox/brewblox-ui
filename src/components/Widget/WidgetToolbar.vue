<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { displayNameById } from '@/store/features/getters';

@Component({
  props: {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    onRefresh: {
      type: Function,
      default: (blockId: string) => { },
    },
    onSettings: {
      type: Function,
      default: (blockId: string) => { },
    },
  },
})
export default class WidgetToolbar extends Vue {
  get displayName(): string {
    return displayNameById(this.$store, this.$props.type);
  }
}
</script>

<template>
  <q-toolbar color="dark-bright">
    <q-toolbar-title>
      {{ $props.name }}
      <q-item-tile sublabel>{{ displayName }}</q-item-tile>
    </q-toolbar-title>

    <slot />

    <q-btn
      flat
      round
      dense
      icon="settings"
      @click="$props.onSettings"
    />

    <q-btn
      flat
      round
      dense
      icon="refresh"
      @click="$props.onRefresh"
    />
  </q-toolbar>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}
</style>
