<script setup lang="ts">
import { computed, ref } from 'vue';
import { useContext, useWidget } from '@/composables';
import Toolbar from './Toolbar.vue';

defineProps({
  hasModeToggle: {
    type: Boolean,
    default: false,
  },
});

const { inDialog, context, toggleMode } = useContext.setup();
const { widget, featureTitle, changeWidgetTitle } = useWidget.setup();
const dialogActive = ref(false);

const toggleBtnIcon = computed<string>(() =>
  context.mode === 'Basic'
    ? 'mdi-unfold-more-horizontal'
    : 'mdi-unfold-less-horizontal',
);

const toggleBtnTooltip = computed<string>(() =>
  context.mode === 'Basic' ? 'Show full widget' : 'Show basic widget',
);
</script>

<template>
  <Toolbar
    :title="widget.title"
    :subtitle="featureTitle"
    :change-title-fn="changeWidgetTitle"
  >
    <InlineWidgetDialog v-model:active="dialogActive" />
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
        @click="dialogActive = true"
      >
        <q-tooltip> Show in dialog </q-tooltip>
      </q-btn>
      <ActionMenu
        round
        dense
      >
        <template
          v-if="!!$slots.actions"
          #actions
        >
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
