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
  <div class="widget-modal column">
    <q-toolbar v-if="$props.buttons" class="unpadded">
      <q-toolbar-title>{{ block.id }} settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-collapsible group="modal" class="col-12" icon="help" label="Settings">
      <q-field label="Actuator">
        <LinkPopupEdit
          :field="block.data.hwDevice"
          :service-id="serviceId"
          :change="callAndSaveBlock(v => block.data.hwDevice = v)"
          label="Actuator"
        />
      </q-field>
      <q-field label="Channel">
        <SelectPopupEdit
          :field="block.data.channel"
          :options="channelOpts"
          :change="callAndSaveBlock(v => block.data.channel = v)"
          label="Channel"
        />
      </q-field>
      <q-field label="State">
        <ActuatorState
          :field="block.data.state"
          :change="callAndSaveBlock(v => block.data.state = v)"
        />
      </q-field>
      <q-field label="Invert">
        <q-toggle :value="block.data.invert" @input="v => { block.data.invert = v; saveBlock(); }"/>
      </q-field>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="help" label="Constraints">
      <div>
        <q-field label="Constraints" orientation="vertical">
          <DigitalConstraints
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
