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
    <WidgetToolbar :title="widgetTitle" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat label="Menu">
          <q-list dark bordered>
            <ActionItem icon="delete" label="Delete widget" @click="$props.onDelete(widgetId)"/>
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

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
