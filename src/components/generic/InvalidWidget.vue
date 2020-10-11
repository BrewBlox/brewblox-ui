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
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" />
    </template>

    <CardWarning color="negative" class="items-center">
      <template #message>
        {{ error }}
      </template>
    </CardWarning>
  </CardWrapper>
</template>
