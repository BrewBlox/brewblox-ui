<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext, useWidget } from '@/composables';
import { startChangeWidgetTitle } from '@/utils/widgets';


export default defineComponent({
  name: 'DialogWidgetToolbar',
  props: {
    hasModeToggle: {
      type: Boolean,
      default: false,
    },
    changeTitleFn: {
      type: Function,
      default: null,
    },
  },
  setup(props) {
    const {
      context,
      toggleMode,
    } = useContext.setup();
    const {
      widget,
      featureTitle,
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

    function changeTitle(): void {
      if (props.changeTitleFn) {
        props.changeTitleFn();
      }
      else {
        startChangeWidgetTitle(widget.value);
      }
    }

    return {
      widget,
      featureTitle,
      toggleBtnIcon,
      toggleBtnTooltip,
      toggleMode,
      changeTitle,
    };
  },
});
</script>

<template>
  <DialogToolbar
    :title="widget.title"
    :subtitle="featureTitle"
    :change-title-fn="changeTitle"
    v-bind="$attrs"
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
