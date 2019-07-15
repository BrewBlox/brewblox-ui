<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { ActuatorPwmBlock } from './types';

@Component
export default class ActuatorPwmWidget extends BlockWidget {
  readonly block!: ActuatorPwmBlock;

  get constrained() {
    const { setting, desiredSetting } = this.block.data;
    return setting === desiredSetting
      ? null
      : setting;
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />

    <CardWarning v-if="!block.data.enabled">
      <template #message>
        <span>
          This PWM actuator is disabled:
          <i>{{ block.data.actuatorId }}</i> will not be toggled.
        </span>
      </template>
      <template #actions>
        <q-btn
          text-color="white"
          flat
          label="Enable"
          @click="block.data.enabled = true; saveBlock();"
        />
      </template>
    </CardWarning>
    <q-card-section>
      <q-item dark>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Setting</q-item-label>
          <div :style="block.data.setting === block.data.desiredSetting ? '' : 'color: orange'">
            <SliderField
              :value="block.data.setting"
              :readonly="isDriven"
              style="display: inline-block"
              title="Duty Setting"
              tag="big"
              @input="v => { block.data.desiredSetting = v; saveBlock(); }"
            />
            <small
              v-if="block.data.setting !== null"
              style="display: inline-block"
              class="q-ml-xs"
            >%</small>
          </div>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
        </q-item-section>

        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Duty achieved</q-item-label>
          <div>
            <big>{{ block.data.value | round }}</big>
            <small class="q-ml-xs">%</small>
          </div>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <AnalogConstraints :value="block.data.constrainedBy" :service-id="serviceId" readonly />
        </q-item-section>
        <q-item-section v-if="block.data.setting !== block.data.desiredSetting">
          <q-item-label caption>Unconstrained setting</q-item-label>
          <div>
            <big>{{ block.data.desiredSetting | round }}</big>
            <small class="q-ml-xs">%</small>
          </div>
        </q-item-section>
        <q-item-section v-else></q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
