<script lang="ts">
import { mdiTextSubject } from '@quasar/extras/mdi-v5';
import { computed, defineComponent, PropType } from 'vue';

// import type { SessionLogWidget } from '@/plugins/history/SessionLog/types';
import { useHistoryStore } from '@/plugins/history/store';
import { LoggedSession } from '@/plugins/history/types';
import { useWidgetStore, Widget } from '@/store/widgets';

import { usePart } from '../composables';
import { WIDGET_KEY } from '../specs/SessionLogDisplay';
import { FlowPart } from '../types';
import { coord2grid, textTransformation } from '../utils';

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
      coord2grid,
      textTransformation,
      sizeX,
      sizeY,
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
    <SvgEmbedded :width="coord2grid(sizeX)" :height="coord2grid(sizeY)">
      <div class="col row no-wrap items-center q-pa-sm full-width">
        <BrokenIcon v-if="isBroken" />
        <q-icon
          v-else
          :name="mdiTextSubject"
          size="40px"
          class="col-auto static"
        />

        <div
          v-if="sizeX >= 1"
          class="col text-center ellipsis"
          style="font-size: 130%"
        >
          {{ displayText }}
        </div>
      </div>
    </SvgEmbedded>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="coord2grid(sizeX) - 2"
        :height="coord2grid(sizeY) - 2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
      <line
        v-if="!isLinked && sizeX === 1"
        :transform="textTransformation(part, part.size)"
        x1="10"
        y1="10"
        :x2="coord2grid(sizeX) - 10"
        :y2="coord2grid(sizeY) - 10"
      />
    </g>
  </g>
</template>
