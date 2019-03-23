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
  <q-card dark class="text-white scroll">
    <q-card-section class="q-pa-xs">
      <q-item dark>
        <q-item-section>
          <q-item-label class="ellipsis text-h6">{{ widgetId }}</q-item-label>
          <q-item-label caption class="ellipsis">{{ displayName }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator dark inset/>
    </q-card-section>

    <q-card-section>
      <q-item dark>
        <q-item-section avatar>
          <q-icon name="warning" color="negative"/>
        </q-item-section>
        <q-item-section>{{ $props.error }}</q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
