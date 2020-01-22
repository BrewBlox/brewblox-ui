<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class Toolbar extends Vue {
  titleMode = true;

  @Prop({ type: String, required: true })
  readonly title!: string;

  @Prop({ type: String, required: false })
  readonly subtitle!: string;
}
</script>

<template>
  <q-card-section class="toolbar__Dashboard q-pa-none">
    <q-item dense class="q-pr-sm q-pt-xs q-gutter-x-sm">
      <q-item-section class="pointer ellipsis no-select" @click="titleMode = !titleMode">
        <q-item-label v-if="titleMode" class="text-deep-purple-3 text-h6">
          {{ title }}
        </q-item-label>
        <q-item-label v-else class="text-indigo-4 text-italic text-bold">
          {{ subtitle }}
        </q-item-label>
      </q-item-section>
      <slot />
      <q-space />
      <div class="col-auto row text-deep-purple-3">
        <slot name="buttons" />
      </div>
    </q-item>
  </q-card-section>
</template>
