<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext, useWidget } from '@/composables';
import { createDialog, startChangeWidgetTitle } from '@/utils';

import Toolbar from './Toolbar.vue';

export default defineComponent({
  name: 'WidgetToolbar',
  components: {
    Toolbar,
  },
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
      inDialog,
      context,
      toggleMode,
    } = useContext.setup();
    const {
      widgetId,
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

    function showDialog(): void {
      createDialog({
        component: 'WidgetDialog',
        componentProps: {
          widgetId,
        },
      });
    }

    function changeTitle(): void {
      if (props.changeTitleFn) {
        props.changeTitleFn();
      }
      else {
        startChangeWidgetTitle(widget.value);
      }
    }

    return {
      inDialog,
      widget,
      featureTitle,
      toggleBtnIcon,
      toggleBtnTooltip,
      toggleMode,
      showDialog,
      changeTitle,
    };
  },
});
</script>

<template>
  <Toolbar
    :title="widget.title"
    :subtitle="featureTitle"
    :change-title-fn="changeTitle"
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
      <q-btn
        v-if="!inDialog"
        icon="mdi-launch"
        flat
        dense
        round
        @click="showDialog"
      >
        <q-tooltip>
          Show in dialog
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
  </Toolbar>
</template>
