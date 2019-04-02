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

  enable() {
    this.block.data.enabled = true;
    this.saveBlock();
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <ActuatorPwmForm v-if="modalOpen" v-bind="formProps"/>
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item v-if="!block.data.enabled" dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>
          <span>
            PWM is disabled:
            <i>{{ block.data.actuatorId }}</i> will not be toggled.
          </span>
        </q-item-section>
        <q-item-section side>
          <q-btn text-color="white" flat label="Enable" @click="enable"/>
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section>
          <q-item-label caption>Duty setting</q-item-label>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          <div>
            <InputPopupEdit
              v-if="!isDriven"
              :field="block.data.setting"
              :change="callAndSaveBlock(v => block.data.setting = v)"
              type="number"
              label="Setting"
            />
            <big v-else>{{ block.data.setting | round }}</big>
            <small class="q-ml-xs">%</small>
          </div>
        </q-item-section>
        <q-item-section style="justify-content: space-between">
          <q-item-label caption>Duty achieved</q-item-label>
          <div>
            <big>{{ block.data.value | round }}</big>
            <small class="q-ml-xs">%</small>
          </div>
        </q-item-section>
      </q-item>

      <q-item v-if="pending !== null" dark>
        <q-item-section>
          <q-item-label caption>Unconstrained setting</q-item-label>
          <div>
            <big>{{ pending | round }}</big>
            <small class="q-ml-xs">%</small>
          </div>
        </q-item-section>
      </q-item>
      <q-item dark>
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
