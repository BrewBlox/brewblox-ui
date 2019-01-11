<script lang="ts">
import { ActuatorDigitalLink } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/state';
import Component from 'vue-class-component';

@Component
export default class ActuatorPwmForm extends BlockForm {
  get block(): ActuatorPwmBlock {
    return this.blockField as ActuatorPwmBlock;
  }

  presets() {
    return [
      {
        label: 'Default',
        value: {
          actuatorId: new ActuatorDigitalLink(null),
          period: 0,
          setting: 0,
          constrainedBy: { constraints: [] },
        },
      },
    ];
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar v-if="$props.buttons" class="unpadded">
      <q-toolbar-title>{{ block.id }} settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-collapsible group="modal" class="col-12" icon="help" label="Settings">
      <div>
        <q-field label="Actuator">
          <LinkPopupEdit
            :field="block.data.actuatorId"
            :service-id="serviceId"
            :change="callAndSaveBlock(v => block.data.actuatorId = v)"
            label="Actuator"
          />
        </q-field>
        <q-field label="Period">
          <InputPopupEdit
            :field="block.data.period"
            :change="callAndSaveBlock(v => block.data.period = v)"
            label="Period"
            type="number"
          />
        </q-field>
        <q-field label="Setting">
          <InputPopupEdit
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            label="Setting"
            type="number"
          />
        </q-field>
        <q-field label="Value">
          <big>{{ block.data.value | round }}</big>
        </q-field>
      </div>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="help" label="Constraints">
      <div>
        <q-field label="Constraints" orientation="vertical">
          <AnalogConstraints
            :service-id="block.serviceId"
            :field="block.data.constrainedBy"
            :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
          />
        </q-field>
      </div>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="help" label="Block Settings">
      <BlockSettings v-bind="settingsProps" :presets-func="presets"/>
    </q-collapsible>
  </div>
</template>
