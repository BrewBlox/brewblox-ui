<script lang="ts">
import { ProcessValueLink } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class ActuatorOffsetForm extends BlockForm {
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
        <q-field label="Target">
          <LinkPopupEdit
            :field="block.data.targetId"
            :service-id="block.serviceId"
            :change="callAndSaveBlock(v => block.data.targetId = v)"
            label="Target"
          />
        </q-field>
        <q-field label="Reference">
          <LinkPopupEdit
            :field="block.data.referenceId"
            :service-id="block.serviceId"
            :change="callAndSaveBlock(v => block.data.referenceId = v)"
            label="Reference"
          />
        </q-field>
        <q-field label="Setting">
          <big>{{ block.data.setting | round }}</big>
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
      <div>
        <q-field label="Block ID">
          <InputPopupEdit
            :field="block.id"
            :change="changeBlockId"
            display="span"
            label="Block ID"
          />
        </q-field>
        <q-field label="Block Type">
          <span>{{ block.type }}</span>
        </q-field>
        <q-field label="Part of service">
          <span>{{ serviceId }}</span>
        </q-field>
        <q-field label="Active in profiles">
          <ProfilesPopupEdit
            :field="block.profiles"
            :service-id="serviceId"
            :change="callAndSaveBlock(v => block.profiles = v)"
            display="span"
          />
        </q-field>
        <q-field label="Load defaults preset">
          <SelectPopupEdit
            :field="block.data"
            :options="presets()"
            :change="callAndSaveBlock(v => block.data = v)"
            label="Select preset to load"
            display="span"
          />
        </q-field>
      </div>
    </q-collapsible>
  </div>
</template>
