<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { PidBlock } from './types';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class PidDisplay extends Vue {
  get block(): PidBlock {
    return this.$props.value;
  }

  enable() {
    this.block.data.enabled = true;
    this.$emit('input', this.block);
  }
}
</script>

<template>
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
        <UnitField :field="block.data.inputSetting"/>
      </q-item-section>
      <q-item-section>
        <q-item-label caption>Measured</q-item-label>
        <UnitField :field="block.data.inputValue"/>
      </q-item-section>
      <q-item-section side>
        <BlockFormButton
          :block-id="block.data.inputId.id"
          :service-id="block.serviceId"
          :btn-props="{ icon: 'mdi-pencil', flat: true, class:'q-py-xs q-px-sm'}"
        />
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
          :btn-props="{ icon: 'mdi-pencil', flat: true, class:'q-py-xs q-px-sm'}"
        />
      </q-item-section>
    </q-item>

    <q-separator dark inset/>

    <q-item dark>
      <q-item-section side class="col-3">
        <div class="text-weight-light text-subtitle2 q-my-xs">Error</div>
      </q-item-section>
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
</template>

<style lang="stylus" scoped>
.q-card__section .q-separator {
  opacity: 0.2;
}
</style>
