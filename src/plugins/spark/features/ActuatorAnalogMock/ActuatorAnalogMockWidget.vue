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
      <ActuatorAnalogMockForm v-if="modalOpen" v-bind="formProps"/>
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item v-if="block.value === null" dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>This Actuator is invalid</q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Setting</q-item-label>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          <div>
            <InputPopupEdit
              v-if="!isDriven"
              :field="block.data.setting"
              :change="callAndSaveBlock(v => block.data.setting = v)"
              type="number"
              label="Setting"
            />
            <div v-else>
              <big>{{ block.data.setting | round }}</big>
              <small class="q-ml-xs">{{ block.data.error.notation }}</small>
            </div>
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Value</q-item-label>
          <big>{{ block.data.value | round }}</big>
        </q-item-section>
      </q-item>
      <q-item dark>
        <AnalogConstraints
          :service-id="serviceId"
          :field="block.data.constrainedBy"
          :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
          readonly
        />
      </q-item>
    </q-card-section>
  </q-card>
</template>
