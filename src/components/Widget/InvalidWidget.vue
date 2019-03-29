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
    <WidgetToolbar :title="widgetId" :subtitle="displayName"/>

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
