<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { ActuatorAnalogMockBlock } from './state';

@Component
export default class ActuatorAnalogMockWidget extends BlockWidget {
  get block(): ActuatorAnalogMockBlock {
    return getById(this.$store, this.serviceId, this.blockId);
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
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <ActuatorAnalogMockForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item v-if="block.value === null" dark>
        <q-item-section avatar>
          <q-icon name="warning"></q-icon>
        </q-item-section>
        <q-item-section>This Actuator is invalid</q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <div class="column">
            <span>Setting</span>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </div>
        </q-item-section>
        <q-item-section>
          <InputPopupEdit
            v-if="!isDriven"
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            type="number"
            label="Setting"
          />
          <big v-else>{{ block.data.setting | unit }}</big>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Value</q-item-section>
        <q-item-section>
          <big>{{ block.data.value | round }}</big>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-label>Constraints</q-item-label>
        <q-item-section>
          <AnalogConstraints
            :service-id="serviceId"
            :field="block.data.constrainedBy"
            :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
            readonly
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
