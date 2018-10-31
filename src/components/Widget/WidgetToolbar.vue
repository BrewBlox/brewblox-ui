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
      required: false,
    },
    onSettings: {
      type: Function,
      required: false,
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
      v-if="$props.onSettings"
      @click="$props.onSettings"
    />

    <q-btn
      flat
      round
      dense
      icon="refresh"
      v-if="$props.onRefresh"
      @click="$props.onRefresh"
    />
  </q-toolbar>
</template>

<style scoped>
</style>
