<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { clampRotation } from '@/helpers/functional';
import { WidgetContext } from '@/store/features';

import { squares } from './helpers';
import { builderStore } from './store';
import { CardSpec, FlowPart, PartSpec } from './types';

@Component
export default class BuilderPartMenu extends Vue {
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
  <q-dialog :value="true" no-backdrop-dismiss @input="close" @keyup.esc="close">
    <CardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="partTitle" @close="close" />
      </template>

      <q-card-section>
        <q-item>
          <q-item-section>
            <svg
              :width="`${squares(rotatedSize[0]) * displayScale}px`"
              :height="`${squares(rotatedSize[1] * displayScale)}px`"
              :viewBox="`0, 0, ${squares(rotatedSize[0])}, ${squares(rotatedSize[1])}`"
              class="q-mx-auto"
            >
              <PartWrapper :part="part" />
            </svg>
          </q-item-section>
        </q-item>
        <component
          :is="card.component"
          v-for="(card, idx) in cards"
          :key="idx"
          :part="part"
          v-bind="card.props || {}"
          v-on="$listeners"
        />
      </q-card-section>
    </CardWrapper>
  </q-dialog>
</template>
