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
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const widgetStore = useWidgetStore();
    const historyStore = useHistoryStore();
    const { bordered } = usePart.setup(props.part);

    const isLinked = computed<boolean>(() =>
      Boolean(props.part.settings[WIDGET_KEY]),
    );

    const widget = computed<Widget | null>(() =>
      // TODO(Bob)
      widgetStore.widgetById(props.part.settings[WIDGET_KEY]),
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

    function interact(): void {
      showLinkedWidgetDialog(props.part, WIDGET_KEY);
    }

    return {
      mdiTextSubject,
      bordered,
      isLinked,
      isBroken,
      displayText,
      interact,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    class="interaction"
    @click="interact"
  >
    <rect class="interaction-background" />
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

    <g class="outline">
      <rect
        v-show="bordered"
        :width="width - 2"
        :height="height - 2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </svg>
</template>
