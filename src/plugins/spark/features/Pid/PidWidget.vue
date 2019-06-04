<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import { Link, postfixedDisplayNames } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import sparkStore from '@/plugins/spark/store';
import { BlockLink } from '@/plugins/spark/types';
import featureStore from '@/store/features';

import PidDisplay from './PidDisplay.vue';
import { filters, presets } from './getters';
import { PidBlock } from './types';

@Component({
  components: {
    PidDisplay,
  },
})
export default class PidWidget extends BlockWidget {
  block!: PidBlock;
  inputFormOpen = false;
  relationsOpen = false;

  get presets() {
    return presets();
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

  findLinks(id: string | null): BlockLink[] {
    const block = sparkStore.blocks(this.serviceId)[id || ''];
    if (!id || !block) {
      return [];
    }

    const links = Object.entries(block.data)
      .filter(([, v]) => v instanceof Link) as [string, Link][];

    const filtered = links
      .filter(([, link]) => !link.driven && link.id);

    const relations: BlockLink[] = filtered
      .map(([k, link]) => ({
        source: id,
        target: link.id as string,
        relation: [k],
      }));

    return filtered
      .reduce((acc: BlockLink[], [, link]) => ([...acc, ...this.findLinks(link.id)]), relations);
  }

  get relations(): BlockLink[] {
    const chain = this.findLinks(this.blockId);

    // Setpoints may be driven by something else (profile, setpoint driver, etc)
    // Just display the block that's actually driving, ignore any blocks driving the driver
    const setpointId = this.block.data.inputId.id;
    if (!setpointId) {
      return chain;
    }

    return [
      ...chain,
      ...sparkStore.blockValues(this.serviceId)
        .filter(block => get(block, 'data.targetId.id') === setpointId)
        .map(block => ({ source: block.id, target: setpointId, relation: ['target'] })),
    ];
  }

  get nodes() {
    return sparkStore.blockValues(this.serviceId)
      .map(block => ({
        id: block.id,
        type: featureStore.displayNameById(block.type),
      }));
  }

}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <PidForm v-if="modalOpen" v-bind="$props" :block="block" @update:block="saveBlock"/>
    </q-dialog>
    <q-dialog v-model="relationsOpen" no-backdrop-dismiss>
      <DagreDiagram
        v-if="relationsOpen"
        :service-id="serviceId"
        :nodes="nodes"
        :relations="relations"
      />
    </q-dialog>
    <BlockWidgetToolbar :field="me" graph>
      <template v-slot:actions>
        <ActionItem
          icon="mdi-ray-start-arrow"
          label="Show Relations"
          @click="relationsOpen = true"
        />
      </template>
    </BlockWidgetToolbar>

    <PidDisplay :value="block" @input="saveBlock"/>
  </q-card>
</template>
