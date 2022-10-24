<script lang="ts">
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockStatus } from '@/plugins/spark/types';
import { Block } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'StatusIcon',
  props: {
    block: {
      type: [Object, null] as PropType<Block | null>,
      required: true,
    },
  },
  setup(props) {
    const specStore = useBlockSpecStore();

    const status = computed<BlockStatus | undefined>(() =>
      props.block
        ? specStore.blockSpecByType(props.block.type)?.analyze(props.block)
        : undefined,
    );

    return {
      status,
    };
  },
});
</script>

<template>
  <circle
    v-if="block"
    :class="'status-' + status"
    r="3"
  />
</template>

<style lang="sass" scoped>
.status-Active
  fill: $positive
.status-Inactive
  fill: $warning
.status-Disabled
  fill: $grey-6
.status-Invalid
  fill: $negative
</style>
