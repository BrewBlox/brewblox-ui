<script lang="ts">
import { Unit } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { isNullOrUndefined } from 'util';
import Component from 'vue-class-component';
import { getById } from './getters';
import { SetpointSimpleBlock } from './state';

@Component
export default class SetpointSimpleWidget extends BlockWidget {
  get block(): SetpointSimpleBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <SetpointSimpleForm
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
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-alert v-if="block.data.value === null" type="warning" color="warn">This Setpoint is invalid</q-alert>
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-field :label="block.data.enabled ? 'Target' : 'Target when enabled'">
          <UnitPopupEdit
            :class="[block.data.setting.value === null ? 'darkened' : {}]"
            :field="block.data.setpoint"
            :change="callAndSaveBlock(v => block.data.setpoint = v)"
            label="Target"
          />
        </q-field>
        <q-field label="Enabled">
          <q-toggle
            :value="block.data.enabled"
            @input="v => { block.data.enabled = v; saveBlock() }"
          />
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
