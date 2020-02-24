<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { Unit } from '@/helpers/units';
import { blockTypes } from '@/plugins/spark/block-types';

import { automationStore } from './store';
import { AutomationConfig, AutomationStep, AutomationTemplate } from './types';


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
export default class AutomationWidget extends WidgetBase<AutomationConfig> {
  get templates(): AutomationTemplate[] {
    return automationStore.templateValues;
  }

  startEditor(): void {
    this.$router.push('/automation');
  }

  async clear(): Promise<void> {
    for (const template of automationStore.templateValues) {
      await automationStore.removeTemplate(template);
    }
  }

  async make(): Promise<void> {
    const mkSteps = (): AutomationStep[] => ([
      {
        id: uid(),
        title: 'step-one',
        enabled: true,
        actions: [
          {
            id: uid(),
            title: 'sensor to 5 C',
            enabled: true,
            impl: {
              type: 'BlockPatch',
              blockId: 'sensor-1',
              serviceId: 'sparkey',
              blockType: blockTypes.TempSensorMock,
              data: {
                value: new Unit(5, 'degC'),
              },
            },
          },
          {
            id: uid(),
            title: 'sensor to 5 C',
            enabled: true,
            impl: {
              type: 'BlockPatch',
              blockId: 'sensor-1',
              serviceId: 'sparkey',
              blockType: blockTypes.TempSensorMock,
              data: {
                value: new Unit(5, 'degC'),
              },
            },
          },
          {
            id: uid(),
            enabled: true,
            title: 'Create task-one',
            impl: {
              type: 'TaskCreate',
              ref: 'task-one',
              title: 'Test Task',
              message: lipsum,
            },
          },
        ],
        conditions: [
          {
            id: uid(),
            enabled: true,
            title: 'Check sensor value',
            impl: {
              type: 'BlockValue',
              blockId: 'sensor-1',
              serviceId: 'sparkey',
              blockType: blockTypes.TempSensorMock,
              key: 'value[degC]',
              operator: 'ge',
              value: 10,
            },
          },
          {
            id: uid(),
            enabled: true,
            title: 'Wait for abs time',
            impl: {
              type: 'TimeAbsolute',
              time: 1572342354937,
            },
          },
          {
            id: uid(),
            enabled: true,
            title: 'Wait for rel time',
            impl: {
              type: 'TimeElapsed',
              duration: 12345,
            },
          },
          {
            id: uid(),
            enabled: true,
            title: 'Wait for task task-one',
            impl: {
              type: 'TaskStatus',
              ref: 'task-one',
              status: 'Done',
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
            title: 'Set sensor to 5 C',
            impl: {
              type: 'BlockPatch',
              blockId: 'sensor-1',
              serviceId: 'sparkey',
              blockType: blockTypes.TempSensorMock,
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
            title: 'Wait for value',
            impl: {
              type: 'BlockValue',
              blockId: 'sensor-1',
              serviceId: 'sparkey',
              blockType: blockTypes.TempSensorMock,
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

    automationStore.createTemplate({
      id: uid(),
      title: 'Test Template',
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
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud">
        <template #actions>
          <ActionItem icon="settings" label="Editor" @click="startEditor" />
          <ActionItem icon="add" label="New" @click="make" />
          <ActionItem icon="delete" label="Clear" @click="clear" />
        </template>
      </component>
    </template>

    <div class="widget-body column" @dblclick="startEditor">
      <div v-for="template in templates" :key="template.id" class="col">
        {{ template.title }}
      </div>
    </div>
  </CardWrapper>
</template>
