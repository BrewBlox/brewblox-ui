<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    id: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    error: {
      type: String,
      default: () => 'Unspecified error',
    },
  },
})
export default class InvalidWidget extends Vue { }
</script>

<template>
  <q-card>
    <q-toolbar color="negative">
      <q-toolbar-title>
        {{ $props.id }}
      </q-toolbar-title>
      <q-item-tile icon="error" />
    </q-toolbar>
    <q-item>
      <q-item-tile label>
        {{ $props.error }}
      </q-item-tile>
    </q-item>
  </q-card>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}
</style>
