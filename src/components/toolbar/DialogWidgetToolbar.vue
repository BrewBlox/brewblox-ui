<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { useWidget } from '@/composables';
import { WidgetMode } from '@/store/features';

export default defineComponent({
  name: 'DialogWidgetToolbar',
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

    return {
      widget,
      featureTitle,
      toggleIcon,
      toggleTooltip,
      toggle,
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
        v-if="!!mode"
        :icon="toggleIcon"
        flat
        dense
        round
        @click="toggle"
      >
        <q-tooltip>
          {{ toggleTooltip }}
        </q-tooltip>
      </q-btn>
      <ActionMenu round dense>
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
  </DialogToolbar>
</template>
