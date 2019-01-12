<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { MutexBlock } from './state';

@Component
export default class MutexWidget extends BlockWidget {
  get block(): MutexBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <MutexForm v-if="modalOpen" :field="block" :change="saveBlock" :change-id="changeBlockId"/>
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
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-field label="Actuator wait time">
          <InputPopupEdit
            :field="block.data.differentActuatorWait"
            :change="callAndSaveBlock(v => block.data.differentActuatorWait = v)"
            type="number"
            label="Actuator wait time"
          />
        </q-field>
      </div>
    </q-card-main>
  </q-card>
</template>


