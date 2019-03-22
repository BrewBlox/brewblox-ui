<script lang="ts">
import { postfixedDisplayNames } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { SetpointSimpleBlock } from './state';

@Component
export default class SetpointSimpleWidget extends BlockWidget {
  get block(): SetpointSimpleBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get renamedTargets() {
    return postfixedDisplayNames(
      {
        setting: 'Setpoint setting',
      },
      this.block.data,
    );
  }
}
</script>

<template>
  <q-card dark class="text-white nopad">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <SetpointSimpleForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-dialog>

    <q-card-section class="q-pa-xs">
      <q-item dark>
        <q-item-section>
          <q-item-label class="ellipsis text-h6">{{ widgetId }}</q-item-label>
        </q-item-section>
        <q-item-section side>{{ displayName }}</q-item-section>
        <q-item-section side>
          <q-btn flat round dense icon="refresh" @click="refreshBlock"/>
        </q-item-section>
        <q-item-section side>
          <BlockGraph :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
        </q-item-section>
        <q-item-section side>
          <q-btn flat round dense icon="settings" @click="openModal"/>
        </q-item-section>
      </q-item>
      <q-separator dark inset/>
    </q-card-section>

    <q-card-section>
      <q-item v-if="block.data.value === null">
        <q-item-section avatar>
          <q-icon name="warning"></q-icon>
        </q-item-section>
        <q-item-section>This Setpoint is invalid</q-item-section>
      </q-item>
      <q-item>
        <q-item-section side>{{ block.data.enabled ? 'Target' : 'Target when enabled' }}</q-item-section>
        <q-item-section>
          <UnitPopupEdit
            v-if="!isDriven"
            :class="{ darkened: block.data.setting.value === null }"
            :field="block.data.setpoint"
            :change="callAndSaveBlock(v => block.data.setpoint = v)"
            label="Target"
          />
          <big
            v-else
            :class="{ darkened: block.data.setting.value === null }"
          >{{ block.data.setpoint | unit }}</big>
          <DrivenIndicator :block-id="blockId" :service-id="serviceId"/>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section side>Enabled</q-item-section>
        <q-item-section>
          <q-toggle
            :value="block.data.enabled"
            @input="v => { block.data.enabled = v; saveBlock() }"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
