<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById, getMutexClients } from './getters';
import { MutexBlock } from './state';

@Component
export default class MutexWidget extends BlockWidget {
  get block(): MutexBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get mutexClients() {
    return getMutexClients(this.$store, this.serviceId, this.blockId);
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen" no-backdrop-dismiss>
      <MutexForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-field label="Held by">
          <span>{{ mutexClients.active }}</span>
        </q-field>
        <q-field label="Waiting">
          <div class="column">
            <span v-for="client in mutexClients.waiting" :key="client">{{ client }}</span>
          </div>
        </q-field>
        <q-field label="Idle">
          <div class="column">
            <span v-for="client in mutexClients.idle" :key="client">{{ client }}</span>
          </div>
        </q-field>
        <q-field label="Wait time remaining">
          <span>
            {{block.data.waitRemaining | unit}}
          </span>
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
