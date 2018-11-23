<script lang="ts">
import { ProcessValueLink } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class ActuatorOffsetForm extends BlockForm {
  defaultData() {
    return {
      targetId: new ProcessValueLink(null),
      referenceId: new ProcessValueLink(null),
      referenceSettingOrValue: 0,
      constrainedBy: { constraints: [] },
    };
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Target">
          <LinkPopupEdit
            label="Target"
            :field="block.data.targetId"
            :serviceId="block.serviceId"
            :change="callAndSaveBlock(v => block.data.targetId = v)"
          />
        </q-field>
        <q-field class="col" label="Reference">
          <LinkPopupEdit
            label="Reference"
            :field="block.data.referenceId"
            :serviceId="block.serviceId"
            :change="callAndSaveBlock(v => block.data.referenceId = v)"
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
          :serviceId="serviceId"
          :field="block.data.constrainedBy"
          :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
        />
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

