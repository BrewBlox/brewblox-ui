<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { Quantity } from '@/shared-types';
import { tempQty } from '@/utils/quantity';

import { QuickstartAction } from '../types';
import { createOutputActions } from '../utils';
import {
  defineChangedBlocks,
  defineCreatedBlocks,
  defineDisplayedBlocks,
  defineWidgets,
} from './changes';
import { defineLayouts } from './changes-layout';
import { GlycolConfig, GlycolOpts } from './types';

export default defineComponent({
  name: 'GlycolSettingsTask',
  props: {
    config: {
      type: Object as PropType<GlycolConfig>,
      required: true,
    },
    actions: {
      type: Array as PropType<QuickstartAction[]>,
      required: true,
    },
  },
  emits: ['update:config', 'update:actions', 'back', 'next'],
  setup(props, { emit }) {
    const beerSetting = ref<Quantity>(tempQty(20));
    const glycolSetting = ref<Quantity>(tempQty(4));

    function done(): void {
      const opts: GlycolOpts = {
        beerSetting: beerSetting.value,
        glycolSetting: glycolSetting.value,
      };

      const createdBlocks = defineCreatedBlocks(props.config, opts);
      const changedBlocks = defineChangedBlocks(props.config);
      const layouts = defineLayouts(props.config);
      const widgets = defineWidgets(props.config, layouts);
      const displayedBlocks = defineDisplayedBlocks(props.config);

      const updates: Partial<GlycolConfig> = {
        createdBlocks,
        changedBlocks,
        layouts,
        widgets,
        displayedBlocks,
      };

      emit('update:config', { ...props.config, ...updates });
      emit('update:actions', createOutputActions());
      emit('next');
    }

    return {
      beerSetting,
      glycolSetting,
      done,
    };
  },
});
</script>

<template>
  <WizardBody>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Initial setpoints
          </q-item-label>
          <p v-if="config.glycolControl === 'Control'">
            The setup creates a setpoint for your beer temperature and your
            glycol temperature.
          </p>
          <p v-else>
            The setup creates a setpoint for your beer temperature.
          </p>
          <p>You can set the initial values now.</p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuantityField
            v-model="beerSetting"
            title="Beer setting"
            label="Beer setpoint"
          />
        </q-item-section>
        <q-item-section>
          <QuantityField
            v-if="config.glycolControl === 'Control'"
            v-model="glycolSetting"
            title="Glycol setting"
            label="Glycol setpoint"
          />
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn unelevated label="Back" @click="$emit('back')" />
      <q-space />
      <q-btn unelevated label="Done" color="primary" @click="done" />
    </template>
  </WizardBody>
</template>
