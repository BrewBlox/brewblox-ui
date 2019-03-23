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
      <PidForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item dark v-if="!block.data.enabled">
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

      <q-item dark v-if="block.data.enabled && !block.data.active">
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

      <q-list dense dark>
        <q-item dark>
          <q-item-section>Target input</q-item-section>
          <q-item-section>
            <big>{{ block.data.inputSetting | unit }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Actual input</q-item-section>
          <q-item-section>
            <big>{{ block.data.inputValue | unit }}</big>
          </q-item-section>
        </q-item>
        <q-separator dark inset/>
      </q-list>

      <q-list dense dark>
        <q-item dark>
          <q-item-section>Target output</q-item-section>
          <q-item-section>
            <big>{{ block.data.outputSetting | round }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Actual output</q-item-section>
          <q-item-section>
            <big>{{ block.data.outputSetting | round }}</big>
          </q-item-section>
        </q-item>
        <q-separator dark inset/>
      </q-list>

      <q-list dense dark>
        <q-item dark>
          <q-item-section>Error</q-item-section>
          <q-item-section>
            <big>{{ block.data.error | unit }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Integral</q-item-section>
          <q-item-section>
            <big>{{ block.data.integral | unit }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Derivative</q-item-section>
          <q-item-section>
            <big>{{ block.data.derivative | unit }}</big>
          </q-item-section>
        </q-item>
        <q-separator dark inset/>
      </q-list>

      <q-list dense dark>
        <q-item dark class="q-my-none">
          <q-item-section>P</q-item-section>
          <q-item-section>
            <big>{{ block.data.p | round }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>I</q-item-section>
          <q-item-section>
            <big>{{ block.data.i | round }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>D</q-item-section>
          <q-item-section>
            <big>{{ block.data.d | round }}</big>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
