<script lang="ts">
import { DS2413Link } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { ActuatorDS2413Block } from '@/plugins/spark/features/ActuatorDS2413/state';
import Component from 'vue-class-component';
import { channel } from './getters';

@Component
export default class ActuatorDS2413Form extends BlockForm {
  get block(): ActuatorDS2413Block {
    return this.blockField as ActuatorDS2413Block;
  }

  get actuatorChannel() {
    return channel[this.block.data.channel];
  }

  get channelOpts() {
    return channel
      .map((v, idx) => ({ label: v, value: idx }));
  }

  presets() {
    return [
      {
        label: 'Default',
        value: {
          hwDevice: new DS2413Link(null),
          channel: 0,
          state: 0,
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
        <q-field class="col" label="Actuator">
          <LinkPopupEdit
            label="Actuator"
            :field="block.data.hwDevice"
            :serviceId="serviceId"
            :change="callAndSaveBlock(v => block.data.hwDevice = v)"
          />
        </q-field>
        <q-field class="col" label="Channel">
          <SelectPopupEdit
            label="Channel"
            :field="block.data.channel"
            :options="channelOpts"
            :change="callAndSaveBlock(v => block.data.channel = v)"
          />
        </q-field>
        <q-field class="col" label="State">
          <ActuatorState
            :field="block.data.state"
            :change="callAndSaveBlock(v => block.data.state = v)"
          />
        </q-field>
        <q-field class="col" label="Invert">
          <q-toggle
            :value="block.data.invert"
            @input="callAndSaveBlock(v => block.data.invert = v)"
          />
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Constraints</q-card-title>
      <q-card-main>
        <q-field class="col" label="Constraints" orientation="vertical">
          <DigitalConstraints
            :serviceId="block.serviceId"
            :field="block.data.constrainedBy"
            :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
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

