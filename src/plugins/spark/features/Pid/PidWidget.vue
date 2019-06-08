<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import { Link, postfixedDisplayNames } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import sparkStore from '@/plugins/spark/store';
import { BlockLink } from '@/plugins/spark/types';
import featureStore from '@/store/features';

import { filters } from './getters';
import { PidBlock } from './types';

@Component
export default class PidWidget extends BlockWidget {
  readonly block!: PidBlock;
  inputFormOpen = false;
  relationsOpen = false;

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

  enable() {
    this.block.data.enabled = true;
    this.saveBlock();
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
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

    <q-card-section>
      <slot/>

      <template v-if="!block.data.enabled">
        <q-item dark>
          <q-item-section avatar>
            <q-icon name="warning"/>
          </q-item-section>
          <q-item-section>
            <span>
              PID is disabled:
              <i>{{ block.data.outputId }}</i> will not be set.
            </span>
          </q-item-section>
          <q-item-section side>
            <q-btn text-color="white" flat label="Enable" @click="enable"/>
          </q-item-section>
        </q-item>
        <q-separator dark inset class="q-mb-md"/>
      </template>

      <template v-else-if="!block.data.active">
        <q-item dark>
          <q-item-section avatar>
            <q-icon name="warning"/>
          </q-item-section>
          <q-item-section>
            <span>
              PID is inactive:
              <i>{{ block.data.outputId }}</i> will not be set.
            </span>
          </q-item-section>
        </q-item>
        <q-separator dark inset class="q-mb-md"/>
      </template>

      <q-item dark>
        <q-item-section side class="col-3">
          <div class="text-weight-light text-subtitle2 q-mb-xs">Input</div>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Target</q-item-label>
          <UnitField :value="block.data.inputSetting" tag="big" readonly/>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Measured</q-item-label>
          <UnitField :value="block.data.inputValue" tag="big" readonly/>
        </q-item-section>
        <q-item-section side>
          <BlockFormButton
            :block-id="block.data.inputId.id"
            :service-id="block.serviceId"
            icon="mdi-pencil"
            flat
            class="q-py-xs q-px-sm"
          >
            <q-tooltip>Edit Input Block</q-tooltip>
          </BlockFormButton>
        </q-item-section>
      </q-item>

      <q-separator dark inset/>

      <q-item dark>
        <q-item-section side class="col-3">
          <div class="text-weight-light text-subtitle2 q-mb-xs">Output</div>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Target</q-item-label>
          <big>{{ block.data.outputSetting | round }}</big>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Measured</q-item-label>
          <big>{{ block.data.outputValue | round }}</big>
        </q-item-section>
        <q-item-section side>
          <BlockFormButton
            :block-id="block.data.outputId.id"
            :service-id="block.serviceId"
            icon="mdi-pencil"
            flat
            class="q-py-xs q-px-sm"
          >
            <q-tooltip>Edit Output Block</q-tooltip>
          </BlockFormButton>
        </q-item-section>
      </q-item>

      <q-separator dark inset/>

      <q-item dark>
        <q-item-section side class="col-3">
          <div class="text-weight-light text-subtitle2 q-my-xs">Error</div>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Proportional</q-item-label>
          <UnitField :value="block.data.error" tag="span" unit-tag="small" readonly/>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Integral</q-item-label>
          <UnitField :value="block.data.integral" tag="span" unit-tag="small" readonly/>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Derivative</q-item-label>
          <UnitField :value="block.data.derivative" tag="span" unit-tag="small" readonly/>
        </q-item-section>
      </q-item>

      <q-separator dark inset/>

      <q-item dark>
        <q-item-section side class="col-3">
          <div class="text-weight-light text-subtitle2 q-my-xs">Result</div>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>P</q-item-label>
          <span>{{ block.data.p | round }}</span>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>I</q-item-label>
          <span>{{ block.data.i | round }}</span>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>D</q-item-label>
          <span>{{ block.data.d | round }}</span>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

<style lang="stylus" scoped>
.q-card__section .q-separator {
  opacity: 0.2;
}
</style>
