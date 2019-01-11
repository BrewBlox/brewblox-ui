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
        :field="block"
        :change="saveBlock"
        :change-id="changeBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="widgetId"
        :change="v => widgetId = v"
        class="ellipsis"
        label="Widget ID"
        display="span"
      />
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <BlockGraph slot="right" :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-alert v-if="block.value === null" type="warning" color="warning">This Actuator is invalid</q-alert>
    <q-card-main class="column widget-body">
      <div :style="gridStyle(6)" class="full-width">
        <q-field label="Min Setting">
          <InputPopupEdit
            :field="block.data.minSetting"
            :change="callAndSaveBlock(v => block.data.minSetting = v)"
            type="number"
            label="Minimum setting"
          />
        </q-field>
        <q-field label="Setting">
          <InputPopupEdit
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            type="number"
            label="Setting"
          />
        </q-field>
        <q-field label="Max Setting">
          <InputPopupEdit
            :field="block.data.maxSetting"
            :change="callAndSaveBlock(v => block.data.maxSetting = v)"
            type="number"
            label="Maximum setting"
          />
        </q-field>
        <q-field label="Min Value">
          <InputPopupEdit
            :field="block.data.minValue"
            :change="callAndSaveBlock(v => block.data.minValue = v)"
            type="number"
            label="Minimum value"
          />
        </q-field>
        <q-field label="Value">
          <big>{{ block.data.value | round }}</big>
        </q-field>
        <q-field label="Max Value">
          <InputPopupEdit
            :field="block.data.maxValue"
            :change="callAndSaveBlock(v => block.data.maxValue = v)"
            type="number"
            label="Maximum value"
          />
        </q-field>
      </div>
    </q-card-main>
  </q-card>
</template>
