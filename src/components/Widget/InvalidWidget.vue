<script lang="ts">
import Component from 'vue-class-component';
import WidgetBase from './WidgetBase';

@Component({
  props: {
    error: {
      default: 'Unknown error',
    },
  },
})
export default class InvalidWidget extends WidgetBase { }
</script>

<template>
  <q-card dark class="column">
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
    </q-card-title>
    <q-card-separator/>
    <q-alert icon="error" error>{{ $props.error }}</q-alert>
  </q-card>
</template>
