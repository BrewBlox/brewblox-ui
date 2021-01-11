<script lang="ts">
import { mdiTextSubject } from '@quasar/extras/mdi-v5';
import { Component } from 'vue-property-decorator';

import { SessionLogWidget } from '@/plugins/history/SessionLog/types';
import { historyStore } from '@/plugins/history/store';
import { LoggedSession } from '@/plugins/history/types';
import { dashboardStore } from '@/store/dashboards';

import PartBase from '../components/PartBase';

@Component
export default class SessionLogDisplay extends PartBase {
  icons: Mapped<string> = {};

  created(): void {
    this.icons.mdiTextSubject = mdiTextSubject;
  }

  get isLinked(): boolean {
    return !!this.settings.widgetId;
  }

  get isBroken(): boolean {
    return this.isLinked
      && !dashboardStore.widgetIds.includes(this.settings.widgetId);
  }

  get widget(): SessionLogWidget | null {
    return this.isLinked && !this.isBroken
      ? dashboardStore.widgetById(this.settings.widgetId)
      : null;
  }

  get session(): LoggedSession | null {
    return this.widget && this.widget.config.currentSession
      ? historyStore.sessionById(this.widget.config.currentSession)
      : null;
  }

  get displayText(): string {
    if (!this.isLinked) {
      return 'Not linked';
    }
    return this.session?.title ?? 'No active session';
  }
}
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
          :name="icons.mdiTextSubject"
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
        :transform="textTransformation([sizeX, sizeY])"
        x1="10"
        y1="10"
        :x2="squares(sizeX)-10"
        :y2="squares(sizeY)-10"
      />
    </g>
  </g>
</template>
