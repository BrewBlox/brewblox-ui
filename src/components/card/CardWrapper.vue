<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { WidgetContext } from '@/store/features';


@Component
export default class CardWrapper extends Vue {

  @Prop({ type: Boolean, default: false })
  public readonly noScroll!: boolean;

  @Prop({ type: Object, required: true })
  readonly context!: WidgetContext;

  @Prop({ type: [String, Array, Object], default: '' })
  public readonly contentClass!: any;

  get scrollable(): boolean {
    return !this.noScroll && this.context.size === 'Fixed';
  }

  get cardClass(): string {
    const listed = [`card__${this.context.container} depth-2`];
    if (this.$dense) {
      listed.push('card__dense');
    }
    return listed.join(' ');
  }

  get toolbarClass(): string {
    return `toolbar__${this.context.container}`;
  }

  get bodyClass(): string {
    return `content__${this.context.container}`;
  }
}
</script>

<template>
  <div :class="cardClass">
    <div :class="toolbarClass">
      <slot name="toolbar" />
    </div>
    <div :class="bodyClass">
      <component
        :is="scrollable ? 'q-scroll-area' : 'div'"
        :class="['fit', contentClass]"
        visible
      >
        <slot />
      </component>
    </div>
  </div>
</template>
