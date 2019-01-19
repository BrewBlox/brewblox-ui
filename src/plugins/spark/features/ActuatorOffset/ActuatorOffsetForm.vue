<script lang="ts">
import { ProcessValueLink } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';
import { ActuatorOffsetBlock } from '@/plugins/spark/features/ActuatorOffset/state';

@Component
export default class ActuatorOffsetForm extends BlockForm {
  get block(): ActuatorOffsetBlock {
    return this.blockField as ActuatorOffsetBlock;
  }

  presets() {
    return [
      {
        label: 'Default',
        value: {
          targetId: new ProcessValueLink(null),
          referenceId: new ProcessValueLink(null),
          referenceSettingOrValue: 0,
          constrainedBy: { constraints: [] },
        },
      },
      {
        label: 'HLT Setpoint driver',
        value: {
          targetId: new ProcessValueLink(null),
          referenceId: new ProcessValueLink(null),
          referenceSettingOrValue: 0,
          constrainedBy: {
            constraints: [
              { max: 10 },
            ],
          },
        },
      },
    ];
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar v-if="$props.displayToolbar" class="unpadded">
      <q-toolbar-title>{{ block.id }} settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-collapsible group="modal" class="col-12" icon="settings" label="Settings">
      <div>
        <q-field label="Driven process value">
          <LinkPopupEdit
            :field="block.data.targetId"
            :service-id="block.serviceId"
            :change="callAndSaveBlock(v => block.data.targetId = v)"
            label="Driven process value"
          />
        </q-field>
        <q-field label="Reference process value">
          <LinkPopupEdit
            :field="block.data.referenceId"
            :service-id="block.serviceId"
            :change="callAndSaveBlock(v => block.data.referenceId = v)"
            label="Reference process value"
          />
        </q-field>
        <q-field label="Offset from setting or current value">
          <SelectPopupEdit
            :field="block.data.referenceSettingOrValue"
            :change="callAndSaveBlock(v => block.data.referenceSettingOrValue = v)"
            :options="[{label: 'Setting', value: 0}, {label: 'Current value', value: 1}]"
            label="reference field"
          />
        </q-field>
        <q-field label="Target offset">
          <InputPopupEdit
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            label="Target offset"
            type="number"
          />
        </q-field>
        <q-field label="Current offset">
          <big>{{ block.data.value | round }}</big>
        </q-field>
      </div>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="mdi-less-than-or-equal" label="Constraints">
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
    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="settingsProps" :presets-func="presets"/>
    </q-collapsible>
  </div>
</template>
