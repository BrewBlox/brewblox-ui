<script lang="ts">
import { clampRotation } from '@/utils/quantity';
import { defineComponent, PropType } from 'vue';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'PlacementCard',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  emits: ['update:part', 'remove:part'],
  setup(props, { emit }) {
    function rotate(rotation: number): void {
      const rotate = clampRotation(props.part.rotate + rotation);
      emit('update:part', { ...props.part, rotate });
    }

    function flip(): void {
      emit('update:part', { ...props.part, flipped: !props.part.flipped });
    }

    function removePart(): void {
      emit('remove:part', props.part);
    }

    return {
      rotate,
      flip,
      removePart,
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
      @click="removePart"
    />
  </div>
</template>
