<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class FormToolbar extends Vue {
  @Prop({ type: String, required: true })
  readonly title!: string;
}
</script>

<template>
  <DialogToolbar>
    <span class="text-h6 q-mr-md">{{ title }}</span>
    <slot/>
  </DialogToolbar>
</template>
