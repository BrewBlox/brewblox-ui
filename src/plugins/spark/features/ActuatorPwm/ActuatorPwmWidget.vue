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
      <ActuatorPwmForm
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
      <q-item dark v-if="!block.data.enabled">
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
          <q-btn text-color="white" label="Enable" @click="enable"/>
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section>
          <div class="column">
            <span>Duty setting</span>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </div>
        </q-item-section>
        <q-item-section>
          <InputPopupEdit
            v-if="!isDriven"
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            label="Setting"
            type="number"
          />
          <big v-else>{{ block.data.setting | round }}</big>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Duty achieved</q-item-section>
        <q-item-section>
          <big>{{ block.data.value | round }}</big>
        </q-item-section>
      </q-item>
      <q-item v-if="pending !== null" dark>
        <q-item-section>Unconstrained setting</q-item-section>
        <q-item-section>
          <big>{{ pending | round }}</big>
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
