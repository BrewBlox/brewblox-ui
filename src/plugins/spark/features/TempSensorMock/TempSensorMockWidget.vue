<script lang="ts">
import { serializedPropertyName } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { TempSensorMockBlock } from './state';

@Component
export default class TempSensorMockWidget extends BlockWidget {
  get block(): TempSensorMockBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get renamedTargets() {
    return {
      [serializedPropertyName('value', this.block.data)]: 'Value',
    };
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <TempSensorMockForm
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
    <q-alert v-if="block.data.value === null" type="warning" color="warning">This sensor is invalid</q-alert>
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-field label="Value">
          <big>{{ block.data.value | unit }}</big>
        </q-field>
        <q-field label="Connected">
          <q-toggle
            :value="block.data.connected"
            @input="v => { block.data.connected = v; saveBlock(); }"
          />
        </q-field>
      </div>
    </q-card-main>
  </q-card>
</template>

