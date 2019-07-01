<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import WidgetBase from './WidgetBase';

@Component
export default class InvalidWidget extends WidgetBase {
  @Prop({ type: String, default: 'Unknown error' })
  readonly error!: string;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <WidgetToolbar :title="widget.title" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat label="Menu">
          <q-list dark bordered>
            <RemoveWidgetAction :crud="crud"/>
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section avatar>
          <q-icon name="warning" color="negative"/>
        </q-item-section>
        <q-item-section>{{ error }}</q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
