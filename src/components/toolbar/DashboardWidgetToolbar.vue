<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { useWidget } from '@/composables';
import { WidgetMode } from '@/store/features';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'DashboardWidgetToolbar',
  props: {
    ...useWidget.props,
    mode: {
      type: String as PropType<WidgetMode | null>,
      default: null,
    },
  },
  emits: [
    'title-click',
    'update:mode',
  ],
  setup(props, { attrs, emit }) {
    const {
      widget,
      featureTitle,
      startChangeWidgetTitle,
    } = useWidget.setup(props.widgetId);

    const title = computed<string>(
      () => widget.value.title,
    );

    const toggleIcon = computed<string>(
      () => props.mode === 'Basic'
        ? 'mdi-unfold-more-horizontal'
        : 'mdi-unfold-less-horizontal',
    );

    const toggleTooltip = computed<string>(
      () => props.mode === 'Basic'
        ? 'Show full widget'
        : 'Show basic widget',
    );

    function toggle(): void {
      emit('update:mode', props.mode === 'Basic' ? 'Full' : 'Basic');
    }

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
          widgetId: props.widgetId,
        },
      });
    }

    return {
      widget,
      featureTitle,
      showDialog,
      title,
      toggleIcon,
      toggleTooltip,
      toggle,
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
        v-if="!!mode"
        flat
        dense
        round
        :icon="toggleIcon"
        @click="toggle"
      >
        <q-tooltip>
          {{ toggleTooltip }}
        </q-tooltip>
      </q-btn>
      <q-btn flat icon="mdi-launch" dense round @click="showDialog">
        <q-tooltip>
          Show in dialog
        </q-tooltip>
      </q-btn>
      <ActionMenu dense round>
        <template #actions>
          <slot name="actions" />
        </template>
        <template #menus>
          <slot name="menus">
            <WidgetActions :widget-id="widgetId" />
          </slot>
        </template>
      </ActionMenu>
    </template>
  </Toolbar>
</template>
