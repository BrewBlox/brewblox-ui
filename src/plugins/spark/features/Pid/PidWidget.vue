<script lang="ts">
import { postfixedDisplayNames } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { filters, getById } from './getters';
import { PidBlock } from './types';
import PidDisplay from './PidDisplay.vue';

@Component({
  components: {
    PidDisplay,
  },
})
export default class PidWidget extends BlockWidget {
  inputFormOpen = false;

  get block(): PidBlock {
    return getById(this.serviceId, this.blockId);
  }

  get renamedTargets() {
    return postfixedDisplayNames(
      {
        inputSetting: 'Input target',
        inputValue: 'Input value',
        error: 'Error (filtered)',
        derivative: 'Derivative or error',
        integral: 'Integral of error',
        p: 'P',
        i: 'I',
        d: 'D',
        outputSetting: 'Output target (P+I+D)',
        outputValue: 'Output value',
      },
      this.block.data,
    );
  }

  get filterName() {
    return filters[this.block.data.filter];
  }

  get filterOpts() {
    return filters.map((filter, idx) => ({ label: filter, value: idx }));
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <PidForm v-if="modalOpen" v-bind="formProps"/>
    </q-dialog>
    <BlockWidgetToolbar :field="me" graph/>

    <PidDisplay :value="block" @input="saveBlock"/>
  </q-card>
</template>
