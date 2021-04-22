<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';

const toolbarSlots = [
  'default',
  'buttons',
  'actions',
  'menus',
];

export default defineComponent({
  name: 'BlockWidgetToolbar',
  setup(props, { slots }) {
    const { inDialog } = useContext.setup();

    const activeSlots = computed<string[]>(
      () => Object.keys(slots)
        .filter(s => toolbarSlots.includes(s)),
    );

    return {
      inDialog,
      activeSlots,
    };
  },
});
</script>

<template>
  <DialogBlockWidgetToolbar v-if="inDialog" v-bind="$attrs">
    <template v-for="slot in activeSlots" #[slot] :name="slot">
      <slot :name="slot" />
    </template>
  </DialogBlockWidgetToolbar>
  <DashboardBlockWidgetToolbar v-else v-bind="$attrs">
    <template v-for="slot in activeSlots" #[slot] :name="slot">
      <slot :name="slot" />
    </template>
  </DashboardBlockWidgetToolbar>
</template>
