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
  <q-card class="text-white scroll">
    <component :is="toolbarComponent" :crud="crud" />

    <CardWarning color="negative">
      <template #message>
        <span>{{ error }}</span>
      </template>
    </CardWarning>
  </q-card>
</template>
