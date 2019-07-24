<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class WidgetToolbar extends Vue {
  @Prop({ type: String, required: true })
  readonly title!: string;

  @Prop({ type: String, default: '' })
  readonly subtitle!: string;
}
</script>

<template>
  <q-card-section class="q-pa-xs" style="max-width: 100%">
    <q-item dark>
      <q-item-section>
        <q-item-label class="ellipsis text-h6">{{ title }}</q-item-label>
        <q-item-label caption class="ellipsis">{{ subtitle }}</q-item-label>
      </q-item-section>
      <slot />
    </q-item>
    <q-separator dark inset />
  </q-card-section>
</template>
