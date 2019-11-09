<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { Unit } from '@/helpers/units';
import { blockTypes } from '@/plugins/spark/block-types';

import { stepperStore } from '../store';
import { Process, ProcessStep, Runtime, StepperConfig } from '../types';


const lipsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Suspendisse iaculis sit amet ligula eget fermentum.
            Nunc pharetra, sapien eget rutrum suscipit, eros nisi semper ante,
            at consectetur elit lectus vitae tortor.
            Duis id ipsum ac elit viverra interdum. Aenean finibus risus ut iaculis porta.
            Aenean mollis, orci vel egestas aliquam, diam augue imperdiet orci,
            consectetur vestibulum diam velit in magna.
            Curabitur pulvinar, metus et lacinia sodales,
            sem quam finibus risus, a dignissim nisl enim vitae libero.
            In eget enim ipsum. Cras elementum nisl ac mauris dignissim,
            quis laoreet neque aliquam. Integer lacinia fermentum lectus sit amet ultrices.`;


@Component
export default class StepperWidget extends WidgetBase<StepperConfig> {
  get processes(): Process[] {
    return stepperStore.processValues;
  }

  get runtimes(): Runtime[] {
    return stepperStore.runtimeValues;
  }

  conditionsString(runtime: Runtime | null): string {
    if (runtime === null || runtime.conditions === undefined) {
      return 'No active status';
    }
    const numOk = runtime.conditions.filter(Boolean).length;
    return `${numOk} / ${runtime.conditions.length} conditions satisfied`;
  }

  stepOptions(process: Process): SelectOption[] {
    return process.steps.map(s => ({ label: s.title, value: s.id }));
  }

  async start(process: Process): Promise<void> {
    await stepperStore.startRuntime(process);
  }

  async advance(runtime: Runtime): Promise<void> {
    await stepperStore.advanceRuntime(runtime);
  }

  async stop(runtime: Runtime): Promise<void> {
    await stepperStore.stopRuntime(runtime);
  }

  async remove(process: Process): Promise<void> {
    await stepperStore.removeProcess(process);
  }

  startEditor(): void {
    createDialog({
      component: 'StepperEditor',
      parent: this,
    });
  }

  async clear(): Promise<void> {
    for (const process of stepperStore.processValues) {
      await stepperStore.removeProcess(process);
    }
  }

  async make(): Promise<void> {
    const mkSteps = (): ProcessStep[] => ([
      {
        id: uid(),
        title: 'step-one',
        enabled: true,
        actions: [
          {
            id: uid(),
            enabled: true,
            type: 'BlockPatch',
            opts: {
              block: 'sensor-1',
              service: 'sparkey',
              type: blockTypes.TempSensorMock,
              data: {
                value: new Unit(5, 'degC'),
              },
            },
          },
          {
            id: uid(),
            enabled: true,
            type: 'BlockPatch',
            opts: {
              block: 'sensor-1',
              service: 'sparkey',
              type: blockTypes.TempSensorMock,
              data: {
                value: new Unit(5, 'degC'),
              },
            },
          },
        ],
        conditions: [
          {
            id: uid(),
            enabled: true,
            type: 'BlockValue',
            opts: {
              block: 'sensor-1',
              service: 'sparkey',
              type: blockTypes.TempSensorMock,
              key: 'value[degC]',
              operator: 'ge',
              value: 10,
            },
          },
          {
            id: uid(),
            enabled: true,
            type: 'TimeAbsolute',
            opts: {
              time: 1572342354937,
            },
          },
          {
            id: uid(),
            enabled: true,
            type: 'TimeElapsed',
            opts: {
              duration: 12345,
            },
          },
        ],
        notes: [
          {
            id: uid(),
            title: 'Important Notification',
            message: lipsum,
          },
          {
            id: uid(),
            title: 'Important Notification',
            message: lipsum,
          },

        ],
      },
      {
        id: uid(),
        title: 'step-two',
        enabled: true,
        actions: [
          {
            id: uid(),
            enabled: true,
            type: 'BlockPatch',
            opts: {
              block: 'sensor-1',
              service: 'sparkey',
              type: blockTypes.TempSensorMock,
              data: {
                value: new Unit(5, 'degC'),
              },
            },
          },
        ],
        conditions: [
          {
            id: uid(),
            enabled: true,
            type: 'BlockValue',
            opts: {
              block: 'sensor-1',
              service: 'sparkey',
              type: blockTypes.TempSensorMock,
              key: 'value[degC]',
              operator: 'ge',
              value: 10,
            },
          },
        ],
        notes: [
          {
            id: uid(),
            title: 'Important Notification',
            message: lipsum,
          },
        ],
      },
    ]);

    stepperStore.createProcess({
      id: uid(),
      title: 'Test Process',
      steps: [
        ...mkSteps(),
        ...mkSteps(),
        ...mkSteps(),
      ],
    });
  }
}
</script>

<template>
  <q-card dark :class="cardClass">
    <component :is="toolbarComponent" :crud="crud">
      <template #actions>
        <ActionItem icon="settings" label="Editor" @click="startEditor" />
        <ActionItem icon="add" label="New" @click="make" />
        <ActionItem icon="delete" label="Clear" @click="clear" />
        <WidgetActions :crud="crud" />
      </template>
    </component>

    <!-- <WidgetToolbar :crud="crud">
      <q-item-section side>
        <q-btn
          unelevated
          color="primary"
          label="Editor"
          @click="startEditor"
        />
      </q-item-section>
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="showDialog(null)">
          <q-list dark bordered>
            <ActionItem icon="add" label="New" @click="make" />
            <ActionItem icon="refresh" label="Refresh" @click="fetch" />
            <WidgetActions :crud="crud" />
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar> -->
    <q-card-section v-for="process in processes" :key="process.id">
      <q-item dark>
        <q-item-section>{{ process.title }}</q-item-section>
      </q-item>
    </q-card-section>

    <!-- <q-card-section v-for="group in groups" :key="group.id">
      <q-item dark class="row no-wrap">
        <q-item-section>
          <template v-if="group.runtime">
            <q-select
              :label="group.process.title"
              :value="group.current.index"
              :options="stepOptions(group.process)"
              emit-value
              map-options
              dark
              options-dark
            >
              <template #no-option>
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
              <template v-if="group.runtime">
                <div class="col-auto">
                  {{ conditionsString(group.runtime) }}
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
            {{ group.process.title }}
            <q-tooltip class="column">
              <div v-for="(step, idx) in group.process.steps" :key="`${group.id}-step-${idx}`" class="col-auto">
                {{ step.name }}
              </div>
            </q-tooltip>
          </template>
        </q-item-section>
        <template v-if="group.runtime">
          <q-item-section class="col-auto">
            <q-btn flat icon="mdi-format-list-checks">
              <q-tooltip>{{ conditionsString(group.runtime) }}</q-tooltip>
            </q-btn>
          </q-item-section>
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
            <q-btn flat icon="edit">
              <q-tooltip>Edit Process</q-tooltip>
            </q-btn>
          </q-item-section>
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
    </q-card-section> -->
  </q-card>
</template>
