<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { WidgetContext } from '@/store/features';


@Component
export default class ActionCardWrapper extends Vue {

  @Prop({ type: Object, required: true })
  readonly context!: WidgetContext;
}
</script>

<template>
  <CardWrapper no-scroll v-bind="{context}">
    <template #toolbar>
      <slot name="toolbar" />
    </template>
    <ActionCardBody>
      <slot />
      <template #actions>
        <slot name="actions" />
      </template>
    </ActionCardBody>
  </CardWrapper>
</template>
