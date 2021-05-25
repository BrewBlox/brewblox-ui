import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import {
  BlockIntfType,
  BlockSpec,
  BlockType,
  DigitalActuatorBlock,
  DigitalConstraintsObj,
  DigitalState,
} from '@/plugins/spark/types';
import { blockWidgetSelector, enumHint, prettifyConstraints } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxLink, bloxQty } from '@/utils/bloxfield';

import widget from './DigitalActuatorWidget.vue';

const typeName = BlockType.DigitalActuator;


const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<DigitalActuatorBlock> = {
      id: typeName,
      generate: () => ({
        hwDevice: bloxLink(null, BlockIntfType.IoArrayInterface),
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
                  minOff: bloxQty('5m'),
                  remaining: bloxQty('0s'),
                },
                {
                  minOn: bloxQty('3m'),
                  remaining: bloxQty('0s'),
                },
                {
                  mutexed: {
                    mutexId: bloxLink(null, BlockIntfType.MutexInterface),
                    extraHoldTime: bloxQty('0s'),
                    hasCustomHoldTime: true,
                    hasLock: false,
                  },
                  remaining: bloxQty('0s'),
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
                    mutexId: bloxLink(null, BlockIntfType.MutexInterface),
                    extraHoldTime: bloxQty('0s'),
                    hasCustomHoldTime: true,
                    hasLock: false,
                  },
                  remaining: bloxQty('0s'),
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
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    sparkStore.addBlockSpec(spec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
