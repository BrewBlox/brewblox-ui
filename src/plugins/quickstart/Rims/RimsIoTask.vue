<script lang="ts">
import { defineComponent, PropType, reactive } from 'vue';

import { GpioChange } from '../types';
import { RimsConfig } from './types';

export default defineComponent({
  name: 'RimsIoTask',
  props: {
    config: {
      type: Object as PropType<RimsConfig>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
    const changedGpio = reactive<GpioChange[]>(props.config.changedGpio);

    function taskDone(): void {
      emit('update:config', { ...props.config, changedGpio });
      emit('next');
    }

    return {
      changedGpio,
      taskDone,
    };
  },
});
</script>

<template>
  <WizardBody>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Output channels
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item class="text-weight-light">
        <q-item-section>
          <p>
            These are your selected output channels. If you are using Spark 4
            GPIO channels, you can edit them here.
          </p>
          <LabeledField label="Pump output">
            <i>{{ config.pumpChannel.blockId }}</i>
            {{ config.pumpChannel.name }}
          </LabeledField>
          <LabeledField label="Tube output">
            <i>{{ config.tubeChannel.blockId }}</i>
            {{ config.tubeChannel.name }}
          </LabeledField>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section
      v-for="change in changedGpio"
      :key="`gpio-${change.blockId}`"
    >
      <div class="text-subtitle1">
        Position {{ change.modulePosition }}: GPIO Module {{ change.blockId }}
      </div>
      <OneWireGpioEditor v-model:channels="change.channels" />
    </q-card-section>
    <template #actions>
      <q-btn unelevated label="Back" @click="$emit('back')" />
      <q-space />
      <q-btn unelevated label="Next" color="primary" @click="taskDone" />
    </template>
  </WizardBody>
</template>
