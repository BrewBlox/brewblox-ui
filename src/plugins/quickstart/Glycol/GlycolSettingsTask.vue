<script setup lang="ts">
import { Quantity } from 'brewblox-proto/ts';
import { ref } from 'vue';
import { tempQty } from '@/utils/quantity';
import { UseTaskEmits, UseTaskProps } from '../composables';
import { GlycolConfig, GlycolOpts } from './types';

const props = defineProps<UseTaskProps<GlycolConfig>>();

const emit = defineEmits<UseTaskEmits<GlycolConfig>>();

const beerSetting = ref<Quantity>(tempQty(20));
const glycolSetting = ref<Quantity>(tempQty(4));

function done(): void {
  const glycolOpts: GlycolOpts = {
    beerSetting: beerSetting.value,
    glycolSetting: glycolSetting.value,
  };

  emit('update:config', { ...props.config, glycolOpts });
  emit('next');
}
</script>

<template>
  <QuickstartCard>
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
          <p v-else>The setup creates a setpoint for your beer temperature.</p>
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
