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
  <div class="widget-modal">
    <q-btn
      v-close-overlay
      v-if="$props.buttons"
      rounded
      label="close"
      icon="close"
      style="position: absolute; right: 18px; top: 18px"
    />
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Target">
          <LinkPopupEdit
            :field="block.data.targetId"
            :service-id="block.serviceId"
            :change="callAndSaveBlock(v => block.data.targetId = v)"
            label="Target"
          />
        </q-field>
        <q-field class="col" label="Reference">
          <LinkPopupEdit
            :field="block.data.referenceId"
            :service-id="block.serviceId"
            :change="callAndSaveBlock(v => block.data.referenceId = v)"
            label="Reference"
          />
        </q-field>
        <q-field class="col" label="Setting">
          <big>{{ block.data.setting | round }}</big>
        </q-field>
        <q-field class="col" label="Value">
          <big>{{ block.data.value | round }}</big>
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Constraints</q-card-title>
      <q-card-main>
        <AnalogConstraints
          :service-id="serviceId"
          :field="block.data.constrainedBy"
          :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
        />
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Block Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Block ID">
          <InputPopupEdit :field="block.id" :change="changeBlockId" label="Block ID"/>
        </q-field>
        <q-field class="col" label="Service ID">
          <big>{{ serviceId }}</big>
        </q-field>
        <q-field class="col" label="Block Type">
          <big>{{ block.type }}</big>
        </q-field>
        <q-field class="col" label="Profiles">
          <ProfilesPopupEdit
            :field="block.profiles"
            :service-id="serviceId"
            :change="callAndSaveBlock(v => block.profiles = v)"
          />
        </q-field>
        <q-field class="col" label="Preset">
          <SelectPopupEdit
            :field="block.data"
            :options="presets()"
            :change="callAndSaveBlock(v => block.data = v)"
            label="Preset"
          />
        </q-field>
      </q-card-main>
    </q-card>
  </div>
</template>

<style scoped>
.q-card {
  min-width: 400px;
  width: 100%;
  margin-bottom: 10px;
}
</style>

