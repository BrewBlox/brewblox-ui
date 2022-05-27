<script lang="ts">
import { defineComponent, PropType, reactive } from 'vue';

import { tempQty } from '@/utils/quantity';

import { QuickstartAction } from '../types';
import { FermentConfig, FermentMode, FermentOpts } from './types';

const targetOpts: SelectOption<FermentMode>[] = [
  {
    label: 'Beer',
    value: 'beer',
  },
  {
    label: 'Fridge',
    value: 'fridge',
  },
];

export default defineComponent({
  name: 'FermentSettingsTask',
  props: {
    config: {
      type: Object as PropType<FermentConfig>,
      required: true,
    },
    actions: {
      type: Array as PropType<QuickstartAction[]>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
    const fermentOpts = reactive<FermentOpts>(
      props.config.fermentOpts ?? {
        fridgeSetting: tempQty(20),
        beerSetting: tempQty(20),
        activeSetpoint: 'beer',
      },
    );

    function done(): void {
      emit('update:config', { ...props.config, fermentOpts });
      emit('next');
    }

    return {
      targetOpts,
      fermentOpts,
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
          <p>
            The setup creates 2 setpoints, one for your beer and one for your
            fridge.
          </p>
          <p>
            To change which temperature is actively controlled, you will change
            which setpoint is used as input by the PIDs. The quick actions on
            your dashboard will help you switch and reconfigure the PIDs.<br />
          </p>
          <p>You can set the initial values now.</p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuantityField
            v-model="fermentOpts.fridgeSetting"
            label="Fridge setpoint"
            title="Fridge setting"
          />
        </q-item-section>
        <q-item-section>
          <QuantityField
            v-model="fermentOpts.beerSetting"
            label="Beer setpoint"
            title="Beer setting"
          />
        </q-item-section>
        <q-item-section class="col-auto">
          <LabeledField label="Active setpoint">
            <q-btn-toggle
              v-model="fermentOpts.activeSetpoint"
              :options="targetOpts"
              unelevated
              dense
              class="col-auto"
            />
          </LabeledField>
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn
        unelevated
        label="Back"
        @click="$emit('back')"
      />
      <q-space />
      <q-btn
        unelevated
        label="Done"
        color="primary"
        @click="done"
      />
    </template>
  </WizardBody>
</template>
