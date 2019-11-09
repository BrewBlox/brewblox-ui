<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';

@Component
export default class InvalidWidget extends WidgetBase {
  @Prop({ type: String, default: 'Unknown error' })
  readonly error!: string;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <WidgetToolbar :crud="crud">
      <q-item-section side>
        <q-btn-dropdown flat label="Menu">
          <q-list dark bordered>
            <RemoveWidgetAction :crud="crud" />
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <CardWarning color="negative">
      <template #message>
        <span>{{ error }}</span>
      </template>
    </CardWarning>
  </q-card>
</template>
