<script lang="ts">
import { postfixedDisplayNames } from '@/helpers/units';
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
    return postfixedDisplayNames(
      {
        value: 'Sensor value',
      },
      this.block.data,
    );
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <TempSensorMockForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-dialog>
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <BlockGraph slot="right" :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-banner v-if="block.data.value === null" type="warning" color="warning">This sensor is invalid</q-banner>
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-field label="Value">
          <UnitPopupEdit
            :field="block.data.value"
            :disabled="!block.data.connected"
            :change="callAndSaveBlock(v => block.data.value = v)"
            label="Value"
          />
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

