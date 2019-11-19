<script lang="ts">
import shortid from 'shortid';
import { Component } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { deepCopy } from '@/helpers/units/parseObject';
import { typeName as graphType } from '@/plugins/history/Graph/getters';
import { dashboardStore } from '@/store/dashboards';

import { GraphConfig } from '../types';
import { Session } from './types';


@Component
export default class SessionCreateDialog extends DialogBase {
  sessionId = shortid.generate();
  sessionName = 'Brew session ' + new Date().toLocaleDateString();
  importGraph: SelectOption | null = null;

  get graphOpts(): SelectOption[] {
    return dashboardStore.widgetValues
      .filter(widget => widget.feature === graphType)
      .map(widget => ({
        label: `[${dashboardStore.dashboardById(widget.dashboard).title}] ${widget.title}`,
        value: widget.id,
      }));
  }

  get graphCfg(): GraphConfig {
    if (this.importGraph) {
      const cfg: GraphConfig = deepCopy(
        dashboardStore.persistentWidgetById(this.importGraph.value)
          .config);
      return {
        ...cfg,
        layout: { title: this.sessionName },
      };
    }
    return {
      layout: { title: this.sessionName },
      params: {},
      targets: [],
      renames: {},
      axes: {},
      colors: {},
    };
  }

  createSession(): void {
    const session: Session = {
      id: this.sessionId,
      name: this.sessionName,
      hidden: false,
      start: null,
      end: null,
      notes: '',
      graphCfg: this.graphCfg,
    };
    this.onDialogOk(session);
  }

}
</script>


<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="createSession"
  >
    <q-card class="q-dialog-plugin q-dialog-plugin--dark">
      <q-card-section class="q-dialog__title">
        Create new session
      </q-card-section>
      <q-card-section class="q-dialog__message scroll">
        Pick a name for your new Session. <br />
        If you want, you can import configuration from a Graph Widget.
      </q-card-section>
      <q-card-section class="scroll">
        <q-input v-model="sessionName" label="Session name" />
        <q-select
          v-model="importGraph"
          :options="graphOpts"
          label="Import from Graph"
          clearable
          autofocus
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="createSession" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
