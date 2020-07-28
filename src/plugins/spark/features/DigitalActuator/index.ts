import { Link, Qty } from '@/plugins/spark/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, enumHint, prettifyConstraints } from '@/plugins/spark/helpers';
import { BlockSpec, DigitalActuatorBlock, DigitalConstraintsObj, DigitalState } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './DigitalActuatorWidget.vue';

const seconds = (v = 0): Qty => new Qty(v, 'seconds');
const typeName = 'DigitalActuator';

const block: BlockSpec<DigitalActuatorBlock> = {
  id: typeName,
  generate: () => ({
    hwDevice: new Link(null, 'IoArrayInterface'),
    channel: 0,
    desiredState: DigitalState.STATE_INACTIVE,
    state: DigitalState.STATE_INACTIVE,
    invert: false,
    constrainedBy: { constraints: [] },
  }),
  presets: [
    {
      name: 'Fridge cooler (compressor)',
      generate: () => ({
        invert: false,
        constrainedBy: {
          constraints: [
            {
              minOff: seconds(300),
              remaining: seconds(),
            },
            {
              minOn: seconds(180),
              remaining: seconds(),
            },
            {
              mutexed: {
                mutexId: new Link(null, 'MutexInterface'),
                extraHoldTime: seconds(),
                hasCustomHoldTime: true,
                hasLock: false,
              },
              remaining: seconds(),
            },
          ],
        },
      }),
    },
    {
      name: 'Fridge heater',
      generate: () => ({
        invert: false,
        constrainedBy: {
          constraints: [
            {
              mutexed: {
                mutexId: new Link(null, 'MutexInterface'),
                extraHoldTime: seconds(),
                hasCustomHoldTime: true,
                hasLock: false,
              },
              remaining: seconds(),
            },
          ],
        },
      }),
    },
  ],
  fields: [
    {
      key: 'desiredState',
      title: 'State',
      component: 'StateValEdit',
      generate: (): DigitalState => DigitalState.STATE_INACTIVE,
      valueHint: enumHint(DigitalState),
      graphed: true,
      graphName: 'Desired state',
    },
    {
      key: 'invert',
      title: 'Invert',
      component: 'BoolValEdit',
      generate: () => false,
    },
    {
      key: 'constrainedBy',
      title: 'Constraints',
      component: 'DigitalConstraintsValEdit',
      generate: (): DigitalConstraintsObj => ({ constraints: [] }),
      pretty: prettifyConstraints,
    },
    {
      key: 'state',
      title: 'Actual state',
      component: 'StateValEdit',
      generate: (): DigitalState => DigitalState.STATE_INACTIVE,
      valueHint: enumHint(DigitalState),
      readonly: true,
      graphed: true,
    },
  ],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Digital Actuator',
  role: 'Output',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
