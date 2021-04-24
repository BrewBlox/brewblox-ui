<script lang="ts">
import { mdiTextSubject } from '@quasar/extras/mdi-v5';
import { computed, defineComponent, PropType } from 'vue';

// import type { SessionLogWidget } from '@/plugins/history/SessionLog/types';
import { historyStore } from '@/plugins/history/store';
import { LoggedSession } from '@/plugins/history/types';
import { Widget, widgetStore } from '@/store/widgets';

import { usePart } from '../composables';
import { WIDGET_KEY } from '../specs/SessionLogDisplay';
import { FlowPart } from '../types';
import { squares, textTransformation } from '../utils';

export default defineComponent({
  name: 'SessionLogDisplay',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const {
      sizeX,
      sizeY,
      bordered,
    } = usePart.setup(props.part);

    const isLinked = computed<boolean>(
      () => Boolean(props.part.settings[WIDGET_KEY]),
    );

    const widget = computed<Widget | null>( // TODO(Bob)
      () => widgetStore.widgetById(props.part.settings[WIDGET_KEY]),
    );

    const isBroken = computed<boolean>(
      () => isLinked.value && !widget.value,
    );

    const session = computed<LoggedSession | null>(
      () => widget.value?.config.currentSession
        ? historyStore.sessionById(widget.value.config.currentSession)
        : null,
    );

    const displayText = computed<string>(
      () => isLinked.value
        ? (session.value?.title ?? 'no active session')
        : 'Not linked',
    );

    return {
      mdiTextSubject,
      squares,
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
    <SvgEmbedded
      :width="squares(sizeX)"
      :height="squares(sizeY)"
    >
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
        :width="squares(sizeX)-2"
        :height="squares(sizeY)-2"
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
        :x2="squares(sizeX)-10"
        :y2="squares(sizeY)-10"
      />
    </g>
  </g>
</template>
