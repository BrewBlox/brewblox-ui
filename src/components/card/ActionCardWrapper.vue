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
    <div class="fit column">
      <q-scroll-area class="col">
        <slot />
      </q-scroll-area>
      <div v-if="$slots.actions" class="col-auto">
        <q-separator />
        <q-card-actions align="right">
          <slot name="actions" />
        </q-card-actions>
      </div>
    </div>
  </CardWrapper>
</template>
