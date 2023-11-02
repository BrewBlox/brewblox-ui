<script setup lang="ts">
import {
  DEFAULT_SIZE,
  MAX_SIZE,
  MIN_SIZE,
  WIDGET_KEY,
  WIDGET_TYPE,
} from '../blueprints/SessionLogDisplay';
import { usePart, useSettingsWidget } from '../composables';
import { useHistoryStore } from '@/plugins/history/store';
import { LoggedSession } from '@/plugins/history/types';
import { computed } from 'vue';

const historyStore = useHistoryStore();
const { width, height, bordered, placeholder } = usePart.setup();
const { widgetId, widget, isBroken, showWidgetDialog, showWidgetSelectDialog } =
  useSettingsWidget.setup(WIDGET_KEY, WIDGET_TYPE);

const available = computed<boolean>(() => widget.value != null);

const session = computed<LoggedSession | null>(() =>
  widget.value?.config.currentSession
    ? historyStore.sessionById(widget.value.config.currentSession)
    : null,
);

const displayText = computed<string>(() =>
  widgetId.value ? session.value?.title ?? 'no active session' : 'Not linked',
);
</script>

<template>
  <svg v-bind="{ width, height }">
    <BrokenSvgIcon
      v-if="isBroken"
      :x="width / 2 - 20"
    />
    <UnlinkedSvgIcon
      v-else-if="!available && !placeholder"
      :x="width / 2 - 20"
    />
    <template v-else>
      <foreignObject
        v-if="width > 50"
        x="0"
        y="5"
        :width="width"
        :height="height - 5"
      >
        <div
          class="fit builder-text"
          style="font-size: 130%"
        >
          {{ displayText }}
        </div>
      </foreignObject>
      <SessionSvgIcon v-else />
    </template>
    <BuilderBorder
      v-if="bordered"
      v-bind="{ width, height }"
    />
    <BuilderInteraction
      v-bind="{ width, height }"
      @interact="showWidgetDialog"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <WidgetMenuContent
            :available="available"
            @show="showWidgetDialog"
            @assign="showWidgetSelectDialog"
          />
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
          <ToggleMenuContent
            v-model="bordered"
            label="Border"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
