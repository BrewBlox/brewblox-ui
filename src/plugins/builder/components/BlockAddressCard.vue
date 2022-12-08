<script lang="ts">
import { settingsAddress } from '@/plugins/builder/utils';
import { BlockAddress, ComparedBlockType } from '@/plugins/spark/types';
import { computed, defineComponent, PropType } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'BlockAddressCard',
  props: {
    settingsKey: {
      type: String,
      required: true,
    },
    compatible: {
      type: null as unknown as PropType<ComparedBlockType>,
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
  setup(props) {
    const { part, patchSettings } = usePart.setup();

    const address = computed<BlockAddress>({
      get: () => settingsAddress(part.value, props.settingsKey),
      set: (addr) => patchSettings({ [props.settingsKey]: addr }),
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
    any-service
  />
</template>
