<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { Unit } from '@/helpers/units';

import { stepperStore } from '../store';
import { Process, Runtime, RuntimeResult, RuntimeStatus } from '../types';

interface ProcessGroup {
  id: string;
  process: Process;
  runtime: Runtime | null;
  status: RuntimeStatus | null;
  current: RuntimeResult | null;
}


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

  get groups(): ProcessGroup[] {
    return stepperStore.processValues
      .map(process => {
        const runtime = stepperStore.runtimes[process.id] || null;
        const current = runtime
          ? runtime.results[runtime.results.length - 1]
          : {
            name: '<No active step>',
            index: -1,
            start: null,
            end: null,
            logs: [],
          };
        return {
          id: process.id,
          process,
          runtime,
          current,
          status: stepperStore.statuses[process.id] || null,
        };
      });
  }

  conditionsString(status: RuntimeStatus): string {
    const numOk = status.conditions.filter(Boolean).length;
    return `${numOk} / ${status.conditions.length} conditions satisfied`;
  }

  stepOptions(process: Process): SelectOption[] {
    return process.steps.map((s, idx) => ({ label: s.name, value: idx }));
  }

  fetch(): void {
    stepperStore.fetchAll();
  }

  async start(process: Process): Promise<void> {
    await stepperStore.startProcess(process);
    await stepperStore.fetchRuntime(process);
    await stepperStore.fetchStatus(process);
  }

  async advance(runtime: Runtime): Promise<void> {
    await stepperStore.advanceProcess(runtime);
  }

  async stop(runtime: Runtime): Promise<void> {
    await stepperStore.exitProcess(runtime);
  }

  async remove(process: Process): Promise<void> {
    await stepperStore.removeProcess(process);
  }

  make(): void {
    stepperStore.createProcess({
      id: 'test-process',
      steps: [
        {
          name: 'step-one',
          actions: [
            {
              type: 'BlockPatch',
              opts: {
                block: 'sensor-1',
                service: 'sparkey',
                data: {
                  value: new Unit(5, 'degC'),
                },
              },
            },
          ],
          responses: [],
          conditions: [
            {
              type: 'BlockValue',
              opts: {
                block: 'sensor-1',
                service: 'sparkey',
                key: 'value[degC]',
                operator: 'ge',
                value: 10,
              },
            },
          ],
        },
        {
          name: 'step-two',
          actions: [
            {
              type: 'BlockPatch',
              opts: {
                block: 'sensor-1',
                service: 'sparkey',
                data: {
                  value: new Unit(5, 'degC'),
                },
              },
            },
          ],
          responses: [],
          conditions: [
            {
              type: 'BlockValue',
              opts: {
                block: 'sensor-1',
                service: 'sparkey',
                key: 'value[degC]',
                operator: 'ge',
                value: 10,
              },
            },
          ],
        },
      ],
    });
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
            <ActionItem icon="add" label="New" @click="make" />
            <ActionItem icon="refresh" label="fetch" @click="fetch" />
            <WidgetActions :crud="crud" />
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>
    <q-card-section v-for="group in groups" :key="group.id">
      <q-item dark>
        <q-item-section>
          <template v-if="group.runtime">
            <q-select
              :label="group.id"
              :value="group.current.index"
              :options="stepOptions(group.process)"
              emit-value
              map-options
              dark
              options-dark
            >
              <template v-slot:no-option>
                <q-item dark>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-tooltip class="column">
              <div class="col-auto">
                Step started at {{
                  group.current.start
                    ? new Date(group.current.start).toLocaleString()
                    : '---'
                }}
              </div>
              <template v-if="group.status && group.status.conditions.length">
                <div class="col-auto">
                  {{ conditionsString(group.status) }}
                </div>
              </template>
              <template v-if="group.current.logs.length">
                <div class="col-auto">
                  Results:
                </div>
                <div v-for="(log, idx) in group.current.logs" :key="`${group.id}-log-${idx}`" class="col-auto">
                  - {{ log }}
                </div>
              </template>
            </q-tooltip>
          </template>
          <template v-else>
            {{ group.id }}
            <q-tooltip class="column">
              <div v-for="(step, idx) in group.process.steps" :key="`${group.id}-step-${idx}`" class="col-auto">
                {{ step.name }}
              </div>
            </q-tooltip>
          </template>
        </q-item-section>
        <template v-if="group.runtime">
          <q-item-section class="col-auto">
            <q-btn
              :disable="group.current.index + 1 >= group.process.steps.length"
              flat
              icon="mdi-skip-next"
              @click="advance(group.runtime)"
            />
            <q-tooltip>Next Step</q-tooltip>
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn flat icon="mdi-stop" @click="stop(group.runtime)" />
            <q-tooltip>Stop Process</q-tooltip>
          </q-item-section>
        </template>
        <template v-else>
          <q-item-section class="col-auto">
            <q-btn flat icon="mdi-play" @click="start(group.process)" />
            <q-tooltip>Start Proces</q-tooltip>
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn flat icon="delete" @click="remove(group.process)" />
            <q-tooltip>Remove Process</q-tooltip>
          </q-item-section>
        </template>
      </q-item>
    </q-card-section>
  </q-card>
</template>
