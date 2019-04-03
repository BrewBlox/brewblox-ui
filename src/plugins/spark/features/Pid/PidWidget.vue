<script lang="ts">
import { postfixedDisplayNames } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { filters, getById } from './getters';
import { PidBlock } from './state';

@Component
export default class PidWidget extends BlockWidget {
  get block(): PidBlock {
    return getById(this.$store, this.serviceId, this.blockId);
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

  enable() {
    this.block.data.enabled = true;
    this.saveBlock();
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <PidForm v-if="modalOpen" v-bind="formProps"/>
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
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
        <div class="col-3 text-weight-light text-subtitle2 q-pt-xs">Input</div>
        <q-item-section>
          <q-item-label caption>Measured</q-item-label>
          <UnitField :field="block.data.inputValue"/>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Target</q-item-label>
          <UnitField :field="block.data.inputSetting"/>
        </q-item-section>
      </q-item>

      <q-separator dark inset/>

      <q-item dark>
        <div class="col-3 text-weight-light text-subtitle2 q-pt-xs">Output</div>
        <q-item-section>
          <q-item-label caption>Measured</q-item-label>
          <big>{{ block.data.outputSetting | round }}</big>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Target</q-item-label>
          <big>{{ block.data.outputValue | round }}</big>
        </q-item-section>
      </q-item>

      <q-separator dark inset/>

      <q-item dark>
        <div class="col-3 text-weight-light text-subtitle2 q-pt-xs">Error</div>
        <q-item-section>
          <q-item-label caption>Proportional</q-item-label>
          <UnitField :field="block.data.error" tag="span" unit-tag="small"/>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Integral</q-item-label>
          <UnitField :field="block.data.integral" tag="span" unit-tag="small"/>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Derivative</q-item-label>
          <UnitField :field="block.data.derivative" tag="span" unit-tag="small"/>
        </q-item-section>
      </q-item>

      <q-separator dark inset/>

      <q-item dark>
        <div class="col-3 text-weight-light text-subtitle2 q-pt-xs">Result</div>
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
