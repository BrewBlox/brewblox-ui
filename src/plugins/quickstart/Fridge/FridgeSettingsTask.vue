<script lang="ts">
import { tempQty } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import { defineComponent, PropType, ref } from 'vue';
import { QuickstartAction } from '../types';
import { FridgeConfig, FridgeOpts } from './types';

export default defineComponent({
  name: 'FridgeSettingsTask',
  props: {
    config: {
      type: Object as PropType<FridgeConfig>,
      required: true,
    },
    actions: {
      type: Array as PropType<QuickstartAction[]>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
    const fridgeSetting = ref<Quantity>(tempQty(20));

    function done(): void {
      const fridgeOpts: FridgeOpts = {
        fridgeSetting: fridgeSetting.value,
      };

      emit('update:config', { ...props.config, fridgeOpts });
      emit('next');
    }

    return {
      fridgeSetting,
      done,
    };
  },
});
</script>

<template>
  <QuickstartCard>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Initial setpoint value
          </q-item-label>
          <p>
            The setup creates a Setpoint for your fridge.<br />
            You can set the initial values now.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuantityField
            v-model="fridgeSetting"
            label="Fridge setpoint"
            title="Fridge setting"
          />
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
  </QuickstartCard>
</template>
