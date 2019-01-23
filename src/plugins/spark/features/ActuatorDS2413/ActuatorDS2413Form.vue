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

  defaultData() {
    return {
      hwDevice: new DS2413Link(null),
      channel: 0,
      state: 0,
      constrainedBy: { constraints: [] },
    };
  }

  presets() {
    return [
      {
        label: 'Fridge compressor',
        value: {
          hwDevice: new DS2413Link(null),
          channel: 0,
          state: 0,
          constrainedBy: {
            constraints: [
              { "minOff[second]": 300 },
              { "minOn[second]": 180 },
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
    <q-toolbar v-if="!$props.embedded" class="unpadded">
      <q-toolbar-title>{{ widgetId }} settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-collapsible opened group="modal" class="col-12" icon="settings" label="Settings">
      <q-field label="DS2413 Block">
        <LinkPopupEdit
          :field="block.data.hwDevice"
          :service-id="serviceId"
          :change="callAndSaveBlock(v => block.data.hwDevice = v)"
          label="DS2413 Block"
        />
      </q-field>
      <q-field label="DS2413 Channel">
        <SelectPopupEdit
          :field="block.data.channel"
          :options="channelOpts"
          :change="callAndSaveBlock(v => block.data.channel = v)"
          label="DS2413 Channel"
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
    <q-collapsible group="modal" class="col-12" icon="mdi-less-than-or-equal" label="Constraints">
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
    <q-collapsible group="modal" class="col-12" icon="view_compact" label="Widget Settings">
      <WidgetSettings v-bind="$props"/>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-collapsible>
  </div>
</template>
