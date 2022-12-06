<script lang="ts">
import { useDialog, useGlobals } from '@/composables';
import { useBuilderStore } from '@/plugins/builder/store';
import { clampRotation } from '@/utils/quantity';
import { computed, defineComponent, PropType } from 'vue';
import { BuilderBlueprint, FlowPart, PartSettingsCard } from '../types';
import { coord2grid } from '../utils';

export default defineComponent({
  name: 'BuilderPartSettingsDialog',
  props: {
    ...useDialog.props,
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
    rev: {
      type: String,
      required: true,
    },
  },
  emits: [...useDialog.emits, 'update:part', 'remove:part', 'dirty'],
  setup(props, { emit }) {
    const builderStore = useBuilderStore();
    const { dense } = useGlobals.setup();
    const { dialogRef, onDialogHide } = useDialog.setup();

    const blueprint = computed<BuilderBlueprint>(() =>
      builderStore.blueprintByType(props.part.type),
    );

    const cards = computed<PartSettingsCard[]>(() => [
      { component: 'PlacementCard' },
      ...blueprint.value.cards,
    ]);

    const partTitle = computed<string>(
      () => `${blueprint.value.title} ${props.part.x},${props.part.y}`,
    );

    const rotatedSize = computed<[number, number]>(() => {
      let [x, y] = props.part.size;
      [x, y] = clampRotation(props.part.rotate) % 180 ? [y, x] : [x, y];
      return [coord2grid(x), coord2grid(y)];
    });

    const displayScale = computed<number>(() => {
      const maxSize = Math.max(...props.part.size);
      if (maxSize >= 6) {
        return 0.5;
      }
      if (maxSize >= 4) {
        return 1;
      }
      return 2;
    });

    function updatePart(part: FlowPart): void {
      emit('update:part', part);
    }

    function removePart(part: FlowPart): void {
      emit('remove:part', part);
    }

    function invalidate(): void {
      emit('dirty');
    }

    return {
      coord2grid,
      dense,
      dialogRef,
      onDialogHide,
      cards,
      partTitle,
      rotatedSize,
      displayScale,
      updatePart,
      removePart,
      invalidate,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    persistent
    :model-value="true"
    :maximized="dense"
    transition-hide="fade"
    @update:model-value="onDialogHide"
    @keyup.esc="onDialogHide"
    @hide="onDialogHide"
  >
    <Card>
      <template #toolbar>
        <Toolbar :title="partTitle" />
      </template>

      <div class="widget-body column q-gutter-y-lg">
        <div class="row justify-center">
          <svg
            :height="200"
            :viewBox="`0 0 ${rotatedSize[0]} ${rotatedSize[1]}`"
            class="col-grow"
          >
            <PartWrapper
              :key="`menu-${part.id}-${rev}`"
              :part="part"
            />
          </svg>
        </div>

        <component
          :is="card.component"
          v-for="(card, idx) in cards"
          :key="`card-${card.component}-${idx}`"
          :part="part"
          v-bind="card.props || {}"
          class="col-auto"
          @update:part="updatePart"
          @remove:part="removePart"
          @dirty="invalidate"
        />
      </div>
    </Card>
  </q-dialog>
</template>
