<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';

import { stepperStore } from '../store';
import { Process, Runtime, RuntimeStatus } from '../types';


@Component
export default class StepperWidget extends WidgetBase {
  get processes(): Process[] {
    return stepperStore.processValues;
  }

  get runtimes(): Runtime[] {
    return stepperStore.runtimeValues;
  }

  get statuses(): RuntimeStatus[] {
    return stepperStore.statusValues;
  }

  fetch(): void {
    stepperStore.fetchAll();
  }

  fetchRuntime(runtime: Runtime): void {
    stepperStore.fetchRuntime(runtime);
    stepperStore.fetchStatus(runtime);
  }

  fetchStatus(status: RuntimeStatus): void {
    stepperStore.fetchStatus(status);
  }

  async start(process: Process): Promise<void> {
    await stepperStore.startProcess(process);
    await stepperStore.fetchRuntime(process);
  }

  created(): void {
    this.fetch();
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <WidgetToolbar :title="widget.title" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="openModal(null)">
          <q-list dark bordered>
            <WidgetActions :crud="crud" />
            <ActionItem icon="refresh" label="fetch" @click="fetch" />
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>
    <q-card-section>
      <q-item v-for="item in processes" :key="'proc' + item.id" dark clickable @click="start(item)">
        {{ JSON.stringify(item) }}
      </q-item>
      <q-separator dark />
      <q-item v-for="item in runtimes" :key="'rt' + item.id" dark clickable @click="fetchRuntime(item)">
        {{ JSON.stringify(item) }}
      </q-item>
      <q-separator dark />
      <q-item v-for="item in statuses" :key="'st' + item.id" dark clickable @click="fetchStatus(item)">
        {{ JSON.stringify(item) }}
      </q-item>
    </q-card-section>
  </q-card>
</template>
