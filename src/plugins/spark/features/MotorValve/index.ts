import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import {
  BlockIntfType,
  BlockSpec,
  BlockType,
  DigitalConstraintsObj,
  DigitalState,
  MotorValveBlock,
  ValveState,
} from '@/plugins/spark/types';
import { blockWidgetSelector, enumHint, prettifyConstraints } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/bloxfield';

import widget from './MotorValveWidget.vue';

const typeName = BlockType.MotorValve;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<MotorValveBlock> = {
      id: typeName,
      generate: () => ({
        hwDevice: bloxLink(null, BlockIntfType.IoArrayInterface),
        startChannel: 0,
        desiredState: DigitalState.STATE_INACTIVE,
        state: DigitalState.STATE_INACTIVE,
        valveState: ValveState.VALVE_INIT_IDLE,
        constrainedBy: { constraints: [] },
      }),
      fieldSpecs: [
        {
          key: 'desiredState',
          title: 'State',
          component: 'StateValEdit',
          generate: () => DigitalState.STATE_INACTIVE,
          valueHint: enumHint(DigitalState),
          graphed: true,
          graphName: 'Desired state',
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
          generate: () => DigitalState.STATE_INACTIVE,
          valueHint: enumHint(DigitalState),
          readonly: true,
          graphed: true,
        },
      ],
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: typeName,
      title: 'Motor Valve',
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
