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

  *cardClassGenerator(): Generator<string, void, undefined> {
    yield `card__${this.context.container} depth-1`;

    if (this.$dense) {
      yield 'card__dense';
    }
  }

  get cardClass(): string {
    return [...this.cardClassGenerator()].join(' ');
  }

  get toolbarClass(): string {
    return `toolbar__${this.context.container} depth-1`;
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
      <component :is="scrollable ? 'q-scroll-area' : 'div'" visible :class="['fit', contentClass]">
        <slot />
      </component>
    </div>
  </div>
</template>
