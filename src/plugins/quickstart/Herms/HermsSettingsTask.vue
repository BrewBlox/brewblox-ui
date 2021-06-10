<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { Quantity } from '@/shared-types';
import { systemStore } from '@/store/system';
import { createDialog } from '@/utils/dialog';
import { prettyQty, prettyUnit } from '@/utils/formatting';
import { bloxQty, deltaTempQty, tempQty } from '@/utils/quantity';

import { QuickstartAction } from '../types';
import { createOutputActions } from '../utils';
import { defineChangedBlocks, defineCreatedBlocks, defineDisplayedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { HermsConfig, HermsOpts } from './types';

const volumeRules: InputRule[] = [
  v => Number(v) !== 0 || 'Volume can\'t be 0',
];

export default defineComponent({
  name: 'HermsSettingsTask',
  props: {
    config: {
      type: Object as PropType<HermsConfig>,
      required: true,
    },
    actions: {
      type: Array as PropType<QuickstartAction[]>,
      required: true,
    },
  },
  emits: [
    'update:config',
    'update:actions',
    'back',
    'next',
    'close',
  ],
  setup(props, { emit }) {
    const hltFullPowerDelta = ref<Quantity>(deltaTempQty(2));
    const bkFullPowerDelta = ref<Quantity>(deltaTempQty(2));
    const hltVolume = ref<number>(25);
    const mashVolume = ref<number>(25);
    const driverMax = ref<Quantity>(deltaTempQty(10));
    const mashTarget = ref<Quantity>(tempQty(67));
    const mashActual = ref<Quantity>(tempQty(65));

    const userTemp = computed<string>(
      () => systemStore.units.temperature,
    );

    const hltKp = computed<Quantity>(
      () => bloxQty(100 / (hltFullPowerDelta.value.value || 2), `1/${userTemp.value}`),
    );

    const bkKp = computed<Quantity>(
      () => bloxQty(100 / (bkFullPowerDelta.value.value || 2), `1/${userTemp.value}`),
    );

    const mtKp = computed<Quantity>(
      () => bloxQty(mashVolume.value / (hltVolume.value || 1), `1/${userTemp.value}`),
    );

    const hltSetting = computed<Quantity>(
      () => {
        if (mashTarget.value.value && mtKp.value.value && mashActual.value.value && driverMax.value.value) {
          const upperLimit = mashTarget.value.value + driverMax.value.value;
          const setting = mashTarget.value.value + (mashTarget.value.value - mashActual.value.value) * mtKp.value.value;

          return bloxQty(Math.min(upperLimit, setting), userTemp.value);
        }
        return bloxQty(null, userTemp.value);
      },
    );

    function done(): void {
      const opts: HermsOpts = {
        hltKp: hltKp.value,
        bkKp: bkKp.value,
        mtKp: mtKp.value,
        driverMax: driverMax.value,
      };

      const createdBlocks = defineCreatedBlocks(props.config, opts);
      const changedBlocks = defineChangedBlocks(props.config);
      const layouts = defineLayouts(props.config);
      const widgets = defineWidgets(props.config, layouts);
      const displayedBlocks = defineDisplayedBlocks(props.config);

      const updates: Partial<HermsConfig> = {
        layouts,
        widgets,
        changedBlocks,
        createdBlocks,
        displayedBlocks,
      };

      emit('update:config', { ...props.config, ...updates });
      emit('update:actions', createOutputActions());
      emit('next');
    }

    function showHltVolumeKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          type: 'number',
          modelValue: hltVolume.value,
          rules: volumeRules,
        },
      })
        .onOk(v => hltVolume.value = v);
    }

    function showMashVolumeKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: mashVolume.value,
          type: 'number',
          rules: volumeRules,
        },
      })
        .onOk(v => mashVolume.value = v);
    }

    function showDriverMaxKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: driverMax.value.value,
          type: 'number',
          suffix: prettyUnit(driverMax.value),
        },
      })
        .onOk(v => driverMax.value = v);
    }

    return {
      prettyQty,
      prettyUnit,
      volumeRules,
      hltFullPowerDelta,
      bkFullPowerDelta,
      hltVolume,
      mashVolume,
      driverMax,
      mashTarget,
      mashActual,
      hltKp,
      bkKp,
      mtKp,
      hltSetting,
      done,
      showHltVolumeKeyboard,
      showMashVolumeKeyboard,
      showDriverMaxKeyboard,
    };
  },
});
</script>

<template>
  <WizardBody>
    <q-card-section class="text-weight-light">
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            PID configuration
          </q-item-label>
          <p>
            This HERMS setup uses 3 PIDs to control your temperatures.
            Click the underlined values below to edit.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Hot liquor tun heating
          </q-item-label>
          <p>
            If the temperature is more than
            <InlineQuantityField v-model="hltFullPowerDelta" title="Full power delta" /> too low,
            run at full power (100%).
          </p>
          <p class="text-italic">
            Proportional gain Kp of the HLT PID will be set to {{ prettyQty(hltKp) }}.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Brew kettle heating
          </q-item-label>
          <p>
            If the temperature is more than
            <InlineQuantityField v-model="bkFullPowerDelta" title="Full power delta" /> too low,
            run at full power (100%).
          </p>
          <p class="text-italic">
            Proportional gain Kp of the BK PID will be set to {{ prettyQty(bkKp) }}.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Mash tun heating
          </q-item-label>
          <p>
            To heat the wort in your mash tun, it is pumped through a coil in the HLT.
            <br>
            We don't want to use a static HLT temperature a bit higher than the mash tun.
            <br>
            We can do better than that, by using a third PID to change the HLT setpoint dynamically.
          </p>
          <p>
            More water in the HLT means it builds up more heat to eventually transfer to the MT,
            so with less water in the HLT, we can use a higher temperature without overshooting.
            Best is to only fill your HLT to just above your HERMS coil while step mashing.
          </p>
          <p>
            To calculate your Kp, enter the actual amount of water used, not the Kettle size.
            The unit doesn't matter. Also set the maximum difference between MT and HLT setting.
          </p>
        </q-item-section>
      </q-item>
      <q-item class="items-baseline">
        <q-item-section>
          <q-input
            v-model="hltVolume"
            :rules="volumeRules"
            inputmode="numeric"
            pattern="[0-9\.]*"
            label="HLT volume"
          >
            <template #append>
              <KeyboardButton @click="showHltVolumeKeyboard" />
            </template>
          </q-input>
        </q-item-section>
        <q-item-section>
          <q-input
            v-model="mashVolume"
            :rules="volumeRules"
            inputmode="numeric"
            pattern="[0-9\.]*"
            label="Mash volume"
          >
            <template #append>
              <KeyboardButton @click="showMashVolumeKeyboard" />
            </template>
          </q-input>
        </q-item-section>
        <q-item-section>
          <q-input
            v-model.number="driverMax.value"
            inputmode="numeric"
            pattern="[0-9\.]*"
            label="Limit difference to"
          >
            <template #append>
              <span style="font-size: 70%">
                {{ prettyUnit(driverMax) }}
              </span>
              <KeyboardButton @click="showDriverMaxKeyboard" />
            </template>
          </q-input>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <p class="text-italic">
            Kp will be set to {{ prettyQty(mtKp) }}.
            If your mash temperature is
            <InlineQuantityField v-model="mashActual" style="font-style: normal" />
            and should be
            <InlineQuantityField v-model="mashTarget" style="font-style: normal" />
            the HLT will be set to
            {{ prettyQty(hltSetting) }}.
          </p>
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
