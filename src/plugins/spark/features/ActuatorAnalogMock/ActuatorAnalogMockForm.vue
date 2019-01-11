<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class ActuatorAnalogMockForm extends BlockForm {
  presets() {
    return [
      {
        label: 'Default',
        value: {
          setting: 0,
          minSetting: 0,
          maxSetting: 0,
          value: 0,
          minValue: 0,
          maxValue: 0,
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
    <q-collapsible group="modal" class="col-12" icon="help" label="Setting & Value">
      <div>
        <q-field label="Min Setting">
          <InputPopupEdit
            :field="block.data.minSetting"
            :change="callAndSaveBlock(v => block.data.minSetting = v)"
            type="number"
            label="Minimum setting"
          />
        </q-field>
        <q-field label="Setting">
          <InputPopupEdit
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            type="number"
            label="Setting"
          />
        </q-field>
        <q-field label="Max Setting">
          <InputPopupEdit
            :field="block.data.maxSetting"
            :change="callAndSaveBlock(v => block.data.maxSetting = v)"
            type="number"
            label="Maximum setting"
          />
        </q-field>
        <q-field label="Min Value">
          <InputPopupEdit
            :field="block.data.minValue"
            :change="callAndSaveBlock(v => block.data.minValue = v)"
            type="number"
            label="Minimum value"
          />
        </q-field>
        <q-field label="Value">
          <big>{{ block.data.value | round }}</big>
        </q-field>
        <q-field label="Max Value">
          <InputPopupEdit
            :field="block.data.maxValue"
            :change="callAndSaveBlock(v => block.data.maxValue = v)"
            type="number"
            label="Maximum value"
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
