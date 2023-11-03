<script setup lang="ts">
import { UseTaskEmits, UseTaskProps } from '../composables';
import { FridgeConfig, FridgeOpts } from './types';
import { tempQty } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import { ref } from 'vue';

const props = defineProps<UseTaskProps<FridgeConfig>>();

const emit = defineEmits<UseTaskEmits<FridgeConfig>>();

const fridgeSetting = ref<Quantity>(tempQty(20));

function done(): void {
  const fridgeOpts: FridgeOpts = {
    fridgeSetting: fridgeSetting.value,
  };

  emit('update:config', { ...props.config, fridgeOpts });
  emit('next');
}
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
