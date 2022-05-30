import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import {
  BlockFieldSpec,
  BlockIntfType,
  BlockSpec,
  BlockType,
  DigitalActuatorBlock,
  DigitalConstraintsObj,
  DigitalState,
} from '@/plugins/spark/types';
import {
  blockWidgetSelector,
  enumHint,
  prettifyConstraints,
} from '@/plugins/spark/utils';
import { WidgetFeature, useFeatureStore } from '@/store/features';
import { bloxLink } from '@/utils/link';

import widget from './DigitalActuatorWidget.vue';

const type = BlockType.DigitalActuator;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<DigitalActuatorBlock> = {
      type,
      generate: () => ({
        hwDevice: bloxLink(null, BlockIntfType.IoArrayInterface),
        channel: 0,
        desiredState: DigitalState.STATE_INACTIVE,
        state: DigitalState.STATE_INACTIVE,
        invert: false,
        constrainedBy: { constraints: [] },
      }),
    };

    const fieldSpecs: BlockFieldSpec<DigitalActuatorBlock>[] = [
      {
        type,
        key: 'desiredState',
        title: 'State',
        component: 'StateValEdit',
        generate: (): DigitalState => DigitalState.STATE_INACTIVE,
        valueHint: enumHint(DigitalState),
        graphed: true,
        graphName: 'Desired state',
      },
      {
        type,
        key: 'invert',
        title: 'Invert',
        component: 'BoolValEdit',
        generate: () => false,
      },
      {
        type,
        key: 'constrainedBy',
        title: 'Constraints',
        component: 'DigitalConstraintsValEdit',
        generate: (): DigitalConstraintsObj => ({ constraints: [] }),
        pretty: prettifyConstraints,
      },
      {
        type,
        key: 'state',
        title: 'Actual state',
        component: 'StateValEdit',
        generate: (): DigitalState => DigitalState.STATE_INACTIVE,
        valueHint: enumHint(DigitalState),
        readonly: true,
        graphed: true,
      },
    ];

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'Digital Actuator',
      role: 'Output',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
