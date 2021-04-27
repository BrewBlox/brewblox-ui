<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext, useWidget } from '@/composables';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'DashboardWidgetToolbar',
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
      widgetId,
      widget,
      featureTitle,
      startChangeWidgetTitle,
    } = useWidget.setup();

    const title = computed<string>(
      () => widget.value.title,
    );

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

    function showDialog(): void {
      createDialog({
        component: 'WidgetDialog',
        componentProps: {
          widgetId,
        },
      });
    }

    return {
      widget,
      featureTitle,
      showDialog,
      title,
      toggleBtnIcon,
      toggleBtnTooltip,
      toggleMode,
      clickTitle,
    };
  },
});
</script>

<template>
  <Toolbar
    :title="widget.title"
    :subtitle="featureTitle"
    @title-click="clickTitle"
  >
    <slot />
    <template #buttons>
      <q-btn
        v-if="hasModeToggle"
        flat
        dense
        round
        :icon="toggleBtnIcon"
        @click="toggleMode"
      >
        <q-tooltip>
          {{ toggleBtnTooltip }}
        </q-tooltip>
      </q-btn>
      <q-btn flat icon="mdi-launch" dense round @click="showDialog">
        <q-tooltip>
          Show in dialog
        </q-tooltip>
      </q-btn>
      <ActionMenu dense round>
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
  </Toolbar>
</template>
