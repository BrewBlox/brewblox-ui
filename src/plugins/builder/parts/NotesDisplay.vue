<script lang="ts">
import { Component } from 'vue-property-decorator';

import { SessionNote, SessionNotesConfig } from '@/plugins/history/SessionNotes/types';
import { dashboardStore, PersistentWidget } from '@/store/dashboards';

import PartBase from '../components/PartBase';

@Component
export default class NotesDisplay extends PartBase {
  get widget(): PersistentWidget<SessionNotesConfig> | null {
    if (!this.settings.widgetId) { return null; }
    return dashboardStore.persistentWidgetById(this.settings.widgetId);
  }

  get notes(): SessionNote[] {
    if (!this.widget) { return []; }
    return this.widget.config.notes;
  }
}
</script>

<template>
  <g>
    <foreignObject :transform="textTransformation([sizeX, sizeY])" :width="squares(sizeX)" :height="squares(sizeY)">
      <div style="width: 100%; height: 100%" class="q-pa-sm">
        <template v-if="widget">
          <div class="text-center">
            <b>{{ widget.title.slice(0, 5*sizeX) }}</b>
          </div>
          <div v-for="note in notes" :key="note.id" class="q-mb-sm">
            <i><b>{{ note.title.slice(0, 5*sizeX) }}{{ note.title.length > 5*sizeX ? '...' : '' }}</b></i>
            <br />
            <template v-if="note.value !== null">
              {{ note.value.slice(0, 6*sizeX) }}{{ note.value.length > 6*sizeX ? '...' : '' }}
            </template>
            <template v-else>
              ---
            </template>
          </div>
        </template>
        <template v-else>
          <div class="text-center">
            <b>Notes</b> <br />
            (not linked)
          </div>
        </template>
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
    </g>
  </g>
</template>
