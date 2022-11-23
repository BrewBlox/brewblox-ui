<script lang="ts">
// import type { SessionLogWidget } from '@/plugins/history/SessionLog/types';
import { useHistoryStore } from '@/plugins/history/store';
import { LoggedSession } from '@/plugins/history/types';
import { useWidgetStore, Widget } from '@/store/widgets';
import { mdiTextSubject } from '@quasar/extras/mdi-v5';
import { computed, defineComponent, PropType } from 'vue';
import { WIDGET_KEY } from '../blueprints/SessionLogDisplay';
import { usePart } from '../composables';
import { FlowPart } from '../types';
import { coord2grid } from '../utils';

export default defineComponent({
  name: 'SessionLogDisplayPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const widgetStore = useWidgetStore();
    const historyStore = useHistoryStore();
    const { sizeX, sizeY, bordered } = usePart.setup(props.part);

    const dimensions = computed(() => ({
      width: coord2grid(sizeX.value),
      height: coord2grid(sizeY.value),
    }));

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

    return {
      mdiTextSubject,
      dimensions,
      bordered,
      isLinked,
      isBroken,
      displayText,
    };
  },
});
</script>

<template>
  <g>
    <g class="content">
      <BrokenSvgIcon
        v-if="isBroken"
        :x="dimensions.width / 2 - 20"
      />
      <UnlinkedSvgIcon
        v-else-if="!isLinked"
        :x="dimensions.width / 2 - 20"
      />
      <template v-else>
        <foreignObject
          v-if="dimensions.width > 50"
          x="0"
          y="5"
          :width="dimensions.width"
          :height="dimensions.height - 5"
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
        :width="dimensions.width - 2"
        :height="dimensions.height - 2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
