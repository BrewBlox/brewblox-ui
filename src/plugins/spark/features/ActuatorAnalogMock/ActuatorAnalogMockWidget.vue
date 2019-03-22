<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { ActuatorAnalogMockBlock } from './state';

@Component
export default class ActuatorAnalogMockWidget extends BlockWidget {
  get block(): ActuatorAnalogMockBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get renamedTargets() {
    return {
      setting: 'Setting',
      value: 'Value',
    };
  }
}
</script>

<template>
  <q-card dark class="text-white nopad">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <ActuatorAnalogMockForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-dialog>

    <q-card-section class="q-pa-xs">
      <q-item dark>
        <q-item-section>
          <q-item-label class="ellipsis text-h6">{{ widgetId }}</q-item-label>
        </q-item-section>
        <q-item-section side>{{ displayName }}</q-item-section>
        <q-item-section side>
          <q-btn flat round dense icon="refresh" @click="refreshBlock"/>
        </q-item-section>
        <q-item-section side>
          <BlockGraph :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
        </q-item-section>
        <q-item-section side>
          <q-btn flat round dense icon="settings" @click="openModal"/>
        </q-item-section>
      </q-item>
      <q-separator dark inset/>
    </q-card-section>

    <q-card-section>
      <q-item v-if="block.value === null">
        <q-item-section avatar>
          <q-icon name="warning"></q-icon>
        </q-item-section>
        <q-item-section>This Actuator is invalid</q-item-section>
      </q-item>
      <q-item>
        <q-item-section side>Setting</q-item-section>
        <q-item-section>
          <InputPopupEdit
            v-if="!isDriven"
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            type="number"
            label="Setting"
          />
          <big v-else>{{ block.data.setting | unit }}</big>
        </q-item-section>
      </q-item>
      <q-item v-if="isDriven">
        <q-item-section side>Driven</q-item-section>
        <q-item-section>
          <DrivenIndicator :block-id="blockId" :service-id="serviceId"/>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section side>Value</q-item-section>
        <q-item-section>
          <big>{{ block.data.value | round }}</big>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section side>Constraints</q-item-section>
        <q-item-section>
          <AnalogConstraints
            :service-id="serviceId"
            :field="block.data.constrainedBy"
            :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
            readonly
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
