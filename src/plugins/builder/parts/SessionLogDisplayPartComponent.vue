<script lang="ts">
// import type { SessionLogWidget } from '@/plugins/history/SessionLog/types';
import { useHistoryStore } from '@/plugins/history/store';
import { LoggedSession } from '@/plugins/history/types';
import { useWidgetStore, Widget } from '@/store/widgets';
import { mdiTextSubject } from '@quasar/extras/mdi-v5';
import { computed, defineComponent } from 'vue';
import {
  DEFAULT_SIZE_X,
  DEFAULT_SIZE_Y,
  WIDGET_KEY,
} from '../blueprints/SessionLogDisplay';
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
      DEFAULT_SIZE_X,
      DEFAULT_SIZE_Y,
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
    <BuilderBorder
      v-if="bordered"
      v-bind="{ width, height }"
    />
    <BuilderInteraction
      v-bind="{ width, height }"
      @interact="showWidget"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <!-- TODO(Bob) select widget -->
          <SizeMenuContent
            :min="{ width: 1, height: 1 }"
            :max="{ width: 10, height: 1 }"
            :default="{ width: DEFAULT_SIZE_X, height: DEFAULT_SIZE_Y }"
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
