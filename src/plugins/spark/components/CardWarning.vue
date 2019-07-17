<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class CardWarning extends Vue {
  @Prop({ type: String, default: 'warning' })
  readonly icon!: string;

  @Prop({ type: String, default: 'warning' })
  readonly color!: string;
}
</script>

<template>
  <q-card-section>
    <q-item dark>
      <q-item-section avatar>
        <q-icon :name="icon" :color="color" />
      </q-item-section>
      <q-item-section>
        <slot name="message"></slot>
      </q-item-section>
      <q-item-section side>
        <slot name="actions"></slot>
      </q-item-section>
    </q-item>
    <slot></slot>
  </q-card-section>
</template>
