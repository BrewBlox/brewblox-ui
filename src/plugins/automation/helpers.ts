import { uid } from 'quasar';

import { findById } from '@/helpers/functional';
import { Unit } from '@/helpers/units';

import { blockTypes } from '../spark/block-types';
import { actionSpecs, conditionSpecs } from './impl/specs';
import { AutomationTemplate, AutomationTransition } from './shared-types';
import { automationStore } from './store';
import { AutomationCondition, AutomationStep } from './types';

export function idCopy<T extends HasId>(v: T): T {
  return {
    ...v,
    id: uid(),
  };
}

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

export async function clear(): Promise<void> {
  for (const template of automationStore.templates) {
    await automationStore.removeTemplate(template);
  }
}

export async function make(): Promise<void> {
  const mkConditions = (): AutomationCondition[] => ([
    {
      id: uid(),
      enabled: true,
      title: 'Default block value',
      impl: conditionSpecs.BlockValue.generate(),
    },
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
        start: 'Process',
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
        status: 'Finished',
      },
    },
  ]);

  const mkSteps = (): AutomationStep[] => {
    const stepOneId = uid();
    const stepTwoId = uid();

    return [
      {
        id: stepOneId,
        title: 'step-one',
        preconditions: mkConditions(),
        actions: [
          {
            id: uid(),
            title: 'generated block patch',
            enabled: true,
            impl: actionSpecs.BlockPatch.generate(),
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
        transitions: [
          {
            id: uid(),
            enabled: true,
            next: stepTwoId,
            conditions: mkConditions(),
          },
          {
            id: uid(),
            enabled: true,
            next: true,
            conditions: mkConditions(),
          },
        ],
      },
      {
        id: stepTwoId,
        title: 'step-two',
        preconditions: mkConditions(),
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
        transitions: [
          {
            id: uid(),
            enabled: true,
            next: true,
            conditions: mkConditions(),
          },
        ],
      },
    ];
  };


  await automationStore.createTemplate({
    id: uid(),
    title: 'Test Template',
    steps: [
      ...mkSteps(),
      ...mkSteps(),
      ...mkSteps(),
    ],
  });
}


export function nextTitle(template: AutomationTemplate, transition: AutomationTransition): string {
  return typeof transition.next === 'string'
    ? findById(template.steps, transition.next)?.title ?? 'Unknown step'
    : transition.next
      ? '[Next step]'
      : '[Process end]';
}
