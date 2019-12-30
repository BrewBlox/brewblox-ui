<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class DialogCard extends Vue {
  @Prop({ type: String, required: true })
  public readonly title!: string;

  @Prop({ type: String, default: '' })
  public readonly message!: string;

  @Prop({ type: Boolean, default: false })
  public readonly html!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly separated!: boolean;
}
</script>

<template>
  <q-card class="q-dialog-plugin q-dialog-plugin--dark overflow-auto">
    <q-card-section class="q-dialog__title">
      {{ title }}
    </q-card-section>
    <template v-if="$slots.message">
      <q-card-section class="q-dialog__message scroll">
        {{ message }}
        <slot name="message" />
      </q-card-section>
    </template>
    <template v-else-if="!message" />
    <q-card-section v-else-if="html" class="q-dialog__message scroll" v-html="message" />
    <q-card-section v-else class="q-dialog__message scroll">
      {{ message }}
    </q-card-section>
    <slot name="body">
      <q-card-section class="scroll">
        <slot />
      </q-card-section>
    </slot>
    <q-separator v-if="separated" />
    <template>
      <q-card-actions v-if="$slots.actions" align="right">
        <slot name="actions" />
      </q-card-actions>
    </template>
  </q-card>
</template>
