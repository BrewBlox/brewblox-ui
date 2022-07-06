<script lang="ts">
import { PropType, computed, defineComponent } from 'vue';

import { prettyQty } from '@/utils/quantity';

import { PidConfig } from '../types';

export default defineComponent({
  name: 'TempControlPidView',
  props: {
    modelValue: {
      type: Object as PropType<PidConfig>,
      required: true,
    },
  },
  setup(props) {
    const colorClass = computed<string>(() => {
      if (!props.modelValue.kp.value) {
        return '';
      }
      return props.modelValue.kp.value > 0 ? 'text-red' : 'text-blue';
    });
    return {
      prettyQty,
      colorClass,
    };
  },
});
</script>

<template>
  <div :class="['q-gutter-x-sm prop-parent', colorClass]">
    <div class="col-auto">
      <span>Kp</span>
      <span>{{ prettyQty(modelValue.kp) }}</span>
    </div>
    <div class="col-auto">
      <span>Td</span>
      <span>{{ prettyQty(modelValue.td) }}</span>
    </div>
    <div class="col-auto">
      <span>Ti</span>
      <span>{{ prettyQty(modelValue.ti) }}</span>
    </div>
  </div>
</template>

<style
  lang="sass"
  scoped
>
.prop-parent > div > span:first-child
  width: 2em
  float: left
</style>
