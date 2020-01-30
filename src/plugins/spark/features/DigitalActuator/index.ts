import { Link, Unit } from '@/helpers/units';
import { blockTypes, interfaceTypes } from '@/plugins/spark/block-types';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, DigitalState } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './DigitalActuatorWidget.vue';
import { typeName } from './getters';
import { DigitalActuatorData } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): DigitalActuatorData => ({
    hwDevice: new Link(null, interfaceTypes.IoArray),
    channel: 0,
    desiredState: DigitalState.Inactive,
    state: DigitalState.Inactive,
    invert: false,
    constrainedBy: { constraints: [] },
  }),
  presets: [
    {
      name: 'Fridge cooler (compressor)',
      generate: (): Partial<DigitalActuatorData> => ({
        invert: false,
        constrainedBy: {
          constraints: [
            { minOff: new Unit(300, 'second'), limiting: false },
            { minOn: new Unit(180, 'second'), limiting: false },
            { mutex: new Link(null, blockTypes.Mutex), limiting: false },
          ],
        },
      }),
    },
    {
      name: 'Fridge heater',
      generate: (): Partial<DigitalActuatorData> => ({
        invert: false,
        constrainedBy: {
          constraints: [
            { mutex: new Link(null, blockTypes.Mutex), limiting: false },
          ],
        },
      }),
    },
  ],
  changes: [
    {
      key: 'desiredState',
      title: 'State',
      component: 'StateValEdit',
      generate: () => 0,
      pretty: v => DigitalState[v],
    },
    {
      key: 'invert',
      title: 'Invert',
      component: 'BoolValEdit',
      generate: () => false,
    },
  ],
  graphTargets: {
    state: 'Actual state',
    desiredState: 'Desired state',
  },
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Digital Actuator',
  role: 'Output',
  component: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
