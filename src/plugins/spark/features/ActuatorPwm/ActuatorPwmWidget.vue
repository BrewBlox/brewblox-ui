<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { ActuatorPwmBlock } from './types';

@Component
export default class ActuatorPwmWidget extends BlockWidget {
  readonly block!: ActuatorPwmBlock;

  get renamedTargets() {
    return {
      setting: 'Duty Setting',
      value: 'Duty Achieved',
    };
  }

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
    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item v-if="!block.data.enabled" dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>
          <span>
            PWM is disabled:
            <i>{{ block.data.actuatorId }}</i> will not be toggled.
          </span>
        </q-item-section>
        <q-item-section side>
          <q-btn
            text-color="white"
            flat
            label="Enable"
            @click="block.data.enabled = true; saveBlock();"
          />
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Duty setting</q-item-label>
          <div>
            <InputField
              :value="block.data.desiredSetting"
              :readonly="isDriven"
              style="display: inline-block"
              type="number"
              title="Duty Setting"
              tag="big"
              @input="v => { block.data.desiredSetting = v; saveBlock(); }"
            />
            <small
              v-if="block.data.desiredSetting !== null"
              style="display: inline-block"
              class="q-ml-xs"
            >%</small>
          </div>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-item-section>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Duty achieved</q-item-label>
          <div>
            <big>{{ block.data.value | round }}</big>
            <small class="q-ml-xs">%</small>
          </div>
        </q-item-section>
      </q-item>

      <q-item v-if="constrained !== null" dark>
        <q-item-section>
          <q-item-label caption>Constrained setting</q-item-label>
          <div>
            <big>{{ constrained | round }}</big>
            <small class="q-ml-xs">%</small>
          </div>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <AnalogConstraints :value="block.data.constrainedBy" :service-id="serviceId" readonly/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
