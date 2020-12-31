<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { clampRotation } from '@/helpers/functional';
import { WidgetContext } from '@/store/features';

import { squares } from './helpers';
import { builderStore } from './store';
import { CardSpec, FlowPart, PartSpec } from './types';

@Component
export default class BuilderPartMenu extends DialogBase {
  squares = squares;

  @Prop({ type: Object, required: true })
  readonly part!: FlowPart;

  close(): void {
    this.$emit('close');
  }

  get context(): WidgetContext {
    return {
      container: 'Dialog',
      size: 'Fixed',
      mode: 'Basic',
    };
  }

  get spec(): PartSpec {
    return builderStore.spec(this.part);
  }

  get cards(): CardSpec[] {
    return [
      { component: 'PlacementCard' },
      ...this.spec.cards,
    ];
  }

  get partTitle(): string {
    return `${this.spec.title} ${this.part.x},${this.part.y}`;
  }

  get rotatedSize(): [number, number] {
    const [x, y] = this.part.size;
    return clampRotation(this.part.rotate) % 180
      ? [y, x]
      : [x, y];
  }

  get displayScale(): number {
    const maxSize = Math.max(...this.part.size);
    if (maxSize >= 6) {
      return 0.5;
    }
    if (maxSize >= 4) {
      return 1;
    }
    return 2;
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    persistent
    :value="true"
    @input="close"
    @keyup.esc="close"
  >
    <CardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="partTitle" @close="close" />
      </template>

      <div class="widget-body column q-gutter-y-lg">
        <div class="row justify-center">
          <svg
            :width="`${squares(rotatedSize[0]) * displayScale}px`"
            :height="`${squares(rotatedSize[1] * displayScale)}px`"
            :viewBox="`0, 0, ${squares(rotatedSize[0])}, ${squares(rotatedSize[1])}`"
            class="col-auto"
          >
            <PartWrapper :part="part" />
          </svg>
        </div>

        <component
          :is="card.component"
          v-for="(card, idx) in cards"
          :key="idx"
          :part="part"
          v-bind="card.props || {}"
          class="col-auto"
          v-on="$listeners"
        />
      </div>
    </CardWrapper>
  </q-dialog>
</template>
