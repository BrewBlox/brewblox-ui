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
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <ActuatorAnalogMockForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <BlockGraph slot="right" :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-alert v-if="block.value === null" type="warning" color="warning">This Actuator is invalid</q-alert>
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-field label="Setting">
          <InputPopupEdit
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            type="number"
            label="Setting"
          />
        </q-field>
        <q-field label="Value">
          <big>{{ block.data.value | round }}</big>
        </q-field>
        <q-field label="Constraints">
          <AnalogConstraints
            :service-id="serviceId"
            :field="block.data.constrainedBy"
            :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
            readonly
          />
        </q-field>
      </div>
    </q-card-main>
  </q-card>
</template>
