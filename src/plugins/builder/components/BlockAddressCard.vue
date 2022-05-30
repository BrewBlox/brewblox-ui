<script lang="ts">
import { PropType, computed, defineComponent } from 'vue';

import { settingsAddress } from '@/plugins/builder/utils';
import { BlockAddress } from '@/plugins/spark/types';

import { FlowPart } from '../types';

export default defineComponent({
  name: 'BlockAddressCard',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
    settingsKey: {
      type: String,
      required: true,
    },
    compatible: {
      type: Array as PropType<string[]>,
      required: true,
    },
    label: {
      type: String,
      default: 'Block',
    },
    creatable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:part'],
  setup(props, { emit }) {
    const address = computed<BlockAddress>({
      get: () => settingsAddress(props.part, props.settingsKey),
      set: (addr) =>
        emit('update:part', {
          ...props.part,
          settings: {
            ...props.part.settings,
            [props.settingsKey]: addr,
          },
        }),
    });

    return {
      address,
    };
  },
});
</script>

<template>
  <BlockAddressField
    v-model="address"
    v-bind="{ label, compatible, creatable }"
    item-aligned
    any-service
  />
</template>
