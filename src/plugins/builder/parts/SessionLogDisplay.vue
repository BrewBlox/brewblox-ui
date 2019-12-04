<script lang="ts">
import { Component } from 'vue-property-decorator';

import { SessionLogWidget } from '@/plugins/history/SessionLog/types';
import { historyStore } from '@/plugins/history/store';
import { LoggedSession } from '@/plugins/history/types';
import { dashboardStore } from '@/store/dashboards';

import PartBase from '../components/PartBase';

@Component
export default class SessionLogDisplay extends PartBase {
  get isLinked(): boolean {
    return !!this.settings.widgetId;
  }

  get isBroken(): boolean {
    return this.isLinked
      && !dashboardStore.widgetIds.includes(this.settings.widgetId);
  }

  get widget(): SessionLogWidget | null {
    return this.isLinked && !this.isBroken
      ? dashboardStore.persistentWidgetById(this.settings.widgetId)
      : null;
  }

  get session(): LoggedSession | null {
    return this.widget && this.widget.config.currentSession
      ? historyStore.sessionById(this.widget.config.currentSession)
      : null;
  }
}
</script>

<template>
  <g>
    <foreignObject

      :transform="textTransformation([sizeX, sizeY])"
      :width="squares(sizeX)"
      :height="squares(sizeY)"
    >
      <div class="full-width full-height row">
        <div class="col-auto" :style="`min-width: ${squares(1)}px`">
          <q-icon v-if="isBroken" name="mdi-alert-circle-outline" color="negative" size="lg" class="maximized" />
          <q-icon v-else name="mdi-text-subject" size="lg" class="maximized" />
        </div>

        <template v-if="sizeX === 1" />
        <div v-else-if="!isLinked" class="col text-h6 q-mt-sm ellipsis">
          Not linked
        </div>
        <div v-else class="col text-h6 q-mt-sm ellipsis">
          {{ session ? session.title : 'No active session' }}
        </div>
      </div>
    </foreignObject>
    <g class="outline">
      <rect
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
        :transform="textTransformation([sizeX, sizeY])"
        x1="10"
        y1="10"
        :x2="squares(sizeX)-10"
        :y2="squares(sizeY)-10"
      />
    </g>
  </g>
</template>
