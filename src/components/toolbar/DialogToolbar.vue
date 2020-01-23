<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class DialogToolbar extends Vue {

  @Prop({ type: String, required: false })
  public readonly icon!: string;

  @Prop({ type: String, required: true })
  readonly title!: string;

  @Prop({ type: String, required: false })
  readonly subtitle!: string;
}
</script>

<template>
  <div class="toolbar__Dialog bg-secondary row q-pa-none">
    <div class="full-height q-pa-sm q-gutter-x-sm col-grow row text-h6 items-center">
      <q-icon v-if="icon" :name="icon" />
      <div class="col-grow">
        <q-item-label :class="{'text-h5': !subtitle}">
          {{ title }}
        </q-item-label>
        <q-item-label v-if="subtitle" caption>
          {{ subtitle }}
        </q-item-label>
      </div>
    </div>
    <slot />
    <slot name="buttons" />
    <q-btn v-close-popup flat stretch icon="mdi-close-circle" size="md" @click="$emit('close')" />
  </div>
</template>
