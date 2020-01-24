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
  <div class="row q-px-sm q-pt-xs q-gutter-x-sm text-deep-purple-3">
    <div
      class="col-grow pointer ellipsis no-select q-pa-xs text-h6"
      @click="titleMode = !titleMode"
    >
      <q-item-label v-if="titleMode || !subtitle">
        {{ title }}
      </q-item-label>
      <q-item-label v-else class="text-indigo-4 text-italic darkish">
        {{ subtitle }}
      </q-item-label>
    </div>
    <slot />
    <slot name="buttons" />
  </div>
</template>
