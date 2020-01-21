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
    <q-item class="justify-center">
      <q-item-section avatar>
        <q-icon :name="icon" :color="color" />
      </q-item-section>
      <q-item-section class="col-shrink">
        <slot name="message" />
      </q-item-section>
      <q-item-section side>
        <slot name="actions" />
      </q-item-section>
    </q-item>
    <slot />
  </q-card-section>
</template>
