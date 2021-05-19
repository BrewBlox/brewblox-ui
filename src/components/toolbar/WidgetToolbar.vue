<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';

import DashboardWidgetToolbar from './DashboardWidgetToolbar.vue';
import DialogWidgetToolbar from './DialogWidgetToolbar.vue';

const toolbarSlots = [
  'default',
  'buttons',
  'actions',
  'menus',
];

export default defineComponent({
  name: 'WidgetToolbar',
  components: {
    DialogWidgetToolbar,
    DashboardWidgetToolbar,
  },
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
  <DialogWidgetToolbar v-if="inDialog" v-bind="$attrs">
    <template v-for="slot in activeSlots" #[slot] :name="slot">
      <slot :name="slot" />
    </template>
  </DialogWidgetToolbar>
  <DashboardWidgetToolbar v-else v-bind="$attrs">
    <template v-for="slot in activeSlots" #[slot] :name="slot">
      <slot :name="slot" />
    </template>
  </DashboardWidgetToolbar>
</template>
