<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext, useWidget } from '@/composables';

export default defineComponent({
  name: 'DialogWidgetToolbar',
  props: {
    hasModeToggle: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'title-click',
  ],
  setup(props, { attrs, emit }) {
    const {
      context,
      toggleMode,
    } = useContext.setup();
    const {
      widget,
      featureTitle,
      startChangeWidgetTitle,
    } = useWidget.setup();

    const toggleBtnIcon = computed<string>(
      () => context.mode === 'Basic'
        ? 'mdi-unfold-more-horizontal'
        : 'mdi-unfold-less-horizontal',
    );

    const toggleBtnTooltip = computed<string>(
      () => context.mode === 'Basic'
        ? 'Show full widget'
        : 'Show basic widget',
    );

    function clickTitle(): void {
      if (attrs['onTitleClick'] !== undefined) {
        emit('title-click');
      }
      else {
        startChangeWidgetTitle();
      }
    }

    return {
      widget,
      featureTitle,
      toggleBtnIcon,
      toggleBtnTooltip,
      toggleMode,
      clickTitle,
    };
  },
});
</script>

<template>
  <DialogToolbar
    :title="widget.title"
    :subtitle="featureTitle"
    @title-click="clickTitle"
  >
    <slot />
    <template #buttons>
      <q-btn
        v-if="hasModeToggle"
        :icon="toggleBtnIcon"
        flat
        dense
        round
        @click="toggleMode"
      >
        <q-tooltip>
          {{ toggleBtnTooltip }}
        </q-tooltip>
      </q-btn>
      <ActionMenu round dense>
        <template v-if="!!$slots.actions" #actions>
          <slot name="actions" />
        </template>
        <template #menus>
          <slot name="menus">
            <WidgetActions />
          </slot>
        </template>
      </ActionMenu>
    </template>
  </DialogToolbar>
</template>
