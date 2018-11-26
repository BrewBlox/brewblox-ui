<script lang="ts">
import { Unit } from '@/helpers/units';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class TempSensorOneWireForm extends BlockForm {
  presets() {
    return [
      {
        label: 'Default',
        value: {
          value: new Unit(0, 'degC'),
          valid: true,
          offset: new Unit(0, 'delta_degC'),
          address: '',
        },
      },
    ];
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-btn
      rounded
      v-close-overlay
      v-if="$props.buttons"
      label="close"
      icon="close"
      style="position: absolute; right: 18px; top: 18px"
    />
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Address">
          <InputPopupEdit
            label="Address"
            :field="block.data.address"
            :change="callAndSaveBlock(v => block.data.address = v)"
          />
        </q-field>
        <q-field class="col" label="Offset">
          <UnitPopupEdit
            label="Offset"
            :field="block.data.offset"
            :change="callAndSaveBlock(v => block.data.offset = v)"
          />
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Block Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Block ID">
          <InputPopupEdit label="Block ID" :field="block.id" :change="changeBlockId"/>
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
            :serviceId="serviceId"
            :change="callAndSaveBlock(v => block.profiles = v)"
          />
        </q-field>
        <q-field class="col" label="Preset">
          <SelectPopupEdit
            label="Preset"
            :field="block.data"
            :options="presets()"
            :change="callAndSaveBlock(v => block.data = v)"
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

