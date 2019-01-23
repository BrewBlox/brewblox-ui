<script lang="ts">
import { serializedPropertyName } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { SetpointSensorPairBlock } from './state';

@Component
export default class SetpointSensorPairWidget extends BlockWidget {
  get block(): SetpointSensorPairBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get renamedTargets() {
    return {
      [serializedPropertyName('setpointValue', this.block.data)]: 'Setpoint',
      [serializedPropertyName('sensorValue', this.block.data)]: 'Sensor',
    };
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <SetpointSensorPairForm
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
    <q-card-main class="widget-body column">
      <div class="full-width">
        <q-field label="Setpoint value">
          <big>{{ block.data.setpointValue | unit }}</big>
        </q-field>
        <q-field label="Sensor value">
          <big>{{ block.data.sensorValue | unit }}</big>
        </q-field>
      </div>
    </q-card-main>
  </q-card>
</template>

<style lang="stylus" scoped>
/deep/ .widget-body .q-field-margin {
  margin-top: 0px;
}
</style>
