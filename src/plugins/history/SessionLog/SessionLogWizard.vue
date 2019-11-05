<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';

import { emptyGraphConfig } from '../getters';
import { SessionLogConfig } from './types';


@Component
export default class SessionLogWizard extends WidgetWizardBase {
  createWidget(): void {
    const sessionId = uid();
    const config: SessionLogConfig = {
      currentSession: sessionId,
      sessions: [
        {
          id: sessionId,
          title: 'New Session',
          date: new Date().getTime(),
          notes: [
            {
              id: uid(),
              title: 'Text note',
              type: 'Text',
              value: '',
              col: 12,
            },
            {
              id: uid(),
              title: 'Graph note',
              type: 'Graph',
              start: null,
              end: null,
              config: emptyGraphConfig(),
              col: 12,
            },
          ],
        },
      ],
    };
    this.createItem({
      id: this.widgetId,
      title: this.widgetTitle,
      feature: this.typeId,
      dashboard: this.dashboardId,
      order: 0,
      config,
      ...this.defaultWidgetSize,
    });
  }

  mounted(): void {
    this.widgetTitle = this.typeDisplayName;
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-input v-model="widgetTitle" dark label="Widget name" />
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back" />
      <q-btn unelevated label="Create" color="primary" @click="createWidget" />
    </q-card-actions>
  </div>
</template>
