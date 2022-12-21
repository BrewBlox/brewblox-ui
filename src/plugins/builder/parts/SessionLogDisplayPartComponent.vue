<script lang="ts">
// import type { SessionLogWidget } from '@/plugins/history/SessionLog/types';
import { useHistoryStore } from '@/plugins/history/store';
import { LoggedSession } from '@/plugins/history/types';
import { useWidgetStore, Widget } from '@/store/widgets';
import { mdiTextSubject } from '@quasar/extras/mdi-v5';
import { computed, defineComponent } from 'vue';
import { WIDGET_KEY } from '../blueprints/SessionLogDisplay';
import { usePart } from '../composables';
import { showLinkedWidgetDialog } from '../utils';

export default defineComponent({
  name: 'SessionLogDisplayPartComponent',
  setup() {
    const widgetStore = useWidgetStore();
    const historyStore = useHistoryStore();
    const { part, settings, width, height, bordered } = usePart.setup();

    const isLinked = computed<boolean>(() =>
      Boolean(settings.value[WIDGET_KEY]),
    );

    const widget = computed<Widget | null>(() =>
      widgetStore.widgetById(settings.value[WIDGET_KEY]),
    );

    const isBroken = computed<boolean>(() => isLinked.value && !widget.value);

    const session = computed<LoggedSession | null>(() =>
      widget.value?.config.currentSession
        ? historyStore.sessionById(widget.value.config.currentSession)
        : null,
    );

    const displayText = computed<string>(() =>
      isLinked.value
        ? session.value?.title ?? 'no active session'
        : 'Not linked',
    );

    function showWidget(): void {
      showLinkedWidgetDialog(part.value, WIDGET_KEY);
    }

    return {
      mdiTextSubject,
      width,
      height,
      bordered,
      isLinked,
      isBroken,
      displayText,
      showWidget,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <g class="content">
      <BrokenSvgIcon
        v-if="isBroken"
        :x="width / 2 - 20"
      />
      <UnlinkedSvgIcon
        v-else-if="!isLinked"
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
    </g>
    <BuilderBorder
      v-if="bordered"
      v-bind="{ width, height }"
    />
    <BuilderInteraction
      v-bind="{ width, height }"
      @interact="showWidget"
    />
  </svg>
</template>
