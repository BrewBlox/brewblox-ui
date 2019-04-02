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
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <SetpointSimpleForm v-if="modalOpen" v-bind="formProps"/>
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item v-if="block.data.value === null" dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>This Setpoint is invalid</q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>{{ block.data.enabled ? 'Target' : 'Target when enabled' }}</q-item-section>
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
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Enabled</q-item-section>
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
