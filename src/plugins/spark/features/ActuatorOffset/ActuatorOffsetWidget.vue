<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { ActuatorOffsetBlock } from './state';

@Component
export default class ActuatorOffsetWidget extends BlockWidget {
  get block(): ActuatorOffsetBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get settingOrValue() {
    return ['Setting', 'Value'][this.block.data.referenceSettingOrValue];
  }

  get warnings() {
    const warn: string[] = [];
    if (!this.block.data.targetId === null) {
      warn.push('Target invalid');
    }
    if (this.block.data.referenceId === null) {
      warn.push('Reference invalid');
    }
    return warn.join(', ');
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
      <ActuatorOffsetForm
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
    <q-alert v-if="warnings" type="warning" color="warn">{{ warnings }}</q-alert>
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-field label="Setting">
          <big>{{ block.data.setting | round }}</big>
        </q-field>
        <q-field label="Value">
          <big>{{ block.data.value | round }}</big>
        </q-field>
        <q-field label="Setting or value">
          <big>{{ settingOrValue }}</big>
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


