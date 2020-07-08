<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { BlockAddress, BlockOrIntfType } from '@/plugins/spark/types';

const mkStateSnippet = (address: BlockAddress): string =>
  [
    '',
    `const state = getBlock('${address.serviceId}', '${address.id}').data.state;`,
    'console.log(state);',
    "return state === 'Inactive';",
    '',
  ].join('\n');

@Component
export default class JSCheckSnippets extends Vue {

  addSnippet(): void {
    const value: BlockAddress = {
      serviceId: null,
      id: null,
      type: null,
    };
    const compatible: BlockOrIntfType[] = [
      'DigitalActuator',
    ];
    createDialog({
      component: 'BlockAddressDialog',
      title: 'Select target block',
      message: 'Pick a block. It\'s name will be autofilled',
      compatible,
      value,
      anyService: true,
    })
      .onOk(address => this.$emit('insert', mkStateSnippet(address)));
  }
}
</script>

<template>
  <div class="q-pa-md q-gutter-y-sm">
    <div
      class="col clickable q-pa-sm rounded-borders text-h6"
      @click="addSnippet"
    >
      Check state for Digital Actuator
    </div>
  </div>
</template>
