<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { clampRotation } from '@/utils/quantity';
import { defineComponent, inject } from 'vue';
import { usePart } from '../composables';
import { PartRemoveKey } from '../const';

export default defineComponent({
  name: 'PlacementCard',
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { part } = usePart.setup();
    const removePart = inject(PartRemoveKey)!;

    function rotate(rotation: number): void {
      const rotate = clampRotation(part.value.rotate + rotation);
      part.value = { ...part.value, rotate };
    }

    function flip(): void {
      part.value = { ...part.value, flipped: !part.value.flipped };
    }

    function startRemovePart(): void {
      createDialog({
        component: 'ConfirmDialog',
        componentProps: {
          title: 'Remove part',
          message: `Are you sure you want to remove <b>${props.title}</b>?`,
          html: true,
        },
      }).onOk(() => removePart());
    }

    return {
      part,
      rotate,
      flip,
      startRemovePart,
    };
  },
});
</script>

<template>
  <div class="row justify-center q-gutter-xs">
    <q-btn
      outline
      icon="mdi-rotate-left-variant"
      no-wrap
      label="rotate"
      @click="rotate(-90)"
    />
    <q-btn
      outline
      icon="mdi-rotate-right-variant"
      no-wrap
      label="rotate"
      @click="rotate(90)"
    />
    <q-btn
      outline
      :label="part.flipped ? 'unflip' : 'flip'"
      icon="mdi-swap-horizontal-bold"
      @click="flip"
    />
    <q-btn
      outline
      icon="delete"
      label="delete"
      @click="startRemovePart"
    />
  </div>
</template>
