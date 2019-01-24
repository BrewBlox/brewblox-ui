<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { ActuatorPwmBlock } from './state';

@Component
export default class ActuatorPwmWidget extends BlockWidget {
  get block(): ActuatorPwmBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get renamedTargets() {
    return {
      setting: 'Duty Setting',
      value: 'Duty Achieved',
    };
  }

  get pending() {
    if (!this.block.data.constrainedBy) {
      return null;
    }
    const { unconstrained } = this.block.data.constrainedBy;
    if (this.block.data.setting === unconstrained) {
      return null;
    }
    return unconstrained;
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen" no-backdrop-dismiss>
      <ActuatorPwmForm
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
      <BlockGraph slot="right" :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-field label="Duty Setting">
          <big>{{ block.data.setting | round }}</big>
        </q-field>
        <q-field label="Duty Achieved">
          <big>{{ block.data.value | round }}</big>
        </q-field>
        <q-field v-if="pending !== null" class="col" label="Unconstrained setting">
          <big>{{ pending | round }}</big>
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
